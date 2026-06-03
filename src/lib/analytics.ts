import type { Evaluation, KnowledgeGap, MicroProgress, AttendanceStatus, HomeworkStatus } from '@/types/database';
import type { StudentAnalytics, ClassBenchmark } from '@/types/analytics';

function toDays(d: string): number {
  return new Date(d).getTime() / 86400000;
}

export function calcTimeWeightedAvg(evaluations: Evaluation[], daysBack = 90): number {
  const now = Date.now() / 86400000;
  let sum = 0, weight = 0;
  for (const e of evaluations) {
    const score = (e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation + e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8;
    const recency = (now - toDays(e.session_date)) / daysBack;
    const w = 1.4 - recency * 0.4;
    sum += score * w;
    weight += w;
  }
  return weight ? sum / weight : 0;
}

export function calcEffortScore(evaluations: Evaluation[]): number {
  if (!evaluations.length) return 0;
  let total = 0;
  for (const e of evaluations) {
    const a = { present: 5, late: 3, absent: 1 }[e.attendance];
    const h = { on_time: 5, late: 3, missing: 1 }[e.homework];
    total += a + h + e.engagement;
  }
  return total / (evaluations.length * 3);
}

export function calcSkillDelta(evaluations: Evaluation[]) {
  const now = new Date();
  const w1 = now.getTime() - 7 * 86400000;
  const w2 = now.getTime() - 14 * 86400000;

  const thisW = evaluations.filter(e => {
    const d = new Date(e.session_date).getTime();
    return d >= w1 && d < now.getTime();
  });
  const lastW = evaluations.filter(e => {
    const d = new Date(e.session_date).getTime();
    return d >= w2 && d < w1;
  });

  const avg = (list: Evaluation[]) => {
    if (!list.length) return 0;
    return list.reduce((s, e) => s + (e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation + e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8, 0) / list.length;
  };

  const ta = avg(thisW), la = avg(lastW), d = ta - la;
  return {
    thisWeekAvg: ta, lastWeekAvg: la, delta: d,
    tag: d >= 0.5 ? 'Cải thiện tốt' : d <= -0.5 ? 'Sa sút - Cần cảnh báo' : 'Dậm chân tại chỗ',
  };
}

export function calcExamReadiness(evaluations: Evaluation[]): { score: number; level: 'safe' | 'warning' | 'danger'; label: string } {
  const avg = calcTimeWeightedAvg(evaluations, 90);
  const score = Math.round(avg * 20);
  if (score >= 85) return { score, level: 'safe', label: 'Đã an toàn để đăng ký thi thật' };
  if (score >= 70) return { score, level: 'warning', label: 'Cần tích lũy thêm' };
  return { score, level: 'danger', label: 'Cần cải thiện nhiều hơn' };
}

export function calcMicroProgress(evaluations: Evaluation[]): MicroProgress[] {
  const metrics: { name: string; category: string }[] = [
    { name: 'pronunciation', category: 'Production Orale' },
    { name: 'fluency', category: 'Production Orale' },
    { name: 'vocabulary_oral', category: 'Production Orale' },
    { name: 'grammar_conjugation', category: 'Production Écrite' },
    { name: 'structure', category: 'Production Écrite' },
    { name: 'spelling', category: 'Production Écrite' },
    { name: 'classwork_completion_rate', category: 'Compréhension' },
    { name: 'comprehension_rate', category: 'Compréhension' },
    { name: 'engagement', category: 'Attitude' },
    { name: 'attendance', category: 'Attitude' },
  ];

  const now = new Date();
  const w1 = now.getTime() - 7 * 86400000;
  const w2 = now.getTime() - 14 * 86400000;

  const thisW = evaluations.filter(e => { const d = new Date(e.session_date).getTime(); return d >= w1 && d < now.getTime(); });
  const lastW = evaluations.filter(e => { const d = new Date(e.session_date).getTime(); return d >= w2 && d < w1; });

  const avg = (list: Evaluation[], field: string) => {
    if (!list.length) return 0;
    const nums = list.map(e => {
      if (field === 'attendance') return ({ present: 5, late: 3, absent: 1 } as Record<string, number>)[e.attendance];
      return (e as unknown as Record<string, number>)[field] ?? 0;
    });
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  };

  return metrics.map(m => {
    const pv = avg(lastW, m.name);
    const cv = avg(thisW, m.name);
    const chg = pv > 0 ? Math.round((cv - pv) / pv * 1000) / 10 : 0;
    return {
      id: '', student_id: '', week_start: '', metric_name: m.name,
      metric_category: m.category, previous_value: pv, current_value: cv,
      change_pct: chg, direction: chg > 0 ? 'improved' : chg < 0 ? 'declined' : 'stable',
      created_at: '',
    } as MicroProgress;
  });
}

export function findBestImprovement(progress: MicroProgress[]): MicroProgress | null {
  const improved = progress.filter(p => p.direction === 'improved');
  if (!improved.length) return null;
  return improved.reduce((a, b) => (a.change_pct ?? 0) > (b.change_pct ?? 0) ? a : b);
}

export function detectKnowledgeGaps(evaluations: Evaluation[]): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = [];
  const sorted = [...evaluations].sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());

  const checks: { field: keyof Evaluation; category: 'grammar' | 'vocabulary'; tag: string }[] = [
    { field: 'grammar_conjugation', category: 'grammar', tag: 'Yếu_Chia_Động_Từ_Quá_Khứ' },
    { field: 'vocabulary_oral', category: 'vocabulary', tag: 'Yếu_Từ_Vựng_Cơ_Bản' },
  ];

  for (const check of checks) {
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1][check.field] as number;
      const curr = sorted[i][check.field] as number;
      if (curr < 3 && prev < 3) {
        gaps.push({
          id: '', student_id: '', gap_tag: check.tag, gap_category: check.category,
          severity: 5 - Math.min(prev, curr), detected_at: sorted[i].session_date,
          is_resolved: false, resolved_at: null, created_at: '',
        });
        break;
      }
    }
  }
  return gaps;
}

export function calcClassBenchmark(allStudentEvals: Map<string, Evaluation[]>): Map<string, ClassBenchmark> {
  const benchmarks = new Map<string, ClassBenchmark>();
  allStudentEvals.forEach((evals, studentId) => {
    const avg = calcTimeWeightedAvg(evals);
    benchmarks.set(studentId, { top25: 0, bottom25: 0, average: avg });
  });
  const avgs = Array.from(benchmarks.values()).map(b => b.average).sort((a, b) => b - a);
  if (!avgs.length) return benchmarks;
  const top25 = avgs[Math.floor(avgs.length * 0.25)] || avgs[0];
  const bottom25 = avgs[Math.floor(avgs.length * 0.75)] || avgs[avgs.length - 1];
  benchmarks.forEach((b) => { b.top25 = top25; b.bottom25 = bottom25; });
  return benchmarks;
}

export function buildStudentAnalytics(
  evaluations: Evaluation[],
  gaps: KnowledgeGap[],
  allEvals?: Map<string, Evaluation[]>
): StudentAnalytics {
  const progress = calcMicroProgress(evaluations);
  const bestImprovement = findBestImprovement(progress);
  const readiness = calcExamReadiness(evaluations);

  return {
    timeWeightedAvg: calcTimeWeightedAvg(evaluations),
    effortScore: calcEffortScore(evaluations),
    skillDelta: calcSkillDelta(evaluations),
    examReadiness: readiness,
    knowledgeGaps: gaps,
    microProgress: progress,
    bestImprovement,
    cefrProgress: { currentLevel: '', progressPct: 0, nextLevel: '' },
  };
}
