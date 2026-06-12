'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoEvaluations, deleteDemoEvaluation, loadDemoEnrollments, loadDemoClasses, loadDemoSessions, loadDemoStudents } from '@/data/admin-store';
import { ClipboardCheck, Search, Edit3, Trash2, Eye, X, Save, AlertCircle } from 'lucide-react';
import { useRoleGuard } from '@/lib/auth-guard';

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Kém' },
  { value: 2, label: '2 - Yếu' },
  { value: 3, label: '3 - Trung bình' },
  { value: 4, label: '4 - Khá' },
  { value: 5, label: '5 - Tốt' },
];

export default function TeacherEvaluationsPage() {
  const supabase = createClient();
  const [evals, setEvals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState<{ id: string; title: string }[]>([]);
  const [viewing, setViewing] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { checking } = useRoleGuard(['TeacherTA', 'Admin']);
  const demo = isDemoMode();
  const [editForm, setEditForm] = useState({
    pronunciation: 3, fluency: 3, vocabulary_oral: 3,
    grammar_conjugation: 3, structure: 3, spelling: 3,
    classwork_completion_rate: 75, comprehension_rate: 3,
    attendance: 'present', engagement: 3, homework: 'on_time',
    notes: '',
  });

  if (checking) return <div className="flex h-[60vh] items-center justify-center"><div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div></div>;

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    if (demo) {
      const demoEvals = loadDemoEvaluations();
      const demoEnr = loadDemoEnrollments();
      const demoCls = loadDemoClasses();
      const demoSe = loadDemoSessions();
      const demoStuds = loadDemoStudents();

      setClasses(demoCls.map(c => ({ id: c.id, title: c.title })));

      const enriched = demoEvals.map(e => {
        const stud = demoStuds.find(s => s.id === e.student_id);
        const ses = demoSe.find(s => s.id === e.class_session_id);
        const cls = ses ? demoCls.find(c => c.id === ses.class_id) : null;
        return {
          ...e,
          profiles: stud ? { full_name: stud.full_name, student_code: stud.student_code || '' } : { full_name: 'N/A', student_code: '' },
          class_sessions: ses ? { title: ses.title || '', session_date: ses.session_date, classes: cls ? { title: cls.title } : undefined } : undefined,
        };
      });
      setEvals(enriched);
      return;
    }

    const { data: e } = await supabase
      .from('evaluations')
      .select('*, profiles!student_id(full_name, student_code), class_sessions!class_session_id(title, session_date, classes!class_id(title))')
      .order('session_date', { ascending: false });
    if (e) setEvals(e);

    const { data: c } = await supabase.from('classes').select('id, title').eq('is_active', true);
    if (c) setClasses(c);
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa đánh giá này?')) return;
    if (demo) {
      deleteDemoEvaluation(id);
      loadData();
      return;
    }
    const { error: err } = await supabase.from('evaluations').delete().eq('id', id);
    if (err) alert('Lỗi: ' + err.message);
    else loadData();
  }

  function openEdit(evalRecord: any) {
    setEditing(evalRecord);
    setEditForm({
      pronunciation: evalRecord.pronunciation,
      fluency: evalRecord.fluency,
      vocabulary_oral: evalRecord.vocabulary_oral,
      grammar_conjugation: evalRecord.grammar_conjugation,
      structure: evalRecord.structure,
      spelling: evalRecord.spelling,
      classwork_completion_rate: evalRecord.classwork_completion_rate,
      comprehension_rate: evalRecord.comprehension_rate,
      attendance: evalRecord.attendance,
      engagement: evalRecord.engagement,
      homework: evalRecord.homework,
      notes: evalRecord.notes || '',
    });
    setError('');
  }

  async function handleSaveEdit() {
    setSaving(true);
    setError('');

    if (demo) {
      const { saveDemoEvaluation } = await import('@/data/admin-store');
      saveDemoEvaluation({ id: editing.id, ...editForm, student_id: editing.student_id, class_session_id: editing.class_session_id, teacher_id: editing.teacher_id || 'demo-teacher', session_date: editing.session_date });
      setSaving(false);
      setEditing(null);
      loadData();
      return;
    }

    const { error: err } = await supabase.from('evaluations').update(editForm).eq('id', editing.id);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setEditing(null);
    loadData();
  }

  const filtered = evals.filter((e: any) => {
    const matchSearch = !search ||
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.student_code?.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass ||
      e.class_sessions?.classes?.title === filterClass ||
      e.class_sessions?.classes?.title?.includes(filterClass);
    return matchSearch && matchClass;
  });

  const statusBadge = (e: any) => {
    if (e.is_locked) return <span className="rounded-lg bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">Đã khóa</span>;
    return <span className="rounded-lg bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Có thể sửa</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Lịch sử đánh giá</h2>
        <p className="text-sm text-muted-foreground">Xem, sửa và xóa đánh giá của học viên</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã HV..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary">
          <option value="">Tất cả lớp</option>
          {classes.map((c) => <option key={c.id} value={c.title}>{c.title}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{filtered.length} kết quả</span>
      </div>

      <div className="space-y-3">
        {filtered.map((e: any) => (
          <div key={e.id}
            className="diffusion-shadow flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{e.profiles?.full_name || 'N/A'}</p>
                  <span className="text-xs text-muted-foreground">({e.profiles?.student_code || ''})</span>
                  {statusBadge(e)}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                  <span>{e.session_date}</span>
                  <span>{e.class_sessions?.title || ''}</span>
                  <span className="font-medium text-foreground">
                    TB: {((e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation + e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8).toFixed(1)}/5
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setViewing(e)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              {!e.is_locked && (
                <>
                  <button onClick={() => openEdit(e)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                    <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => handleDelete(e.id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">Không tìm thấy đánh giá nào</p>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold">{viewing.profiles?.full_name}</h3>
                <p className="text-xs text-muted-foreground">{viewing.session_date} — {viewing.class_sessions?.title || ''}</p>
              </div>
              <button onClick={() => setViewing(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Production Orale</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Phát âm:</span> <strong>{viewing.pronunciation}/5</strong></div>
                  <div><span className="text-muted-foreground">Lưu loát:</span> <strong>{viewing.fluency}/5</strong></div>
                  <div><span className="text-muted-foreground">Từ vựng:</span> <strong>{viewing.vocabulary_oral}/5</strong></div>
                </div>
              </div>

              <div className="rounded-xl bg-secondary/50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Production Écrite</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Ngữ pháp:</span> <strong>{viewing.grammar_conjugation}/5</strong></div>
                  <div><span className="text-muted-foreground">Cấu trúc:</span> <strong>{viewing.structure}/5</strong></div>
                  <div><span className="text-muted-foreground">Chính tả:</span> <strong>{viewing.spelling}/5</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hiểu bài</p>
                  <p className="text-sm">Hoàn thành: <strong>{viewing.classwork_completion_rate}%</strong></p>
                  <p className="text-sm">Mức hiểu: <strong>{viewing.comprehension_rate}/5</strong></p>
                </div>
                <div className="rounded-xl bg-secondary/50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thái độ</p>
                  <p className="text-sm">Chuyên cần: <strong>{viewing.attendance}</strong></p>
                  <p className="text-sm">Tương tác: <strong>{viewing.engagement}/5</strong></p>
                  <p className="text-sm">BTVN: <strong>{viewing.homework}</strong></p>
                </div>
              </div>

              {viewing.notes && (
                <div className="rounded-xl bg-secondary/50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ghi chú</p>
                  <p className="text-sm">{viewing.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewing(null)}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Sửa đánh giá — {editing.profiles?.full_name}</h3>
              <button onClick={() => setEditing(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4">
              {(['pronunciation', 'fluency', 'vocabulary_oral', 'grammar_conjugation', 'structure', 'spelling', 'comprehension_rate', 'engagement'] as const).map(field => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground capitalize">{field.replace(/_/g, ' ')}</span>
                  <select value={(editForm as any)[field]} onChange={(e) => setEditForm({ ...editForm, [field]: +e.target.value })}
                    className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary">
                    {SCORE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Hoàn thành bài %</span>
                <input type="number" min={0} max={100} value={editForm.classwork_completion_rate}
                  onChange={(e) => setEditForm({ ...editForm, classwork_completion_rate: Math.min(100, Math.max(0, +e.target.value)) })}
                  className="w-24 rounded-xl border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Ghi chú</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={2} className="w-full rounded-xl border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-primary" />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" strokeWidth={1.5} /> {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
                Hủy
              </button>
              <button onClick={handleSaveEdit} disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                <Save className="h-3.5 w-3.5" strokeWidth={1.5} />
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
