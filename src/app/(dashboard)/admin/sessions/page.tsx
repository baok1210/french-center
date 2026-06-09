'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoSessions, saveDemoSession, deleteDemoSession, loadDemoClasses, loadDemoTeachers } from '@/data/admin-store';
import type { DemoSession } from '@/data/admin-store';
import { Plus, Calendar, Clock, Edit3, Trash2, X, Save, AlertCircle } from 'lucide-react';

export default function AdminSessionsPage() {
  const supabase = createClient();
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<{ id: string; title: string; level: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; full_name: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [form, setForm] = useState({
    class_id: '',
    title: '',
    session_date: '',
    start_time: '',
    end_time: '',
    teacher_id: '',
  });
  const demo = isDemoMode();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (demo) {
      const demoSe = loadDemoSessions();
      const demoCls = loadDemoClasses();
      const demoTeach = loadDemoTeachers();

      setClasses(demoCls.map(c => ({ id: c.id, title: c.title, level: c.level })));
      setTeachers(demoTeach.map(t => ({ id: t.id, full_name: t.full_name })));

      const enriched = demoSe.map(s => {
        const cls = demoCls.find(c => c.id === s.class_id);
        return { ...s, classes: cls ? { title: cls.title, level: cls.level } : { title: 'N/A', level: '' } };
      });
      setSessions(enriched);
      return;
    }

    const { data: sess } = await supabase
      .from('class_sessions')
      .select('*, classes!inner(title, level)')
      .order('session_date', { ascending: false });
    if (sess) setSessions(sess);

    const { data: cls } = await supabase.from('classes').select('id, title, level').eq('is_active', true);
    if (cls) setClasses(cls);

    const { data: profs } = await supabase.from('profiles').select('id, full_name').in('role', ['TeacherTA', 'Admin']);
    if (profs) setTeachers(profs);
  }

  function openCreate() {
    setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    setForm({ class_id: '', title: '', session_date: today, start_time: '08:00', end_time: '09:30', teacher_id: '' });
    setError('');
    setShowModal(true);
  }

  function openEdit(sess: any) {
    setEditing(sess);
    setForm({
      class_id: sess.class_id,
      title: sess.title || '',
      session_date: sess.session_date,
      start_time: sess.start_time,
      end_time: sess.end_time,
      teacher_id: sess.teacher_id || '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.class_id) { setError('Vui lòng chọn lớp'); return; }
    if (!form.session_date) { setError('Vui lòng chọn ngày'); return; }
    if (!form.start_time || !form.end_time) { setError('Vui lòng nhập giờ'); return; }
    setSaving(true);
    setError('');

    if (demo) {
      saveDemoSession({
        id: editing?.id,
        class_id: form.class_id,
        title: form.title || null,
        session_date: form.session_date,
        start_time: form.start_time,
        end_time: form.end_time,
        teacher_id: form.teacher_id || null,
      });
      setSaving(false);
      setShowModal(false);
      loadData();
      return;
    }

    const payload = {
      class_id: form.class_id,
      title: form.title || null,
      session_date: form.session_date,
      start_time: form.start_time,
      end_time: form.end_time,
      teacher_id: form.teacher_id || null,
    };

    let err: any;
    if (editing) {
      const { error: e } = await supabase.from('class_sessions').update(payload).eq('id', editing.id);
      err = e;
    } else {
      const { error: e } = await supabase.from('class_sessions').insert(payload);
      err = e;
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowModal(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa buổi học này?')) return;
    if (demo) {
      deleteDemoSession(id);
      loadData();
      return;
    }
    const { error: err } = await supabase.from('class_sessions').delete().eq('id', id);
    if (err) alert('Lỗi: ' + err.message);
    else loadData();
  }

  const filteredSessions = filterClass
    ? sessions.filter((s: any) => s.class_id === filterClass)
    : sessions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Buổi học</h2>
          <p className="text-sm text-muted-foreground">Quản lý lịch học các lớp</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Thêm buổi học
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-muted-foreground">Lọc theo lớp:</label>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">Tất cả</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.level})</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredSessions.map((sess: any) => (
          <div key={sess.id}
            className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {sess.classes?.title || 'N/A'} — <span className="text-muted-foreground">{sess.title || `Buổi ${sess.session_date}`}</span>
                </p>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" strokeWidth={1.5} />
                  {sess.session_date}
                  <Clock className="h-3 w-3 ml-1" strokeWidth={1.5} />
                  {sess.start_time} - {sess.end_time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => openEdit(sess)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              <button onClick={() => handleDelete(sess.id)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
        {filteredSessions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Chưa có buổi học nào</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa buổi học' : 'Thêm buổi học'}</h3>
              <button onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Lớp *</label>
                <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  <option value="">-- Chọn lớp --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.level})</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tiêu đề buổi học</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="VD: Bài 5 - Passé Composé" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ngày học *</label>
                <input type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Giờ bắt đầu *</label>
                  <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Giờ kết thúc *</label>
                  <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Giáo viên</label>
                <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  <option value="">-- Mặc định (theo lớp) --</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
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
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo buổi học'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
