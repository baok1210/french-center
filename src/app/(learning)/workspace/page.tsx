'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { LEVELS, getModulesByLevel, getLessonsByModule } from '@/data/seed';
import { getReviewStats } from '@/data/review';
import { getLearningPath, getNextLesson, getSuggestedLessons, getCompletionCount, getLevelCompletionCount, getLevelTotalLessons, getTotalCompleted, getTotalLessonsInPath, getProgress } from '@/data/progress';
import type { LearningPath } from '@/data/progress';
import { BookOpen, Headphones, Pen, Mic, Search, Plus, ChevronRight, Clock, CheckCircle2, Brain, Flame, TrendingUp, Library, Wand2, Sparkles, ArrowRight, Target } from 'lucide-react';

const SKILL_ICONS: Record<string, any> = { vocabulary: BookOpen, grammar: Pen, listening: Headphones, reading: Mic };
const LESSON_TYPE_MARKS: Record<string, string> = { video: '▶', audio: '♪', flashcard: '▣', text: '📄' };

export default function WorkspacePage() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ due: 0, streak: 0, total: 0 });
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [suggestedLessons, setSuggestedLessons] = useState<any[]>([]);
  const [completed, setCompleted] = useState(0);
  const [totalInPath, setTotalInPath] = useState(0);
  const [progress, setProgress] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    setStats(getReviewStats());
    const interval = setInterval(() => setStats(getReviewStats()), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLearningPath(getLearningPath());
    setNextLesson(getNextLesson());
    setSuggestedLessons(getSuggestedLessons(5));
    setCompleted(getTotalCompleted());
    setTotalInPath(getTotalLessonsInPath());
    setProgress(getProgress());
  }, [refreshKey]);

  const totalAll = LEVELS.reduce((s, l) => s + getModulesByLevel(l.id).reduce((s2, m) => s2 + getLessonsByModule(m.id).length, 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Thư viện cá nhân</h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Quản lý tiến độ học tập và ôn luyện hàng ngày của bạn.</p>
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
                  <p className="text-sm font-semibold">Ôn tập thông minh</p>
                  <p className="text-xs text-muted-foreground">Lặp lại cách quãng — ghi nhớ lâu hơn</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {stats.streak > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-warning">
                    <Flame className="h-4 w-4" strokeWidth={1.5} />
                    <span className="font-semibold">{stats.streak}</span> ngày
                  </span>
                )}
                {stats.due > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all group-hover:bg-primary/90">
                    {stats.due} thẻ cần ôn <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} /> Đã xong hôm nay
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Action Bar */}
      <div className="mb-8 flex flex-wrap gap-3">
        {learningPath && nextLesson && (
          <Link href={`/lessons/${nextLesson.lesson.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} /> Tiếp tục học
          </Link>
        )}
        <Link href="/knowledge" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
          <Plus className="h-4 w-4" strokeWidth={1.5} /> Thêm bài học
        </Link>
        <Link href="/wizard" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
          <Wand2 className="h-4 w-4" strokeWidth={1.5} /> Lộ trình học
        </Link>
        <Link href="/review" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
          <Brain className="h-4 w-4" strokeWidth={1.5} /> Ôn tập
        </Link>
      </div>

      {/* Learning Path Info + Suggested Lesson */}
      {learningPath ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-8">
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Target className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {LEVELS.find(l => l.id === learningPath.level)?.title_fr || learningPath.level}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {completed}/{totalInPath} bài học · {learningPath.duration} ngày
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-40 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${totalInPath > 0 ? (completed / totalInPath) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{totalInPath > 0 ? Math.round((completed / totalInPath) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          {nextLesson && (
            <Link href={`/lessons/${nextLesson.lesson.id}`}
              className="group mt-3 block rounded-2xl border-2 border-dashed border-primary/30 bg-primary/[0.02] p-4 transition-all hover:border-primary/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Bài học tiếp theo</p>
                  <p className="text-sm font-medium">{nextLesson.lesson.title_fr}</p>
                  <p className="text-xs text-muted-foreground">{nextLesson.module.title_vi} · {nextLesson.lesson.duration_min} phút</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/60" strokeWidth={1.5} />
              </div>
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8 rounded-2xl border-2 border-dashed border-border/40 bg-card/30 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Library className="h-6 w-6 text-muted-foreground/40" strokeWidth={1} />
          </div>
          <h2 className="mt-4 text-base font-semibold">Thư viện trống</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bạn chưa tạo lộ trình học. Hãy bắt đầu ngay!</p>
          <Link href="/wizard" className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
            <Wand2 className="h-4 w-4" strokeWidth={1.5} /> Tạo lộ trình
          </Link>
        </motion.div>
      )}

      {/* Suggested Lessons */}
      {learningPath && suggestedLessons.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">Gợi ý bài học</p>
            <Link href={`/levels/${learningPath.level}`} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">Xem tất cả</Link>
          </div>
          <div className="space-y-2">
            {suggestedLessons.map((item, i) => {
              const completed_ = item.lesson ? getCompletionCount(item.module.id) : 0;
              return (
                <Link key={item.lesson.id} href={`/lessons/${item.lesson.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3.5 transition-all hover:border-border hover:shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs text-muted-foreground">
                    {LESSON_TYPE_MARKS[item.lesson.type] || '📄'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.lesson.title_fr}</p>
                    <p className="text-xs text-muted-foreground">{item.module.title_vi} · {item.lesson.duration_min} phút</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-0.5" strokeWidth={1.5} />
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Progress Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">Tiến độ học tập</p>
        <span className="text-xs text-muted-foreground">{getTotalCompleted()}/{totalAll} bài</span>
      </div>

      {/* Accordion Tree */}
      <div className="space-y-2">
        {LEVELS.map((level, li) => {
          const modules = getModulesByLevel(level.id);
          const isLevelOpen = expandedLevel === level.id;
          const levelCompleted = getLevelCompletionCount(level.id);
          const levelTotal = getLevelTotalLessons(level.id);
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
                  <span>{levelCompleted}/{levelTotal}</span>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isLevelOpen ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                </div>
              </button>

              {isLevelOpen && (
                <div className="border-t border-border/50">
                  {modules.map((mod, mi) => {
                    const lessons = getLessonsByModule(mod.id);
                    const Icon = SKILL_ICONS[mod.skill] || BookOpen;
                    const isModOpen = expandedModule === mod.id;
                    const modCompleted = getCompletionCount(mod.id);
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
                            <span>{modCompleted}/{lessons.length}</span>
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${isModOpen ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                          </div>
                        </button>
                        {isModOpen && (
                          <div className="border-t border-border/30 bg-secondary/20">
                            {lessons.map(lesson => {
                              const done = progress?.completedLessonIds?.includes(lesson.id);
                              return (
                                <Link key={lesson.id} href={`/lessons/${lesson.id}`}
                                  className="flex items-center gap-3 px-10 py-2.5 text-sm transition-colors hover:bg-secondary/40">
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-[10px] text-muted-foreground">
                                    {LESSON_TYPE_MARKS[lesson.type] || '📄'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={`text-xs ${done ? 'text-muted-foreground/50 line-through' : ''}`}>{lesson.title_fr}</p>
                                  </div>
                                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                                    <Clock className="h-3 w-3" strokeWidth={1.5} />{lesson.duration_min}p
                                  </span>
                                  {done ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" strokeWidth={2} />
                                  ) : (
                                    <div className="h-3.5 w-3.5 shrink-0" />
                                  )}
                                </Link>
                              );
                            })}
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
