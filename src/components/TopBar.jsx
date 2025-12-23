import React from 'react';

export default function TopBar() {
  return (
    <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">CodeSense</h1>
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Search..." 
          className="px-3 py-1.5 border rounded text-sm"
        />
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
          U
        </div>
      </div>
    </div>
  );
}