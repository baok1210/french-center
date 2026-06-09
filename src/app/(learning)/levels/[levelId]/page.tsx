'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getLevelById, getModulesByLevel, getLessonsByModule } from '@/data/seed';
import { BookOpen, Headphones, Pen, Mic, ChevronRight, Clock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const SKILL_META: Record<string, { icon: any; color: string }> = {
  vocabulary: { icon: BookOpen, color: 'text-primary bg-primary/10' },
  grammar: { icon: Pen, color: 'text-success bg-success/10' },
  listening: { icon: Headphones, color: 'text-warning bg-warning/10' },
  reading: { icon: Mic, color: 'text-destructive bg-destructive/10' },
};

const LESSON_TYPE_MARKS: Record<string, string> = {
  video: '▶', audio: '♪', flashcard: '▣', text: '📄',
};

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const level = getLevelById(levelId);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!level) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <BookOpen className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm font-medium">Không tìm thấy trình độ</p>
        <Link href="/knowledge" className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary">Quay lại</Link>
      </div>
    );
  }

  const modules = getModulesByLevel(level.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
        <Link href="/knowledge" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Quay lại
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <BookOpen className="h-7 w-7 text-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{level.title_fr}</h1>
            <p className="text-sm text-muted-foreground">{level.title_vi}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground/80">{level.description}</p>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tiến độ tổng thể</span>
          <span className="text-xs text-muted-foreground">0%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-secondary">
          <div className="h-full w-0 rounded-full bg-primary/40 transition-all" />
        </div>
        <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
          <span>{level.vocab_count} từ vựng</span>
          <span>{level.grammar_points} điểm ngữ pháp</span>
          <span>{modules.length} mô-đun</span>
        </div>
      </motion.div>

      <div className="space-y-3">
        {modules.map((mod, i) => {
          const meta = SKILL_META[mod.skill] || SKILL_META.vocabulary;
          const Icon = meta.icon;
          const lessons = getLessonsByModule(mod.id);
          const isOpen = expanded === mod.id;

          return (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : mod.id)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-secondary/40">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{mod.title_fr}</p>
                  <p className="text-xs text-muted-foreground">{mod.title_vi}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span>{lessons.length} bài</span>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border/50">
                  {lessons.length === 0 ? (
                    <p className="px-5 py-6 text-center text-xs text-muted-foreground">Chưa có bài học — đang phát triển</p>
                  ) : lessons.map(lesson => (
                    <Link key={lesson.id} href={`/lessons/${lesson.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/30 group">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-[11px] font-medium text-muted-foreground">
                        {LESSON_TYPE_MARKS[lesson.type] || '📄'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">{lesson.title_fr}</p>
                        <p className="text-xs text-muted-foreground">{lesson.title_vi}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" strokeWidth={1.5} />{lesson.duration_min}p
                        </span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/20" strokeWidth={1.5} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
