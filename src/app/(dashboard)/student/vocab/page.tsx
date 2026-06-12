'use client';

import { useState, useEffect } from 'react';
import { isDemoMode } from '@/data/admin-store';
import { loadDemoVocab, saveDemoVocab, deleteDemoVocab } from '@/data/features-store';
import { FrenchKeyboard } from '@/components/french-keyboard';
import { BookOpen, Plus, Trash2, BookMarked, X, Save, Search } from 'lucide-react';

export default function VocabPage() {
  const demo = isDemoMode();
  const [userId, setUserId] = useState('');
  const [tab, setTab] = useState<'vocab' | 'grammar'>('vocab');
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ french: '', vietnamese: '', example: '', tags: '' });

  useEffect(() => {
    if (!demo) return;
    const raw = localStorage.getItem('demo_user');
    try { const p = JSON.parse(raw || '{}'); setUserId(p.id || ''); } catch {}
  }, []);

  useEffect(() => {
    if (!userId) return;
    setItems(loadDemoVocab(userId, tab));
  }, [userId, tab]);

  function handleSave() {
    if (!form.french.trim() || !form.vietnamese.trim()) return;
    saveDemoVocab({ ...form, type: tab, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    setShowAdd(false); setForm({ french: '', vietnamese: '', example: '', tags: '' });
    setItems(loadDemoVocab(userId, tab));
  }

  const filtered = items.filter((i: any) =>
    i.french.toLowerCase().includes(search.toLowerCase()) ||
    i.vietnamese.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-semibold tracking-tight">Sổ tay</h2><p className="text-sm text-muted-foreground">Từ vựng & ngữ pháp đã ghi nhớ</p></div>
        <button onClick={() => { setShowAdd(true); setForm({ french: '', vietnamese: '', example: '', tags: '' }); }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Thêm</button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex rounded-xl border border-border bg-card p-1">
          <button onClick={() => setTab('vocab')} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${tab === 'vocab' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <BookOpen className="mr-1.5 inline h-3.5 w-3.5" />Từ vựng
          </button>
          <button onClick={() => setTab('grammar')} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${tab === 'grammar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <BookMarked className="mr-1.5 inline h-3.5 w-3.5" />Ngữ pháp
          </button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item: any) => (
          <div key={item.id} className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-primary">{item.french}</p>
                <p className="text-sm text-foreground mt-0.5">{item.vietnamese}</p>
              </div>
              <button onClick={() => { deleteDemoVocab(item.id); setItems(loadDemoVocab(userId, tab)); }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {item.example && <p className="mt-2 text-xs text-muted-foreground italic">VD: {item.example}</p>}
            {item.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{item.tags.map((t: string) => <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>)}</div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"><p className="text-sm text-muted-foreground">Chưa có ghi chép nào</p></div>}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold">Thêm {tab === 'vocab' ? 'từ vựng' : 'ngữ pháp'}</h3><button onClick={() => setShowAdd(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button></div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Tiếng Pháp</label>
                <input value={form.french} onChange={e => setForm({ ...form, french: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" />
                <FrenchKeyboard onInsert={(char) => setForm(prev => ({ ...prev, french: prev.french + char }))} />
              </div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Tiếng Việt</label><input value={form.vietnamese} onChange={e => setForm({ ...form, vietnamese: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Ví dụ</label><input value={form.example} onChange={e => setForm({ ...form, example: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
              <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Tags</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAdd(false)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-secondary">Hủy</button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" />Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
