import React, { useEffect, useState } from 'react';
import { getStatus } from '../api';

const StatusViewer: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [status, setStatus] = useState<string>('pending');

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await getStatus(jobId);
      const stages = res.data?.stages || [];

      const failed = stages.find((s: any) => s.status === 'failed');
      const done = stages.some(
        (s: any) => s.stage_name === 'Mental Model Generation' && s.status === 'completed'
      );

      if (failed) {
        setStatus(`failed: ${failed.stage_name}`);
        clearInterval(id);
        return;
      }

      if (done) {
        setStatus('completed');
        clearInterval(id);
        return;
      }

      const latest = stages[stages.length - 1];
      setStatus(latest ? `${latest.stage_name}: ${latest.status}` : 'pending');
    }, 2000);

    return () => clearInterval(id);
  }, [jobId]);

  return (
    <div className="p-2 bg-gray-100 rounded">Status: {status}</div>
  );
};

export default StatusViewer;
