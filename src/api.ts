import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const ingestRepo = (form: FormData | { repo_path: string; job_id: string }) => {
  if (form instanceof FormData) {
    return api.post('/ingest', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/ingest', form);
};

export const getStatus = (jobId: string) => api.get(`/status/${jobId}`);

export const queryRepo = (repo: string, query: string) =>
  api.post('/query', { question: query, repo_id: repo });

export const queryRepoStream = async (
  repo: string,
  query: string,
  signal?: AbortSignal
) => {
  const base =
    api.defaults.baseURL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return fetch(`${base}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: query, repo_id: repo }),
    signal,
  });
};


export const login = (email: string, password: string) =>
  api.post('/login', { email, password });

export const signup = (email: string, password: string) =>
  api.post('/signup', { email, password });

export const createCheckout = () => api.post('/stripe/create-checkout-session');

export const fetchRepos = () => api.get('/repos');
