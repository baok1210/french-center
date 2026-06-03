'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { ClipboardCheck, Search, Edit3, Trash2, Eye, X, Save, AlertCircle, ChevronDown, Filter } from 'lucide-react';

interface EvalRecord {
  id: string;
  student_id: string;
  class_session_id: string;
  session_date: string;
  pronunciation: number;
  fluency: number;
  vocabulary_oral: number;
  grammar_conjugation: number;
  structure: number;
  spelling: number;
  classwork_completion_rate: number;
  comprehension_rate: number;
  engagement: number;
  attendance: string;
  homework: string;
  notes: string | null;
  is_locked: boolean;
  profiles?: { full_name: string; student_code: string };
  class_sessions?: { title: string; session_date: string; classes?: { title: string } };
}

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Kém' },
  { value: 2, label: '2 - Yếu' },
  { value: 3, label: '3 - Trung bình' },
  { value: 4, label: '4 - Khá' },
  { value: 5, label: '5 - Tốt' },
];

export default function TeacherEvaluationsPage() {
  const supabase = createClient();
  const [evals, setEvals] = useState<EvalRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState<{ id: string; title: string }[]>([]);
  const [viewing, setViewing] = useState<EvalRecord | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
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
    const { error: err } = await supabase.from('evaluations').delete().eq('id', id);
    if (err) alert('Lỗi: ' + err.message);
    else loadData();
  }

  const filtered = evals.filter((e) => {
    const matchSearch = !search ||
      e.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.profiles?.student_code?.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass ||
      e.class_sessions?.classes?.title?.includes(filterClass) ||
      e.class_sessions?.classes?.title === filterClass;
    return matchSearch && matchClass;
  });

  const statusBadge = (e: EvalRecord) => {
    if (e.is_locked) return <span className="rounded-lg bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">Đã khóa</span>;
    return <span className="rounded-lg bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Có thể sửa</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Lịch sử đánh giá</h2>
        <p className="text-sm text-muted-foreground">Xem, sửa và xóa đánh giá của học viên</p>
      </div>

      {/* Filters */}
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

      {/* Evaluations List */}
      <div className="space-y-3">
        {filtered.map((e) => (
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
                  <span>{e.class_sessions?.title || e.class_sessions?.classes?.title || ''}</span>
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
                <button onClick={() => handleDelete(e.id)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
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
    </div>
  );
}
