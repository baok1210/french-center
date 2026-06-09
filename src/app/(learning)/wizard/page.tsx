'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LEVELS } from '@/data/seed';
import { initProgressFromPath, getNextLesson } from '@/data/progress';
import { ArrowLeft, Sparkles, Rocket, Target, Clock, ChevronRight, CheckCircle2, BookOpen, ChevronDown } from 'lucide-react';

const GOALS = [
  { id: 'comprehensive', label_fr: 'Parcours complet', label_vi: 'Lộ trình toàn diện', desc: 'Học đầy đủ từ A-Z', icon: Target },
  { id: 'review', label_fr: 'Révision rapide', label_vi: 'Ôn tập nhanh', desc: 'Tập trung vào từ vựng và ngữ pháp cốt lõi', icon: Rocket },
];

const DURATIONS = [
  { id: '15', label: '15 ngày' },
  { id: '30', label: '30 ngày' },
  { id: '60', label: '60 ngày' },
  { id: '90', label: '90 ngày' },
];

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('');
  const [started, setStarted] = useState(false);

  if (started) {
    const nextLesson = getNextLesson();
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold">Lộ trình đã sẵn sàng!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {LEVELS.find(l => l.id === level)?.title_fr} — {GOALS.find(g => g.id === goal)?.label_vi} — {DURATIONS.find(d => d.id === duration)?.label}
        </p>

        {nextLesson && (
          <div className="mt-8 w-full rounded-2xl border border-border/60 bg-card p-5 text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bài học đầu tiên</p>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{nextLesson.lesson.title_fr}</p>
                <p className="text-xs text-muted-foreground">{nextLesson.module.title_vi} · {nextLesson.lesson.duration_min} phút</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/30" strokeWidth={1.5} />
            </div>
            <Link href={`/lessons/${nextLesson.lesson.id}`}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
              Học ngay <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <Link href="/workspace" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
          Xem lộ trình
        </Link>
        <button onClick={() => { setStep(0); setLevel(''); setGoal(''); setDuration(''); setStarted(false); }} className="mt-2 text-xs text-muted-foreground underline">Tạo lại</button>
      </div>
    );
  }

  const canNext = () => {
    if (step === 0) return !!level;
    if (step === 1) return !!goal;
    return !!duration;
  };

  const steps = [
    <div key="level">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Bước 1/3</p>
      <h2 className="text-lg font-bold">Chọn trình độ</h2>
      <p className="mb-4 text-sm text-muted-foreground">Bạn muốn bắt đầu từ đâu?</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {LEVELS.map(l => (
          <button key={l.id} onClick={() => setLevel(l.id)}
            className={`rounded-2xl border-2 p-5 text-left transition-all ${level === l.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
            <span className="text-3xl">{l.icon}</span>
            <p className="mt-2 font-semibold">{l.title_fr}</p>
            <p className="text-xs text-muted-foreground">{l.title_vi}</p>
          </button>
        ))}
      </div>
    </div>,

    <div key="goal">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Bước 2/3</p>
      <h2 className="text-lg font-bold">Mục tiêu học tập</h2>
      <p className="mb-4 text-sm text-muted-foreground">Bạn muốn học như thế nào?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {GOALS.map(g => {
          const Icon = g.icon;
          return (
            <button key={g.id} onClick={() => setGoal(g.id)}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${goal === g.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
              <Icon className="mb-2 h-6 w-6 text-primary" />
              <p className="font-semibold">{g.label_fr}</p>
              <p className="text-xs text-muted-foreground">{g.desc} — {g.label_vi}</p>
            </button>
          );
        })}
      </div>
    </div>,

    <div key="duration">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Bước 3/3</p>
      <h2 className="text-lg font-bold">Thời gian</h2>
      <p className="mb-4 text-sm text-muted-foreground">Bạn muốn hoàn thành trong bao lâu?</p>
      <div className="grid gap-3 sm:grid-cols-4">
        {DURATIONS.map(d => (
          <button key={d.id} onClick={() => setDuration(d.id)}
            className={`rounded-2xl border-2 p-5 text-center transition-all ${duration === d.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
            <Clock className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="font-semibold">{d.label}</p>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map(s => (
            <div key={s} className={`flex h-2 rounded-full transition-all ${s <= step ? 'w-8 bg-primary' : 'w-2 bg-secondary'}`} />
          ))}
        </div>
      </div>

      {steps[step]}

      <div className="mt-8 flex justify-between">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-30">
          Quay lại
        </button>
        {step < 2 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            Tiếp theo <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => { localStorage.setItem('learning_path', JSON.stringify({ level, goal, duration, createdAt: Date.now() })); initProgressFromPath(); setStarted(true); }} disabled={!canNext()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg disabled:opacity-40">
            <Sparkles className="h-4 w-4" /> Tạo lộ trình
          </button>
        )}
      </div>
    </div>
  );
}
