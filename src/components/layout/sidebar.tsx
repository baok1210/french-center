'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, FileBarChart,
  Bot, BookOpen, LogOut, ChevronLeft, Settings, Users, Calendar,
  UserPlus, Mic,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Student', 'TeacherTA', 'Admin'] },
  { href: '/teacher/evaluate', label: 'Nhập điểm', icon: ClipboardCheck, roles: ['TeacherTA', 'Admin'] },
  { href: '/teacher/evaluations', label: 'Lịch sử ĐG', icon: ClipboardCheck, roles: ['TeacherTA', 'Admin'] },
  // Admin management
  { href: '/admin/classes', label: 'Lớp học', icon: GraduationCap, roles: ['Admin'] },
  { href: '/admin/sessions', label: 'Buổi học', icon: Calendar, roles: ['Admin'] },
  { href: '/admin/enrollments', label: 'Ghi danh', icon: UserPlus, roles: ['Admin'] },
  { href: '/admin/students', label: 'Học viên', icon: Users, roles: ['Admin'] },
  { href: '/admin/reports', label: 'Báo cáo', icon: FileBarChart, roles: ['Admin'] },
  // Common
  { href: '/pronunciation', label: 'Phát âm', icon: Mic, roles: ['Student', 'TeacherTA', 'Admin'] },
  { href: '/resources', label: 'Tài nguyên', icon: BookOpen, roles: ['Student', 'TeacherTA', 'Admin'] },
  { href: '/ai-assistant', label: 'Trợ lý AI', icon: Bot, roles: ['Student', 'TeacherTA', 'Admin'] },
  { href: '/settings', label: 'Cài đặt', icon: Settings, roles: ['Student', 'TeacherTA', 'Admin'] },
];

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = 'Student' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = navItems.filter((item) => item.roles.includes(role));

  async function handleLogout() {
    localStorage.removeItem('demo_user');
    // Also try to sign out from Supabase
    try {
      const { createClient } = await import('@/lib/supabase-client');
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
  }

  return (
    <aside
      className={`flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border/50 px-5">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-[10px] font-bold text-primary-foreground">
              FC
            </div>
            <span className="text-sm font-semibold tracking-tight">French Center</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-[10px] font-bold text-primary-foreground">
              FC
            </div>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filtered.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/50 px-3 py-3">
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
            {!collapsed && <span>Đăng xuất</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto rounded-xl p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
