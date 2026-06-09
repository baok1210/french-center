import sys
sys.stdout.reconfigure(encoding='utf-8')

files = {}

# ===== Learning Layout - use AppShell for consistency =====
files['src/app/(learning)/layout.tsx'] = """import { AppShell } from '@/components/layout';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
"""

# ===== StickyNav - keep as component but not used in main layout =====
files['src/components/learning/StickyNav.tsx'] = """'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Library, Wand2, Brain } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/knowledge', label: 'Ki\u1ebfn th\u1ee9c', icon: BookOpen },
  { href: '/workspace', label: 'Th\u01b0 vi\u1ec7n', icon: Library },
  { href: '/review', label: '\u00d4n t\u1eadp', icon: Brain },
  { href: '/wizard', label: 'L\u1ed9 tr\u00ecnh', icon: Wand2 },
];

export default function StickyNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-4">
      {NAV_ITEMS.map(item => {
        const active = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}>
            <item.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
"""

# ===== Review Page =====
files['src/app/(learning)/review/page.tsx'] = """'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { getDueCards, updateCardRating, getReviewStats, removeCard, type ReviewCard } from '@/data/review';
import { ArrowLeft, RefreshCw, TrendingUp, Flame, CheckCircle2, XCircle, Brain, RotateCcw } from 'lucide-react';

type Quality = 1 | 2 | 3 | 4;

const QUALITY_BTNS: { label: string; desc: string; quality: Quality; color: string }[] = [
  { label: 'Again', desc: 'Qu\u00ean m\u1ea5t', quality: 1, color: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20' },
  { label: 'Hard', desc: 'Kh\u00f3', quality: 2, color: 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20' },
  { label: 'Good', desc: 'T\u1ed1t', quality: 3, color: 'bg-success/10 text-success border-success/30 hover:bg-success/20' },
  { label: 'Easy', desc: 'D\u1ec5', quality: 4, color: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' },
];

export default function ReviewPage() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ total: 0, due: 0, reviewed: 0, streak: 0 });
  const [justReviewed, setJustReviewed] = useState<Quality[]>([]);

  const refresh = useCallback(() => {
    setCards(getDueCards());
    setStats(getReviewStats());
    setIdx(0);
    setFlipped(false);
    setDone(false);
    setJustReviewed([]);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const card = cards[idx];
  const progress = cards.length > 0 ? (idx / cards.length) * 100 : 0;

  const handleRate = (quality: Quality) => {
    if (!card) return;
    updateCardRating(card.id, quality);
    setJustReviewed(prev => [...prev, quality]);
    if (idx + 1 >= cards.length) { setDone(true); setStats(getReviewStats()); }
    else { setIdx(idx + 1); setFlipped(false); }
  };

  const handleRemove = () => {
    if (!card) return;
    removeCard(card.id);
    setCards(prev => prev.filter(c => c.id !== card.id));
    if (idx >= cards.length - 1) { setDone(true); setStats(getReviewStats()); }
    else { setIdx(idx + 1); setFlipped(false); }
  };

  if (cards.length === 0 && !done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
        </div>
        <h2 className="mt-5 text-xl font-bold tracking-tight">Kh\u00f4ng c\u00f3 th\u1ebb c\u1ea7n \u00f4n</h2>
        <p className="mt-2 text-sm text-muted-foreground">B\u1ea1n \u0111\u00e3 ho\u00e0n th\u00e0nh t\u1ea5t c\u1ea3 c\u00e1c th\u1ebb c\u1ea7n \u00f4n t\u1eadp h\u00f4m nay!</p>
        <div className="mt-5 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className="h-4 w-4 text-warning" strokeWidth={1.5} /> Streak: <strong>{stats.streak}</strong> ng\u00e0y
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Brain className="h-4 w-4 text-primary" strokeWidth={1.5} /> T\u1ed5ng: <strong>{stats.total}</strong> th\u1ebb
          </span>
        </div>
        <Link href="/workspace" className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">V\u1ec1 th\u01b0 vi\u1ec7n</Link>
      </div>
    );
  }

  if (done) {
    const correct = justReviewed.filter(q => q >= 3).length;
    const total = justReviewed.length;
    const pct = total > 0 ? Math.round(correct / total * 100) : 100;
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
        </div>
        <h2 className="mt-5 text-xl font-bold tracking-tight">Ho\u00e0n th\u00e0nh!</h2>
        <p className="mt-1 text-sm text-muted-foreground">B\u1ea1n \u0111\u00e3 \u00f4n {total} th\u1ebb</p>
        <div className="mt-6 flex items-center gap-8 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight text-success">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">\u0110\u00fang</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight">{pct}%</p>
            <p className="text-xs text-muted-foreground">T\u1ec9 l\u1ec7</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 text-lg font-bold tracking-tight text-warning">
              <Flame className="h-5 w-5" strokeWidth={1.5} /> {stats.streak}
            </p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <button onClick={refresh} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> \u00d4n l\u1ea1i
          </button>
          <Link href="/workspace" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">V\u1ec1 th\u01b0 vi\u1ec7n</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/workspace" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Quay l\u1ea1i
        </Link>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-warning" strokeWidth={1.5} /><span>{stats.streak}</span></span>
          <span>{idx + 1} / {cards.length}</span>
        </div>
      </div>

      <div className="mb-8 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div className="h-full rounded-full bg-primary/30" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} />
      </div>

      <div className="flex items-start justify-center gap-4">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div key={card.id + (flipped ? '-flipped' : '')}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setFlipped(!flipped)}
              className={`min-h-[300px] w-full cursor-pointer rounded-2xl border-2 p-10 text-center transition-all ${
                flipped ? 'border-success/30 bg-success/[0.03]' : 'border-border/60 bg-card hover:border-foreground/20 shadow-sm'
              }`}>
              <p className={`text-2xl font-bold tracking-tight transition-all sm:text-3xl ${flipped ? 'text-success' : ''}`}>
                {flipped ? card.term_vi : card.term_fr}
              </p>
              <p className="mt-4 text-xs text-muted-foreground">{flipped ? 'B\u1ea3n d\u1ecbch' : 'Ch\u1ea1m v\u00e0o \u0111\u1ec3 l\u1eadt'}</p>
              {flipped && (card.example_fr || card.example_vi) && (
                <div className="mx-auto mt-8 max-w-sm rounded-xl bg-secondary/50 p-4 text-left">
                  {card.example_fr && <p className="text-sm italic leading-relaxed text-muted-foreground">{card.example_fr}</p>}
                  {card.example_vi && <p className="mt-1 text-sm text-muted-foreground">{card.example_vi}</p>}
                </div>
              )}
              {flipped && (
                <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-muted-foreground/60">
                  <span>H\u1ec7 s\u1ed1 d\u1ec5: <strong>{card.ease.toFixed(2)}</strong></span>
                  <span>Kho\u1ea3ng c\u00e1ch: <strong>{card.interval}</strong> ng\u00e0y</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {flipped && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-6 grid grid-cols-4 gap-2">
              {QUALITY_BTNS.map(btn => (
                <button key={btn.quality} onClick={() => handleRate(btn.quality)}
                  className={`rounded-xl border p-3 text-center text-xs font-medium transition-all ${btn.color}`}>
                  <p className="font-semibold">{btn.label}</p>
                  <p className="mt-0.5 text-[10px] opacity-60">{btn.desc}</p>
                </button>
              ))}
            </motion.div>
          )}

          {flipped && (
            <button onClick={handleRemove} className="mt-4 w-full rounded-xl py-2 text-xs text-muted-foreground/50 transition-colors hover:bg-secondary/50 hover:text-muted-foreground">
              <XCircle className="mr-1.5 inline h-3 w-3" strokeWidth={1.5} /> Lo\u1ea1i th\u1ebb n\u00e0y kh\u1ecfi danh s\u00e1ch \u00f4n
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
"""

