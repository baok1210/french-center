import type { Evaluation, KnowledgeGap, MicroProgress } from './database';

export interface StudentAnalytics {
  timeWeightedAvg: number;
  effortScore: number;
  skillDelta: {
    thisWeekAvg: number;
    lastWeekAvg: number;
    delta: number;
    tag: string;
  };
  examReadiness: {
    score: number;
    level: 'safe' | 'warning' | 'danger';
    label: string;
  };
  knowledgeGaps: KnowledgeGap[];
  microProgress: MicroProgress[];
  bestImprovement: MicroProgress | null;
  cefrProgress: {
    currentLevel: string;
    progressPct: number;
    nextLevel: string;
  };
}

export interface ClassBenchmark {
  top25: number;
  bottom25: number;
  average: number;
}

export interface EvaluationFormData {
  student_id: string;
  class_session_id: string;
  pronunciation: number;
  fluency: number;
  vocabulary_oral: number;
  grammar_conjugation: number;
  structure: number;
  spelling: number;
  classwork_completion_rate: number;
  comprehension_rate: number;
  attendance: 'present' | 'late' | 'absent';
  engagement: number;
  homework: 'on_time' | 'late' | 'missing';
  notes?: string;
}

export interface EvaluationWithStudent extends Evaluation {
  student: { full_name: string; student_code: string };
  class_session: { title: string; class_id: string };
}
