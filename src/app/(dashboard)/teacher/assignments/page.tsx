'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/auth-guard';
import { isDemoMode, loadDemoClasses } from '@/data/admin-store';
import { loadDemoAssignments, saveDemoAssignment, deleteDemoAssignment } from '@/data/features-store';
import { Plus, Edit3, Trash2, X, Save, FileText, Mic, ListChecks } from 'lucide-react';

const TYPES = [
  { value: 'multiple_choice', label: 'Trắc nghiệm', icon: ListChecks },
  { value: 'essay', label: 'Tự luận', icon: FileText },
  { value: 'voice', label: 'Ghi âm', icon: Mic },
];

export default function AssignmentsPage() {
  useRoleGuard(['TeacherTA', 'Admin']);
  const demo = isDemoMode();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ class_id: '', title: '', description: '', type: 'multiple_choice', due_date: '', cefr_level: 'A1' });
  const [questions, setQuestions] = useState<{ question: string; options: string[]; correctAnswer: string }[]>([]);

  useEffect(() => {
    if (demo) { setAssignments(loadDemoAssignments()); setClasses(loadDemoClasses()); }
  }, []);

  function openCreate() {
    setEditing(null); setForm({ class_id: '', title: '', description: '', type: 'multiple_choice', due_date: '', cefr_level: 'A1' }); setQuestions([]); setShowModal(true);
  }

  function openEdit(a: any) {
    setEditing(a); setForm({ class_id: a.class_id, title: a.title, description: a.description, type: a.type, due_date: a.due_date, cefr_level: a.cefr_level });
    setQuestions(a.questions || []); setShowModal(true);
  }

  function handleSave() {
    if (demo) saveDemoAssignment({ id: editing?.id || undefined, class_id: form.class_id, title: form.title, description: form.description, type: form.type as any, due_date: form.due_date, cefr_level: form.cefr_level });
    setShowModal(false); setAssignments(loadDemoAssignments());
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa bài tập này?')) return;
    if (demo) deleteDemoAssignment(id);
    setAssignments(loadDemoAssignments());
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold tracking-tight">Bài tập</h2><p className="text-sm text-muted-foreground">Giao và quản lý bài tập</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Giao bài tập</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a: any) => {
          const t = TYPES.find(t => t.value === a.type);
          const Icon = t?.icon || FileText;
          return (
            <div key={a.id} className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" strokeWidth={1.5} /></div>
                  <div>
                    <h3 className="text-sm font-medium">{a.title}</h3>
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{a.cefr_level}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(a)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"><Edit3 className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(a.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{a.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Hạn: {a.due_date}</span>
                <span>{a.questions?.length || 0} câu</span>
              </div>
            </div>
          );
        })}
        {assignments.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-sm text-muted-foreground">Chưa có bài tập nào</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa bài tập' : 'Giao bài tập mới'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Tiêu đề</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Lớp</label><select value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"><option value="">-- Chọn --</option>{classes.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Loại</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">{TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">CEFR</label><select value={form.cefr_level} onChange={e => setForm({ ...form, cefr_level: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">{['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Hạn nộp</label><input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Mô tả</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">Hủy</button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" />{editing ? 'Cập nhật' : 'Giao bài'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
