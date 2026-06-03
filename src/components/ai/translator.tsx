'use client';

import { useState } from 'react';
import { Languages, ArrowRightLeft, Info } from 'lucide-react';

export function Translator() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [direction, setDirection] = useState<'en-fr' | 'fr-en'>('en-fr');
  const [loading, setLoading] = useState(false);

  async function handleTranslate() {
    if (!text.trim()) return;
    setLoading(true); setResult('');
    try {
      const [source, target] = direction === 'en-fr' ? ['en', 'fr'] : ['fr', 'en'];
      const googleKey = localStorage.getItem('app_settings_google_key') || '';
      const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text.trim(), source, target, apiKey: googleKey }) });
      const data = await res.json();
      setResult(data.translatedText ?? data.error ?? 'Lỗi');
    } catch { setResult('Lỗi kết nối'); }
    finally { setLoading(false); }
  }

  function swap() {
    setDirection((d) => (d === 'en-fr' ? 'fr-en' : 'en-fr'));
    setText(result);
    setResult(text);
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card">
      <div className="flex items-center gap-3 border-b border-border/50 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
          <Languages className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium">Dịch thuật</span>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2 text-[11px] text-muted-foreground">
          <Info className="h-3 w-3 shrink-0" strokeWidth={1.5} />
          Dùng API miễn phí (MyMemory) hoặc thêm Google API key trong <a href="/settings" className="underline">Cài đặt</a>
        </div>
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">{direction === 'en-fr' ? 'English' : 'Français'}</span>
          <button onClick={swap} className="rounded-xl border border-border p-1.5 text-muted-foreground transition-colors hover:bg-secondary"><ArrowRightLeft className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
          <span className="text-xs font-medium uppercase text-muted-foreground">{direction === 'en-fr' ? 'Français' : 'English'}</span>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập văn bản..." rows={3}
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary" />
        <button onClick={handleTranslate} disabled={loading || !text.trim()}
          className="mt-3 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
          <Languages className="h-3.5 w-3.5" strokeWidth={1.5} />
          {loading ? 'Đang dịch...' : 'Dịch'}
        </button>
        {result && <div className="mt-3 rounded-xl bg-secondary/50 p-4 text-sm">{result}</div>}
      </div>
    </div>
  );
}
