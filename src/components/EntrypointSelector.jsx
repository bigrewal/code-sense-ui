import React from 'react';
import { Code, Layers } from 'lucide-react';

export default function EntryPointSelector({ entryPoints, selectedIndex, onSelect, depth, onDepthChange }) {
  const depthOptions = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white px-6 py-3 border-b">
      <div className="flex items-center gap-6">
        {/* Entry Point Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Code size={16} />
            <span className="font-medium">Entry Point:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {entryPoints.map((entryPoint, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {entryPoint.split('/').pop()}
              </button>
            ))}
          </div>
        </div>

        {/* Depth Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Layers size={16} />
            <span className="font-medium">Depth:</span>
          </div>
          <select
            value={depth}
            onChange={(e) => onDepthChange(Number(e.target.value))}
            className="px-3 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {depthOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            (how deep to explore dependencies)
          </span>
        </div>
      </div>
    </div>
  );
}