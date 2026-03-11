const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function readJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function buildApiError(response) {
  let detail = `Request failed with status ${response.status}`;
  try {
    const payload = await readJson(response);
    if (payload?.detail) {
      detail = payload.detail;
    }
  } catch {
    // Ignore parse errors and keep generic detail.
  }
  const error = new Error(detail);
  error.status = response.status;
  return error;
}

export const Api = {
  async fetchRepos() {
    const response = await fetch(`${API_BASE}/repos`);
    if (!response.ok) {
      throw await buildApiError(response);
    }
    const data = await readJson(response);
    return data.repos || [];
  },

  async createConversation(repoId) {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_name: repoId })
    });
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async listConversations(repoId = null, limit = 50, offset = 0) {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (repoId) {
      params.append('repo_name', repoId);
    }
    const response = await fetch(`${API_BASE}/conversations?${params}`);
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async getConversationMessages(conversationId, limit = 200) {
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages?limit=${limit}`);
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
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
    if (!response.ok || !response.body) {
      throw await buildApiError(response);
    }

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
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async deleteRepo(repoName, deleteFiles = false) {
    const params = new URLSearchParams({
      repo_name: repoName,
      delete_files: String(deleteFiles),
    });
    const response = await fetch(`${API_BASE}/repos?${params}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async ingestRepo(repoName, options = {}) {
    const payload = {
      repo_name: repoName,
    };
    if (typeof options.enable_precheck === 'boolean') {
      payload.enable_precheck = options.enable_precheck;
    }
    if (typeof options.enable_resolve_refs === 'boolean') {
      payload.enable_resolve_refs = options.enable_resolve_refs;
    }

    const response = await fetch(`${API_BASE}/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async ingestRepos(repoNames, options = {}) {
    const repos = Array.isArray(repoNames) ? repoNames : [repoNames];
    const results = [];

    for (let i = 0; i < repos.length; i += 1) {
      const repoName = repos[i];
      try {
        const data = await this.ingestRepo(repoName, options);
        results.push({
          repo_name: repoName,
          ok: true,
          data,
        });
      } catch (error) {
        results.push({
          repo_name: repoName,
          ok: false,
          error: error.message || 'Failed to start ingestion',
          status: error.status || null,
        });
        if (error.status === 409) {
          for (let j = i + 1; j < repos.length; j += 1) {
            results.push({
              repo_name: repos[j],
              ok: false,
              error: error.message || 'An ingestion job is already in progress.',
              status: 409,
            });
          }
          break;
        }
      }
    }

    return results;
  },

  async getJobStatus(jobId) {
    const response = await fetch(`${API_BASE}/status?job_id=${jobId}`);
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async listJobs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.repo_name) params.append('repo_name', filters.repo_name);
    params.append('limit', (filters.limit || 50).toString());
    params.append('skip', (filters.skip || 0).toString());

    const response = await fetch(`${API_BASE}/status?${params}`);
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },

  async deleteJob(jobId) {
    const response = await fetch(`${API_BASE}/jobs/${jobId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw await buildApiError(response);
    }
    return readJson(response);
  },
};
