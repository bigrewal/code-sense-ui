import React from 'react';
import { Search, FolderSearch } from 'lucide-react';

export default function TopBar({ repoCount, searchTerm, onSearchChange }) {
  return (
    <div className="surface-card fade-in-up rounded-3xl px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-5">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Repository Workspace
          </div>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-none tracking-[-0.04em] sm:text-5xl">
                <span className="text-slate-900">Code</span>
                <span className="ml-1 text-slate-600">Sense</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(220px,0.5fr)]">
          <label className="relative block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search repositories by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-full min-h-[76px] w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="flex min-h-[76px] flex-col justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              <FolderSearch size={14} />
              Catalog
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-slate-900">{repoCount}</span>
              <span className="text-sm text-slate-500">repositories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
