const API_BASE = 'http://localhost:8000';

export const walkthroughApi = {
  async fetchRepos() {
    const response = await fetch(`${API_BASE}/repos`);
    const data = await response.json();
    return data.repos || [];
  },

  async startWalkthrough(repoId) {
    const response = await fetch(`${API_BASE}/walkthrough/repo/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId })
    });
    return response.json();
  },

  async fetchPlan(repoId) {
    const response = await fetch(`${API_BASE}/walkthrough/repo/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId })
    });
    return response.json();
  },

  async streamNext(repoId, onChunk) {
    const response = await fetch(`${API_BASE}/walkthrough/repo/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId })
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

  async gotoStep(repoId, filePath, onChunk) {
    const response = await fetch(`${API_BASE}/walkthrough/goto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId, file_path: filePath })
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
  }
};