# ===== Workspace Page =====
files['src/app/(learning)/workspace/page.tsx'] = """'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LEVELS, getModulesByLevel, getLessonsByModule } from '@/data/seed';
import { getReviewStats } from '@/data/review';
import { BookOpen, Headphones, Pen, Mic, Search, Plus, ChevronRight, Clock, CheckCircle2, Brain, Flame, TrendingUp, Library, Wand2 } from 'lucide-react';

const SKILL_ICONS: Record<string, any> = { vocabulary: BookOpen, grammar: Pen, listening: Headphones, reading: Mic };
const LESSON_TYPE_MARKS: Record<string, string> = { video: '\u25b6', audio: '\u266a', flashcard: '\u25a3', text: '\U0001f4c4' };

export default function WorkspacePage() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ due: 0, streak: 0, total: 0 });

  useEffect(() => {
    setStats(getReviewStats());
    const interval = setInterval(() => setStats(getReviewStats()), 30000);
    return () => clearInterval(interval);
  }, []);

  const totalAll = LEVELS.reduce((s, l) => s + getModulesByLevel(l.id).reduce((s2, m) => s2 + getLessonsByModule(m.id).length, 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Th\u01b0 vi\u1ec7n c\u00e1 nh\u00e2n</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Qu\u1ea3n l\u00fd ti\u1ebfn \u0111\u1ed9 h\u1ecdc t\u1eadp v\u00e0 \u00f4n luy\u1ec7n h\u00e0ng ng\u00e0y c\u1ee7a b\u1ea1n.</p>
      </motion.div>

      {/* Review Summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Link href="/review" className="group block mb-8">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-foreground/[0.02] to-transparent p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Brain className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold">\u00d4n t\u1eadp th\u00f4ng minh</p>
                  <p className="text-xs text-muted-foreground">L\u1eb7p l\u1ea1i c\u00e1ch qu\u00e3ng \u2014 ghi nh\u1edb l\u00e2u h\u01a1n</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-warning">
                    <Flame className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-semibold">{stats.streak}</span> ng\u00e0y
                  </span>
                )}
                {stats.due > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all group-hover:bg-primary/90">
                    {stats.due} th\u1ebb c\u1ea7n \u00f4n <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> \u0110\u00e3 xong h\u00f4m nay
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Action Bar */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/knowledge" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Th\u00eam b\u00e0i h\u1ecdc
        </Link>
        <Link href="/wizard" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
          <Wand2 className="h-4 w-4" strokeWidth={1.5} /> L\u1ed9 tr\u00ecnh h\u1ecdc
        </Link>
        <Link href="/review" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
          <Brain className="h-4 w-4" strokeWidth={1.5} /> \u00d4n t\u1eadp
        </Link>
      </div>

      {/* Empty State */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 rounded-2xl border-2 border-dashed border-border/40 bg-card/30 p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <Library className="h-6 w-6 text-muted-foreground/40" strokeWidth={1} />
        </div>
        <h2 className="mt-4 text-base font-semibold">Th\u01b0 vi\u1ec7n tr\u1ed1ng</h2>
        <p className="mt-1 text-sm text-muted-foreground">B\u1ea1n ch\u01b0a th\u00eam b\u00e0i h\u1ecdc n\u00e0o. H\u00e3y b\u1eaft \u0111\u1ea7u kh\u00e1m ph\u00e1!</p>
        <Link href="/knowledge" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Kh\u00e1m ph\u00e1 kh\u00f3a h\u1ecdc
        </Link>
      </motion.div>

      {/* Progress Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">Ti\u1ebfn \u0111\u1ed9 h\u1ecdc t\u1eadp</p>
        <span className="text-xs text-muted-foreground">0/{totalAll} b\u00e0i</span>
      </div>

      {/* Accordion Tree */}
      <div className="space-y-2">
        {LEVELS.map((level, li) => {
          const modules = getModulesByLevel(level.id);
          const isLevelOpen = expandedLevel === level.id;
          const totalLessons = modules.reduce((sum, m) => sum + getLessonsByModule(m.id).length, 0);
          return (
            <motion.div key={level.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + li * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <button onClick={() => setExpandedLevel(isLevelOpen ? null : level.id)}
                className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary shrink-0">
                  <BookOpen className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{level.title_fr}</p>
                  <p className="text-xs text-muted-foreground">{level.title_vi}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span>0/{totalLessons}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isLevelOpen ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                </div>
              </button>

              {isLevelOpen && (
                <div className="border-t border-border/50">
                  {modules.map((mod, mi) => {
                    const lessons = getLessonsByModule(mod.id);
                    const Icon = SKILL_ICONS[mod.skill] || BookOpen;
                    const isModOpen = expandedModule === mod.id;
                    return (
                      <div key={mod.id}>
                        <button onClick={() => setExpandedModule(isModOpen ? null : mod.id)}
                          className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-secondary/30">
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm">{mod.title_fr}</p>
                            <p className="text-[11px] text-muted-foreground">{mod.title_vi}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                            <span>0/{lessons.length}</span>
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isModOpen ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                          </div>
                        </button>
                        {isModOpen && (
                          <div className="border-t border-border/30 bg-secondary/20">
                            {lessons.map(lesson => (
                              <Link key={lesson.id} href={`/lessons/${lesson.id}`}
                                className="flex items-center gap-3 px-10 py-2.5 text-sm transition-colors hover:bg-secondary/40">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] text-muted-foreground">
                                  {LESSON_TYPE_MARKS[lesson.type] || '\U0001f4c4'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs">{lesson.title_fr}</p>
                                </div>
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                                  <Clock className="h-3 w-3" strokeWidth={1.5} />{lesson.duration_min}p
                                </span>
                                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/20 shrink-0" strokeWidth={1.5} />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
"""

