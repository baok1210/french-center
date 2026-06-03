'use client';

interface Props {
  score: number;
  label: string;
  level: 'safe' | 'warning' | 'danger';
}

export function ExamReadinessGauge({ score, label, level }: Props) {
  const angle = (score / 100) * 180;
  const circumference = 2 * Math.PI * 70;
  const dashoffset = circumference - (angle / 180) * circumference;

  const colors = {
    safe: { stroke: 'hsl(var(--success))', bg: 'hsl(var(--success) / 0.1)', text: 'hsl(var(--success))' },
    warning: { stroke: 'hsl(var(--warning))', bg: 'hsl(var(--warning) / 0.1)', text: 'hsl(var(--warning))' },
    danger: { stroke: 'hsl(var(--destructive))', bg: 'hsl(var(--destructive) / 0.1)', text: 'hsl(var(--destructive))' },
  };

  const c = colors[level];

  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Sẵn sàng thi thật
      </h3>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 160 100" className="h-28 w-full">
          <path
            d="M 10 90 A 70 70 0 0 1 150 90"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 10 90 A 70 70 0 0 1 150 90"
            fill="none"
            stroke={c.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <text x="80" y="62" textAnchor="middle" fill={c.text} fontSize="32" fontWeight="700">
            {score}%
          </text>
          <text x="80" y="80" textAnchor="middle" fill={c.text} fontSize="10" fontWeight="500">
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}
