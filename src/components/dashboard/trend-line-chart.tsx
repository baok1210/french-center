'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceArea, Legend,
} from 'recharts';
import type { Evaluation } from '@/types/database';

interface Props {
  evaluations: Evaluation[];
  benchmarkTop25: number;
  benchmarkBottom25: number;
}

export function TrendLineChart({ evaluations, benchmarkTop25, benchmarkBottom25 }: Props) {
  const sorted = [...evaluations].sort(
    (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime()
  );

  const data = sorted.map((e, i) => ({
    date: e.session_date.slice(5),
    score: +((e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation +
      e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8).toFixed(2),
    top25: benchmarkTop25,
    bottom25: benchmarkBottom25,
  }));

  if (!data.length) {
    return (
      <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Xu hướng tiến bộ</h3>
        <p className="mt-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Xu hướng tiến bộ
      </h3>
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
            <ReferenceArea
              y1={benchmarkBottom25}
              y2={benchmarkTop25}
              fill="hsl(var(--primary))"
              fillOpacity={0.05}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'hsl(var(--primary))' }}
              name="Điểm của bạn"
            />
            <Line
              type="monotone"
              dataKey="top25"
              stroke="hsl(var(--success))"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Top 25% lớp"
            />
            <Line
              type="monotone"
              dataKey="bottom25"
              stroke="hsl(var(--destructive))"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Bottom 25% lớp"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
