import { useState, useEffect, useRef } from 'react';
import { walkthroughApi } from '../api/walkthroughApi';

export function useWalkthrough() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({});
  
  const [walkthroughState, setWalkthroughState] = useState('not_started');
  const [planData, setPlanData] = useState(null); // Changed from 'plan' to 'planData'
  const [selectedEntryPoint, setSelectedEntryPoint] = useState(0); // NEW
  const [currentStep, setCurrentStep] = useState(0);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const contentRef = useRef(null);

  // Get the current active plan based on selected entry point
  const activePlan = planData?.plans?.[selectedEntryPoint] || null; // NEW

  useEffect(() => {
    walkthroughApi.fetchRepos()
      .then(setRepos)
      .catch(err => console.error('Failed to fetch repos:', err));
  }, []);

  const handleStartWalkthrough = async () => {
    if (!selectedRepo) return;
    
    setWalkthroughState('loading');
    setCurrentStep(0);
    setMarkdownContent('');
    setSelectedEntryPoint(0); // NEW
    
    try {
      await walkthroughApi.startWalkthrough(selectedRepo);
      const planResponse = await walkthroughApi.fetchPlan(selectedRepo);
      
      console.log('Plan Response:', planResponse);
      console.log('First plan:', planResponse?.plans?.[0]);
      
      setPlanData(planResponse); // Changed from setPlan
      setWalkthroughState('ready');
    } catch (err) {
      console.error('Failed to start walkthrough:', err);
      setWalkthroughState('not_started');
    }
  };

  const handleNext = async () => {
    if (!selectedRepo || !activePlan || currentStep >= (activePlan.sequence?.length || 0)) return; // Changed condition
    
    setIsStreaming(true);
    setMarkdownContent('');
    
    try {
      await walkthroughApi.streamNext(selectedRepo, (content) => {
        setMarkdownContent(content);
        
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      });
      
      setCurrentStep(prev => prev + 1);
    } catch (err) {
      console.error('Failed to fetch next:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  // NEW FUNCTION
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
      
      // Update current step to match the clicked file
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

  // NEW FUNCTION
  const handleEntryPointChange = (index) => {
    setSelectedEntryPoint(index);
    setCurrentStep(0);
    setMarkdownContent('');
  };

  const toggleRepo = (repo) => {
    setExpandedRepos(prev => ({ ...prev, [repo]: !prev[repo] }));
  };

  const selectRepo = (repo) => {
    setSelectedRepo(repo);
    setWalkthroughState('not_started');
    setPlanData(null); // Changed from setPlan
    setSelectedEntryPoint(0); // NEW
    setCurrentStep(0);
    setMarkdownContent('');
  };

  return {
    repos,
    selectedRepo,
    expandedRepos,
    walkthroughState,
    planData,        // NEW - return planData
    activePlan,      // NEW - return activePlan
    selectedEntryPoint, // NEW
    currentStep,
    markdownContent,
    isStreaming,
    contentRef,
    toggleRepo,
    selectRepo,
    handleStartWalkthrough,
    handleNext,
    handleGotoStep,        // NEW
    handleEntryPointChange // NEW
  };
}