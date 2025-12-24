import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, Trash2, X, Plus } from 'lucide-react';
import ConversationList from './ConversationList';
import IngestionStatusBar from './IngestionStatusBar';

export default function Sidebar({ 
  repos, 
  selectedRepo, 
  expandedRepos, 
  toggleRepo, 
  selectRepo,
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onDeleteRepo,
  onOpenIngestModal,
  ingestionJobs,
  batches,
  onRemoveJob,
  onAbortJob,
  onDeleteJob,
  onGetJobDetails,
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState(null);
  const [deleteFiles, setDeleteFiles] = useState(false);

  const handleDeleteClick = (e, repo) => {
    e.stopPropagation();
    setRepoToDelete(repo);
    setDeleteModalOpen(true);
    setDeleteFiles(false);
  };

  const confirmDelete = () => {
    if (repoToDelete) {
      onDeleteRepo(repoToDelete, deleteFiles);
      setDeleteModalOpen(false);
      setRepoToDelete(null);
      setDeleteFiles(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setRepoToDelete(null);
    setDeleteFiles(false);
  };

  return (
    <>
      <div className="w-64 bg-white border-r overflow-y-auto">
        <div className="p-4">
          {/* Repositories Section */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Folder size={16} />
              <span>Repositories</span>
            </div>
            <button
              onClick={onOpenIngestModal}
              className="p-1 hover:bg-gray-100 rounded"
              title="Ingest repository"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
          
          {repos.map(repo => (
            <div key={repo} className="ml-2">
              <div 
                className="flex items-center gap-2 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer group"
                onClick={() => toggleRepo(repo)}
              >
                {expandedRepos[repo] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="text-sm flex-1">{repo.split('/').pop()}</span>
                <button
                  onClick={(e) => handleDeleteClick(e, repo)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                  title="Delete repository"
                >
                  <Trash2 size={14} className="text-red-600" />
                </button>
              </div>
              
              {expandedRepos[repo] && (
                <div className="ml-6">
                  <div 
                    className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer text-sm ${
                      selectedRepo === repo ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                    onClick={() => selectRepo(repo)}
                  >
                    <FileCode size={14} />
                    <span>{repo.split('/').pop()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Ingestion Status Bar */}
          <IngestionStatusBar
            jobs={ingestionJobs}
            batches={batches}
            onRemoveJob={onRemoveJob}
            onAbortJob={onAbortJob}
            onDeleteJob={onDeleteJob}
            onGetJobDetails={onGetJobDetails}
          />

          {/* Conversations Section */}
          {selectedRepo && (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={onSelectConversation}
              onNewConversation={onNewConversation}
              onDeleteConversation={onDeleteConversation}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Repository</h3>
              <button onClick={cancelDelete} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{repoToDelete}</strong>?
            </p>

            <label className="flex items-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteFiles}
                onChange={(e) => setDeleteFiles(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Also delete files from disk
              </span>
            </label>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}