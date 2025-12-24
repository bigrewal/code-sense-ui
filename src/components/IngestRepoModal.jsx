import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function IngestRepoModal({ isOpen, onClose, onIngest, onIngestBatch }) {
  const [repoInput, setRepoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const parseRepoInput = (input) => {
    // Split by commas or newlines, trim, and filter empty
    return input
      .split(/[,\n]/)
      .map(r => r.trim())
      .filter(r => r.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoInput.trim()) return;

    setIsSubmitting(true);
    setError('');
    
    try {
      const repos = parseRepoInput(repoInput);
      
      if (repos.length === 0) {
        setError('Please enter at least one repository name');
        setIsSubmitting(false);
        return;
      }
      
      if (repos.length === 1) {
        await onIngest(repos[0]);
      } else {
        await onIngestBatch(repos);
      }
      
      setRepoInput('');
      // Modal will be closed by the hook
    } catch (err) {
      setError(err.message || 'Failed to start ingestion');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const repoCount = parseRepoInput(repoInput).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ingest Repository</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="repoInput" className="block text-sm font-medium text-gray-700 mb-2">
              Repository Name(s)
            </label>
            <textarea
              id="repoInput"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g., my-project&#10;or: repo1, repo2, repo3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Repositories should exist in <code className="bg-gray-100 px-1 rounded">data/</code>
              </p>
              {repoCount > 0 && (
                <span className="text-xs font-medium text-blue-600">
                  {repoCount} repo{repoCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple repos with commas or new lines
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!repoInput.trim() || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Starting...' : `Ingest ${repoCount > 1 ? `(${repoCount})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}