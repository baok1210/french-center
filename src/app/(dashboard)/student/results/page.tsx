'use client';

import { useState, useEffect } from 'react';
import { isDemoMode, loadDemoStudents } from '@/data/admin-store';
import { loadDemoSubmissions, loadDemoAssignments } from '@/data/features-store';
import { TrendingUp, Award, BookOpen } from 'lucide-react';

export default function ResultsPage() {
  const demo = isDemoMode();
  const [stats, setStats] = useState({ total: 0, graded: 0, avgScore: 0, byType: {} as Record<string, { count: number; sum: number }> });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (!demo) return;
    const raw = localStorage.getItem('demo_user');
    let sid = '';
    try { const p = JSON.parse(raw || '{}'); sid = p.id || ''; } catch {}
    const subs = loadDemoSubmissions().filter((s: any) => s.student_id === sid);
    const ass = loadDemoAssignments();
    setSubmissions(subs); setAssignments(ass);

    const graded = subs.filter((s: any) => s.status === 'graded');
    const total = graded.reduce((sum: number, s: any) => sum + (s.score || 0), 0);
    const byType: Record<string, { count: number; sum: number }> = {};

    graded.forEach((s: any) => {
      const a = ass.find((x: any) => x.id === s.assignment_id);
      const t = a?.type || 'essay';
      if (!byType[t]) byType[t] = { count: 0, sum: 0 };
      byType[t].count++; byType[t].sum += (s.score || 0);
    });

    setStats({ total: subs.length, graded: graded.length, avgScore: graded.length ? +(total / graded.length).toFixed(1) : 0, byType });
  }, []);

  const typeLabel: Record<string, string> = { multiple_choice: 'Trắc nghiệm', essay: 'Tự luận', voice: 'Ghi âm' };

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-semibold tracking-tight">Kết quả học tập</h2><p className="text-sm text-muted-foreground">Theo dõi điểm số và tiến bộ của bạn</p></div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><BookOpen className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Bài đã nộp</p></div>
          </div>
        </div>
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10"><TrendingUp className="h-5 w-5 text-success" /></div>
            <div><p className="text-2xl font-bold">{stats.avgScore}/10</p><p className="text-xs text-muted-foreground">Điểm trung bình</p></div>
          </div>
        </div>
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10"><Award className="h-5 w-5 text-warning" /></div>
            <div><p className="text-2xl font-bold">{stats.graded}/{stats.total}</p><p className="text-xs text-muted-foreground">Đã chấm</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(stats.byType).map(([type, data]: [string, any]) => (
          <div key={type} className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{typeLabel[type] || type}</p>
            <p className="mt-2 text-lg font-bold">{data.count ? (data.sum / data.count).toFixed(1) : 0}/10</p>
            <p className="text-xs text-muted-foreground">{data.count} bài</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Chi tiết bài nộp</h3>
        {submissions.map((s: any) => {
          const a = assignments.find((x: any) => x.id === s.assignment_id);
          return (
            <div key={s.id} className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
              <div>
                <p className="text-sm font-medium">{a?.title || 'Đã xóa'}</p>
                <p className="text-xs text-muted-foreground">{s.submitted_at?.slice(0, 10)}</p>
              </div>
              <div className="flex items-center gap-3">
                {s.status === 'graded' ? (
                  <>
                    <span className={`text-lg font-bold ${s.score >= 7 ? 'text-success' : s.score >= 5 ? 'text-warning' : 'text-destructive'}`}>{s.score}/10</span>
                    {s.feedback && <span className="max-w-xs truncate text-xs text-muted-foreground" title={s.feedback}>"{s.feedback}"</span>}
                  </>
                ) : <span className="rounded-lg bg-warning/10 px-3 py-1 text-xs font-medium text-warning">Chờ chấm</span>}
              </div>
            </div>
          );
        })}
        {submissions.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-sm text-muted-foreground">Bạn chưa nộp bài tập nào</p></div>}
      </div>
    </div>
  );
}
