import React from 'react';
import { Code } from 'lucide-react';

export default function EntryPointSelector({ entryPoints, selectedIndex, onSelect }) {
  return (
    <div className="bg-white px-6 py-3 border-b">
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
    </div>
  );
}