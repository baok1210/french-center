'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/auth-guard';
import { isDemoMode, loadDemoClasses, loadDemoSessions, loadDemoEnrollments, loadDemoStudents } from '@/data/admin-store';
import { loadDemoAttendance, markAttendance } from '@/data/features-store';
import { ClipboardCheck, Save } from 'lucide-react';

type AttStatus = 'present' | 'late' | 'absent' | 'excused';

export default function AttendancePage() {
  useRoleGuard(['TeacherTA', 'Admin']);
  const demo = isDemoMode();
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttStatus>>({});
  const [classId, setClassId] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (demo) setClasses(loadDemoClasses());
  }, []);

  useEffect(() => {
    if (!classId) return;
    if (demo) {
      setSessions(loadDemoSessions().filter((s: any) => s.class_id === classId));
    }
    setSessionId('');
    setAttendance({});
  }, [classId]);

  useEffect(() => {
    if (!sessionId) return;
    if (demo) {
      const enr = loadDemoEnrollments().filter((e: any) => e.class_id === classId);
      const studs = loadDemoStudents();
      setStudents(enr.map((e: any) => studs.find((s: any) => s.id === e.student_id)).filter(Boolean));
      const att = loadDemoAttendance(sessionId);
      const map: Record<string, AttStatus> = {};
      att.forEach((a: any) => { map[a.student_id] = a.status; });
      setAttendance(map);
    }
  }, [sessionId]);

  function setStatus(studentId: string, status: AttStatus) {
    if (demo) markAttendance(sessionId, studentId, status);
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  }

  const statusColors: Record<AttStatus, string> = { present: 'bg-success/20 text-success border-success/30', late: 'bg-warning/20 text-warning border-warning/30', absent: 'bg-destructive/20 text-destructive border-destructive/30', excused: 'bg-muted/50 text-muted-foreground border-border' };
  const statusLabels: Record<AttStatus, string> = { present: 'Có mặt', late: 'Đi muộn', absent: 'Vắng', excused: 'Có phép' };
  const statuses: AttStatus[] = ['present', 'late', 'absent', 'excused'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Điểm danh</h2>
        <p className="text-sm text-muted-foreground">Điểm danh học viên theo buổi học</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select value={classId} onChange={(e) => setClassId(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
          <option value="">Chọn lớp</option>
          {classes.map((c: any) => <option key={c.id} value={c.id}>{c.title} ({c.level})</option>)}
        </select>
        <select value={sessionId} onChange={(e) => setSessionId(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
          <option value="">Chọn buổi học</option>
          {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session_date} - {s.title || ''}</option>)}
        </select>
      </div>

      {sessionId && (
        <div className="space-y-2">
          {students.map((s: any) => (
            <div key={s.id} className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">{s.full_name?.charAt(0)}</div>
                <div>
                  <p className="text-sm font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.student_code}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {statuses.map(st => (
                  <button key={st} onClick={() => setStatus(s.id, st)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${attendance[s.id] === st ? statusColors[st] : 'border-border text-muted-foreground hover:bg-secondary'}`}>
                    {statusLabels[st]}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {students.length === 0 && <p className="text-sm text-muted-foreground">Lớp này chưa có học viên</p>}
        </div>
      )}
    </div>
  );
}
