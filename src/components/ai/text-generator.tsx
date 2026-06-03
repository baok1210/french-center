'use client';

import { useState, useEffect } from 'react';
import type { GenerateType, FrenchLevel } from '@/types/ai';
import { LEVEL_OPTIONS, GENERATE_OPTIONS } from '@/data/levels';
import { Sparkles, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function TextGenerator() {
  const [type, setType] = useState<GenerateType>('Dialog');
  const [level, setLevel] = useState<FrenchLevel>('Beginner');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(!!localStorage.getItem('app_settings_openai_key'));
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setContent('');
    try {
      const apiKey = localStorage.getItem('app_settings_openai_key') || '';
      const res = await fetch('/api/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, level, apiKey }) });
      const data = await res.json();
      setContent(data.content ?? data.error ?? 'Lỗi');
    } catch { setContent('Lỗi kết nối'); }
    finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card">
      <div className="flex items-center gap-3 border-b border-border/50 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium">Sinh văn bản</span>
      </div>
      {!hasKey && (
        <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span>Chưa cấu hình API key. <Link href="/settings" className="font-semibold underline">Cài đặt ngay</Link></span>
        </div>
      )}
      <div className="flex flex-wrap gap-3 p-5">
        <select value={type} onChange={(e) => setType(e.target.value as GenerateType)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none">
          {GENERATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value as FrenchLevel)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs text-foreground outline-none">
          {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={handleGenerate} disabled={loading}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          {loading ? 'Đang tạo...' : 'Tạo'}
        </button>
      </div>
      {content && (
        <div className="border-t border-border/50 p-5">
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" strokeWidth={1.5} />
            {type === 'Lesson' ? 'Bài học' : 'Văn bản'} đã tạo:
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-xl bg-secondary/50 p-4 text-sm leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
