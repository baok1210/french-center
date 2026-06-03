'use client';

import { Bell, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
}

export function Header({ title, userName, userRole }: HeaderProps) {
  const initial = userName?.charAt(0)?.toUpperCase() || 'HV';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-semibold tracking-tight">{title || 'Dashboard'}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full bg-primary ring-2 ring-card" />
        </button>
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
