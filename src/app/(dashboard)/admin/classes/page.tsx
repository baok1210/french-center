'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoClasses, saveDemoClass, deleteDemoClass, loadDemoTeachers } from '@/data/admin-store';
import type { DemoClass } from '@/data/admin-store';
import { Plus, Calendar, Users, Edit3, Trash2, X, Save, AlertCircle } from 'lucide-react';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface ClassRecord {
  id: string;
  title: string;
  level: string;
  schedule: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  teacher_id: string;
  profiles?: { full_name: string };
  teacher_name?: string;
}

export default function AdminClassesPage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ClassRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    level: 'A1',
    schedule: '',
    start_date: '',
    end_date: '',
    teacher_id: '',
    is_active: true,
  });
  const demo = isDemoMode();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (demo) {
      const demoClasses = loadDemoClasses();
      const demoTeachers = loadDemoTeachers();
      setClasses(demoClasses.map(c => ({ ...c, teacher_name: c.teacher_name })));
      setTeachers(demoTeachers.map(t => ({ id: t.id, full_name: t.full_name })));
      return;
    }

    const { data: cls } = await supabase
      .from('classes')
      .select('*, profiles!teacher_id(full_name)')
      .order('created_at', { ascending: false });
    if (cls) setClasses(cls);

    const { data: profs } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['TeacherTA', 'Admin']);
    if (profs) setTeachers(profs);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', level: 'A1', schedule: '', start_date: '', end_date: '', teacher_id: '', is_active: true });
    setError('');
    setShowModal(true);
  }

  function openEdit(cls: ClassRecord) {
    setEditing(cls);
    setForm({
      title: cls.title,
      level: cls.level,
      schedule: cls.schedule || '',
      start_date: cls.start_date || '',
      end_date: cls.end_date || '',
      teacher_id: cls.teacher_id,
      is_active: cls.is_active,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Vui lòng nhập tên lớp'); return; }
    if (!form.teacher_id) { setError('Vui lòng chọn giáo viên'); return; }
    setSaving(true);
    setError('');

    const teacherName = teachers.find(t => t.id === form.teacher_id)?.full_name || '';

    if (demo) {
      saveDemoClass({
        id: editing?.id,
        title: form.title.trim(),
        level: form.level,
        schedule: form.schedule || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        is_active: form.is_active,
        teacher_id: form.teacher_id,
        teacher_name: teacherName,
      });
      setSaving(false);
      setShowModal(false);
      loadData();
      return;
    }

    const payload = {
      title: form.title.trim(),
      level: form.level,
      schedule: form.schedule || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      teacher_id: form.teacher_id,
      is_active: form.is_active,
    };

    let err: any;
    if (editing) {
      const { error: e } = await supabase.from('classes').update(payload).eq('id', editing.id);
      err = e;
    } else {
      const { error: e } = await supabase.from('classes').insert(payload);
      err = e;
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa lớp học này? Hành động này không thể hoàn tác.')) return;
    if (demo) {
      deleteDemoClass(id);
      loadData();
      return;
    }
    const { error: err } = await supabase.from('classes').delete().eq('id', id);
    if (err) alert('Lỗi: ' + err.message);
    else loadData();
  }

  function getTeacherName(cls: ClassRecord): string {
    if (demo) return (cls as any).teacher_name || 'N/A';
    return cls.profiles?.full_name || 'N/A';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Lớp học</h2>
          <p className="text-sm text-muted-foreground">Quản lý danh sách lớp học</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Thêm lớp
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold tracking-tight">{cls.title}</h3>
                <span className="mt-1 inline-block rounded-xl bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  {cls.level}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button onClick={() => openEdit(cls)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button onClick={() => handleDelete(cls.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {cls.schedule && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {cls.schedule}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
                GV: {getTeacherName(cls)}
              </div>
              {!cls.is_active && (
                <span className="inline-block rounded-lg bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  Không hoạt động
                </span>
              )}
            </div>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Chưa có lớp học nào</p>
            <button onClick={openCreate}
              className="mt-3 text-sm font-medium text-primary underline underline-offset-2">
              Tạo lớp mới
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa lớp' : 'Thêm lớp mới'}</h3>
              <button onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tên lớp *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="VD: Tiếng Pháp A2 - Sáng T2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Cấp độ</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Giáo viên *</label>
                  <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                    <option value="">-- Chọn --</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Lịch học</label>
                <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="VD: Thứ 2 & Thứ 4, 8:00-9:30" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngày bắt đầu</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngày kết thúc</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-border accent-primary" />
                <label htmlFor="is_active" className="text-sm text-muted-foreground">Đang hoạt động</label>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo lớp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
