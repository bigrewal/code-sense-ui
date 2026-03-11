import React, { useEffect, useState } from 'react';
import { X, GitBranch } from 'lucide-react';

export default function IngestRepoModal({ isOpen, onClose, onIngest, onIngestBatch }) {
  const [repoInput, setRepoInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [enablePrecheck, setEnablePrecheck] = useState(true);
  const [enableResolveRefs, setEnableResolveRefs] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  const parseRepoInput = (input) => {
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
        await onIngest(repos[0], {
          enable_precheck: enablePrecheck,
          enable_resolve_refs: enableResolveRefs,
        });
      } else {
        await onIngestBatch(repos, {
          enable_precheck: enablePrecheck,
          enable_resolve_refs: enableResolveRefs,
        });
      }

      setRepoInput('');
    } catch (err) {
      if (err?.status === 409) {
        setError(err.message || 'An ingestion job is already in progress.');
      } else {
        setError(err.message || 'Failed to start ingestion');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const repoCount = parseRepoInput(repoInput).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-lg rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Ingest Repository</h3>
            <p className="text-sm text-slate-500">Queue one or more repositories for indexing.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="repoInput" className="mb-2 block text-sm font-semibold text-slate-700">
              Repository Name(s)
            </label>
            <div className="relative">
              <GitBranch size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
              <textarea
                id="repoInput"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="org/repo-one\norg/repo-two"
                className="w-full resize-none rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                rows={4}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Repositories should exist in <code className="rounded bg-slate-100 px-1">data/</code>
              </p>
              {repoCount > 0 && (
                <span className="text-xs font-semibold text-cyan-700">
                  {repoCount} repo{repoCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Separate multiple repos with commas or new lines. They will be queued one-at-a-time.
            </p>
          </div>

          <div className="mb-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={enablePrecheck}
                onChange={(e) => setEnablePrecheck(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-300"
                disabled={isSubmitting}
              />
              <span className="text-sm text-slate-700">Enable precheck</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={enableResolveRefs}
                onChange={(e) => setEnableResolveRefs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-300"
                disabled={isSubmitting}
              />
              <span className="text-sm text-slate-700">Enable resolve refs</span>
            </label>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!repoInput.trim() || isSubmitting}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? 'Starting...' : `Ingest ${repoCount > 1 ? `(${repoCount})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
