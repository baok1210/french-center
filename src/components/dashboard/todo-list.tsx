'use client';

import type { KnowledgeGap } from '@/types/database';
import { gapToTodo } from '@/utils/scoring';
import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  gaps: KnowledgeGap[];
}

export function TodoList({ gaps }: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const activeGaps = gaps.filter((g) => !g.is_resolved).slice(0, 3);

  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Nhiệm vụ tuần này
      </h3>
      {!activeGaps.length ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
          Không có lỗ hổng kiến thức nào. Bạn đang đi đúng hướng!
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {activeGaps.map((gap, i) => {
            const todo = gapToTodo(gap);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setChecked({ ...checked, [i]: !checked[i] })}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left text-sm transition-all ${
                  checked[i]
                    ? 'bg-success/5 text-success line-through'
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                {checked[i] ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" strokeWidth={1.5} />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                )}
                {todo}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
