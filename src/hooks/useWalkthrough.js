import { useState, useEffect, useRef } from 'react';
import { walkthroughApi } from '../api/walkthroughApi';

export function useWalkthrough() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({});
  
  const [walkthroughState, setWalkthroughState] = useState('not_started');
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [markdownContent, setMarkdownContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const contentRef = useRef(null);

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
    
    try {
      await walkthroughApi.startWalkthrough(selectedRepo);
      const planData = await walkthroughApi.fetchPlan(selectedRepo);
      
      setPlan(planData);
      setWalkthroughState('ready');
    } catch (err) {
      console.error('Failed to start walkthrough:', err);
      setWalkthroughState('not_started');
    }
  };

  const handleNext = async () => {
    if (!selectedRepo || currentStep >= (plan?.sequence?.length || 0)) return;
    
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

  const toggleRepo = (repo) => {
    setExpandedRepos(prev => ({ ...prev, [repo]: !prev[repo] }));
  };

  const selectRepo = (repo) => {
    setSelectedRepo(repo);
    setWalkthroughState('not_started');
    setPlan(null);
    setCurrentStep(0);
    setMarkdownContent('');
  };

  return {
    repos,
    selectedRepo,
    expandedRepos,
    walkthroughState,
    plan,
    currentStep,
    markdownContent,
    isStreaming,
    contentRef,
    toggleRepo,
    selectRepo,
    handleStartWalkthrough,
    handleNext
  };
}