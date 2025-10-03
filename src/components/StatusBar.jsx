import React from 'react';

export default function StatusBar({ walkthroughState, currentStep, totalSteps }) {
  return (
    <div className="bg-gray-50 px-6 py-3 border-b">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Plan:</span>
          <span className={`px-2 py-1 rounded ${
            walkthroughState === 'ready' ? 'bg-green-100 text-green-700' :
            walkthroughState === 'loading' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {walkthroughState === 'ready' ? '● Ready' :
             walkthroughState === 'loading' ? '○ Loading' :
             '○ Not started'}
          </span>
        </div>
        {totalSteps > 0 && (
          <div className="text-gray-600">
            Current Step: <span className="font-medium">{currentStep}/{totalSteps}</span>
          </div>
        )}
      </div>
    </div>
  );
}