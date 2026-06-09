'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoTeachers, saveDemoTeacher, deleteDemoTeacher } from '@/data/admin-store';
import type { DemoTeacher } from '@/data/admin-store';
import { Plus, GraduationCap, Edit3, Trash2, X, Save, AlertCircle, Search, Mail } from 'lucide-react';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface TeacherRecord {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  student_code: string | null;
  cefr_current: string;
  role: string;
}

export default function AdminTeachersPage() {
  const supabase = createClient();
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TeacherRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    student_code: '',
    cefr_current: 'B2',
  });
  const demo = isDemoMode();

  useEffect(() => { loadTeachers(); }, []);

  async function loadTeachers() {
    if (demo) {
      setTeachers(loadDemoTeachers());
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['TeacherTA', 'Admin'])
      .order('full_name');
    if (data) setTeachers(data);
  }

  function openCreate() {
    setEditing(null);
    setForm({ full_name: '', email: '', phone: '', student_code: '', cefr_current: 'B2' });
    setError('');
    setShowModal(true);
  }

  function openEdit(t: TeacherRecord) {
    setEditing(t);
    setForm({
      full_name: t.full_name,
      email: t.email || '',
      phone: t.phone || '',
      student_code: t.student_code || '',
      cefr_current: t.cefr_current,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.full_name.trim()) { setError('Vui lòng nhập họ tên'); return; }
    setSaving(true);
    setError('');

    if (demo) {
      saveDemoTeacher({
        id: editing?.id,
        full_name: form.full_name.trim(),
        email: form.email || null,
        phone: form.phone || null,
        student_code: form.student_code || null,
        cefr_current: form.cefr_current,
      });
      setSaving(false);
      setShowModal(false);
      loadTeachers();
      return;
    }

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email || null,
      phone: form.phone || null,
      student_code: form.student_code || null,
      cefr_current: form.cefr_current,
      role: 'TeacherTA',
    };

    let err: any;
    if (editing) {
      const { error: e } = await supabase.from('profiles').update(payload).eq('id', editing.id);
      err = e;
    } else {
      const { error: e } = await supabase.from('profiles').insert({
        ...payload,
        id: crypto.randomUUID(),
        cefr_progress_pct: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: null,
      });
      err = e;
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowModal(false);
    loadTeachers();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa giáo viên này?')) return;
    if (demo) {
      deleteDemoTeacher(id);
      loadTeachers();
      return;
    }
    const { error: err } = await supabase.from('profiles').delete().eq('id', id);
    if (err) alert('Lỗi: ' + err.message);
    else loadTeachers();
  }

  const filtered = teachers.filter((t) =>
    !search || t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Giáo viên</h2>
          <p className="text-sm text-muted-foreground">Quản lý danh sách giáo viên</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Thêm giáo viên
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm giáo viên..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <span className="text-sm text-muted-foreground">Tổng: <strong>{teachers.length}</strong> giáo viên</span>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t.id}
            className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.full_name}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {t.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{t.email}</span>}
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary">{t.cefr_current}</span>
                  <span className="rounded-md bg-secondary px-1.5 py-0.5">{t.role === 'Admin' ? 'Quản trị' : 'Giáo viên'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(t)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <button onClick={() => handleDelete(t.id)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Không tìm thấy giáo viên</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa thông tin giáo viên' : 'Thêm giáo viên mới'}</h3>
              <button onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Họ tên *</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">SĐT</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Mã giáo viên</label>
                <input value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">CEFR</label>
                <select value={form.cefr_current} onChange={(e) => setForm({ ...form, cefr_current: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
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
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm giáo viên'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
