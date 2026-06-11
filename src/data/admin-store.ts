'use client';

const DEMO_CLASSES_KEY = 'demo_classes';
const DEMO_TEACHERS_KEY = 'demo_teachers';
const DEMO_STUDENTS_KEY = 'demo_students';

export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('demo_user');
}

function getStore<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ==================== CLASSES ==================== */

export interface DemoClass {
  id: string;
  title: string;
  level: string;
  schedule: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  teacher_id: string;
  teacher_name: string;
  created_at: string;
}

export function loadDemoClasses(): DemoClass[] {
  return getStore<DemoClass>(DEMO_CLASSES_KEY);
}

export function saveDemoClass(data: {
  id?: string;
  title: string;
  level: string;
  schedule?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  teacher_id: string;
  teacher_name: string;
}): DemoClass {
  const list = loadDemoClasses();
  const now = new Date().toISOString();

  if (data.id) {
    const idx = list.findIndex(c => c.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setStore(DEMO_CLASSES_KEY, list);
      return list[idx];
    }
  }

  const newClass: DemoClass = {
    id: crypto.randomUUID(),
    title: data.title,
    level: data.level,
    schedule: data.schedule ?? null,
    start_date: data.start_date ?? null,
    end_date: data.end_date ?? null,
    is_active: data.is_active,
    teacher_id: data.teacher_id,
    teacher_name: data.teacher_name,
    created_at: now,
  };
  list.unshift(newClass);
  setStore(DEMO_CLASSES_KEY, list);
  return newClass;
}

export function deleteDemoClass(id: string) {
  setStore(DEMO_CLASSES_KEY, loadDemoClasses().filter(c => c.id !== id));
}

/* ==================== TEACHERS ==================== */

export interface DemoTeacher {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  student_code: string | null;
  cefr_current: string;
  role: string;
}

const SEED_TEACHERS: DemoTeacher[] = [
  { id: 'teacher-1', full_name: 'Nguyễn Văn An', email: 'an.nguyen@demo.com', phone: '0901234567', student_code: 'GV001', cefr_current: 'C1', role: 'TeacherTA' },
  { id: 'teacher-2', full_name: 'Trần Thị Bình', email: 'binh.tran@demo.com', phone: '0902345678', student_code: 'GV002', cefr_current: 'C2', role: 'TeacherTA' },
  { id: 'teacher-3', full_name: 'Lê Hoàng Cường', email: 'cuong.le@demo.com', phone: '0903456789', student_code: 'GV003', cefr_current: 'C1', role: 'TeacherTA' },
  { id: 'teacher-4', full_name: 'Phạm Minh Đức', email: 'duc.pham@demo.com', phone: '0904567890', student_code: 'GV004', cefr_current: 'B2', role: 'TeacherTA' },
  { id: 'admin-1', full_name: 'Admin Hệ thống', email: 'admin@demo.com', phone: '0905678901', student_code: 'AD001', cefr_current: 'C2', role: 'Admin' },
];

export function loadDemoTeachers(): DemoTeacher[] {
  const raw = getStore<DemoTeacher>(DEMO_TEACHERS_KEY);
  return raw.length > 0 ? raw : SEED_TEACHERS;
}

export function saveDemoTeacher(data: {
  id?: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  student_code?: string | null;
  cefr_current: string;
}): DemoTeacher {
  const list = loadDemoTeachers();

  if (data.id) {
    const idx = list.findIndex(t => t.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setStore(DEMO_TEACHERS_KEY, list);
      return list[idx];
    }
  }

  const newTeacher: DemoTeacher = {
    id: 'teacher-' + crypto.randomUUID().slice(0, 8),
    full_name: data.full_name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    student_code: data.student_code ?? null,
    cefr_current: data.cefr_current,
    role: 'TeacherTA',
  };
  list.push(newTeacher);
  setStore(DEMO_TEACHERS_KEY, list);
  return newTeacher;
}

export function deleteDemoTeacher(id: string) {
  setStore(DEMO_TEACHERS_KEY, loadDemoTeachers().filter(t => t.id !== id));
}

/* ==================== STUDENTS ==================== */

export interface DemoStudent {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  student_code: string | null;
  cefr_current: string;
  cefr_progress_pct: number;
  role: string;
}

