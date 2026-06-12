'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import { isDemoMode } from '@/data/admin-store';
import { getUnreadCount } from '@/data/features-store';

interface HeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
}

export function Header({ title, userName, userRole }: HeaderProps) {
  const initial = userName?.charAt(0)?.toUpperCase() || 'HV';
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isDemoMode()) return;
    const raw = localStorage.getItem('demo_user');
    if (!raw) return;
    try {
      const p = JSON.parse(raw);
      if (p?.id) {
        setUnread(getUnreadCount(p.id));
        const interval = setInterval(() => setUnread(getUnreadCount(p.id)), 10000);
        return () => clearInterval(interval);
      }
    } catch {}
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-semibold tracking-tight">{title || 'Dashboard'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/notifications"
          className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-card">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
            {initial}
          </div>
          <span className="hidden text-sm font-medium sm:inline">{userName || 'Học viên'}</span>
        </div>
      </div>
    </header>
  );
}
