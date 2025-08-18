import React, { useState } from 'react';
import { queryRepo, queryRepoStream} from '../api';
import { Message } from '../types';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1) Push user message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((m) => [...m, userMsg]);

    // 2) Prepare empty bot message to progressively fill
    const botId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: botId, sender: 'bot', text: '' }]);

    const question = input;
    setInput('');

    const controller = new AbortController();

    try {
      // ✅ Uses the same baseURL as axios (http://localhost:8000 by default)
      const resp = await queryRepoStream(question, controller.signal);

      if (!resp.ok || !resp.body) {
        let errText = `Request failed (${resp?.status || 'no status'})`;
        try {
          const j = await resp.json();
          if (j?.error) errText = j.error;
        } catch {}
        setMessages((m) => m.map((msg) => (msg.id === botId ? { ...msg, text: errText } : msg)));
        return;
      }

      // 3) Stream & parse SSE
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events end with a blank line
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // Gather data: lines
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