const SEED_STUDENTS: DemoStudent[] = [
  { id: 'student-1', full_name: 'Hoàng Văn Dũng', email: 'dung.hoang@demo.com', phone: '0912345678', student_code: 'HV001', cefr_current: 'A1', cefr_progress_pct: 45, role: 'Student' },
  { id: 'student-2', full_name: 'Mai Thị Em', email: 'em.mai@demo.com', phone: '0913456789', student_code: 'HV002', cefr_current: 'A2', cefr_progress_pct: 30, role: 'Student' },
  { id: 'student-3', full_name: 'Võ Minh Phương', email: 'phuong.vo@demo.com', phone: '0914567890', student_code: 'HV003', cefr_current: 'B1', cefr_progress_pct: 60, role: 'Student' },
  { id: 'student-4', full_name: 'Đặng Thị Giang', email: 'giang.dang@demo.com', phone: '0915678901', student_code: 'HV004', cefr_current: 'A1', cefr_progress_pct: 15, role: 'Student' },
  { id: 'student-5', full_name: 'Bùi Quang Hải', email: 'hai.bui@demo.com', phone: '0916789012', student_code: 'HV005', cefr_current: 'A2', cefr_progress_pct: 75, role: 'Student' },
  { id: 'student-6', full_name: 'Lý Tự Trọng', email: 'trong.ly@demo.com', phone: '0917890123', student_code: 'HV006', cefr_current: 'B1', cefr_progress_pct: 20, role: 'Student' },
  { id: 'student-7', full_name: 'Ngô Thị Hạnh', email: 'hanh.ngo@demo.com', phone: '0918901234', student_code: 'HV007', cefr_current: 'A1', cefr_progress_pct: 90, role: 'Student' },
  { id: 'student-8', full_name: 'Trịnh Văn Hùng', email: 'hung.trinh@demo.com', phone: '0919012345', student_code: 'HV008', cefr_current: 'A2', cefr_progress_pct: 50, role: 'Student' },
];

export function loadDemoStudents(): DemoStudent[] {
  const raw = getStore<DemoStudent>(DEMO_STUDENTS_KEY);
  return raw.length > 0 ? raw : SEED_STUDENTS;
}

export function saveDemoStudent(data: {
  id?: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  student_code?: string | null;
  cefr_current: string;
  cefr_progress_pct: number;
}): DemoStudent {
  const list = loadDemoStudents();

  if (data.id) {
    const idx = list.findIndex(s => s.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setStore(DEMO_STUDENTS_KEY, list);
      return list[idx];
    }
  }

  const newStudent: DemoStudent = {
    id: 'student-' + crypto.randomUUID().slice(0, 8),
    full_name: data.full_name,
    email: data.email ?? null,
    phone: data.phone ?? null,
    student_code: data.student_code ?? null,
    cefr_current: data.cefr_current,
    cefr_progress_pct: data.cefr_progress_pct,
    role: 'Student',
  };
  list.push(newStudent);
  setStore(DEMO_STUDENTS_KEY, list);
  return newStudent;
}

export function deleteDemoStudent(id: string) {
  setStore(DEMO_STUDENTS_KEY, loadDemoStudents().filter(s => s.id !== id));
}

/* ==================== ENROLLMENTS ==================== */

export interface DemoEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  created_at: string;
}

const DEMO_ENROLLMENTS_KEY = 'demo_enrollments';

const SEED_ENROLLMENTS: DemoEnrollment[] = [
  { id: 'enr-1', class_id: 'demo-class-1', student_id: 'student-1', created_at: new Date().toISOString() },
  { id: 'enr-2', class_id: 'demo-class-1', student_id: 'student-2', created_at: new Date().toISOString() },
  { id: 'enr-3', class_id: 'demo-class-1', student_id: 'student-3', created_at: new Date().toISOString() },
  { id: 'enr-4', class_id: 'demo-class-2', student_id: 'student-4', created_at: new Date().toISOString() },
  { id: 'enr-5', class_id: 'demo-class-2', student_id: 'student-5', created_at: new Date().toISOString() },
  { id: 'enr-6', class_id: 'demo-class-3', student_id: 'student-6', created_at: new Date().toISOString() },
  { id: 'enr-7', class_id: 'demo-class-3', student_id: 'student-7', created_at: new Date().toISOString() },
  { id: 'enr-8', class_id: 'demo-class-3', student_id: 'student-8', created_at: new Date().toISOString() },
];

export function loadDemoEnrollments(): DemoEnrollment[] {
  const raw = getStore<DemoEnrollment>(DEMO_ENROLLMENTS_KEY);
  return raw.length > 0 ? raw : SEED_ENROLLMENTS;
}

export function addDemoEnrollments(classId: string, studentIds: string[]): DemoEnrollment[] {
  const list = loadDemoEnrollments();
  const existing = list.filter(e => e.class_id === classId).map(e => e.student_id);
  const toAdd = studentIds.filter(id => !existing.includes(id));

  const added: DemoEnrollment[] = toAdd.map(student_id => ({
    id: 'enr-' + crypto.randomUUID().slice(0, 8),
    class_id: classId,
    student_id,
    created_at: new Date().toISOString(),
  }));
  list.push(...added);
  setStore(DEMO_ENROLLMENTS_KEY, list);
  return added;
}

