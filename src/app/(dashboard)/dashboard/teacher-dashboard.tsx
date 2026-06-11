'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { isDemoMode, loadDemoClasses, loadDemoEnrollments, loadDemoEvaluations, loadDemoStudents } from '@/data/admin-store';
import { Users, GraduationCap, ClipboardCheck, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface ClassStats {
  id: string;
  title: string;
  level: string;
  studentCount: number;
  avgScore: number;
  evalCount: number;
  schedule: string | null;
}

function generateDemoClassStats(): ClassStats[] {
  const demoClasses = loadDemoClasses();
  const demoEnrollments = loadDemoEnrollments();
  const demoEvals = loadDemoEvaluations();

  if (demoClasses.length === 0) return [];

  return demoClasses.map(cls => {
    const studentCount = demoEnrollments.filter(e => e.class_id === cls.id).length;
    const classEvals = demoEvals.filter(e => {
      const enrolledIds = demoEnrollments.filter(en => en.class_id === cls.id).map(en => en.student_id);
      return enrolledIds.includes(e.student_id);
    });
    const avgScore = classEvals.length > 0
      ? +(classEvals.reduce((sum, e) => sum + (e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation + e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8, 0) / classEvals.length).toFixed(1)
      : 0;
    return {
      id: cls.id,
      title: cls.title,
      level: cls.level,
      schedule: cls.schedule,
      studentCount,
      avgScore,
      evalCount: classEvals.length,
    };
  });
}

function generateWeakStudents() {
  const students = loadDemoStudents();
  if (students.length === 0) return [];
  const shuffled = [...students].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(s => ({
    full_name: s.full_name,
    student_code: s.student_code || '',
    avg: +(2 + Math.random() * 0.8).toFixed(1),
  })).sort((a, b) => a.avg - b.avg);
}

export function TeacherDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<ClassStats[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEvals, setTotalEvals] = useState(0);
  const [weakStudents, setWeakStudents] = useState<{ full_name: string; student_code: string; avg: number }[]>([]);
  const demo = isDemoMode();

  useEffect(() => {
    loadTeacherData();
  }, []);

  async function loadTeacherData() {
    if (demo) {
      const classStats = generateDemoClassStats();
      setStats(classStats);
      setTotalStudents(classStats.reduce((s, c) => s + c.studentCount, 0));
      setTotalEvals(classStats.reduce((s, c) => s + c.evalCount, 0));
      setWeakStudents(generateWeakStudents());
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    let teacherId = session?.user.id;

    if (!teacherId) return;
    if (!teacherId) return;

    const { data: classes } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_active', true);

    if (!classes || classes.length === 0) return;

    const classStats: ClassStats[] = [];
    let allStudents = 0;
    let allEvals = 0;

    for (const cls of classes) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('class_id', cls.id);

      const studentCount = enrollments?.length || 0;
      allStudents += studentCount;

      const { data: evals } = await supabase
        .from('evaluations')
        .select('pronunciation, fluency, vocabulary_oral, grammar_conjugation, structure, spelling, comprehension_rate, engagement')
        .in('student_id', (enrollments || []).map((e: any) => e.student_id));

      if (evals && evals.length > 0) {
        allEvals += evals.length;
        const totalScore = (evals as any[]).reduce((sum: number, e: any) => sum +
          (e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation +
           e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8, 0);
        classStats.push({
          id: cls.id,
          title: cls.title,
          level: cls.level,
          schedule: cls.schedule,
          studentCount,
          avgScore: Math.round((totalScore / evals.length) * 10) / 10,
          evalCount: evals.length,
        });
      } else {
        classStats.push({
          id: cls.id,
          title: cls.title,
          level: cls.level,
          schedule: cls.schedule,
          studentCount,
          avgScore: 0,
          evalCount: 0,
        });
      }
    }

    setStats(classStats);
    setTotalStudents(allStudents);
    setTotalEvals(allEvals);

    const { data: lowEvals } = await supabase
      .from('evaluations')
      .select('student_id, pronunciation, fluency, vocabulary_oral, grammar_conjugation, structure, spelling, comprehension_rate, engagement, profiles!student_id(full_name, student_code)')
      .order('session_date', { ascending: false });

    if (lowEvals) {
      const studentScores = new Map<string, { name: string; code: string; scores: number[] }>();
      for (const e of lowEvals as any[]) {
        if (!studentScores.has(e.student_id)) {
          studentScores.set(e.student_id, {
            name: e.profiles?.full_name || 'N/A',
            code: e.profiles?.student_code || '',
            scores: [],
          });
        }
        const avg = (e.pronunciation + e.fluency + e.vocabulary_oral + e.grammar_conjugation +
          e.structure + e.spelling + e.comprehension_rate + e.engagement) / 8;
        studentScores.get(e.student_id)!.scores.push(avg);
      }

      const weak = Array.from(studentScores.entries())
        .map(([id, s]) => ({
          full_name: s.name,
          student_code: s.code,
          avg: Math.round((s.scores.reduce((a: number, b: number) => a + b, 0) / s.scores.length) * 10) / 10,
        }))
        .filter((s) => s.avg < 3)
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 5);

      setWeakStudents(weak);
    }
  }

  const avgClassScore = stats.length > 0
    ? Math.round((stats.reduce((s, c) => s + c.avgScore * c.studentCount, 0) / stats.reduce((s, c) => s + c.studentCount, 0)) * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.length}</p>
              <p className="text-xs text-muted-foreground">Lớp đang dạy</p>
            </div>
          </div>
        </div>
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">Học viên</p>
            </div>
          </div>
        </div>
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEvals}</p>
              <p className="text-xs text-muted-foreground">Đánh giá đã nhập</p>
            </div>
          </div>
        </div>
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgClassScore}</p>
              <p className="text-xs text-muted-foreground">Điểm TB toàn lớp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class List with Scores */}
      <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card">
        <div className="border-b border-border/50 px-6 py-4">
          <h3 className="text-sm font-semibold">Lớp học của tôi</h3>
        </div>
        <div className="divide-y divide-border/50">
          {stats.map((cls) => (
            <div key={cls.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium">{cls.title}</p>
                  <p className="text-xs text-muted-foreground">{cls.level} — {cls.schedule || 'Linh hoạt'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">{cls.studentCount} HV</span>
                <span className="text-muted-foreground">{cls.evalCount} lượt ĐG</span>
                <span className={`font-semibold ${cls.avgScore >= 3.5 ? 'text-success' : cls.avgScore >= 2.5 ? 'text-warning' : 'text-destructive'}`}>
                  {cls.avgScore}/5
                </span>
              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              Chưa có lớp học nào. <Link href="/admin/classes" className="text-primary underline">Tạo lớp mới</Link>
            </div>
          )}
        </div>
      </div>

      {/* Warning: Weak Students */}
      {weakStudents.length > 0 && (
        <div className="diffusion-shadow rounded-2xl border border-border/50 bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold">Học viên cần hỗ trợ (TB &lt; 3/5)</h3>
          </div>
          <div className="space-y-2">
            {weakStudents.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-destructive/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-destructive" strokeWidth={1.5} />
                  <span className="text-sm">{s.full_name}</span>
                  <span className="text-xs text-muted-foreground">({s.student_code})</span>
                </div>
                <span className="text-sm font-semibold text-destructive">{s.avg}/5</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/teacher/evaluate"
          className="diffusion-shadow flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold">Nhập điểm</p>
            <p className="text-xs text-muted-foreground">Đánh giá học viên sau buổi học</p>
          </div>
        </Link>
        <Link href="/teacher/evaluations"
          className="diffusion-shadow flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-5 transition-all hover:shadow-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold">Lịch sử đánh giá</p>
            <p className="text-xs text-muted-foreground">Xem và quản lý các đánh giá đã nhập</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
