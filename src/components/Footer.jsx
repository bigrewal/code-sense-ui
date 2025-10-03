import React from 'react';

export default function Footer() {
  return (
    <div className="bg-gray-100 px-6 py-2 border-t text-xs text-gray-600">
      Keyboard tips: <kbd className="px-1.5 py-0.5 bg-white border rounded">S</kbd>=Start  
      <kbd className="px-1.5 py-0.5 bg-white border rounded ml-2">N</kbd>=Next  
      <kbd className="px-1.5 py-0.5 bg-white border rounded ml-2">G</kbd>=Toggle Graph
    </div>
  );
}