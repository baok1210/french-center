'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoClasses, loadDemoSessions, loadDemoEnrollments, loadDemoEvaluations, saveDemoEvaluation, loadDemoStudents } from '@/data/admin-store';
import type { DemoClass, DemoSession, DemoEnrollment, DemoEvaluation } from '@/data/admin-store';
import { isSessionLocked } from '@/utils/scoring';
import { ClipboardCheck, Lock, Send, AlertCircle, ChevronDown } from 'lucide-react';

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Kém' },
  { value: 2, label: '2 - Yếu' },
  { value: 3, label: '3 - Trung bình' },
  { value: 4, label: '4 - Khá' },
  { value: 5, label: '5 - Tốt' },
];

const ATTENDANCE_OPTIONS = [
  { value: 'present', label: 'Có mặt' },
  { value: 'late', label: 'Đi muộn' },
  { value: 'absent', label: 'Vắng' },
];

const HOMEWORK_OPTIONS = [
  { value: 'on_time', label: 'Đúng hạn' },
  { value: 'late', label: 'Trễ' },
  { value: 'missing', label: 'Không nộp' },
];

export function EvaluationForm() {
  const supabase = createClient();
  const [classes, setClasses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);
  const [success, setSuccess] = useState('');
  const demo = isDemoMode();

  const [form, setForm] = useState({
    student_id: '', class_session_id: '',
    pronunciation: 3, fluency: 3, vocabulary_oral: 3,
    grammar_conjugation: 3, structure: 3, spelling: 3,
    classwork_completion_rate: 75, comprehension_rate: 3,
    attendance: 'present' as const, engagement: 3, homework: 'on_time' as const,
    notes: '',
  });

  useEffect(() => { loadClasses(); }, []);

  async function loadClasses() {
    if (demo) {
      setClasses(loadDemoClasses().map(c => ({ ...c })));
      return;
    }
    const { data } = await supabase.from('classes').select('*').eq('is_active', true);
    if (data) setClasses(data);
  }

  async function loadRelatedData(classId: string) {
    if (demo) {
      const demoSe = loadDemoSessions();
      const demoEnr = loadDemoEnrollments();
      const demoStuds = loadDemoStudents();

      setSessions(demoSe.filter(s => s.class_id === classId));

      const enrolledIds = demoEnr.filter(e => e.class_id === classId).map(e => e.student_id);
      setStudents(demoStuds.filter(s => enrolledIds.includes(s.id)).map(s => ({
        id: s.id,
        full_name: s.full_name,
        student_code: s.student_code,
      })));
      return;
    }

    const { data: sess } = await supabase.from('class_sessions').select('*').eq('class_id', classId).order('session_date', { ascending: false });
    if (sess) setSessions(sess);

    const { data: enr } = await supabase.from('enrollments').select('student_id, profiles!inner(full_name, student_code)').eq('class_id', classId);
    if (enr) {
      setStudents(enr.map((e: any) => ({
        id: e.student_id,
        full_name: e.profiles.full_name,
        student_code: e.profiles.student_code,
      })));
    }
  }

  function handleSessionChange(sessionId: string) {
    setForm({ ...form, class_session_id: sessionId });
    if (demo) {
      const session = loadDemoSessions().find(s => s.id === sessionId);
      if (session) setLocked(isSessionLocked(session.session_date, session.end_time));
    } else {
      const session = sessions.find((s: any) => s.id === sessionId);
      if (session) setLocked(isSessionLocked(session.session_date, session.end_time));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setSubmitting(true);
    setSuccess('');

    if (demo) {
      const session = loadDemoSessions().find(s => s.id === form.class_session_id);
      saveDemoEvaluation({
        student_id: form.student_id,
        class_session_id: form.class_session_id,
        teacher_id: 'demo-teacher',
        session_date: session?.session_date || new Date().toISOString().split('T')[0],
        pronunciation: form.pronunciation,
        fluency: form.fluency,
        vocabulary_oral: form.vocabulary_oral,
        grammar_conjugation: form.grammar_conjugation,
        structure: form.structure,
        spelling: form.spelling,
        classwork_completion_rate: form.classwork_completion_rate,
        comprehension_rate: form.comprehension_rate,
        attendance: form.attendance,
        engagement: form.engagement,
        homework: form.homework,
        notes: form.notes || null,
      });
      setSubmitting(false);
      setSuccess('Đã lưu đánh giá thành công!');
      resetForm();
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSubmitting(false); return; }

    const { error } = await supabase.from('evaluations').insert({
      ...form,
      teacher_id: session.user.id,
      session_date: sessions.find((s: any) => s.id === form.class_session_id)?.session_date,
    });

    setSubmitting(false);
    if (error) {
      setSuccess(`Lỗi: ${error.message}`);
    } else {
      setSuccess('Đã lưu đánh giá thành công!');
      resetForm();
    }
  }

  function resetForm() {
    setForm({
      student_id: '', class_session_id: '',
      pronunciation: 3, fluency: 3, vocabulary_oral: 3,
      grammar_conjugation: 3, structure: 3, spelling: 3,
      classwork_completion_rate: 75, comprehension_rate: 3,
      attendance: 'present', engagement: 3, homework: 'on_time',
      notes: '',
    });
  }

  const Select = ({ label, value, onChange, options, disabled, placeholder }: any) => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <select value={value} onChange={onChange} disabled={disabled}
          className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-2.5 pr-8 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50">
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
      </div>
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-3">{children}</div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold tracking-tight">Nhập điểm đánh giá</h2>
          <p className="text-sm text-muted-foreground">Điền thông tin đánh giá cho buổi học</p>
        </div>
        {locked && (
          <span className="flex items-center gap-1.5 rounded-xl bg-destructive/10 px-3.5 py-2 text-xs font-semibold text-destructive">
            <Lock className="h-3.5 w-3.5" strokeWidth={2} /> Đã khóa
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Lớp" value={form.class_session_id ? '' : ''} options={classes.map((c: any) => ({ value: c.id, label: `${c.title} (${c.level})` }))}
          onChange={(e: any) => { loadRelatedData(e.target.value); setForm({ ...form, class_session_id: '' }); }}
          placeholder="Chọn lớp..." />
        <Select label="Buổi học" value={form.class_session_id}
          options={sessions.map((s: any) => ({ value: s.id, label: `${s.session_date} - ${s.title || ''}` }))}
          onChange={(e: any) => handleSessionChange(e.target.value)} />
        <Select label="Học viên" value={form.student_id}
          options={students.map((s: any) => ({ value: s.id, label: `${s.full_name} (${s.student_code || ''})` }))}
          onChange={(e: any) => setForm({ ...form, student_id: e.target.value })} />
      </div>

      {locked && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          Buổi học đã kết thúc hơn 12 giờ. Biểu mẫu đã bị khóa.
        </div>
      )}

      <Section title="Production Orale (Nói)">
        <Select label="Phát âm" value={form.pronunciation} options={SCORE_OPTIONS} onChange={(e: any) => setForm({ ...form, pronunciation: +e.target.value })} disabled={locked} />
        <Select label="Lưu loát" value={form.fluency} options={SCORE_OPTIONS} onChange={(e: any) => setForm({ ...form, fluency: +e.target.value })} disabled={locked} />
        <Select label="Từ vựng" value={form.vocabulary_oral} options={SCORE_OPTIONS} onChange={(e: any) => setForm({ ...form, vocabulary_oral: +e.target.value })} disabled={locked} />
      </Section>

      <Section title="Production Écrite (Viết)">
        <Select label="Ngữ pháp/Chia ĐT" value={form.grammar_conjugation} options={SCORE_OPTIONS} onChange={(e: any) => setForm({ ...form, grammar_conjugation: +e.target.value })} disabled={locked} />
        <Select label="Cấu trúc" value={form.structure} options={SCORE_OPTIONS} onChange={(e: any) => setForm({ ...form, structure: +e.target.value })} disabled={locked} />
        <Select label="Chính tả" value={form.spelling} options={SCORE_OPTIONS} onChange={(e: any) => setForm({ ...form, spelling: +e.target.value })} disabled={locked} />
      </Section>

      <Section title="Compréhension (Hiểu biết)">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Hoàn thành bài (%)</label>
          <input type="range" min={0} max={100} step={5} value={form.classwork_completion_rate}
            onChange={(e) => setForm({ ...form, classwork_completion_rate: +e.target.value })}
            disabled={locked} className="w-full accent-primary" />
          <span className="mt-1 block text-xs font-medium text-foreground">{form.classwork_completion_rate}%</span>
        </div>
        <Select label="Mức hiểu bài" value={form.comprehension_rate} options={SCORE_OPTIONS}
          onChange={(e: any) => setForm({ ...form, comprehension_rate: +e.target.value })} disabled={locked} />
      </Section>

      <Section title="Thái độ & Nỗ lực">
        <Select label="Chuyên cần" value={form.attendance} options={ATTENDANCE_OPTIONS}
          onChange={(e: any) => setForm({ ...form, attendance: e.target.value })} disabled={locked} />
        <Select label="Tương tác" value={form.engagement} options={SCORE_OPTIONS}
          onChange={(e: any) => setForm({ ...form, engagement: +e.target.value })} disabled={locked} />
        <Select label="Bài tập về nhà" value={form.homework} options={HOMEWORK_OPTIONS}
          onChange={(e: any) => setForm({ ...form, homework: e.target.value })} disabled={locked} />
      </Section>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ghi chú</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={locked}
          rows={2} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Nhận xét thêm..." />
      </div>

      {success && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${success.startsWith('Lỗi') ? 'bg-destructive/5 text-destructive' : 'bg-success/5 text-success'}`}>
          {success}
        </div>
      )}

      <button type="submit" disabled={locked || submitting || !form.student_id || !form.class_session_id}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        <Send className="h-4 w-4" strokeWidth={1.5} />
        {submitting ? 'Đang lưu...' : 'Lưu đánh giá'}
      </button>
    </form>
  );
}
