import React from 'react';

export default function PlanVisualization({ plan, currentStep }) {
  return (
    <div className="bg-white px-6 py-4 border-b">
      <div className="grid grid-cols-2 gap-4 h-48">
        {/* Graph Placeholder */}
        <div className="border rounded p-4 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-2">Dependency Graph</div>
          <div className="text-xs text-gray-500">
            {plan.nodes?.length || 0} nodes, {plan.edges?.length || 0} edges
          </div>
          <div className="mt-4 text-xs text-gray-400 italic">Graph visualization coming soon...</div>
        </div>

        {/* Outline */}
        <div className="border rounded p-4 bg-gray-50 overflow-y-auto">
          <div className="text-sm font-medium text-gray-700 mb-2">Sequence Outline</div>
          <div className="space-y-1">
            {plan.sequence?.map((item, idx) => (
              <div 
                key={idx}
                className={`text-xs py-1 px-2 rounded ${
                  idx === currentStep - 1 ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600'
                }`}
                style={{ paddingLeft: `${item.level * 12 + 8}px` }}
              >
                {idx + 1}. {item.file_path.split('/').pop()} {item.level > 0 && `(level ${item.level})`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}