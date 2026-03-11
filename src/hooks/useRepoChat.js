import { useState, useEffect, useRef } from 'react';
import { Api } from '../api/Api';

const TERMINAL_JOB_STATUSES = new Set(['completed', 'failed', 'cancelled']);

function normalizeJob(job) {
  return {
    jobId: job.job_id || job.jobId,
    job_id: job.job_id || job.jobId,
    repo_name: job.repo_name,
    status: job.status,
    current_stage: job.current_stage,
    error: job.error || null,
    created_at: job.created_at,
    updated_at: job.updated_at,
    stages: job.stages || {},
    isLocalOnly: job.isLocalOnly || false,
  };
}

export function useRepoChat() {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [expandedRepos, setExpandedRepos] = useState({});

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatStreaming, setIsChatStreaming] = useState(false);

  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [ingestionJobs, setIngestionJobs] = useState([]);

  const contentRef = useRef(null);
  const pollingIntervals = useRef({});

  const clearPollingForJob = (jobId) => {
    if (pollingIntervals.current[jobId]) {
      clearInterval(pollingIntervals.current[jobId]);
      delete pollingIntervals.current[jobId];
    }
  };

  const pollJobStatus = async (jobId) => {
    try {
      const status = await Api.getJobStatus(jobId);
      const normalized = normalizeJob(status);

      setIngestionJobs(prev => {
        const existing = prev.find(j => j.jobId === jobId);
        if (existing) {
          return prev.map(j => (j.jobId === jobId ? { ...j, ...normalized } : j));
        }
        return [...prev, normalized];
      });

      if (TERMINAL_JOB_STATUSES.has(normalized.status)) {
        clearPollingForJob(jobId);

        if (normalized.status === 'completed') {
          Api.fetchRepos()
            .then(setRepos)
            .catch(err => console.error('Failed to refresh repos:', err));
        }
      }
    } catch (err) {
      console.error('Failed to poll job status:', err);
      if (err.status === 404) {
        clearPollingForJob(jobId);
      }
    }
  };

  const startPollingJob = (jobId) => {
    if (pollingIntervals.current[jobId]) {
      return;
    }

    pollJobStatus(jobId);
    pollingIntervals.current[jobId] = setInterval(() => {
      pollJobStatus(jobId);
    }, 60000);
  };

  useEffect(() => {
    Api.fetchRepos()
      .then(setRepos)
      .catch(err => console.error('Failed to fetch repos:', err));
  }, []);

  useEffect(() => {
    Api.listJobs({ limit: 100 })
      .then(response => {
        if (!response.jobs || response.jobs.length === 0) {
          return;
        }

        const jobs = response.jobs.map(normalizeJob);
        setIngestionJobs(jobs);

        jobs.forEach(job => {
          if (['running', 'pending', 'queued'].includes(job.status)) {
            startPollingJob(job.jobId);
          }
        });
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

    setIsChatStreaming(true);
    let assistantMessage = {
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString()
    };

    let hasStartedResponse = false;

    try {
      await Api.sendChatMessage(
        selectedConversationId,
        message,
        (content) => {
          assistantMessage.content = content;
          setChatMessages(prev => {
            const last = prev[prev.length - 1];
            if (hasStartedResponse && last?.role === 'assistant') {
              const withoutLast = prev.slice(0, -1);
              return [...withoutLast, assistantMessage];
            }
            hasStartedResponse = true;
            return [...prev, assistantMessage];
          });
        }
      );
    } catch (err) {
      console.error('Failed to send message:', err);
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
      alert(err.message || 'Failed to delete repository');
    }
  };

  const handleOpenIngestModal = () => {
    setIngestModalOpen(true);
  };

  const handleCloseIngestModal = () => {
    setIngestModalOpen(false);
  };

  const registerNewJob = (jobPayload) => {
    const job = normalizeJob(jobPayload);
    if (!job.jobId) {
      throw new Error('Ingestion response missing job_id');
    }

    setIngestionJobs(prev => {
      const existing = prev.find(j => j.jobId === job.jobId);
      if (existing) {
        return prev.map(j => (j.jobId === job.jobId ? { ...j, ...job } : j));
      }
      return [...prev, job];
    });

    startPollingJob(job.jobId);
  };

  const handleIngestRepo = async (repoName, ingestOptions = {}) => {
    try {
      const result = await Api.ingestRepo(repoName, ingestOptions);
      setIngestModalOpen(false);
      registerNewJob(result);
    } catch (err) {
      console.error('Failed to ingest repo:', err);
      throw err;
    }
  };

  const handleIngestRepos = async (repoNames, ingestOptions = {}) => {
    try {
      const results = await Api.ingestRepos(repoNames, ingestOptions);
      const successful = results.filter(result => result.ok);
      const failed = results.filter(result => !result.ok);

      if (successful.length === 0) {
        const firstError = failed[0];
        const error = new Error(firstError?.error || 'Failed to start ingestion');
        error.status = firstError?.status || null;
        throw error;
      }

      setIngestModalOpen(false);

      const failedEntries = [];
      let localFailureIndex = 0;

      results.forEach((result) => {
        if (result.ok) {
          registerNewJob(result.data);
          return;
        }

        localFailureIndex += 1;
        failedEntries.push(normalizeJob({
          job_id: `local-failure-${Date.now()}-${localFailureIndex}`,
          repo_name: result.repo_name,
          status: 'failed',
          current_stage: 'queued',
          error: result.error || 'Failed to start ingestion',
          isLocalOnly: true,
        }));
      });

      if (failedEntries.length > 0) {
        setIngestionJobs(prev => [...prev, ...failedEntries]);
      }
    } catch (err) {
      console.error('Failed to ingest repos:', err);
      throw err;
    }
  };

  const handleRemoveJob = (jobId) => {
    setIngestionJobs(prev => prev.filter(j => j.jobId !== jobId));
    clearPollingForJob(jobId);
  };

  const handleDeleteJob = async (jobId) => {
    const job = ingestionJobs.find(j => j.jobId === jobId);
    if (job?.isLocalOnly) {
      handleRemoveJob(jobId);
      return;
    }

    try {
      await Api.deleteJob(jobId);
      handleRemoveJob(jobId);
    } catch (err) {
      console.error('Failed to delete job:', err);
      const errorMsg = err.message || 'Failed to delete job';
      if (errorMsg.toLowerCase().includes('running')) {
        alert('Job is running. Retry delete after it finishes.');
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
    handleDeleteJob,
  };
}
