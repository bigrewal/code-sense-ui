import React from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  onNewConversation,
  onDeleteConversation
}) {
  const handleDelete = (e, conversationId) => {
    e.stopPropagation(); // Prevent selecting conversation when clicking delete
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(conversationId);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MessageSquare size={16} />
          <span>Conversations</span>
        </div>
        <button
          onClick={onNewConversation}
          className="p-1 hover:bg-gray-100 rounded"
          title="New conversation"
        >
          <Plus size={16} className="text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-1 px-2">
        {conversations.length === 0 ? (
          <div className="text-xs text-gray-400 italic px-2 py-2">
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.conversation_id}
              onClick={() => onSelectConversation(conv.conversation_id)}
              className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer text-sm group ${
                selectedConversationId === conv.conversation_id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <MessageSquare size={14} className="flex-shrink-0" />
              <span className="truncate flex-1">
                {conv.title || `Chat ${new Date(conv.created_at).toLocaleDateString()}`}
              </span>
              <button
                onClick={(e) => handleDelete(e, conv.conversation_id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                title="Delete conversation"
              >
                <Trash2 size={14} className="text-red-600" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}