# ===== Lesson Page =====
files['src/app/(learning)/lessons/[lessonId]/page.tsx'] = """'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getLessonById } from '@/data/seed';
import { addCardsToReview } from '@/data/review';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, RefreshCw, ChevronLeft, ChevronRight, Brain, Play, BookOpen } from 'lucide-react';

const TYPE_META: Record<string, { label: string; color: string }> = {
  video: { label: 'Video', color: 'bg-primary/10 text-primary' },
  audio: { label: 'Audio', color: 'bg-warning/10 text-warning' },
  text: { label: '\u0110\u1ecdc hi\u1ec3u', color: 'bg-success/10 text-success' },
  flashcard: { label: 'Flashcard', color: 'bg-primary/10 text-primary' },
  quiz: { label: 'Quiz', color: 'bg-destructive/10 text-destructive' },
};

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const lesson = getLessonById(lessonId);
  const [flipIdx, setFlipIdx] = useState<number | null>(null);
  const [cardIdx, setCardIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  if (!lesson) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <BookOpen className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm font-medium">Kh\u00f4ng t\u00ecm th\u1ea5y b\u00e0i h\u1ecdc</p>
        <Link href="/workspace" className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary">Quay l\u1ea1i</Link>
      </div>
    );
  }

  const typeMeta = TYPE_META[lesson.type] || TYPE_META.text;

  const renderContent = () => {
    const c = lesson.content;

    if (c.type === 'video') {
      return (
        <div className="space-y-8">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10 backdrop-blur-sm transition-transform hover:scale-105">
              <Play className="ml-0.5 h-7 w-7 text-foreground/70" fill="currentColor" strokeWidth={0} />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fran\u00e7ais</p>
              <p className="text-sm leading-relaxed">{c.transcript_fr}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ti\u1ebfng Vi\u1ec7t</p>
              <p className="text-sm leading-relaxed">{c.transcript_vi}</p>
            </div>
          </div>
          {c.exercises.length > 0 && (
            <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm font-semibold">B\u00e0i t\u1eadp</p>
              {c.exercises.map((ex, i) => <ExerciseItem key={ex.id} exercise={ex} />)}
            </div>
          )}
        </div>
      );
    }

    if (c.type === 'audio') {
      return (
        <div className="space-y-8">
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
              <Volume2 className="h-9 w-9 text-warning" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-muted-foreground">{c.duration_sec} gi\u00e2y</p>
            <div className="mx-auto mt-5 h-1.5 w-full max-w-sm rounded-full bg-secondary">
              <div className="h-full w-0 rounded-full bg-foreground/20" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground/60">Ph\u00e1t \u00e2m thanh m\u1eabu</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fran\u00e7ais</p>
              <p className="text-sm leading-relaxed">{c.transcript_fr}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ti\u1ebfng Vi\u1ec7t</p>
              <p className="text-sm leading-relaxed">{c.transcript_vi}</p>
            </div>
          </div>
        </div>
      );
    }

    if (c.type === 'text') {
      const qCorrect = c.questions.filter(q => quizAnswers[q.id] === q.correct_index).length;
      return (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fran\u00e7ais</p>
              <p className="text-sm leading-relaxed">{c.body_fr}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ti\u1ebfng Vi\u1ec7t</p>
              <p className="text-sm leading-relaxed">{c.body_vi}</p>
            </div>
          </div>
          {c.vocabulary.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">T\u1eeb v\u1ef1ng trong b\u00e0i</p>
              <div className="flex flex-wrap gap-2">
                {c.vocabulary.map((v, i) => (
                  <span key={i} className="rounded-xl bg-secondary px-3 py-1.5 text-xs"><strong>{v.word_fr}</strong> \u2014 {v.word_vi}</span>
                ))}
              </div>
            </div>
          )}
          {c.questions.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold">C\u00e2u h\u1ecfi</p>
                {Object.keys(quizAnswers).length === c.questions.length && (
                  <span className={`text-xs font-medium ${qCorrect === c.questions.length ? 'text-success' : 'text-warning'}`}>
                    {qCorrect}/{c.questions.length} \u0111\u00fang
                  </span>
                )}
              </div>
              <div className="space-y-5">
                {c.questions.map((q, qi) => (
                  <div key={q.id}>
                    <p className="mb-1.5 text-sm font-medium">{qi + 1}. {q.question_vi}</p>
                    <p className="mb-3 text-xs italic text-muted-foreground">{q.question_fr}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oi) => {
                        const selected = quizAnswers[q.id] === oi;
                        const isCorrect = q.correct_index === oi;
                        const show = quizAnswers[q.id] !== undefined;
                        let cls = 'border-border/60 bg-card hover:bg-secondary/50 text-foreground';
                        if (show && isCorrect) cls = 'border-success/30 bg-success/5 text-success';
                        else if (show && selected && !isCorrect) cls = 'border-destructive/30 bg-destructive/5 text-destructive';
                        else if (selected) cls = 'border-foreground/20 bg-secondary/50 text-foreground';
                        return (
                          <button key={oi} onClick={() => !show && setQuizAnswers({ ...quizAnswers, [q.id]: oi })}
                            className={`rounded-xl border px-3.5 py-2.5 text-left text-xs transition-all ${cls}`}>
                            {show && isCorrect && <CheckCircle2 className="mr-1.5 inline h-3 w-3" strokeWidth={2} />}
                            {show && selected && !isCorrect && <XCircle className="mr-1.5 inline h-3 w-3" strokeWidth={2} />}
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (c.type === 'flashcard') {
      const card = c.cards[cardIdx];
      const flipped = flipIdx === cardIdx;
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{cardIdx + 1} / {c.cards.length}</span>
            <span className="text-xs">H\u1ecdc t\u1eeb v\u1ef1ng</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button onClick={() => { setCardIdx(Math.max(0, cardIdx - 1)); setFlipIdx(null); }} disabled={cardIdx === 0}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>

            <motion.div key={cardIdx} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setFlipIdx(flipped ? null : cardIdx)}
              className={`min-h-[280px] w-full max-w-md cursor-pointer rounded-2xl border-2 p-8 text-center transition-all duration-500 ${
                flipped ? 'border-success/30 bg-success/[0.03]' : 'border-border/60 bg-card hover:border-foreground/20'
              }`}>
              <p className={`text-2xl font-bold tracking-tight transition-all ${flipped ? 'text-success' : ''}`}>
                {flipped ? card.term_vi : card.term_fr}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">{flipped ? 'B\u1ea3n d\u1ecbch' : 'Ch\u1ea1m v\u00e0o \u0111\u1ec3 l\u1eadt'}</p>
              {flipped && (card.example_fr || card.example_vi) && (
                <div className="mx-auto mt-6 max-w-sm rounded-xl bg-secondary/50 p-4 text-left">
                  {card.example_fr && <p className="text-sm italic leading-relaxed text-muted-foreground">{card.example_fr}</p>}
                  {card.example_vi && <p className="mt-1 text-sm text-muted-foreground">{card.example_vi}</p>}
                </div>
              )}
            </motion.div>

            <button onClick={() => { setCardIdx(Math.min(c.cards.length - 1, cardIdx + 1)); setFlipIdx(null); }} disabled={cardIdx === c.cards.length - 1}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground transition-colors hover:bg-secondary disabled:opacity-30">
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            {c.cards.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === cardIdx ? 'w-6 bg-foreground/60' : 'w-1.5 bg-secondary'}`} />
            ))}
          </div>

          {cardIdx === c.cards.length - 1 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3">
              <button onClick={() => { setCardIdx(0); setFlipIdx(null); }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} /> H\u1ecdc l\u1ea1i
              </button>
              <button onClick={() => {
                addCardsToReview(c.cards.map(card => ({
                  id: lesson.id + '-' + card.id, lesson_id: lesson.id,
                  term_fr: card.term_fr, term_vi: card.term_vi,
                  example_fr: card.example_fr, example_vi: card.example_vi, image_url: card.image_url,
                })));
                setAdded(true);
              }} className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                added ? 'bg-success/10 text-success border border-success/20' : 'bg-foreground/5 text-foreground border border-border/60 hover:bg-secondary'
              }`}>
                <Brain className="h-4 w-4" strokeWidth={1.5} />
                {added ? '\u0110\u00e3 th\u00eam v\u00e0o \u00f4n t\u1eadp' : 'Th\u00eam v\u00e0o \u00f4n t\u1eadp'}
              </button>
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <BookOpen className="h-5 w-5 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">N\u1ed9i dung \u0111ang \u0111\u01b0\u1ee3c ph\u00e1t tri\u1ec3n</p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Link href={`/levels/${lesson.module_id.split('-').slice(0, 2).join('/')}`}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Quay l\u1ea1i
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mb-8">
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${typeMeta.color}`}>{typeMeta.label}</span>
        </div>
        <h1 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">{lesson.title_fr}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{lesson.title_vi}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
        {renderContent()}
      </motion.div>
    </div>
  );
}

function ExerciseItem({ exercise }: { exercise: any }) {
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);
  const correct = answer.trim().toLowerCase() === exercise.answer.toLowerCase();
  return (
    <div className="rounded-xl bg-secondary/40 p-4">
      <p className="mb-1 text-xs text-muted-foreground">{exercise.instruction_vi}</p>
      <p className="mb-3 text-sm">{exercise.prompt}</p>
      <div className="flex gap-2">
        <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Nh\u1eadp c\u00e2u tr\u1ea3 l\u1eddi..."
          className="flex-1 rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-foreground/20" />
        <button onClick={() => setChecked(true)}
          className="rounded-xl bg-foreground/10 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20">Ki\u1ec3m tra</button>
      </div>
      {checked && (
        <p className={`mt-2 flex items-center gap-1.5 text-xs ${correct ? 'text-success' : 'text-destructive'}`}>
          {correct ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <XCircle className="h-3 w-3" strokeWidth={2} />}
          {correct ? 'Ch\u00ednh x\u00e1c!' : `Sai. \u0110\u00e1p \u00e1n: ${exercise.answer}`}
        </p>
      )}
    </div>
  );
}
"""

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Written: {path}')

print('All files updated')
