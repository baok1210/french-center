'use client';

import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts';
import type { Evaluation } from '@/types/database';

interface Props {
  evaluations: Evaluation[];
}

export function SkillRadar({ evaluations }: Props) {
  const avg = (fields: (keyof Evaluation)[]) => {
    if (!evaluations.length) return 0;
    return fields.reduce((s, f) => s + (evaluations.reduce((a, e) => a + (e[f] as number), 0) / evaluations.length), 0) / fields.length;
  };

  const data = [
    { skill: 'Nghe', value: avg(['comprehension_rate']), fullMark: 5 },
    { skill: 'Nói', value: avg(['pronunciation', 'fluency', 'vocabulary_oral']), fullMark: 5 },
    { skill: 'Đọc', value: avg(['comprehension_rate']), fullMark: 5 },
    { skill: 'Viết', value: avg(['grammar_conjugation', 'structure', 'spelling']), fullMark: 5 },
    { skill: 'Từ vựng', value: avg(['vocabulary_oral']), fullMark: 5 },
    { skill: 'Ngữ pháp', value: avg(['grammar_conjugation']), fullMark: 5 },
  ];

  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Kỹ năng cốt lõi
      </h3>
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Radar
              name="Bạn"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
