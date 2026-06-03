'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { UserPlus, Users, Trash2, X, Save, AlertCircle, Search, GraduationCap } from 'lucide-react';

interface EnrollmentRecord {
  id: string;
  student_id: string;
  class_id: string;
  profiles?: { full_name: string; student_code: string };
  classes?: { title: string; level: string };
}

export default function AdminEnrollmentsPage() {
  const supabase = createClient();
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [classes, setClasses] = useState<{ id: string; title: string; level: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; student_code: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [form, setForm] = useState({ class_id: '', student_ids: [] as string[] });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: enr } = await supabase
      .from('enrollments')
      .select('*, profiles!student_id(full_name, student_code), classes!class_id(title, level)')
      .order('created_at', { ascending: false });
    if (enr) setEnrollments(enr);

    const { data: cls } = await supabase.from('classes').select('id, title, level').eq('is_active', true);
    if (cls) setClasses(cls);

    const { data: studs } = await supabase
      .from('profiles')
      .select('id, full_name, student_code')
      .eq('role', 'Student');
    if (studs) setStudents(studs);
  }

  async function handleAddStudents() {
    if (!form.class_id) { setError('Vui lòng chọn lớp'); return; }
    if (form.student_ids.length === 0) { setError('Vui lòng chọn học viên'); return; }
    setSaving(true);
    setError('');

    const existingIds = enrollments
      .filter((e) => e.class_id === form.class_id)
      .map((e) => e.student_id);

    const newIds = form.student_ids.filter((id) => !existingIds.includes(id));
    if (newIds.length === 0) {
      setError('Các học viên này đã được ghi danh vào lớp');
      setSaving(false);
      return;
    }

    const payload = newIds.map((student_id) => ({ class_id: form.class_id, student_id }));
    const { error: err } = await supabase.from('enrollments').insert(payload);
    if (err) { setError(err.message); } else {
      setShowModal(false);
      setForm({ class_id: '', student_ids: [] });
      loadData();
    }
    setSaving(false);
  }

  async function handleRemove(id: string) {
    if (!confirm('Xóa ghi danh này?')) return;
    const { error: err } = await supabase.from('enrollments').delete().eq('id', id);
    if (err) alert('Lỗi: ' + err.message);
    else loadData();
  }

  function toggleStudentId(id: string) {
    setForm({
      ...form,
      student_ids: form.student_ids.includes(id)
        ? form.student_ids.filter((s) => s !== id)
        : [...form.student_ids, id],
    });
  }

  const filteredEnrollments = filterClass
    ? enrollments.filter((e) => e.class_id === filterClass)
    : enrollments;

  const enrolledStudentIds = new Set(
    filterClass ? enrollments.filter((e) => e.class_id === filterClass).map((e) => e.student_id) : []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Ghi danh</h2>
          <p className="text-sm text-muted-foreground">Quản lý học viên trong lớp</p>
        </div>
        <button onClick={() => { setForm({ class_id: '', student_ids: [] }); setError(''); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
          <UserPlus className="h-4 w-4" strokeWidth={1.5} /> Thêm học viên vào lớp
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-muted-foreground">Xem theo lớp:</label>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">Tất cả lớp</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.level})</option>)}
        </select>
      </div>

      {/* Stats */}
      {filterClass && (
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <p className="text-sm">
            <span className="font-medium">{filteredEnrollments.length}</span> học viên trong lớp này
          </p>
        </div>
      )}

      {/* Enrollments List */}
      <div className="space-y-3">
        {filteredEnrollments.map((enr) => (
          <div key={enr.id}
            className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">{enr.profiles?.full_name || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {enr.profiles?.student_code || ''} — {enr.classes?.title || ''} ({enr.classes?.level || ''})
                </p>
              </div>
            </div>
            <button onClick={() => handleRemove(enr.id)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {filteredEnrollments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Chưa có ghi danh nào</p>
          </div>
        )}
      </div>

      {/* Add Students Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Thêm học viên vào lớp</h3>
              <button onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Lớp *</label>
                <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, student_ids: [] })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.level}) — Đã có {enrollments.filter((e) => e.class_id === c.id).length} HV
                    </option>
                  ))}
                </select>
              </div>

              {form.class_id && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Chọn học viên ({form.student_ids.length} đã chọn)
                  </label>
                  <div className="max-h-60 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                    {students
                      .filter((s) => !enrolledStudentIds.has(s.id) || form.student_ids.includes(s.id))
                      .map((s) => (
                        <label key={s.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                            form.student_ids.includes(s.id) ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'
                          }`}>
                          <input type="checkbox" checked={form.student_ids.includes(s.id)}
                            onChange={() => toggleStudentId(s.id)}
                            className="h-4 w-4 rounded border-border accent-primary" />
                          <span className="font-medium">{s.full_name}</span>
                          <span className="text-xs text-muted-foreground">{s.student_code}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

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
              <button onClick={handleAddStudents} disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-4 w-4" strokeWidth={1.5} />
                {saving ? 'Đang lưu...' : `Thêm ${form.student_ids.length} học viên`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
