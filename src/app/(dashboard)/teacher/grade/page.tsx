'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/auth-guard';
import { isDemoMode, loadDemoStudents } from '@/data/admin-store';
import { loadDemoAssignments, loadDemoSubmissions, gradeDemoSubmission } from '@/data/features-store';
import { ClipboardCheck, Search, Save } from 'lucide-react';

export default function GradePage() {
  useRoleGuard(['TeacherTA', 'Admin']);
  const demo = isDemoMode();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filterAss, setFilterAss] = useState('');
  const [grading, setGrading] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (demo) {
      setAssignments(loadDemoAssignments());
      setStudents(loadDemoStudents());
      setSubmissions(loadDemoSubmissions());
    }
  }, []);

  function startGrade(sub: any) {
    setGrading(sub.id); setScore(sub.score || 0); setFeedback(sub.feedback || '');
  }

  function handleGrade() {
    if (!grading) return;
    if (demo) gradeDemoSubmission(grading, score, feedback);
    setGrading(null); setSubmissions(loadDemoSubmissions());
  }

  function getStudentName(id: string) { return students.find(s => s.id === id)?.full_name || id; }
  function getAssTitle(id: string) { return assignments.find(a => a.id === id)?.title || id; }

  const filtered = filterAss ? submissions.filter(s => s.assignment_id === filterAss) : submissions;

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-semibold tracking-tight">Chấm điểm</h2><p className="text-sm text-muted-foreground">Chấm và nhận xét bài nộp của học viên</p></div>

      <div className="flex items-center gap-3">
        <select value={filterAss} onChange={e => setFilterAss(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">
          <option value="">Tất cả bài tập</option>
          {assignments.map((a: any) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{filtered.length} bài nộp</span>
      </div>

      <div className="space-y-3">
        {filtered.map((sub: any) => (
          <div key={sub.id} className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><ClipboardCheck className="h-4 w-4 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium">{getStudentName(sub.student_id)}</p>
                  <p className="text-xs text-muted-foreground">{getAssTitle(sub.assignment_id)} — {sub.submitted_at?.slice(0, 10)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {sub.status === 'graded' ? (
                  <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-medium text-success">{sub.score}/10</span>
                ) : (
                  <button onClick={() => startGrade(sub)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20">Chấm</button>
                )}
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-secondary/30 p-3 text-sm text-muted-foreground">
              <p className="line-clamp-3 whitespace-pre-wrap">{sub.content}</p>
              {sub.file_url && <p className="mt-1 text-xs text-primary">📎 {sub.file_url}</p>}
            </div>
            {sub.feedback && sub.status === 'graded' && (
              <div className="mt-2 rounded-xl bg-primary/5 px-3 py-2 text-xs">
                <span className="font-medium text-foreground">Nhận xét:</span> {sub.feedback}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-sm text-muted-foreground">Chưa có bài nộp nào</p></div>}
      </div>

      {grading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Chấm điểm</h3>
            <div className="space-y-4">
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Điểm (0-10)</label>
                <input type="range" min={0} max={10} value={score} onChange={e => setScore(+e.target.value)} className="w-full accent-primary" />
                <span className="text-sm font-medium">{score}/10</span>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Nhận xét</label>
                <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setGrading(null)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">Hủy</button>
              <button onClick={handleGrade} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" />Lưu điểm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
