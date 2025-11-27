import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

export default function ConversationList({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  onNewConversation 
}) {
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
              className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer text-sm ${
                selectedConversationId === conv.conversation_id
                  ? 'bg-blue-50 text-blue-700'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <MessageSquare size={14} />
              <span className="truncate flex-1">
                {conv.title || `Chat ${new Date(conv.created_at).toLocaleDateString()}`}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}