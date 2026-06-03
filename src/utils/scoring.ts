import type { Evaluation, KnowledgeGap } from '@/types/database';
export { calcTimeWeightedAvg, calcEffortScore, calcSkillDelta, calcExamReadiness, calcMicroProgress, findBestImprovement, detectKnowledgeGaps, calcClassBenchmark, buildStudentAnalytics } from '@/lib/analytics';

export function isSessionLocked(sessionDate: string, endTime: string): boolean {
  const end = new Date(`${sessionDate}T${endTime}`);
  const now = new Date();
  return now.getTime() - end.getTime() > 12 * 60 * 60 * 1000;
}

export function formatLevel(level: string): string {
  return { A1: 'A1 - Khởi đầu', A2: 'A2 - Cơ bản', B1: 'B1 - Trung cấp', B2: 'B2 - Trung cao', C1: 'C1 - Cao cấp', C2: 'C2 - Thành thạo' }[level] || level;
}

export function getNextCefrLevel(current: string): string {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const idx = levels.indexOf(current);
  return idx >= 0 && idx < levels.length - 1 ? levels[idx + 1] : current;
}

export function gapToTodo(gap: KnowledgeGap): string {
  const todos: Record<string, string> = {
    'Yếu_Chia_Động_Từ_Quá_Khứ': 'Ôn lại bài chia động từ Passé composé với Être/Avoir (15 phút)',
    'Yếu_Từ_Vựng_Cơ_Bản': 'Học 10 từ vựng mới theo chủ đề trong tuần (15 phút)',
  };
  return todos[gap.gap_tag] || `Ôn tập: ${gap.gap_tag.replace(/_/g, ' ').toLowerCase()} (15 phút)`;
}
