import React from 'react';

interface Conversation {
  id: string;
  title: string;
}

interface Props {
  conversations: Conversation[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onIngest: () => void;
}

const Sidebar: React.FC<Props> = ({ conversations, currentId, onSelect, onNew, onIngest }) => {
  return (
    <div className="w-64 bg-[#202123] text-gray-200 flex flex-col p-2">
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-3 py-2 mb-3 border border-gray-600/50 rounded-md hover:bg-gray-500/10"
      >
        <span className="text-lg">+</span>
        <span>New Chat</span>
      </button>
      <div className="flex-1 overflow-y-auto space-y-1">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center px-3 py-2 rounded-md hover:bg-gray-500/10 ${
              currentId === c.id ? 'bg-gray-500/20' : ''
            }`}
          >
            <span className="truncate">{c.title || 'New Chat'}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onIngest}
        className="mt-2 flex items-center gap-2 px-3 py-2 border border-gray-600/50 rounded-md hover:bg-gray-500/10"
      >
        <span className="text-lg">⬆</span>
        <span>Ingest Code Repo</span>
      </button>
    </div>
  );
};

export default Sidebar;
