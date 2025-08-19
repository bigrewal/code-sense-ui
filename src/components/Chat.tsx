import React, { useState } from 'react';
import { queryRepoStream } from '../api';
import { Message } from '../types';

interface Props {
  repos: string[];
  repo: string | null;
  onRepoChange: (repo: string) => void;
  onTitle: (title: string) => void;
}

const Chat: React.FC<Props> = ({ repos, repo, onRepoChange, onTitle }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim() || !repo) return;

    if (messages.length === 0) {
      onTitle(input.slice(0, 30));
    }

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);

    const botId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: botId, sender: 'bot', text: '' }]);

    const question = input;
    setInput('');

    const controller = new AbortController();

    try {
      const resp = await queryRepoStream(repo, question, controller.signal);

      if (!resp.ok || !resp.body) {
        let errText = `Request failed (${resp?.status || 'no status'})`;
        try {
          const j = await resp.json();
          if (j?.error) errText = j.error;
        } catch {}
        setMessages((m) => m.map((msg) => (msg.id === botId ? { ...msg, text: errText } : msg)));
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const dataLines = rawEvent
            .split('\n')
            .filter((l) => l.startsWith('data:'))
            .map((l) => l.slice(5).trim());

          if (!dataLines.length) continue;

          const payloadStr = dataLines.join('\n');
          let piece = '';
          try {
            const payload = JSON.parse(payloadStr);
            piece =
              payload?.text ??
              payload?.delta ??
              payload?.content ??
              (typeof payload === 'string' ? payload : JSON.stringify(payload));
          } catch {
            piece = payloadStr;
          }

          if (piece) {
            setMessages((m) =>
              m.map((msg) => (msg.id === botId ? { ...msg, text: msg.text + piece } : msg))
            );
          }
        }
      }
    } catch (err: any) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === botId
            ? { ...msg, text: `Stream error: ${err?.message || String(err)}` }
            : msg
        )
      );
    } finally {
      controller.abort();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#343541]">
      <div className="p-4 border-b border-gray-700">
        <select
          className="bg-[#40414f] text-gray-100 px-3 py-2 rounded-md focus:outline-none"
          value={repo || ''}
          onChange={(e) => onRepoChange(e.target.value)}
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
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`whitespace-pre-wrap px-4 py-6 border-b border-gray-700/50 last:border-b-0 ${
                m.sender === 'user' ? 'bg-[#343541]' : 'bg-[#444654]'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-700 p-4">
        <div className="max-w-3xl mx-auto w-full flex">
          <input
            className="flex-1 bg-[#40414f] text-gray-100 placeholder-gray-400 px-4 py-3 rounded-md focus:outline-none border border-gray-700"
            value={input}
            placeholder={repo ? 'Ask a question about the repo...' : 'Select a repo to start chatting'}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="ml-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white"
            onClick={sendMessage}
            disabled={!repo}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
