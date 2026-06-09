'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { getDueCards, updateCardRating, getReviewStats, removeCard, type ReviewCard } from '@/data/review';
import { ArrowLeft, RefreshCw, TrendingUp, Flame, CheckCircle2, XCircle, Brain, RotateCcw } from 'lucide-react';

type Quality = 1 | 2 | 3 | 4;

const QUALITY_BTNS: { label: string; desc: string; quality: Quality; color: string }[] = [
  { label: 'Again', desc: 'Quên mất', quality: 1, color: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20' },
  { label: 'Hard', desc: 'Khó', quality: 2, color: 'bg-warning/10 text-warning border-warning/30 hover:bg-warning/20' },
  { label: 'Good', desc: 'Tốt', quality: 3, color: 'bg-success/10 text-success border-success/30 hover:bg-success/20' },
  { label: 'Easy', desc: 'Dễ', quality: 4, color: 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20' },
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
        <h2 className="mt-5 text-xl font-bold tracking-tight">Không có thẻ cần ôn</h2>
        <p className="mt-2 text-sm text-muted-foreground">Bạn đã hoàn thành tất cả các thẻ cần ôn tập hôm nay!</p>
        <div className="mt-5 flex items-center gap-6 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Flame className="h-4 w-4 text-warning" strokeWidth={1.5} /> Streak: <strong>{stats.streak}</strong> ngày
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Brain className="h-4 w-4 text-primary" strokeWidth={1.5} /> Tổng: <strong>{stats.total}</strong> thẻ
          </span>
        </div>
        <Link href="/workspace" className="mt-8 inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">Về thư viện</Link>
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
        <h2 className="mt-5 text-xl font-bold tracking-tight">Hoàn thành!</h2>
        <p className="mt-1 text-sm text-muted-foreground">Bạn đã ôn {total} thẻ</p>
        <div className="mt-6 flex items-center gap-8 text-sm">
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight text-success">{correct}/{total}</p>
            <p className="text-xs text-muted-foreground">Đúng</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold tracking-tight">{pct}%</p>
            <p className="text-xs text-muted-foreground">Tỉ lệ</p>
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
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} /> Ôn lại
          </button>
          <Link href="/workspace" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">Về thư viện</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/workspace" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Quay lại
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
              <p className="mt-4 text-xs text-muted-foreground">{flipped ? 'Bản dịch' : 'Chạm vào để lật'}</p>
              {flipped && (card.example_fr || card.example_vi) && (
                <div className="mx-auto mt-8 max-w-sm rounded-xl bg-secondary/50 p-4 text-left">
                  {card.example_fr && <p className="text-sm italic leading-relaxed text-muted-foreground">{card.example_fr}</p>}
                  {card.example_vi && <p className="mt-1 text-sm text-muted-foreground">{card.example_vi}</p>}
                </div>
              )}
              {flipped && (
                <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-muted-foreground/60">
                  <span>Hệ số dễ: <strong>{card.ease.toFixed(2)}</strong></span>
                  <span>Khoảng cách: <strong>{card.interval}</strong> ngày</span>
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
              <XCircle className="mr-1.5 inline h-3 w-3" strokeWidth={1.5} /> Loại thẻ này khỏi danh sách ôn
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