export function deleteDemoEnrollment(id: string) {
  setStore(DEMO_ENROLLMENTS_KEY, loadDemoEnrollments().filter(e => e.id !== id));
}

/* ==================== SESSIONS ==================== */

export interface DemoSession {
  id: string;
  class_id: string;
  title: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  teacher_id: string | null;
}

const DEMO_SESSIONS_KEY = 'demo_sessions';

const SEED_SESSIONS: DemoSession[] = [
  { id: 'ses-1', class_id: 'demo-class-1', title: 'Bài 1 - Bảng chữ cái', session_date: '2026-06-09', start_time: '08:00', end_time: '09:30', teacher_id: 'teacher-1' },
  { id: 'ses-2', class_id: 'demo-class-1', title: 'Bài 2 - Chào hỏi', session_date: '2026-06-11', start_time: '08:00', end_time: '09:30', teacher_id: 'teacher-1' },
  { id: 'ses-3', class_id: 'demo-class-2', title: 'Bài 1 - Passé Composé', session_date: '2026-06-10', start_time: '13:30', end_time: '15:00', teacher_id: 'teacher-2' },
  { id: 'ses-4', class_id: 'demo-class-3', title: 'Bài 1 - Subjonctif', session_date: '2026-06-09', start_time: '18:00', end_time: '19:30', teacher_id: 'teacher-3' },
];

export function loadDemoSessions(): DemoSession[] {
  const raw = getStore<DemoSession>(DEMO_SESSIONS_KEY);
  return raw.length > 0 ? raw : SEED_SESSIONS;
}

export function saveDemoSession(data: {
  id?: string;
  class_id: string;
  title?: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  teacher_id?: string | null;
}): DemoSession {
  const list = loadDemoSessions();

  if (data.id) {
    const idx = list.findIndex(s => s.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, id: data.id };
      setStore(DEMO_SESSIONS_KEY, list);
      return list[idx];
    }
  }

  const newSession: DemoSession = {
    id: 'ses-' + crypto.randomUUID().slice(0, 8),
    class_id: data.class_id,
    title: data.title ?? null,
    session_date: data.session_date,
    start_time: data.start_time,
    end_time: data.end_time,
    teacher_id: data.teacher_id ?? null,
  };
  list.unshift(newSession);
  setStore(DEMO_SESSIONS_KEY, list);
  return newSession;
}

export function deleteDemoSession(id: string) {
  setStore(DEMO_SESSIONS_KEY, loadDemoSessions().filter(s => s.id !== id));
}

/* ==================== EVALUATIONS ==================== */

export interface DemoEvaluation {
  id: string;
  student_id: string;
  class_session_id: string;
  teacher_id: string;
  session_date: string;
  pronunciation: number;
  fluency: number;
  vocabulary_oral: number;
  grammar_conjugation: number;
  structure: number;
  spelling: number;
  classwork_completion_rate: number;
  comprehension_rate: number;
  attendance: string;
  engagement: number;
  homework: string;
  notes: string | null;
  is_locked: boolean;
  created_at: string;
}

const DEMO_EVALUATIONS_KEY = 'demo_evaluations';

const SEED_EVALUATIONS: DemoEvaluation[] = [
  { id: 'eval-1', student_id: 'student-1', class_session_id: 'ses-1', teacher_id: 'teacher-1', session_date: '2026-06-09', pronunciation: 4, fluency: 3, vocabulary_oral: 4, grammar_conjugation: 3, structure: 3, spelling: 4, classwork_completion_rate: 85, comprehension_rate: 4, attendance: 'present', engagement: 4, homework: 'on_time', notes: null, is_locked: false, created_at: new Date().toISOString() },
  { id: 'eval-2', student_id: 'student-2', class_session_id: 'ses-1', teacher_id: 'teacher-1', session_date: '2026-06-09', pronunciation: 3, fluency: 3, vocabulary_oral: 2, grammar_conjugation: 3, structure: 3, spelling: 3, classwork_completion_rate: 70, comprehension_rate: 3, attendance: 'present', engagement: 3, homework: 'on_time', notes: null, is_locked: false, created_at: new Date().toISOString() },
  { id: 'eval-3', student_id: 'student-3', class_session_id: 'ses-1', teacher_id: 'teacher-1', session_date: '2026-06-09', pronunciation: 2, fluency: 2, vocabulary_oral: 2, grammar_conjugation: 2, structure: 2, spelling: 3, classwork_completion_rate: 50, comprehension_rate: 2, attendance: 'late', engagement: 2, homework: 'missing', notes: null, is_locked: false, created_at: new Date().toISOString() },
  { id: 'eval-4', student_id: 'student-4', class_session_id: 'ses-3', teacher_id: 'teacher-2', session_date: '2026-06-10', pronunciation: 5, fluency: 4, vocabulary_oral: 5, grammar_conjugation: 4, structure: 4, spelling: 5, classwork_completion_rate: 95, comprehension_rate: 5, attendance: 'present', engagement: 5, homework: 'on_time', notes: null, is_locked: true, created_at: new Date().toISOString() },
  { id: 'eval-5', student_id: 'student-5', class_session_id: 'ses-3', teacher_id: 'teacher-2', session_date: '2026-06-10', pronunciation: 3, fluency: 3, vocabulary_oral: 3, grammar_conjugation: 3, structure: 3, spelling: 3, classwork_completion_rate: 75, comprehension_rate: 3, attendance: 'present', engagement: 3, homework: 'late', notes: null, is_locked: true, created_at: new Date().toISOString() },
  { id: 'eval-6', student_id: 'student-6', class_session_id: 'ses-4', teacher_id: 'teacher-3', session_date: '2026-06-09', pronunciation: 2, fluency: 3, vocabulary_oral: 2, grammar_conjugation: 2, structure: 3, spelling: 2, classwork_completion_rate: 60, comprehension_rate: 2, attendance: 'absent', engagement: 2, homework: 'missing', notes: null, is_locked: false, created_at: new Date().toISOString() },
];

