import { useState, useEffect, useRef } from 'react';
import { walkthroughApi } from '../api/walkthroughApi';

export function useWalkthrough() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({});
  
  const [walkthroughState, setWalkthroughState] = useState('not_started');
  const [planData, setPlanData] = useState(null);
  const [architectureData, setArchitectureData] = useState(null); // NEW
  const [viewMode, setViewMode] = useState('walkthrough'); // NEW: 'walkthrough' or 'architecture'
  const [selectedEntryPoint, setSelectedEntryPoint] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const contentRef = useRef(null);

  const activePlan = planData?.plans?.[selectedEntryPoint] || null;

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
    setSelectedEntryPoint(0);
    setViewMode('walkthrough'); // NEW: Reset to walkthrough view
    
    try {
      await walkthroughApi.startWalkthrough(selectedRepo);
      const planResponse = await walkthroughApi.fetchPlan(selectedRepo);
      const archResponse = await walkthroughApi.fetchArchitecture(selectedRepo); // NEW
      
      setPlanData(planResponse);
      setArchitectureData(archResponse); // NEW
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
      const currentLevel = currentStep > 0 
        ? (activePlan.sequence[currentStep - 1]?.level || 0)
        : 0;
      const depth = 2;
      
      await walkthroughApi.streamNext(
        selectedRepo,
        entryPoint,
        currentLevel,
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

  const handleToggleArchitecture = () => { // NEW FUNCTION
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

  const toggleRepo = (repo) => {
    setExpandedRepos(prev => ({ ...prev, [repo]: !prev[repo] }));
  };

  const selectRepo = (repo) => {
    setSelectedRepo(repo);
    setWalkthroughState('not_started');
    setPlanData(null);
    setArchitectureData(null); // NEW
    setViewMode('walkthrough'); // NEW
    setSelectedEntryPoint(0);
    setCurrentStep(0);
    setMarkdownContent('');
  };

  return {
    repos,
    selectedRepo,
    expandedRepos,
    walkthroughState,
    planData,
    architectureData, // NEW
    viewMode, // NEW
    activePlan,
    selectedEntryPoint,
    currentStep,
    markdownContent,
    isStreaming,
    contentRef,
    toggleRepo,
    selectRepo,
    handleStartWalkthrough,
    handleNext,
    handleGotoStep,
    handleToggleArchitecture, // NEW
    handleEntryPointChange
  };
}