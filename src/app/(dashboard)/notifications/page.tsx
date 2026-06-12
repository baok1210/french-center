'use client';

import { useState, useEffect } from 'react';
import { isDemoMode } from '@/data/admin-store';
import { loadDemoNotifications, markNotificationRead, markAllNotificationsRead } from '@/data/features-store';
import { Bell, CheckCheck, Calendar, Clock, MessageSquare, Award } from 'lucide-react';

const typeIcons: Record<string, any> = { schedule: Calendar, deadline: Clock, grade: Award, message: MessageSquare, system: Bell };

export default function NotificationsPage() {
  const demo = isDemoMode();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (!demo) return;
    const raw = localStorage.getItem('demo_user');
    try { const p = JSON.parse(raw || '{}'); setUserId(p.id || ''); } catch {}
  }, []);

  useEffect(() => {
    if (!userId) return;
    setNotifs(loadDemoNotifications(userId));
  }, [userId]);

  function handleMarkAll() {
    markAllNotificationsRead(userId);
    setNotifs(loadDemoNotifications(userId));
  }

  function handleRead(id: string) {
    markNotificationRead(id);
    setNotifs(loadDemoNotifications(userId));
  }

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold tracking-tight">Thông báo</h2><p className="text-sm text-muted-foreground">{unread} chưa đọc</p></div>
        {unread > 0 && <button onClick={handleMarkAll} className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"><CheckCheck className="h-3.5 w-3.5" />Đánh dấu tất cả đã đọc</button>}
      </div>

      <div className="space-y-2">
        {notifs.map((n: any) => {
          const Icon = typeIcons[n.type] || Bell;
          return (
            <div key={n.id} onClick={() => handleRead(n.id)}
              className={`diffusion-shadow flex items-start gap-4 rounded-2xl border p-5 transition-all cursor-pointer ${n.read ? 'border-border/50 bg-card' : 'border-primary/30 bg-primary/[0.02]'}`}>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.read ? 'bg-secondary' : 'bg-primary/10'}`}>
                <Icon className={`h-4 w-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">{n.created_at?.slice(0, 16).replace('T', ' ')}</p>
              </div>
            </div>
          );
        })}
        {notifs.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><Bell className="mx-auto h-8 w-8 text-muted-foreground/30" strokeWidth={1} /><p className="mt-2 text-sm text-muted-foreground">Chưa có thông báo nào</p></div>}
      </div>
    </div>
  );
}
