'use client';

import type { MicroProgress } from '@/types/database';
import { TrendingUp, Sparkles, ArrowUp } from 'lucide-react';

interface Props {
  bestImprovement: MicroProgress | null;
  effortScore: number;
  skillDelta: { tag: string; delta: number };
}

const LABELS: Record<string, string> = {
  pronunciation: 'Phát âm',
  fluency: 'Lưu loát',
  vocabulary_oral: 'Từ vựng (nói)',
  grammar_conjugation: 'Ngữ pháp',
  structure: 'Cấu trúc',
  spelling: 'Chính tả',
  classwork_completion_rate: 'Hoàn thành bài',
  comprehension_rate: 'Hiểu bài',
  engagement: 'Tương tác',
  attendance: 'Chuyên cần',
};

export function MicroProgressBanner({ bestImprovement, effortScore, skillDelta }: Props) {
  const effortLabel = effortScore >= 4 ? 'Xuất sắc' : effortScore >= 3 ? 'Tốt' : effortScore >= 2 ? 'Đạt' : 'Cần cố gắng';
  const effortColors = effortScore >= 4
    ? 'bg-success/10 text-success'
    : effortScore >= 3
    ? 'bg-primary/10 text-primary'
    : 'bg-warning/10 text-warning';

  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
          <Sparkles className="h-5 w-5 text-success" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          {bestImprovement ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Tiến bộ nổi bật:
              </span>
              <span className="text-sm font-semibold text-success">
                {LABELS[bestImprovement.metric_name] || bestImprovement.metric_name}
              </span>
              <span className="flex items-center gap-0.5 text-sm font-semibold text-success">
                <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                {bestImprovement.change_pct?.toFixed(1)}%
              </span>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                so với tuần trước
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có dữ liệu tuần này. Hãy tiếp tục cố gắng!
            </p>
          )}
        </div>
        <div className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold ${effortColors}`}>
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          Nỗ lực: {effortLabel} ({effortScore.toFixed(1)}/5)
        </div>
      </div>
    </div>
  );
}
