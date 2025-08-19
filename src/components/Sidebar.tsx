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
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <button
        onClick={onNew}
        className="m-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-left"
      >
        + New Chat
      </button>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full text-left px-4 py-2 hover:bg-gray-800 ${
              currentId === c.id ? 'bg-gray-800' : ''
            }`}
          >
            {c.title || 'New Chat'}
          </button>
        ))}
      </div>
      <button
        onClick={onIngest}
        className="m-2 px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-left"
      >
        Ingest Code Repo
      </button>
    </div>
  );
};

export default Sidebar;
