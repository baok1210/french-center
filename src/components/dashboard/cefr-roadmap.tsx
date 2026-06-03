'use client';

interface Props {
  currentLevel: string;
  progressPct: number;
  nextLevel: string;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LABELS: Record<string, string> = {
  A1: 'Khởi đầu', A2: 'Cơ bản', B1: 'Trung cấp',
  B2: 'Trung cao', C1: 'Cao cấp', C2: 'Thành thạo',
};

export function CefrRoadmap({ currentLevel, progressPct, nextLevel }: Props) {
  const idx = LEVELS.indexOf(currentLevel);
  const progress = (idx + progressPct / 100) / (LEVELS.length - 1) * 100;

  return (
    <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Lộ trình CEFR
      </h3>
      <div className="relative mt-6">
        <div className="absolute left-0 right-0 top-[19px] h-[3px] rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-success transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="relative flex justify-between">
          {LEVELS.map((level, i) => {
            const completed = i < idx || (i === idx && progressPct >= 100);
            const active = i === idx;
            return (
              <div key={level} className="flex flex-col items-center">
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    completed
                      ? 'bg-success text-white'
                      : active
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-card'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {level}
                </div>
                <span className={`mt-2 text-[11px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {LABELS[level]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Bạn đang ở <span className="font-semibold text-foreground">{currentLevel}</span>
        {' — '}
        <span className="font-semibold text-primary">{progressPct.toFixed(0)}%</span> hoàn thành,
        còn <span className="font-semibold text-foreground">{(100 - progressPct).toFixed(0)}%</span> để lên
        {' '}<span className="font-semibold text-primary">{nextLevel}</span>
      </p>
    </div>
  );
}
