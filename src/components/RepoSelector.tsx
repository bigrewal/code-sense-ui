import React from 'react';
import { Repo } from '../types';

interface Props {
  repos: string[];
  current: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

const RepoSelector: React.FC<Props> = ({ repos, current, onSelect, onNewChat }) => (
  <div className="flex items-center space-x-2">
    <select
      className="border p-2 rounded"
      value={current || ''}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="" disabled>
        Select repo
      </option>
      {repos.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
    <button className="bg-gray-200 p-2 rounded" onClick={onNewChat}>
      New Chat
    </button>
  </div>
);

export default RepoSelector;
