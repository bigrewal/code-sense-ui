import React from 'react';
import { Search, Database } from 'lucide-react';

export default function TopBar({ repoCount, activeRepo, searchTerm, onSearchChange }) {
  return (
    <div className="surface-card rounded-3xl px-4 py-4 sm:px-6 sm:py-4 fade-in-up">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">CodeSense</h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse repos, monitor ingestion, and ask focused code questions.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-[240px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-10 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <Database size={16} className="text-slate-500" />
            <span>{repoCount} repos</span>
          </div>

          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            {activeRepo ? activeRepo.split('/').pop() : 'No repo selected'}
          </div>
        </div>
      </div>
    </div>
  );
}
