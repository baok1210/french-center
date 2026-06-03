'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { createClient } from '@/lib/supabase-client';
import type { Profile } from '@/types/database';
import { useState } from 'react';

const DEMO_PROFILES: Record<string, Profile> = {
  'admin@demo.com': {
    id: 'demo-admin', role: 'Admin', full_name: 'Admin', student_code: 'AD001',
    email: 'admin@demo.com', phone: null, avatar_url: null,
    cefr_current: 'B2', cefr_progress_pct: 70, created_at: '', updated_at: '',
  },
  'teacher@demo.com': {
    id: 'demo-teacher', role: 'TeacherTA', full_name: 'Giáo viên', student_code: 'GV001',
    email: 'teacher@demo.com', phone: null, avatar_url: null,
    cefr_current: 'C1', cefr_progress_pct: 85, created_at: '', updated_at: '',
  },
  'student@demo.com': {
    id: 'demo-student', role: 'Student', full_name: 'Nguyễn Văn A', student_code: 'HV001',
    email: 'student@demo.com', phone: null, avatar_url: null,
    cefr_current: 'A2', cefr_progress_pct: 35, created_at: '', updated_at: '',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }

    const demoEmail = localStorage.getItem('demo_user');
    if (demoEmail && DEMO_PROFILES[demoEmail]) {
      setProfile(DEMO_PROFILES[demoEmail]);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then((result: any) => {
      const session = result?.data?.session ?? null;
      if (!session) {
        router.push('/login');
        return;
      }
      supabase.from('profiles').select('*').eq('id', session.user.id).single().then((r: any) => {
        if (r?.data) setProfile(r.data);
      });
    });
  }, []);

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    evaluate: 'Nhập điểm',
    evaluations: 'Lịch sử đánh giá',
    reports: 'Duyệt báo cáo',
    classes: 'Lớp học',
    sessions: 'Buổi học',
    students: 'Học viên',
    enrollments: 'Ghi danh',
    pronunciation: 'Phát âm',
    resources: 'Tài nguyên',
    assistant: 'Trợ lý AI',
    settings: 'Cài đặt',
  };
  const key = Object.keys(titles).find((k) => pathname.includes(k)) || 'dashboard';

  return (
    <AppShell role={profile?.role || 'Student'} title={titles[key]} userName={profile?.full_name || undefined}>
      {children}
    </AppShell>
  );
}
