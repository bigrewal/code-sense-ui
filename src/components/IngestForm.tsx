import React, { useState } from 'react';
import { ingestRepo } from '../api';
import StatusViewer from './StatusViewer';

const IngestForm: React.FC<{ onRepoAdded: (repo: string) => void }> = ({ onRepoAdded }) => {
  const [source, setSource] = useState<'github' | 'local' | 'upload'>('github');
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const job_id = input;
    let payload: any;
    if (source === 'upload' && file) {
      const form = new FormData();
      form.append('file', file);
      form.append('job_id', job_id);
      payload = form;
    } else {
      payload = { repo_path: input, job_id };
    }
    await ingestRepo(payload);
    setJobId(job_id);
    onRepoAdded(input || file?.name || job_id);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex space-x-4">
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={source === 'github'}
              onChange={() => setSource('github')}
            />
            <span>GitHub URL</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={source === 'local'}
              onChange={() => setSource('local')}
            />
            <span>Local Path</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="radio"
              checked={source === 'upload'}
              onChange={() => setSource('upload')}
            />
            <span>Upload Zip</span>
          </label>
        </div>
        {source === 'upload' ? (
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        ) : (
          <input
            className="w-full border p-2"
            placeholder={source === 'github' ? 'https://github.com/user/repo' : '/path/to/repo'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}
        <button className="bg-purple-500 text-white px-4 py-2 rounded" type="submit">
          Ingest
        </button>
      </form>
      {jobId && <StatusViewer jobId={jobId} />}
    </div>
  );
};

export default IngestForm;
