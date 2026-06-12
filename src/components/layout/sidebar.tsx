'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, GraduationCap, ClipboardCheck, FileBarChart,
  Bot, BookOpen, LogOut, ChevronLeft, Settings, Users, Calendar,
  UserPlus, Mic, Library, Wand2, Brain, Notebook, MessageSquare,
  Bell, FileText, ListChecks, BookMarked, MapPin,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: string[];
  group: string;
  groupLabel: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Student', 'TeacherTA', 'Admin'], group: 'main', groupLabel: '' },
  // Teaching
  { href: '/teacher/evaluate', label: 'Nhập điểm', icon: ClipboardCheck, roles: ['TeacherTA', 'Admin'], group: 'teaching', groupLabel: 'Giảng dạy' },
  { href: '/teacher/evaluations', label: 'Lịch sử ĐG', icon: ClipboardCheck, roles: ['TeacherTA', 'Admin'], group: 'teaching', groupLabel: 'Giảng dạy' },
  { href: '/teacher/attendance', label: 'Điểm danh', icon: Calendar, roles: ['TeacherTA', 'Admin'], group: 'teaching', groupLabel: 'Giảng dạy' },
  { href: '/teacher/assignments', label: 'Bài tập', icon: ListChecks, roles: ['TeacherTA', 'Admin'], group: 'teaching', groupLabel: 'Giảng dạy' },
  { href: '/teacher/grade', label: 'Chấm điểm', icon: BookOpen, roles: ['TeacherTA', 'Admin'], group: 'teaching', groupLabel: 'Giảng dạy' },
  { href: '/teacher/documents', label: 'Giáo trình', icon: FileText, roles: ['TeacherTA', 'Admin'], group: 'teaching', groupLabel: 'Giảng dạy' },
  // Admin
  { href: '/admin/classes', label: 'Lớp học', icon: GraduationCap, roles: ['Admin'], group: 'admin', groupLabel: 'Quản lý' },
  { href: '/admin/teachers', label: 'Giáo viên', icon: Users, roles: ['Admin'], group: 'admin', groupLabel: 'Quản lý' },
  { href: '/admin/sessions', label: 'Buổi học', icon: Calendar, roles: ['Admin'], group: 'admin', groupLabel: 'Quản lý' },
  { href: '/admin/enrollments', label: 'Ghi danh', icon: UserPlus, roles: ['Admin'], group: 'admin', groupLabel: 'Quản lý' },
  { href: '/admin/students', label: 'Học viên', icon: Users, roles: ['Admin'], group: 'admin', groupLabel: 'Quản lý' },
  { href: '/admin/reports', label: 'Báo cáo', icon: FileBarChart, roles: ['Admin'], group: 'admin', groupLabel: 'Quản lý' },
  // Learning
  { href: '/knowledge', label: 'Kiến thức', icon: BookOpen, roles: ['Student', 'TeacherTA', 'Admin'], group: 'learning', groupLabel: 'Học tập' },
  { href: '/workspace', label: 'Thư viện', icon: Library, roles: ['Student', 'TeacherTA', 'Admin'], group: 'learning', groupLabel: 'Học tập' },
  { href: '/review', label: 'Ôn tập', icon: Brain, roles: ['Student', 'TeacherTA', 'Admin'], group: 'learning', groupLabel: 'Học tập' },
  { href: '/wizard', label: 'Lộ trình', icon: Wand2, roles: ['Student', 'TeacherTA', 'Admin'], group: 'learning', groupLabel: 'Học tập' },
  // Student features
  { href: '/student/schedule', label: 'Lịch học', icon: MapPin, roles: ['Student'], group: 'student', groupLabel: 'Học viên' },
  { href: '/student/submit', label: 'Nộp bài', icon: Notebook, roles: ['Student'], group: 'student', groupLabel: 'Học viên' },
  { href: '/student/vocab', label: 'Sổ tay', icon: BookMarked, roles: ['Student'], group: 'student', groupLabel: 'Học viên' },
  { href: '/student/results', label: 'Kết quả', icon: FileBarChart, roles: ['Student'], group: 'student', groupLabel: 'Học viên' },
  // Tools
  { href: '/chat', label: 'Chat', icon: MessageSquare, roles: ['Student', 'TeacherTA', 'Admin'], group: 'tools', groupLabel: 'Công cụ' },
  { href: '/pronunciation', label: 'Phát âm', icon: Mic, roles: ['Student', 'TeacherTA', 'Admin'], group: 'tools', groupLabel: 'Công cụ' },
  { href: '/resources', label: 'Tài nguyên', icon: Notebook, roles: ['Student', 'TeacherTA', 'Admin'], group: 'tools', groupLabel: 'Công cụ' },
  { href: '/ai-assistant', label: 'Trợ lý AI', icon: Bot, roles: ['Student', 'TeacherTA', 'Admin'], group: 'tools', groupLabel: 'Công cụ' },
  { href: '/notifications', label: 'Thông báo', icon: Bell, roles: ['Student', 'TeacherTA', 'Admin'], group: 'tools', groupLabel: 'Công cụ' },
  { href: '/settings', label: 'Cài đặt', icon: Settings, roles: ['Student', 'TeacherTA', 'Admin'], group: 'tools', groupLabel: 'Công cụ' },
];

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = 'Student' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const filtered = navItems.filter((item) => item.roles.includes(role));

  const groups = filtered.reduce<{ group: string; groupLabel: string; items: NavItem[] }[]>((acc, item) => {
    const existing = acc.find(g => g.group === item.group);
    if (existing) existing.items.push(item);
    else acc.push({ group: item.group, groupLabel: item.groupLabel, items: [item] });
    return acc;
  }, []);

  async function handleLogout() {
    localStorage.removeItem('demo_user');
    document.cookie = 'demo_role=; path=/; max-age=0';
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
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-[10px] font-bold text-primary-foreground">
              FC
            </div>
            <span className="text-sm font-semibold tracking-tight">French Center</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-[10px] font-bold text-primary-foreground">
              FC
            </div>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.group}>
            {!collapsed && group.groupLabel && (
              <p className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 first:mt-0">
                {group.groupLabel}
              </p>
            )}
            {collapsed && group.groupLabel && (
              <div className="my-3 border-t border-border/30" />
            )}
            {group.items.map((item) => {
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
          </div>
        ))}
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
