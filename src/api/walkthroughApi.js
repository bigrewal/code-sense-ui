const API_BASE = 'http://localhost:8000';

export const walkthroughApi = {
  async fetchRepos() {
    const response = await fetch(`${API_BASE}/repos`);
    const data = await response.json();
    return data.repos || [];
  },

  async createConversation(repoId) {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId })
    });
    return response.json();
  },

  async listConversations(repoId = null, limit = 50, offset = 0) {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (repoId) {
      params.append('repo_id', repoId);
    }
    const response = await fetch(`${API_BASE}/conversations?${params}`);
    return response.json();
  },

  async getConversationMessages(conversationId, limit = 200) {
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages?limit=${limit}`);
    return response.json();
  },

  async sendChatMessage(conversationId, message, onChunk) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        conversation_id: conversationId,
        message: message
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulated += chunk;
      onChunk(accumulated);
    }

    return accumulated;
  },

  async deleteConversation(conversationId) {
    const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async deleteRepo(repoName, deleteFiles = false) {
    const response = await fetch(`${API_BASE}/repos/${repoName}?delete_files=${deleteFiles}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async ingestRepo(repoName) {
    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_name: repoName })
    });
    return response.json();
  },

  async ingestRepos(repoNames) {
    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_names: repoNames })
    });
    return response.json();
  },

  async getJobStatus(jobId = null, filters = {}) {
    let url = `${API_BASE}/status`;
    const params = new URLSearchParams();
    
    if (jobId) {
      params.append('job_id', jobId);
    }
    if (filters.batch_id) params.append('batch_id', filters.batch_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.repo_name) params.append('repo_name', filters.repo_name);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.skip) params.append('skip', filters.skip.toString());
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    const response = await fetch(url);
    return response.json();
  },

  async listJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.batch_id) params.append('batch_id', filters.batch_id);
    if (filters.status) params.append('status', filters.status);
    if (filters.repo_name) params.append('repo_name', filters.repo_name);
    params.append('limit', (filters.limit || 50).toString());
    params.append('skip', (filters.skip || 0).toString());
    
    const response = await fetch(`${API_BASE}/status?${params}`);
    return response.json();
  },

  async abortJob(jobId) {
    const response = await fetch(`${API_BASE}/jobs/${jobId}/abort`, {
      method: 'POST',
    });
    return response.json();
  },

  async deleteJob(jobId) {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};