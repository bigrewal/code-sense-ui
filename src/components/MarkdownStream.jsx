import React from 'react';

export default function MarkdownStream({ content, walkthroughState, contentRef }) {
  return (
    <div 
      ref={contentRef}
      className="flex-1 overflow-y-auto px-6 py-4 bg-white"
    >
      {content ? (
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap text-sm">{content}</pre>
        </div>
      ) : (
        <div className="text-gray-400 text-sm italic">
          {walkthroughState === 'ready' 
            ? 'Click "Next" to start the walkthrough...' 
            : 'Select a repository and click "Start" to begin...'}
        </div>
      )}
    </div>
  );
}