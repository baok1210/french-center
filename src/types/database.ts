export type UserRole = 'Admin' | 'TeacherTA' | 'Student';
export type AttendanceStatus = 'present' | 'late' | 'absent';
export type HomeworkStatus = 'on_time' | 'late' | 'missing';
export type ReportStatus = 'draft' | 'pending_approval' | 'approved' | 'sent';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  student_code: string | null;
  cefr_current: CefrLevel;
  cefr_progress_pct: number;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  title: string;
  level: CefrLevel;
  teacher_id: string;
  schedule: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ClassSession {
  id: string;
  class_id: string;
  title: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  teacher_id: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  student_id: string;
  class_session_id: string;
  teacher_id: string;
  pronunciation: number;
  fluency: number;
  vocabulary_oral: number;
  grammar_conjugation: number;
  structure: number;
  spelling: number;
  classwork_completion_rate: number;
  comprehension_rate: number;
  attendance: AttendanceStatus;
  engagement: number;
  homework: HomeworkStatus;
  notes: string | null;
  is_locked: boolean;
  session_date: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeGap {
  id: string;
  student_id: string;
  gap_tag: string;
  gap_category: 'grammar' | 'vocabulary' | 'pronunciation' | 'writing';
  severity: number;
  detected_at: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface MicroProgress {
  id: string;
  student_id: string;
  week_start: string;
  metric_name: string;
  metric_category: string;
  previous_value: number | null;
  current_value: number | null;
  change_pct: number | null;
  direction: 'improved' | 'declined' | 'stable';
  created_at: string;
}

export interface Report {
  id: string;
  student_id: string;
  class_id: string | null;
  report_url: string | null;
  pdf_path: string | null;
  status: ReportStatus;
  period_start: string;
  period_end: string;
  is_weekly: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  sent_at: string | null;
  created_at: string;
}
