'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/auth-guard';
import { isDemoMode } from '@/data/admin-store';
import { loadDemoDocuments, saveDemoDocument, deleteDemoDocument } from '@/data/features-store';
import { Plus, Trash2, FileText, Mic, Video, Link, X, Save } from 'lucide-react';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DOC_TYPES = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'audio', label: 'Audio', icon: Mic },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'link', label: 'Liên kết', icon: Link },
];

export default function DocumentsPage() {
  useRoleGuard(['TeacherTA', 'Admin']);
  const demo = isDemoMode();
  const [docs, setDocs] = useState<any[]>([]);
  const [filterLvl, setFilterLvl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'pdf', url: '', cefr_level: 'A1', tags: '' });

  useEffect(() => { if (demo) setDocs(loadDemoDocuments()); }, []);

  const filtered = filterLvl ? docs.filter((d: any) => d.cefr_level === filterLvl) : docs;

  function handleSave() {
    if (demo) saveDemoDocument({ title: form.title, description: form.description, type: form.type as any, url: form.url, cefr_level: form.cefr_level, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    setShowModal(false); setDocs(loadDemoDocuments());
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa tài liệu này?')) return;
    if (demo) deleteDemoDocument(id);
    setDocs(loadDemoDocuments());
  }

  const typeIcon: Record<string, any> = { pdf: FileText, audio: Mic, video: Video, link: Link };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold tracking-tight">Giáo trình</h2><p className="text-sm text-muted-foreground">Quản lý tài liệu học tập</p></div>
        <button onClick={() => { setShowModal(true); setForm({ title: '', description: '', type: 'pdf', url: '', cefr_level: 'A1', tags: '' }); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Thêm tài liệu</button>
      </div>

      <select value={filterLvl} onChange={e => setFilterLvl(e.target.value)}
        className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">
        <option value="">Tất cả CEFR</option>
        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d: any) => {
          const Icon = typeIcon[d.type] || FileText;
          return (
            <div key={d.id} className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
                  <div>
                    <h3 className="text-sm font-medium">{d.title}</h3>
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{d.cefr_level}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(d.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{d.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {d.tags?.map((tag: string) => <span key={tag} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{tag}</span>)}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-sm text-muted-foreground">Chưa có tài liệu nào</p></div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold">Thêm tài liệu</h3><button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button></div>
            <div className="space-y-4">
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Tiêu đề</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Loại</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">{DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div><label className="mb-1 block text-xs font-medium text-muted-foreground">CEFR</label><select value={form.cefr_level} onChange={e => setForm({ ...form, cefr_level: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary">{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
              </div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">URL / Đường dẫn</label><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Mô tả</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Tags (phân cách bằng dấu phẩy)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">Hủy</button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" />Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
