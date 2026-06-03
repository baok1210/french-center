'use client';

import type { KnowledgeGap } from '@/types/database';

interface Props {
  gaps: KnowledgeGap[];
}

const CATEGORIES = [
  { key: 'grammar', label: 'Ngữ pháp' },
  { key: 'vocabulary', label: 'Từ vựng' },
  { key: 'pronunciation', label: 'Phát âm' },
  { key: 'writing', label: 'Viết' },
];

export function KnowledgeHeatmap({ gaps }: Props) {
  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Bản đồ nhiệt kiến thức
      </h3>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {CATEGORIES.map(({ key, label }) => {
          const gap = gaps.find((g) => g.gap_category === key);
          const severity = gap?.severity ?? 0;
          let bg = 'bg-success';
          let text = 'text-white';
          let detail = '';

          if (gap) {
            if (severity >= 4) { bg = 'bg-destructive'; detail = 'Nguy cấp'; }
            else if (severity >= 3) { bg = 'bg-warning'; detail = 'Yếu'; }
            else { bg = 'bg-amber-400'; detail = 'Có vấn đề'; }
          } else {
            detail = 'Ổn định';
          }

          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <div className={`flex h-14 w-full items-center justify-center rounded-xl text-sm font-bold ${bg} ${text}`}>
                {gap ? `${severity}/5` : '✓'}
              </div>
              <div className="text-center">
                <span className="block text-[11px] font-medium text-foreground">{label}</span>
                <span className="block text-[10px] text-muted-foreground">{detail}</span>
              </div>
            </div>
          );
        })}
      </div>
      {gaps.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-medium text-destructive">Cần cải thiện:</p>
          {gaps.map((g, i) => (
            <div key={i} className="rounded-xl bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {g.gap_tag.replace(/_/g, ' ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
