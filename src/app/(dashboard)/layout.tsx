'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout';
import { createClient } from '@/lib/supabase-client';
import type { Profile, CefrLevel, UserRole } from '@/types/database';
import { useState } from 'react';

const DEMO_CEFR: Record<string, { cefr: CefrLevel; pct: number }> = {
  Admin: { cefr: 'C2', pct: 70 },
  TeacherTA: { cefr: 'C1', pct: 85 },
  Student: { cefr: 'A2', pct: 35 },
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

    const demoRaw = localStorage.getItem('demo_user');
    if (demoRaw) {
      try {
        const parsed = JSON.parse(demoRaw);
        if (parsed && parsed.role) {
          const role = parsed.role as UserRole;
          const cefr = DEMO_CEFR[role] || { cefr: 'A1' as CefrLevel, pct: 0 };
          setProfile({
            id: parsed.id,
            role,
            full_name: parsed.full_name,
            student_code: parsed.role === 'Student' ? 'HV001' : parsed.role === 'Admin' ? 'AD001' : 'GV001',
            email: parsed.email || '',
            phone: null,
            avatar_url: null,
            cefr_current: cefr.cefr,
            cefr_progress_pct: cefr.pct,
            created_at: '',
            updated_at: '',
          });
          return;
        }
      } catch { /* fall through */ }
      // Legacy: raw email string
      const legacyMap: Record<string, UserRole> = { 'admin@demo.com': 'Admin', 'teacher@demo.com': 'TeacherTA', 'student@demo.com': 'Student' };
      const role: UserRole = legacyMap[demoRaw] || 'Student';
      const cefr = DEMO_CEFR[role] || { cefr: 'A1' as CefrLevel, pct: 0 };
      setProfile({
        id: demoRaw, role, full_name: demoRaw, student_code: '',
        email: demoRaw, phone: null, avatar_url: null,
        cefr_current: cefr.cefr, cefr_progress_pct: cefr.pct,
        created_at: '', updated_at: '',
      });
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
    attendance: 'Điểm danh',
    assignments: 'Bài tập',
    grade: 'Chấm điểm',
    documents: 'Giáo trình',
    reports: 'Duyệt báo cáo',
    classes: 'Lớp học',
    teachers: 'Giáo viên',
    sessions: 'Buổi học',
    students: 'Học viên',
    enrollments: 'Ghi danh',
    schedule: 'Lịch học',
    submit: 'Nộp bài',
    results: 'Kết quả',
    vocab: 'Sổ tay',
    pronunciation: 'Phát âm',
    resources: 'Tài nguyên',
    assistant: 'Trợ lý AI',
    chat: 'Chat',
    notifications: 'Thông báo',
    settings: 'Cài đặt',
  };
  const key = Object.keys(titles).find((k) => pathname.includes(k)) || 'dashboard';

  return (
    <AppShell role={profile?.role || 'Student'} title={titles[key]} userName={profile?.full_name || undefined}>
      {children}
    </AppShell>
  );
}
