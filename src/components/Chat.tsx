import React, { useState } from 'react';
import { queryRepo } from '../api';
import { Message } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    const res = await queryRepo(userMsg.text);
    const botMsg: Message = {
      id: Date.now().toString(),
      sender: 'bot',
      text: res.data.answer,
    };
    setMessages((m) => [...m, botMsg]);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded max-w-xl ${m.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="p-4 flex space-x-2">
        <input
          className="flex-1 border p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
