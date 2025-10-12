const API_BASE = 'http://localhost:8000';

export const walkthroughApi = {
  async fetchRepos() {
    const response = await fetch(`${API_BASE}/repos`);
    const data = await response.json();
    return data.repos || [];
  },

  async startWalkthrough(repoId) {
    const response = await fetch(`${API_BASE}/repo/walkthrough/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId })
    });
    return response.json();
  },

  async fetchPlan(repoId, depth = 2) {
    const response = await fetch(`${API_BASE}/repo/walkthrough/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repo_id: repoId, depth: depth })
    });
    return response.json();
  },

  async fetchArchitecture(repoId) {
    const response = await fetch(`${API_BASE}/repo/architecture?repo_id=${repoId}`);
    return response.json();
  },

  async streamNext(repoId, entryPoint, currentLevel, currentFilePath, depth, onChunk) {  // ADDED depth parameter
    const body = { 
      repo_id: repoId,
      entry_point: entryPoint,
      current_level: currentLevel,
      depth: depth // NEW: Add depth to request body
    };
    
    if (currentFilePath !== null) {
      body.current_file_path = currentFilePath;
    }

    const response = await fetch(`${API_BASE}/repo/walkthrough/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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
    const response = await fetch(`${API_BASE}/repo/walkthrough/goto`, {
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