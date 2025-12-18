import React from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import IngestRepoModal from './components/IngestRepoModal';
import { useWalkthrough } from './hooks/useWalkthrough';

export default function App() {
  const {
    repos,
    selectedRepo,
    expandedRepos,
    conversations,
    selectedConversationId,
    chatMessages,
    isChatStreaming,
    ingestModalOpen,
    ingestionJobs,
    batches,
    toggleRepo,
    selectRepo,
    handleNewConversation,
    handleSelectConversation,
    handleSendMessage,
    handleDeleteConversation,
    handleDeleteRepo,
    handleOpenIngestModal,
    handleCloseIngestModal,
    handleIngestRepos,
    handleIngestRepo,
    handleRemoveJob,
    handleAbortJob,
    handleDeleteJob,
  } = useWalkthrough();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          repos={repos}
          selectedRepo={selectedRepo}
          expandedRepos={expandedRepos}
          toggleRepo={toggleRepo}
          selectRepo={selectRepo}
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onDeleteRepo={handleDeleteRepo}
          onOpenIngestModal={handleOpenIngestModal}
          ingestionJobs={ingestionJobs}
          batches={batches}
          onRemoveJob={handleRemoveJob}
          onAbortJob={handleAbortJob}
          onDeleteJob={handleDeleteJob}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedConversationId ? (
            <ChatView
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isStreaming={isChatStreaming}
              conversationId={selectedConversationId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-2">Select a repository and start a conversation</p>
                <p className="text-sm">or create a new chat to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <IngestRepoModal
        isOpen={ingestModalOpen}
        onClose={handleCloseIngestModal}
        onIngest={handleIngestRepo}
        onIngestBatch={handleIngestRepos} // ADD THIS
      />
    </div>
  );
}