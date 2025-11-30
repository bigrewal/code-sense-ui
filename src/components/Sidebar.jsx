import React from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder } from 'lucide-react';
import ConversationList from './ConversationList';

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
  onDeleteConversation
}) {
  return (
    <div className="w-64 bg-white border-r overflow-y-auto">
      <div className="p-4">
        {/* Repositories Section */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <Folder size={16} />
          <span>Repositories</span>
        </div>
        
        {repos.map(repo => (
          <div key={repo} className="ml-2">
            <div 
              className="flex items-center gap-2 py-2 px-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => toggleRepo(repo)}
            >
              {expandedRepos[repo] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="text-sm">{repo.split('/').pop()}</span>
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
  );
}