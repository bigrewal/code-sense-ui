import React, { useState } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, Layers, StopCircle, Trash2 } from 'lucide-react';
import JobDetailModal from './JobDetailModal';
import { Api } from '../api/Api';

export default function IngestionStatusBar({ jobs, batches, onRemoveJob, onAbortJob, onDeleteJob, onGetJobDetails }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  if (jobs.length === 0) return null;

  const handleJobClick = async (job) => {
    try {
      const fullJobDetails = await Api.getJobStatus(job.jobId);
      setSelectedJob(fullJobDetails);
      setDetailModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch job details:', err);
      setSelectedJob(job);
      setDetailModalOpen(true);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'running':
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
      case 'aborted':
      case 'aborting':
        return <StopCircle size={16} className="text-orange-600" />;
      case 'queued':
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'aborted':
      case 'aborting':
        return 'bg-orange-50 border-orange-200';
      case 'queued':
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Group jobs by batch
  const batchJobs = {};
  const singleJobs = [];

  jobs.forEach(job => {
    if (job.isBatch && job.batchId) {
      if (!batchJobs[job.batchId]) {
        batchJobs[job.batchId] = [];
      }
      batchJobs[job.batchId].push(job);
    } else {
      singleJobs.push(job);
    }
  });

  // Sort batch jobs by batch_index
  Object.keys(batchJobs).forEach(batchId => {
    batchJobs[batchId].sort((a, b) => (a.batchIndex || 0) - (b.batchIndex || 0));
  });

  const canRemoveBatch = (batchId) => {
    const jobs = batchJobs[batchId] || [];
    return jobs.every(j => j.status === 'completed' || j.status === 'failed' || j.status === 'aborted');
  };

  const canDeleteJob = (status) => {
    return status === 'completed' || status === 'failed' || status === 'aborted';
  };

  const canAbortJob = (status) => {
    return status === 'running' || status === 'queued' || status === 'pending';
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="text-xs font-medium text-gray-700 mb-2 px-4">
        Ingestion Jobs
      </div>
      <div className="space-y-3 px-2">
        {/* Batch Jobs */}
        {Object.entries(batchJobs).map(([batchId, batchJobList]) => {
          const completedCount = batchJobList.filter(j => j.status === 'completed').length;
          const failedCount = batchJobList.filter(j => j.status === 'failed').length;
          const runningCount = batchJobList.filter(j => j.status === 'running').length;
          const abortingCount = batchJobList.filter(j => j.status === 'aborting').length;
          const abortedCount = batchJobList.filter(j => j.status === 'aborted').length;
          const queuedCount = batchJobList.filter(j => j.status === 'queued' || j.status === 'pending').length;

          return (
            <div key={batchId} className="border rounded p-2 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-purple-600" />
                  <span className="text-xs font-semibold text-gray-800">
                    Batch ({batchJobList.length} repos)
                  </span>
                </div>
                {canRemoveBatch(batchId) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveJob(batchJobList[0].jobId);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Remove batch"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-600 mb-2 flex gap-3">
                {completedCount > 0 && <span className="text-green-600">✓ {completedCount}</span>}
                {runningCount > 0 && <span className="text-blue-600">⟳ {runningCount}</span>}
                {queuedCount > 0 && <span className="text-yellow-600">⋯ {queuedCount}</span>}
                {abortingCount > 0 && <span className="text-orange-600">⊗ {abortingCount}</span>}
                {abortedCount > 0 && <span className="text-orange-500">⊘ {abortedCount}</span>}
                {failedCount > 0 && <span className="text-red-600">✗ {failedCount}</span>}
              </div>

              <div className="space-y-1">
                {batchJobList.map((job) => (
                  <div
                    key={job.jobId}
                    onClick={() => handleJobClick(job)}
                    className={`border rounded p-1.5 ${getStatusColor(job.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(job.status)}
                        <span className="text-xs text-gray-700 truncate">
                          {job.repo_name?.split('/').pop() || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {canAbortJob(job.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAbortJob(job.jobId);
                            }}
                            className="text-orange-600 hover:text-orange-800"
                            title="Abort job"
                          >
                            <StopCircle size={12} />
                          </button>
                        )}
                        {canDeleteJob(job.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteJob(job.jobId);
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Delete job"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    {job.current_stage && job.status === 'running' && (
                      <div className="text-[10px] text-gray-500 ml-5 capitalize">
                        {job.current_stage.replace('_', ' ')}
                      </div>
                    )}
                    {job.status === 'failed' && job.error && (
                      <div className="text-[10px] text-red-600 ml-5 truncate">
                        {job.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Single Jobs */}
        {singleJobs.map((job) => (
          <div
            key={job.jobId}
            onClick={() => handleJobClick(job)}
            className={`border rounded p-2 ${getStatusColor(job.status)} cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getStatusIcon(job.status)}
                <span className="text-xs font-medium text-gray-800 truncate">
                  {job.repo_name?.split('/').pop() || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {canAbortJob(job.status) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAbortJob(job.jobId);
                    }}
                    className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                    title="Abort job"
                  >
                    <StopCircle size={14} />
                  </button>
                )}
                {canDeleteJob(job.status) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteJob(job.jobId);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Delete job"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-600">
              {job.current_stage && job.status === 'running' && (
                <div className="capitalize">Stage: {job.current_stage.replace('_', ' ')}</div>
              )}
              {job.status === 'failed' && job.error && (
                <div className="text-red-600 mt-1">{job.error}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </div>
  );
}