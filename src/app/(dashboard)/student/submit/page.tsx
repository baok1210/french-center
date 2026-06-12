'use client';

import { useState, useEffect } from 'react';
import { isDemoMode } from '@/data/admin-store';
import { loadDemoAssignments, loadDemoSubmissions, submitDemoAssignment } from '@/data/features-store';
import { FrenchKeyboard } from '@/components/french-keyboard';
import { Send, FileText, Mic, ListChecks, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SubmitPage() {
  const demo = isDemoMode();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [selectedAss, setSelectedAss] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!demo) return;
    const raw = localStorage.getItem('demo_user');
    try { const p = JSON.parse(raw || '{}'); setStudentId(p.id || ''); } catch {}
    setAssignments(loadDemoAssignments());
    setSubmissions(loadDemoSubmissions());
  }, []);

  const submittedIds = new Set(submissions.filter((s: any) => s.student_id === studentId).map((s: any) => s.assignment_id));
  const pending = assignments.filter((a: any) => !submittedIds.has(a.id));

  function handleSubmit() {
    if (!selectedAss || !answer.trim()) return;
    if (demo) submitDemoAssignment({ assignment_id: selectedAss, content: answer });
    setSuccess('Nộp bài thành công!');
    setAnswer('');
    setSelectedAss(null);
    setSubmissions(loadDemoSubmissions());
    setTimeout(() => setSuccess(''), 3000);
  }

  function getMySubmissions() {
    return submissions.filter((s: any) => s.student_id === studentId)
      .map((s: any) => ({ ...s, assignment: assignments.find((a: any) => a.id === s.assignment_id) }));
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-semibold tracking-tight">Nộp bài tập</h2><p className="text-sm text-muted-foreground">Làm và nộp bài tập về nhà</p></div>

      {success && <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-success"><CheckCircle2 className="h-4 w-4" />{success}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Bài tập cần làm ({pending.length})</h3>
          {pending.map((a: any) => (
            <div key={a.id} onClick={() => { setSelectedAss(a.id); setAnswer(''); setSuccess(''); }}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${selectedAss === a.id ? 'border-primary bg-primary/5' : 'border-border/50 bg-card hover:border-primary/50'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  {a.type === 'multiple_choice' ? <ListChecks className="h-4 w-4 text-primary" /> : a.type === 'voice' ? <Mic className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">Hạn: {a.due_date} — {a.cefr_level}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{a.description}</p>
            </div>
          ))}
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Bạn đã hoàn thành tất cả bài tập!</p>}
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Bài tập đã nộp ({getMySubmissions().length})</h3>
          {getMySubmissions().map((s: any) => (
            <div key={s.id} className="rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{s.assignment?.title || 'Đã xóa'}</p>
                {s.status === 'graded' ? (
                  <span className="rounded-lg bg-success/10 px-2.5 py-1 text-xs font-medium text-success">{s.score}/10</span>
                ) : (
                  <span className="rounded-lg bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">Chờ chấm</span>
                )}
              </div>
              {s.feedback && <div className="mt-2 rounded-xl bg-primary/5 px-3 py-2 text-xs"><span className="font-medium">GV:</span> {s.feedback}</div>}
            </div>
          ))}
        </div>
      </div>

      {selectedAss && (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <h3 className="text-sm font-semibold mb-4">Bài làm của bạn</h3>
          <div className="space-y-3">
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={6}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Nhập câu trả lời của bạn tại đây..." />
            <FrenchKeyboard onInsert={(char) => setAnswer(prev => prev + char)} />
            <button onClick={handleSubmit} disabled={!answer.trim()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              <Send className="h-4 w-4" /> Nộp bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
