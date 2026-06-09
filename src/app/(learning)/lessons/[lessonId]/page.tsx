'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { getLessonById } from '@/data/seed';
import { addCardsToReview } from '@/data/review';
import { completeLesson, getNextLesson, getLearningPath } from '@/data/progress';
import { ArrowLeft, Volume2, CheckCircle2, XCircle, RefreshCw, ChevronLeft, ChevronRight, Brain, Play, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

const TYPE_META: Record<string, { label: string; color: string }> = {
  video: { label: 'Video', color: 'bg-primary/10 text-primary' },
  audio: { label: 'Audio', color: 'bg-warning/10 text-warning' },
  text: { label: 'Đọc hiểu', color: 'bg-success/10 text-success' },
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
  const [completed, setCompleted] = useState(false);
  const [nextSuggestion, setNextSuggestion] = useState<any>(null);
  const [hasPath, setHasPath] = useState(false);

  useEffect(() => {
    setHasPath(!!getLearningPath());
    if (getLearningPath()) setNextSuggestion(getNextLesson());
  }, []);

  if (!lesson) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
          <BookOpen className="h-6 w-6 text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <p className="mt-4 text-sm font-medium">Không tìm thấy bài học</p>
        <Link href="/workspace" className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary">Quay lại</Link>
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
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Français</p>
              <p className="text-sm leading-relaxed">{c.transcript_fr}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tiếng Việt</p>
              <p className="text-sm leading-relaxed">{c.transcript_vi}</p>
            </div>
          </div>
          {c.exercises.length > 0 && (
            <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-6">
              <p className="text-sm font-semibold">Bài tập</p>
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
            <p className="text-xs text-muted-foreground">{c.duration_sec} giây</p>
            <div className="mx-auto mt-5 h-1.5 w-full max-w-sm rounded-full bg-secondary">
              <div className="h-full w-0 rounded-full bg-foreground/20" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground/60">Phát âm thanh mẫu</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Français</p>
              <p className="text-sm leading-relaxed">{c.transcript_fr}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tiếng Việt</p>
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
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Français</p>
              <p className="text-sm leading-relaxed">{c.body_fr}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tiếng Việt</p>
              <p className="text-sm leading-relaxed">{c.body_vi}</p>
            </div>
          </div>
          {c.vocabulary.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Từ vựng trong bài</p>
              <div className="flex flex-wrap gap-2">
                {c.vocabulary.map((v, i) => (
                  <span key={i} className="rounded-xl bg-secondary px-3 py-1.5 text-xs"><strong>{v.word_fr}</strong> — {v.word_vi}</span>
                ))}
              </div>
            </div>
          )}
          {c.questions.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold">Câu hỏi</p>
                {Object.keys(quizAnswers).length === c.questions.length && (
                  <span className={`text-xs font-medium ${qCorrect === c.questions.length ? 'text-success' : 'text-warning'}`}>
                    {qCorrect}/{c.questions.length} đúng
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
            <span className="text-xs">Học từ vựng</span>
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
              <p className="mt-3 text-xs text-muted-foreground">{flipped ? 'Bản dịch' : 'Chạm vào để lật'}</p>
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
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} /> Học lại
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
                {added ? 'Đã thêm vào ôn tập' : 'Thêm vào ôn tập'}
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
        <p className="mt-3 text-sm text-muted-foreground">Nội dung đang được phát triển</p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Link href={`/levels/${lesson.module_id.split('-')[0]}`}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Quay lại
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

      {/* Complete & Next */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mt-8 border-t border-border/50 pt-8">
        {completed && nextSuggestion ? (
          <div className="rounded-2xl border-2 border-success/20 bg-success/[0.03] p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.5} />
            </div>
            <p className="font-semibold">Hoàn thành!</p>
            <p className="mt-1 text-sm text-muted-foreground">Bài học đã được đánh dấu hoàn tất.</p>
            <Link href={`/lessons/${nextSuggestion.lesson.id}`}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
              Bài tiếp theo: {nextSuggestion.lesson.title_fr} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/workspace" className="mt-3 block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">Về thư viện</Link>
          </div>
        ) : completed ? (
          <div className="rounded-2xl border-2 border-success/20 bg-success/[0.03] p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-6 w-6 text-success" strokeWidth={1.5} />
            </div>
            <p className="font-semibold">Hoàn thành!</p>
            <p className="mt-1 text-sm text-muted-foreground">Bài học đã được đánh dấu hoàn tất.</p>
            <Link href="/workspace" className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
              Về thư viện <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : hasPath ? (
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => {
              completeLesson(lesson.id);
              setCompleted(true);
              setNextSuggestion(getNextLesson());
            }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-success px-6 py-2.5 text-sm font-semibold text-success-foreground transition-all hover:bg-success/90">
              <Sparkles className="h-4 w-4" strokeWidth={1.5} /> Đánh dấu hoàn thành
            </button>
            <Link href="/workspace"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
              Về thư viện
            </Link>
          </div>
        ) : null}
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
        <input value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Nhập câu trả lời..."
          className="flex-1 rounded-xl border border-border/60 bg-background px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-foreground/20" />
        <button onClick={() => setChecked(true)}
          className="rounded-xl bg-foreground/10 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground/20">Kiểm tra</button>
      </div>
      {checked && (
        <p className={`mt-2 flex items-center gap-1.5 text-xs ${correct ? 'text-success' : 'text-destructive'}`}>
          {correct ? <CheckCircle2 className="h-3 w-3" strokeWidth={2} /> : <XCircle className="h-3 w-3" strokeWidth={2} />}
          {correct ? 'Chính xác!' : `Sai. Đáp án: ${exercise.answer}`}
        </p>
      )}
    </div>
  );
}
