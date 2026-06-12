'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import type { Profile, Evaluation, KnowledgeGap, MicroProgress } from '@/types/database';
import {
  buildStudentAnalytics, calcMicroProgress, detectKnowledgeGaps, findBestImprovement,
} from '@/lib/analytics';
import type { StudentAnalytics, ClassBenchmark } from '@/types/analytics';
import {
  MicroProgressBanner, CefrRoadmap, ExamReadinessGauge,
  KnowledgeHeatmap, SkillRadar, TrendLineChart, TodoList,
} from '@/components/dashboard';
import { BookOpen, Wand2, Brain, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { TeacherDashboard } from './teacher-dashboard';

// Mock data for development
const MOCK_EVALS: Evaluation[] = Array.from({ length: 12 }, (_, i) => {
  const day = 20 - i * 2;
  const baseScore = 3 + Math.round(Math.sin(i * 0.5) * 1.2);
  return {
    id: `m-${i}`, student_id: '', class_session_id: '', teacher_id: '',
    pronunciation: Math.min(5, Math.max(1, baseScore + Math.round(Math.random() * 1.5))),
    fluency: Math.min(5, Math.max(1, baseScore + Math.round(Math.random() * 1.5))),
    vocabulary_oral: Math.min(5, Math.max(1, baseScore + Math.round(Math.random() * 1.5))),
    grammar_conjugation: Math.min(5, Math.max(1, 2 + Math.round(Math.random() * 2))),
    structure: Math.min(5, Math.max(1, 3 + Math.round(Math.random() * 1.5))),
    spelling: Math.min(5, Math.max(1, 3 + Math.round(Math.random() * 1.5))),
    classwork_completion_rate: 65 + Math.round(Math.random() * 35),
    comprehension_rate: Math.min(5, Math.max(1, 3 + Math.round(Math.random() * 1.5))),
    attendance: (['present', 'present', 'present', 'late', 'present'] as const)[Math.floor(Math.random() * 5)],
    engagement: Math.min(5, Math.max(1, 3 + Math.round(Math.random() * 1.5))),
    homework: (['on_time', 'on_time', 'late', 'on_time', 'missing'] as const)[Math.floor(Math.random() * 5)],
    notes: null, is_locked: false,
    session_date: `2026-05-${String(day).padStart(2, '0')}`,
    created_at: '', updated_at: '',
  } as Evaluation;
});

const MOCK_GAPS: KnowledgeGap[] = [
  { id: 'g1', student_id: '', gap_tag: 'Yếu_Chia_Động_Từ_Quá_Khứ', gap_category: 'grammar', severity: 4, detected_at: '2026-05-10', is_resolved: false, resolved_at: null, created_at: '' },
  { id: 'g2', student_id: '', gap_tag: 'Yếu_Từ_Vựng_Cơ_Bản', gap_category: 'vocabulary', severity: 3, detected_at: '2026-05-08', is_resolved: false, resolved_at: null, created_at: '' },
];

function StudentDashboard() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [realEvals, setRealEvals] = useState<Evaluation[]>([]);
  const [benchmark] = useState<ClassBenchmark>({ top25: 4.1, bottom25: 2.8, average: 3.5 });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    let evaluations: Evaluation[];

    if (session) {
      const { data: evals } = await supabase.from('evaluations').select('*').eq('student_id', session.user.id);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      const { data: dbGaps } = await supabase.from('knowledge_gaps').select('*').eq('student_id', session.user.id).eq('is_resolved', false);

      evaluations = (evals?.length ? evals : MOCK_EVALS) as any;
      const gaps: KnowledgeGap[] = (dbGaps?.length ? dbGaps : MOCK_GAPS) as any;
      const a = buildStudentAnalytics(evaluations, gaps);
      a.knowledgeGaps = gaps;
      a.cefrProgress = {
        currentLevel: (prof as any)?.cefr_current || 'A2',
        progressPct: (prof as any)?.cefr_progress_pct || 35,
        nextLevel: 'B1',
      };
      setAnalytics(a);
    } else {
      evaluations = MOCK_EVALS;
      const a = buildStudentAnalytics(MOCK_EVALS, MOCK_GAPS);
      a.knowledgeGaps = MOCK_GAPS;
      a.cefrProgress = { currentLevel: 'A2', progressPct: 35, nextLevel: 'B1' };
      setAnalytics(a);
    }
    setRealEvals(evaluations);
  }

  if (!analytics) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div>
      </div>
    );
  }

  const { timeWeightedAvg, effortScore, skillDelta, examReadiness, knowledgeGaps, microProgress, bestImprovement, cefrProgress } = analytics;
  const [hasPath, setHasPath] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('learning_path');
    setHasPath(!!saved);
  }, []);

  return (
    <div className="space-y-6 pb-10">
      {/* Quick Start */}
      {!hasPath && (
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.04] to-transparent p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Chào mừng bạn đến với French Center!</h2>
              <p className="mt-1 text-sm text-muted-foreground">Bắt đầu hành trình học tiếng Pháp ngay hôm nay.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/wizard" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90">
                <Wand2 className="h-4 w-4" strokeWidth={1.5} /> Tạo lộ trình
              </Link>
              <Link href="/knowledge" className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition-all hover:bg-secondary">
                <BookOpen className="h-4 w-4" strokeWidth={1.5} /> Khám phá bài học
              </Link>
            </div>
          </div>
        </div>
      )}
      <MicroProgressBanner
        bestImprovement={bestImprovement}
        effortScore={effortScore}
        skillDelta={skillDelta}
      />
      <CefrRoadmap
        currentLevel={cefrProgress.currentLevel}
        progressPct={cefrProgress.progressPct}
        nextLevel={cefrProgress.nextLevel}
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <ExamReadinessGauge
          score={examReadiness.score}
          label={examReadiness.label}
          level={examReadiness.level}
        />
        <KnowledgeHeatmap gaps={knowledgeGaps} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkillRadar evaluations={realEvals} />
        <TrendLineChart
          evaluations={realEvals}
          benchmarkTop25={benchmark.top25}
          benchmarkBottom25={benchmark.bottom25}
        />
      </div>
      <TodoList gaps={knowledgeGaps} />
    </div>
  );
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get role from demo or supabase
    const demoRaw = localStorage.getItem('demo_user');
    if (demoRaw) {
      try {
        const parsed = JSON.parse(demoRaw);
        if (parsed?.role) { setRole(parsed.role); return; }
      } catch { /* fall through */ }
      const legacyMap: Record<string, string> = { 'admin@demo.com': 'Admin', 'teacher@demo.com': 'TeacherTA' };
      if (legacyMap[demoRaw]) { setRole(legacyMap[demoRaw]); return; }
      if (demoRaw === 'student@demo.com') { setRole('Student'); return; }
    }

    const supabase = createClient();
    supabase.auth.getSession().then((result: any) => {
      const session = result?.data?.session ?? null;
      if (session) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then((r: any) => {
          if (r?.data) setRole(r.data.role);
          else setRole('Student');
        });
      } else {
        setRole('Student');
      }
    });
  }, []);

  if (!role) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground animate-pulse">Đang tải...</div>
      </div>
    );
  }

  // Teachers and Admins see the teacher dashboard
  if (role === 'TeacherTA' || role === 'Admin') {
    return <TeacherDashboard />;
  }

  // Students see the student dashboard
  return <StudentDashboard />;
}
