'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppShellProps {
  children: React.ReactNode;
  role?: string;
  title?: string;
  userName?: string;
}

export function AppShell({ children, role = 'Student', title, userName }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} userName={userName} userRole={role} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
