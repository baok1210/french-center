'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/auth-guard';
import { isDemoMode, loadDemoTeachers, loadDemoStudents } from '@/data/admin-store';
import { loadDemoMessages, sendDemoMessage, getConversations, markConversationRead } from '@/data/features-store';
import { FrenchKeyboard } from '@/components/french-keyboard';
import { Send, MessageSquare, User } from 'lucide-react';

export default function ChatPage() {
  const demo = isDemoMode();
  const [profile, setProfile] = useState<{ id: string; name: string; role: string } | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [input, setInput] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    if (!demo) return;
    const raw = localStorage.getItem('demo_user');
    try {
      const p = JSON.parse(raw || '{}');
      const role = p.role || 'Student';
      const name = p.full_name || p.email || '';
      setProfile({ id: p.id || '', name, role });
    } catch {}
  }, []);

  useEffect(() => {
    if (!profile) return;
    setConversations(getConversations(profile.id));
    // Load contacts based on role
    if (profile.role === 'Student') {
      setContacts(loadDemoTeachers().map((t: any) => ({ id: t.id, name: t.full_name, role: 'TeacherTA' })));
    } else {
      setContacts(loadDemoStudents().map((s: any) => ({ id: s.id, name: s.full_name, role: 'Student' })));
    }
  }, [profile]);

  function openChat(pid: string, pname: string) {
    setPartnerId(pid); setPartnerName(pname);
    markConversationRead(profile!.id, pid);
    setMessages(loadDemoMessages([profile!.id, pid].sort().join('-')));
    setConversations(getConversations(profile!.id));
  }

  function handleSend() {
    if (!input.trim() || !partnerId || !profile) return;
    sendDemoMessage(profile.id, profile.name, partnerId, partnerName, input.trim());
    setInput('');
    setMessages(loadDemoMessages([profile.id, partnerId].sort().join('-')));
    setConversations(getConversations(profile.id));
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar */}
      <div className="w-72 shrink-0 space-y-4 overflow-y-auto">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gần đây</h3>
          {conversations.map((c: any) => (
            <button key={c.partnerId} onClick={() => openChat(c.partnerId, c.partnerName)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-colors ${partnerId === c.partnerId ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">{c.partnerName?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{c.partnerName}</p>
                <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
              </div>
              {c.unread > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{c.unread}</span>}
            </button>
          ))}
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Liên hệ</h3>
          {contacts.map((c: any) => (
            <button key={c.id} onClick={() => openChat(c.id, c.name)}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm transition-colors hover:bg-secondary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-xs font-medium">{c.name?.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.role === 'TeacherTA' ? 'Giáo viên' : 'Học viên'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-2xl border border-border/50 bg-card">
        {partnerId ? (
          <>
            <div className="flex items-center gap-3 border-b border-border/50 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">{partnerName?.charAt(0)}</div>
              <div><p className="text-sm font-medium">{partnerName}</p></div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {messages.map((m: any) => {
                const isMe = m.from_id === profile?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
                      <p>{m.content}</p>
                      <p className={`mt-1 text-[10px] ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{m.created_at?.slice(11, 16)}</p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">Chưa có tin nhắn nào</p>}
            </div>
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập tin nhắn..." className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <button onClick={handleSend} disabled={!input.trim()}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <FrenchKeyboard onInsert={(char) => setInput(prev => prev + char)} />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
              <p className="mt-3 text-sm text-muted-foreground">Chọn một cuộc hội thoại để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
