'use client';

import { useState, useEffect } from 'react';
import { isDemoMode, loadDemoClasses, loadDemoSessions, loadDemoEnrollments, loadDemoStudents } from '@/data/admin-store';
import { loadDemoAttendance } from '@/data/features-store';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function SchedulePage() {
  const demo = isDemoMode();
  const [sessions, setSessions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    if (!demo) return;
    const raw = localStorage.getItem('demo_user');
    let sid = '';
    try { const p = JSON.parse(raw || '{}'); sid = p.id || ''; } catch {}
    setStudentId(sid);

    const enr = loadDemoEnrollments().filter((e: any) => e.student_id === sid);
    const classIds = enr.map((e: any) => e.class_id);
    const allSessions = loadDemoSessions().filter((s: any) => classIds.includes(s.class_id));
    const cls = loadDemoClasses();
    setSessions(allSessions.map((s: any) => ({ ...s, className: cls.find((c: any) => c.id === s.class_id)?.title || '' })));
    setAttendance(loadDemoAttendance());
  }, []);

  const attMap: Record<string, string> = {};
  attendance.forEach((a: any) => { if (a.student_id === studentId) attMap[a.session_id] = a.status; });

  const statusBadge: Record<string, { label: string; color: string }> = {
    present: { label: 'Có mặt', color: 'bg-success/10 text-success' },
    late: { label: 'Đi muộn', color: 'bg-warning/10 text-warning' },
    absent: { label: 'Vắng', color: 'bg-destructive/10 text-destructive' },
    excused: { label: 'Có phép', color: 'bg-muted/50 text-muted-foreground' },
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-semibold tracking-tight">Lịch học</h2><p className="text-sm text-muted-foreground">Theo dõi lịch học và điểm danh</p></div>

      <div className="space-y-3">
        {sessions.map((s: any) => {
          const att = attMap[s.id];
          const badge = att ? statusBadge[att] : null;
          return (
            <div key={s.id} className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Calendar className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium">{s.className}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{s.session_date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.start_time} - {s.end_time}</span>
                    {s.title && <span>{s.title}</span>}
                  </div>
                </div>
              </div>
              {badge && <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${badge.color}`}>{badge.label}</span>}
              {!badge && <span className="text-xs text-muted-foreground">Chưa điểm danh</span>}
            </div>
          );
        })}
        {sessions.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-sm text-muted-foreground">Bạn chưa tham gia lớp học nào</p></div>}
      </div>
    </div>
  );
}
