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
    <div className="p-2 bg-gray-100 rounded">
      <h4 className="font-semibold mb-2">Ingestion Progress</h4>
      <ul className="space-y-1 text-sm">
        {stages.map((s) => (
          <li key={s.stage_name} className="flex justify-between">
            <span>{s.stage_name}</span>
            <span>{s.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusViewer;
