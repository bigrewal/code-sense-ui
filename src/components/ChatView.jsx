import React, { useEffect, useRef } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatView({
  messages,
  onSendMessage,
  isStreaming,
  selectedRepo,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white/70 px-6 py-4 backdrop-blur-md">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Conversation</h3>
        <p className="mt-1 text-sm text-slate-700">
          {selectedRepo ? `Repo: ${selectedRepo}` : 'No repository selected'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8">
        {messages.length === 0 ? (
          <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
              <Bot size={22} />
            </div>
            <p className="text-base font-semibold text-slate-800">Start a focused repo conversation</p>
            <p className="mt-2 text-sm text-slate-500">
              Ask architecture, setup, or implementation questions about the selected repository.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isStreaming && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Finding out...
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={onSendMessage} disabled={isStreaming} />
    </div>
  );
}
