'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LEVELS, getModulesByLevel } from '@/data/seed';
import { Search, ChevronRight, BookOpen, Headphones, Pen, Mic, Sparkles } from 'lucide-react';

const SKILL_ICONS: Record<string, any> = { vocabulary: BookOpen, grammar: Pen, listening: Headphones, reading: Mic };

const DIFFICULTY_BADGES: Record<string, string> = {
  A1: 'bg-primary/10 text-primary',
  A2: 'bg-warning/10 text-warning',
  B1: 'bg-destructive/10 text-destructive',
};

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const filtered = LEVELS.filter(l => {
    if (filterLevel && l.id !== filterLevel) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.title_fr.toLowerCase().includes(q) && !l.title_vi.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const levels = filtered;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kiến thức</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Chọn trình độ và mô-đun học tập phù hợp với bạn.
        </p>
      </motion.div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" strokeWidth={1.5} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm bài học..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20" />
        </div>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 sm:w-auto">
          <option value="">Tất cả</option>
          {LEVELS.map(l => <option key={l.id} value={l.id}>{l.title_vi}</option>)}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {levels.map((level, i) => {
          const modules = getModulesByLevel(level.id);
          return (
            <motion.div key={level.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
              <Link href={`/levels/${level.id}`} className="group block h-full">
                <div className="relative flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                      <BookOpen className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                    </div>
                    <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${DIFFICULTY_BADGES[level.difficulty]}`}>
                      {level.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">{level.title_fr}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{level.title_vi}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">{level.description}</p>
                  <div className="mt-auto flex items-center gap-4 pt-5 text-xs text-muted-foreground">
                    <span>{level.vocab_count} từ</span>
                    <span>{level.grammar_points} điểm ngữ pháp</span>
                    <span>{modules.length} mô-đun</span>
                  </div>
                  <div className="mt-4 flex -space-x-1.5">
                    {modules.slice(0, 4).map(m => {
                      const Icon = SKILL_ICONS[m.skill] || BookOpen;
                      return (
                        <div key={m.id} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary/80 text-muted-foreground" title={m.title_vi}>
                          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </div>
                      );
                    })}
                  </div>
                  <ChevronRight className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-foreground/50" strokeWidth={1.5} />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {levels.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Search className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-sm font-medium">Không tìm thấy khóa học phù hợp</p>
          <button onClick={() => { setSearch(''); setFilterLevel(''); }} className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary">
            Xóa bộ lọc
          </button>
        </motion.div>
      )}
    </div>
  );
}
