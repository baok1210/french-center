'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/ai';
import { LEVEL_OPTIONS } from '@/data/levels';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState('Beginner');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }, { role: 'assistant', content: 'Đang tạo câu trả lời...' }]);

    try {
      const apiKey = localStorage.getItem('app_settings_openai_key') || '';
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messages.filter((m) => m.role !== 'system'), question, level, apiKey }),
      });
      const data = await res.json();
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: data.message ?? data.error ?? 'Lỗi' }; return u; });
    } catch {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: 'Lỗi kết nối' }; return u; });
    } finally { setLoading(false); }
  }

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-border/50 bg-card">
      <div className="flex items-center gap-3 border-b border-border/50 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Bot className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium">AI French Assistant</span>
        <select value={level} onChange={(e) => setLevel(e.target.value)}
          className="ml-auto rounded-xl border border-border bg-card px-3 py-1.5 text-xs text-foreground outline-none">
          {LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Bot className="h-8 w-8" strokeWidth={1} />
            <p>Hỏi bất kỳ câu gì về tiếng Pháp</p>
          {typeof window !== 'undefined' && !localStorage.getItem('app_settings_openai_key') && !process.env.NEXT_PUBLIC_OPENAI_KEY && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              Chưa cấu hình API key. Vào <a href="/settings" className="underline">Cài đặt</a> để thêm.
            </p>
          )}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
            }`}>{msg.content}</div>
            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-border/50 p-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập câu hỏi về tiếng Pháp..." disabled={loading}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          className="rounded-xl bg-primary p-2.5 text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
          <Send className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
