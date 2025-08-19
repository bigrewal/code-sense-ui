import React, { useEffect, useState } from 'react';
import { getStatus } from '../api';

interface Stage {
  stage_name: string;
  status: string;
}

const StatusViewer: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await getStatus(jobId);
      setStages(res.data?.stages || []);
    }, 2000);

    return () => clearInterval(id);
  }, [jobId]);

  return (
    <div className="p-3 bg-[#2a2b32] rounded-md text-sm space-y-2">
      <h4 className="font-semibold">Ingestion Progress</h4>
      <ul className="space-y-1">
        {stages.map((s) => (
          <li key={s.stage_name} className="flex justify-between">
            <span>{s.stage_name}</span>
            <span className="text-gray-400">{s.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusViewer;
