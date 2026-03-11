import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`mb-4 flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} fade-in-up`}>
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700">
          <Bot size={18} />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[72%] ${
          isUser
            ? 'border-cyan-600 bg-cyan-600 text-white'
            : 'border-slate-200 bg-white text-slate-800'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-code:text-cyan-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
        <div className={`mt-2 text-[11px] ${isUser ? 'text-cyan-100' : 'text-slate-500'}`}>
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-600">
          <User size={18} />
        </div>
      )}
    </div>
  );
}
