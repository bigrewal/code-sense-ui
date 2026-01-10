import React from 'react';
import { X, CheckCircle, XCircle, Clock, Loader2, StopCircle } from 'lucide-react';

export default function JobDetailModal({ job, isOpen, onClose }) {
  if (!isOpen || !job) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={24} className="text-green-600" />;
      case 'failed':
        return <XCircle size={24} className="text-red-600" />;
      case 'running':
        return <Loader2 size={24} className="text-blue-600 animate-spin" />;
      case 'aborted':
      case 'aborting':
        return <StopCircle size={24} className="text-orange-600" />;
      case 'queued':
      case 'pending':
        return <Clock size={24} className="text-yellow-600" />;
      default:
        return <Clock size={24} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'aborted':
      case 'aborting':
        return 'text-orange-600 bg-orange-50';
      case 'queued':
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp * 1000) 
      : new Date(timestamp);
    return date.toLocaleString();
  };

  const stages = job.stages || {};
  const stageOrder = ['precheck', 'resolve_refs', 'repo_graph', 'mental_model'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Job Header */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            {getStatusIcon(job.status)}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{job.repo_name}</h4>
              <p className="text-sm text-gray-500">Job ID: {job.job_id || job.jobId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Created:</span>
              <span className="ml-2 font-medium">{formatDate(job.created_at)}</span>
            </div>
            <div>
              <span className="text-gray-600">Updated:</span>
              <span className="ml-2 font-medium">{formatDate(job.updated_at)}</span>
            </div>
            {job.current_stage && (
              <div className="col-span-2">
                <span className="text-gray-600">Current Stage:</span>
                <span className="ml-2 font-medium capitalize">{job.current_stage.replace('_', ' ')}</span>
              </div>
            )}
            {job.batch_id && (
              <div className="col-span-2">
                <span className="text-gray-600">Batch ID:</span>
                <span className="ml-2 font-mono text-xs">{job.batch_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {job.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h5 className="font-semibold text-red-900 mb-2">Error</h5>
            <p className="text-sm text-red-700">{job.error}</p>
          </div>
        )}

        {/* Stages */}
        <div className="mb-4">
          <h5 className="font-semibold text-gray-900 mb-3">Pipeline Stages</h5>
          <div className="space-y-3">
            {stageOrder.map(stageName => {
              const stage = stages[stageName] || {};
              const stageStatus = stage.status || 'pending';
              
              return (
                <div key={stageName} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize text-gray-900">
                      {stageName.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(stageStatus)}`}>
                      {stageStatus}
                    </span>
                  </div>
                  
                  {/* Precheck Metrics */}
                  {stageName === 'precheck' && stage.metrics && (
                    <div className="text-xs text-gray-600 space-y-1 mt-2 pl-2 border-l-2 border-gray-200">
                      <div>
                        Supported Tokens:{' '}
                        {stage.metrics.supported_tokens?.toLocaleString()}
                      </div>
                      <div>
                        Supported File count: {stage.metrics.supported_file_count}
                      </div>

                      {stage.metrics.language_distribution_pct &&
                        Object.keys(stage.metrics.language_distribution_pct).length > 0 && (
                          <div className="pt-1 border-t border-gray-300 mt-2">
                            <div className="font-medium mb-1">Language distribution:</div>
                            <div className="ml-2 space-y-0.5">
                              {Object.entries(stage.metrics.language_distribution_pct).map(
                                ([language, percentage]) => (
                                  <div key={language}>
                                    {language.charAt(0).toUpperCase() + language.slice(1)}:{' '}
                                    {percentage}%
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Mental Model Metrics */}
                  {stageName === 'mental_model' && stage.metrics && (
                    <div className="text-xs text-gray-600 space-y-1 mt-2 pl-2 border-l-2 border-gray-200">
                      <div>Critical Files: {stage.metrics.critical_files}</div>
                      <div>Files Ignored: {stage.metrics.files_ignored}</div>
                      <div>Context Tokens: {stage.metrics.repo_context_token_count?.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}