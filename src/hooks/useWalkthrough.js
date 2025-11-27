import { useState, useEffect, useRef } from 'react';
import { walkthroughApi } from '../api/walkthroughApi';

export function useWalkthrough() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({});
  
  const [walkthroughState, setWalkthroughState] = useState('not_started');
  const [planData, setPlanData] = useState(null);
  const [architectureData, setArchitectureData] = useState(null);
  const [viewMode, setViewMode] = useState('walkthrough'); // 'walkthrough' | 'architecture' | 'chat'
  const [selectedEntryPoint, setSelectedEntryPoint] = useState(0);
  const [depth, setDepth] = useState(2);
  const [currentStep, setCurrentStep] = useState(0);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // NEW: Chat state
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  
  const contentRef = useRef(null);

  const activePlan = planData?.plans?.[selectedEntryPoint] || null;

  useEffect(() => {
    walkthroughApi.fetchRepos()
      .then(setRepos)
      .catch(err => console.error('Failed to fetch repos:', err));
  }, []);

  // NEW: Load conversations when repo is selected
  useEffect(() => {
    if (selectedRepo) {
      walkthroughApi.listConversations(selectedRepo)
        .then(setConversations)
        .catch(err => console.error('Failed to fetch conversations:', err));
    } else {
      setConversations([]);
    }
  }, [selectedRepo]);

  const handleStartWalkthrough = async () => {
    if (!selectedRepo) return;
    
    setWalkthroughState('loading');
    setCurrentStep(0);
    setMarkdownContent('');
    setSelectedEntryPoint(0);
    setViewMode('walkthrough');
    
    try {
      await walkthroughApi.startWalkthrough(selectedRepo);
      const planResponse = await walkthroughApi.fetchPlan(selectedRepo, depth);
      const archResponse = await walkthroughApi.fetchArchitecture(selectedRepo);
      
      setPlanData(planResponse);
      setArchitectureData(archResponse);
      setWalkthroughState('ready');
    } catch (err) {
      console.error('Failed to start walkthrough:', err);
      setWalkthroughState('not_started');
    }
  };

  const handleNext = async () => {
    if (!selectedRepo || !activePlan || !planData) return;
    if (currentStep >= (activePlan.sequence?.length || 0)) return;
    
    setIsStreaming(true);
    setMarkdownContent('');
    
    try {
      const entryPoint = planData.entry_points?.[selectedEntryPoint] || null;
      
      const currentSequenceItem = currentStep > 0 
        ? activePlan.sequence[currentStep - 1]
        : null;
      
      const currentLevel = currentSequenceItem?.level || 0;
      const currentFilePath = currentSequenceItem?.file_path || null;
      
      await walkthroughApi.streamNext(
        selectedRepo,
        entryPoint,
        currentLevel,
        currentFilePath,
        depth,
        (content) => {
          setMarkdownContent(content);
          
          if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
          }
        }
      );
      
      setCurrentStep(prev => prev + 1);
    } catch (err) {
      console.error('Failed to fetch next:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleGotoStep = async (filePath) => {
    if (!selectedRepo || !activePlan) return;
    
    setIsStreaming(true);
    setMarkdownContent('');
    
    try {
      await walkthroughApi.gotoStep(selectedRepo, filePath, (content) => {
        setMarkdownContent(content);
        
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      });
      
      const stepIndex = activePlan.sequence.findIndex(s => s.file_path === filePath);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex + 1);
      }
    } catch (err) {
      console.error('Failed to goto step:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleToggleArchitecture = () => {
    if (viewMode === 'walkthrough') {
      setViewMode('architecture');
    } else {
      setViewMode('walkthrough');
    }
  };

  const handleEntryPointChange = (index) => {
    setSelectedEntryPoint(index);
    setCurrentStep(0);
    setMarkdownContent('');
  };

  const handleDepthChange = async (newDepth) => {
    if (!selectedRepo) return;
    
    setDepth(newDepth);
    
    if (walkthroughState === 'ready') {
      setWalkthroughState('loading');
      setCurrentStep(0);
      setMarkdownContent('');
      
      try {
        const planResponse = await walkthroughApi.fetchPlan(selectedRepo, newDepth);
        setPlanData(planResponse);
        setWalkthroughState('ready');
      } catch (err) {
        console.error('Failed to refetch plan with new depth:', err);
        setWalkthroughState('ready');
      }
    }
  };

  // NEW: Chat functions
  const handleNewConversation = async () => {
    if (!selectedRepo) return;
    
    try {
      const newConv = await walkthroughApi.createConversation(selectedRepo);
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversationId(newConv.conversation_id);
      setChatMessages([]);
      setViewMode('chat');
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    setViewMode('chat');
    
    try {
      const response = await walkthroughApi.getConversationMessages(conversationId);
      setChatMessages(response.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (message) => {
    if (!selectedConversationId) return;
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Start streaming assistant response
    setIsChatStreaming(true);
    let assistantMessage = {
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    };
    
    try {
      await walkthroughApi.sendChatMessage(
        selectedConversationId,
        message,
        (content) => {
          assistantMessage.content = content;
          setChatMessages(prev => {
            const withoutLast = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...withoutLast, assistantMessage];
            } else {
              return [...prev, assistantMessage];
            }
          });
        }
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsChatStreaming(false);
    }
  };

  const toggleRepo = (repo) => {
    setExpandedRepos(prev => ({ ...prev, [repo]: !prev[repo] }));
  };

  const selectRepo = (repo) => {
    setSelectedRepo(repo);
    setWalkthroughState('not_started');
    setPlanData(null);
    setArchitectureData(null);
    setViewMode('walkthrough');
    setSelectedEntryPoint(0);
    setDepth(2);
    setCurrentStep(0);
    setMarkdownContent('');
    setSelectedConversationId(null);
    setChatMessages([]);
  };

  return {
    repos,
    selectedRepo,
    expandedRepos,
    walkthroughState,
    planData,
    architectureData,
    viewMode,
    activePlan,
    selectedEntryPoint,
    depth,
    currentStep,
    markdownContent,
    isStreaming,
    contentRef,
    // NEW: Chat exports
    conversations,
    selectedConversationId,
    chatMessages,
    isChatStreaming,
    toggleRepo,
    selectRepo,
    handleStartWalkthrough,
    handleNext,
    handleGotoStep,
    handleToggleArchitecture,
    handleEntryPointChange,
    handleDepthChange,
    // NEW: Chat handlers
    handleNewConversation,
    handleSelectConversation,
    handleSendMessage,
  };
}