export function loadDemoEvaluations(): DemoEvaluation[] {
  const raw = getStore<DemoEvaluation>(DEMO_EVALUATIONS_KEY);
  return raw.length > 0 ? raw : SEED_EVALUATIONS;
}

export function saveDemoEvaluation(data: {
  id?: string;
  student_id: string;
  class_session_id: string;
  teacher_id: string;
  session_date: string;
  pronunciation: number;
  fluency: number;
  vocabulary_oral: number;
  grammar_conjugation: number;
  structure: number;
  spelling: number;
  classwork_completion_rate: number;
  comprehension_rate: number;
  attendance: string;
  engagement: number;
  homework: string;
  notes?: string | null;
  is_locked?: boolean;
}): DemoEvaluation {
  const list = loadDemoEvaluations();

  if (data.id) {
    const idx = list.findIndex(e => e.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, id: data.id, created_at: list[idx].created_at };
      setStore(DEMO_EVALUATIONS_KEY, list);
      return list[idx];
    }
  }

  const newEval: DemoEvaluation = {
    id: 'eval-' + crypto.randomUUID().slice(0, 8),
    student_id: data.student_id,
    class_session_id: data.class_session_id,
    teacher_id: data.teacher_id,
    session_date: data.session_date,
    pronunciation: data.pronunciation,
    fluency: data.fluency,
    vocabulary_oral: data.vocabulary_oral,
    grammar_conjugation: data.grammar_conjugation,
    structure: data.structure,
    spelling: data.spelling,
    classwork_completion_rate: data.classwork_completion_rate,
    comprehension_rate: data.comprehension_rate,
    attendance: data.attendance,
    engagement: data.engagement,
    homework: data.homework,
    notes: data.notes ?? null,
    is_locked: data.is_locked ?? false,
    created_at: new Date().toISOString(),
  };
  list.unshift(newEval);
  setStore(DEMO_EVALUATIONS_KEY, list);
  return newEval;
}

export function deleteDemoEvaluation(id: string) {
  setStore(DEMO_EVALUATIONS_KEY, loadDemoEvaluations().filter(e => e.id !== id));
}

/* ==================== REPORTS ==================== */

export interface DemoReport {
  id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  sent_at: string | null;
}

const DEMO_REPORTS_KEY = 'demo_reports';

const SEED_REPORTS: DemoReport[] = [
  { id: 'rpt-1', student_id: 'student-1', student_name: 'Hoàng Văn Dũng', student_code: 'HV001', period_start: '2026-05-01', period_end: '2026-05-31', status: 'draft', created_at: new Date().toISOString(), reviewed_at: null, sent_at: null },
  { id: 'rpt-2', student_id: 'student-2', student_name: 'Mai Thị Em', student_code: 'HV002', period_start: '2026-05-01', period_end: '2026-05-31', status: 'pending_approval', created_at: new Date().toISOString(), reviewed_at: null, sent_at: null },
  { id: 'rpt-3', student_id: 'student-3', student_name: 'Võ Minh Phương', student_code: 'HV003', period_start: '2026-05-01', period_end: '2026-05-31', status: 'approved', created_at: new Date().toISOString(), reviewed_at: new Date().toISOString(), sent_at: null },
];

export function loadDemoReports(): DemoReport[] {
  const raw = getStore<DemoReport>(DEMO_REPORTS_KEY);
  return raw.length > 0 ? raw : SEED_REPORTS;
}

export function updateDemoReport(id: string, updates: Partial<DemoReport>) {
  const list = loadDemoReports();
  const idx = list.findIndex(r => r.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    setStore(DEMO_REPORTS_KEY, list);
  }
}
