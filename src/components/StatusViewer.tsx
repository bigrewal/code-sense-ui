import React, { useEffect, useState } from 'react';
import { getStatus } from '../api';

const StatusViewer: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getStatus(jobId);
      setStatus(res.data.status);
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="p-2 bg-gray-100 rounded">Status: {status}</div>
  );
};

export default StatusViewer;
