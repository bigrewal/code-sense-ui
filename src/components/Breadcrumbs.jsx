import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ sequence, currentStep }) {
  if (currentStep === 0) return null;
  
  const breadcrumbItems = sequence.slice(Math.max(0, currentStep - 3), currentStep);
  
  return (
    <div className="bg-gray-50 px-6 py-2 border-b">
      <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
        {breadcrumbItems.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="whitespace-nowrap">{item.file_path.split('/').pop()}</span>
            {idx < breadcrumbItems.length - 1 && <ChevronRight size={14} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}