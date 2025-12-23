import { useState, useEffect, useRef } from 'react';
import { Api } from '../api/Api';

export function useRepoChat() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({});
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [ingestionJobs, setIngestionJobs] = useState([]); // Track individual jobs
  const [batches, setBatches] = useState({}); // Track batches by batch_id
  
  const contentRef = useRef(null);
  const pollingIntervals = useRef({}); // Store polling intervals per job_id

  useEffect(() => {
    Api.fetchRepos()
      .then(setRepos)
      .catch(err => console.error('Failed to fetch repos:', err));
  }, []);

  useEffect(() => {
    Api.listJobs({ limit: 100 })
      .then(response => {
        if (response.jobs && response.jobs.length > 0) {
          const jobs = response.jobs.map(job => ({
            jobId: job.job_id,
            repo_name: job.repo_name,
            status: job.status,
            current_stage: job.current_stage,
            error: job.error,
            isBatch: !!job.batch_id,
            batchId: job.batch_id,
            batchIndex: job.batch_index
          }));
          
          setIngestionJobs(jobs);
          
          // Start polling for any running/pending/queued jobs
          jobs.forEach(job => {
            if (['running', 'pending', 'queued'].includes(job.status)) {
              startPollingJob(job.jobId);
            }
          });
        }
      })
      .catch(err => console.error('Failed to fetch existing jobs:', err));
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      Api.listConversations(selectedRepo)
        .then(setConversations)
        .catch(err => console.error('Failed to fetch conversations:', err));
    } else {
      setConversations([]);
    }
  }, [selectedRepo]);

  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  const handleNewConversation = async () => {
    if (!selectedRepo) return;
    
    try {
      const newConv = await Api.createConversation(selectedRepo);
      setConversations(prev => [newConv, ...prev]);
      setSelectedConversationId(newConv.conversation_id);
      setChatMessages([]);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    
    try {
      const response = await Api.getConversationMessages(conversationId);
      setChatMessages(response.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSendMessage = async (message) => {
    if (!selectedConversationId) return;
    
    const userMessage = {
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    const loadingMessage = {
      role: 'assistant',
      content: 'Gathering data...',
      created_at: new Date().toISOString(),
      isLoading: true
    };
    setChatMessages(prev => [...prev, loadingMessage]);
    
    setIsChatStreaming(true);
    let assistantMessage = {
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    };
    
    let firstChunk = true;
    
    try {
      await Api.sendChatMessage(
        selectedConversationId,
        message,
        (content) => {
          if (firstChunk) {
            firstChunk = false;
            setChatMessages(prev => prev.slice(0, -1));
          }
          
          assistantMessage.content = content;
          setChatMessages(prev => {
            const withoutLast = prev.slice(0, -1);
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant' && !last?.isLoading) {
              return [...withoutLast, assistantMessage];
            } else {
              return [...prev, assistantMessage];
            }
          });
        }
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setChatMessages(prev => prev.filter(m => !m.isLoading));
    } finally {
      setIsChatStreaming(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await Api.deleteConversation(conversationId);
      
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleDeleteRepo = async (repoName, deleteFiles) => {
    try {
      await Api.deleteRepo(repoName, deleteFiles);
      
      setRepos(prev => prev.filter(r => r !== repoName));
      
      if (selectedRepo === repoName) {
        setSelectedRepo(null);
        setConversations([]);
        setSelectedConversationId(null);
        setChatMessages([]);
      }
    } catch (err) {
      console.error('Failed to delete repo:', err);
      alert('Failed to delete repository');
    }
  };

  const handleOpenIngestModal = () => {
    setIngestModalOpen(true);
  };

  const handleCloseIngestModal = () => {
    setIngestModalOpen(false);
  };

  // Poll individual job status
  const pollJobStatus = async (jobId) => {
    try {
      const status = await Api.getJobStatus(jobId);
      
      setIngestionJobs(prev => {
        const existing = prev.find(j => j.jobId === jobId);
        if (existing) {
          return prev.map(j => 
            j.jobId === jobId 
              ? { ...j, ...status, jobId }
              : j
          );
        } else {
          return [...prev, { ...status, jobId }];
        }
      });

      // Stop polling if completed or failed
      if (status.status === 'completed' || status.status === 'failed') {
        if (pollingIntervals.current[jobId]) {
          clearInterval(pollingIntervals.current[jobId]);
          delete pollingIntervals.current[jobId];
        }
        
        // Refresh repos list if completed
        if (status.status === 'completed') {
          Api.fetchRepos()
            .then(setRepos)
            .catch(err => console.error('Failed to refresh repos:', err));
        }
      }
    } catch (err) {
      console.error('Failed to poll job status:', err);
    }
  };

  // Start polling for a job
  const startPollingJob = (jobId) => {
    // Poll immediately
    pollJobStatus(jobId);
    
    // Set up interval
    pollingIntervals.current[jobId] = setInterval(() => {
      pollJobStatus(jobId);
    }, 60000); // 60 seconds
  };

  const handleIngestRepo = async (repoName) => {
    try {
      const result = await Api.ingestRepos([repoName]); // Pass as single-item array
      
      // Close modal immediately
      setIngestModalOpen(false);
      
      // Check if single or batch response
      if (result.batch_id && result.jobs) {
        // Even single repo now returns batch format
        const job = result.jobs[0];
        
        setIngestionJobs(prev => [...prev, {
          jobId: job.job_id,
          repo_name: job.repo_name,
          status: job.status || 'queued',
          current_stage: 'queued',
          error: null,
          isBatch: false
        }]);
        
        startPollingJob(job.job_id);
      }
      
    } catch (err) {
      console.error('Failed to ingest repo:', err);
      throw err;
    }
  };

  const handleGetJobDetails = async (jobId) => {
    try {
      return await Api.getJobStatus(jobId);
    } catch (err) {
      console.error('Failed to get job details:', err);
      throw err;
    }
  };

  // Handle batch ingestion
  const handleIngestRepos = async (repoNames) => {
    try {
      const result = await Api.ingestRepos(repoNames);
      
      // Close modal immediately
      setIngestModalOpen(false);
      
      // Batch response: {batch_id, jobs: [{job_id, repo_name, status, batch_index}]}
      if (result.batch_id && result.jobs) {
        // Store batch info
        setBatches(prev => ({
          ...prev,
          [result.batch_id]: {
            batchId: result.batch_id,
            totalJobs: result.jobs.length,
            jobs: result.jobs.map(j => j.job_id)
          }
        }));
        
        // Add all jobs to tracking
        const newJobs = result.jobs.map(job => ({
          jobId: job.job_id,
          repo_name: job.repo_name,
          status: job.status || 'queued',
          current_stage: 'queued',
          error: null,
          isBatch: true,
          batchId: result.batch_id,
          batchIndex: job.batch_index
        }));
        
        setIngestionJobs(prev => [...prev, ...newJobs]);
        
        // Start polling for all jobs in batch
        result.jobs.forEach(job => {
          startPollingJob(job.job_id);
        });
      }
      
    } catch (err) {
      console.error('Failed to ingest repos:', err);
      throw err;
    }
  };

  const handleRemoveJob = (jobId) => {
    const job = ingestionJobs.find(j => j.jobId === jobId);
    
    // If it's a batch job, remove entire batch
    if (job?.isBatch && job?.batchId) {
      const batchInfo = batches[job.batchId];
      if (batchInfo) {
        // Remove all jobs in this batch
        setIngestionJobs(prev => prev.filter(j => j.batchId !== job.batchId));
        
        // Clear all polling intervals for this batch
        batchInfo.jobs.forEach(jId => {
          if (pollingIntervals.current[jId]) {
            clearInterval(pollingIntervals.current[jId]);
            delete pollingIntervals.current[jId];
          }
        });
        
        // Remove batch info
        setBatches(prev => {
          const updated = { ...prev };
          delete updated[job.batchId];
          return updated;
        });
      }
    } else {
      // Single job removal
      setIngestionJobs(prev => prev.filter(j => j.jobId !== jobId));
      
      if (pollingIntervals.current[jobId]) {
        clearInterval(pollingIntervals.current[jobId]);
        delete pollingIntervals.current[jobId];
      }
    }
  };

  const handleAbortJob = async (jobId) => {
    try {
      await Api.abortJob(jobId);
      
      // Update job status to "aborting"
      setIngestionJobs(prev => prev.map(j => 
        j.jobId === jobId 
          ? { ...j, status: 'aborting' }
          : j
      ));
    } catch (err) {
      console.error('Failed to abort job:', err);
      alert('Failed to abort job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await Api.deleteJob(jobId);
      
      // Remove job from list
      setIngestionJobs(prev => prev.filter(j => j.jobId !== jobId));
      
      // Clear polling interval
      if (pollingIntervals.current[jobId]) {
        clearInterval(pollingIntervals.current[jobId]);
        delete pollingIntervals.current[jobId];
      }
    } catch (err) {
      console.error('Failed to delete job:', err);
      const errorMsg = err.message || 'Failed to delete job';
      if (errorMsg.includes('running') || errorMsg.includes('Abort')) {
        alert('Job is running. Please abort the job before deleting.');
      } else {
        alert(errorMsg);
      }
    }
  };

  const toggleRepo = (repo) => {
    setExpandedRepos(prev => ({ ...prev, [repo]: !prev[repo] }));
  };

  const selectRepo = (repo) => {
    setSelectedRepo(repo);
    setSelectedConversationId(null);
    setChatMessages([]);
  };

  return {
    repos,
    selectedRepo,
    expandedRepos,
    conversations,
    selectedConversationId,
    chatMessages,
    isChatStreaming,
    contentRef,
    ingestModalOpen,
    ingestionJobs,
    batches,
    toggleRepo,
    selectRepo,
    handleNewConversation,
    handleSelectConversation,
    handleSendMessage,
    handleDeleteConversation,
    handleDeleteRepo,
    handleOpenIngestModal,
    handleCloseIngestModal,
    handleIngestRepo,
    handleIngestRepos,
    handleRemoveJob,
    handleAbortJob,
    handleDeleteJob,
    handleGetJobDetails,
  };
}