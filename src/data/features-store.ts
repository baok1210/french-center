'use client';

import { getDemoProfile } from './admin-store';

function getDemoId(): string | null {
  return getDemoProfile()?.id || null;
}

function store<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function save<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(prefix: string): string {
  return prefix + '-' + crypto.randomUUID().slice(0, 8);
}

/* ==================== ASSIGNMENTS ==================== */
export interface DemoAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string;
  type: 'multiple_choice' | 'essay' | 'voice';
  due_date: string;
  cefr_level: string;
  questions?: { question: string; options?: string[]; correctAnswer?: string }[];
  created_at: string;
}

const ASSIGN_KEY = 'demo_assignments';
const SEED_ASSIGNMENTS: DemoAssignment[] = [
  { id: 'ass-1', class_id: 'demo-class-1', teacher_id: 'teacher-1', title: 'Bài tập Passé Composé', description: 'Hoàn thành các câu với động từ ở thì Passé Composé', type: 'multiple_choice', due_date: '2026-06-20', cefr_level: 'A2', questions: [{ question: 'Hier, je ___ (manger) une pomme.', options: ['ai mangé', 'suis mangé', 'a mangé'], correctAnswer: 'ai mangé' }, { question: 'Elle ___ (aller) au marché.', options: ['a allé', 'est allée', 'ont allé'], correctAnswer: 'est allée' }], created_at: '2026-06-10' },
  { id: 'ass-2', class_id: 'demo-class-2', teacher_id: 'teacher-2', title: 'Viết đoạn văn giới thiệu', description: 'Viết 100 từ giới thiệu về bản thân bằng tiếng Pháp', type: 'essay', due_date: '2026-06-22', cefr_level: 'A1', created_at: '2026-06-10' },
];

export function loadDemoAssignments(): DemoAssignment[] {
  const raw = store<DemoAssignment>(ASSIGN_KEY);
  return raw.length > 0 ? raw : SEED_ASSIGNMENTS;
}

export function saveDemoAssignment(data: Partial<DemoAssignment> & { title: string; class_id: string; type: string }): DemoAssignment {
  const list = loadDemoAssignments();
  if (data.id) {
    const idx = list.findIndex(a => a.id === data.id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data } as DemoAssignment; save(ASSIGN_KEY, list); return list[idx]; }
  }
  const a: DemoAssignment = {
    id: uid('ass'), class_id: data.class_id, teacher_id: getDemoId() || 'demo-teacher',
    title: data.title, description: data.description || '', type: data.type as any,
    due_date: data.due_date || '', cefr_level: data.cefr_level || 'A1',
    questions: data.questions, created_at: new Date().toISOString(),
  };
  list.unshift(a); save(ASSIGN_KEY, list); return a;
}

export function deleteDemoAssignment(id: string) {
  save(ASSIGN_KEY, loadDemoAssignments().filter(a => a.id !== id));
}

/* ==================== SUBMISSIONS ==================== */
export interface DemoSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;  // text / JSON answer / voice URL
  file_url?: string;
  score?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  status: 'submitted' | 'graded';
  submitted_at: string;
}

const SUB_KEY = 'demo_submissions';

export function loadDemoSubmissions(): DemoSubmission[] {
  return store<DemoSubmission>(SUB_KEY);
}

export function submitDemoAssignment(data: { assignment_id: string; content: string; file_url?: string }): DemoSubmission {
  const list = loadDemoSubmissions();
  const sub: DemoSubmission = {
    id: uid('sub'), assignment_id: data.assignment_id, student_id: getDemoId() || 'demo-student',
    content: data.content, file_url: data.file_url || undefined,
    status: 'submitted', submitted_at: new Date().toISOString(),
  };
  list.unshift(sub); save(SUB_KEY, list); return sub;
}

export function gradeDemoSubmission(id: string, score: number, feedback: string) {
  const list = loadDemoSubmissions();
  const idx = list.findIndex(s => s.id === id);
  if (idx !== -1) {
    list[idx].score = score; list[idx].feedback = feedback;
    list[idx].status = 'graded'; list[idx].graded_by = getDemoId() || 'demo-teacher';
    list[idx].graded_at = new Date().toISOString();
    save(SUB_KEY, list);
  }
}

/* ==================== MESSAGES ==================== */
export interface DemoMessage {
  id: string;
  from_id: string;
  from_name: string;
  to_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

const MSG_KEY = 'demo_messages';

export function loadDemoMessages(conversationId?: string): DemoMessage[] {
  const all = store<DemoMessage>(MSG_KEY);
  if (conversationId) {
    const [uid1, uid2] = conversationId.split('-');
    return all.filter(m => (m.from_id === uid1 && m.to_id === uid2) || (m.from_id === uid2 && m.to_id === uid1));
  }
  return all;
}

export function getConversations(userId: string): { partnerId: string; partnerName: string; lastMessage: string; unread: number }[] {
  const all = store<DemoMessage>(MSG_KEY);
  const partners = new Map<string, { name: string; last: string; unread: number }>();
  all.forEach(m => {
    if (m.from_id === userId || m.to_id === userId) {
      const pid = m.from_id === userId ? m.to_id : m.from_id;
      const pname = m.from_id === userId ? m.from_name : (m as any).to_name || pid;
      if (!partners.has(pid) || m.created_at > partners.get(pid)!.last) {
        partners.set(pid, { name: pname, last: m.content, unread: (partners.get(pid)?.unread || 0) + (m.to_id === userId && !m.read ? 1 : 0) });
      }
    }
  });
  return Array.from(partners.entries()).map(([partnerId, v]) => ({ partnerId, partnerName: v.name, lastMessage: v.last, unread: v.unread }));
}

export function sendDemoMessage(fromId: string, fromName: string, toId: string, toName: string, content: string): DemoMessage {
  const all = loadDemoMessages();
  const msg: DemoMessage = { id: uid('msg'), from_id: fromId, from_name: fromName, to_id: toId, content, created_at: new Date().toISOString(), read: false };
  all.unshift(msg); save(MSG_KEY, all); return msg;
}

export function markConversationRead(userId: string, partnerId: string) {
  const all = loadDemoMessages();
  all.forEach(m => { if (m.to_id === userId && m.from_id === partnerId) m.read = true; });
  save(MSG_KEY, all);
}

/* ==================== NOTIFICATIONS ==================== */
export interface DemoNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'schedule' | 'deadline' | 'grade' | 'message' | 'system';
  related_id?: string;
  read: boolean;
  created_at: string;
}

const NOTIF_KEY = 'demo_notifications';
const SEED_NOTIFICATIONS: DemoNotification[] = [
  { id: 'notif-1', user_id: 'demo-student', title: 'Lịch học mới', body: 'Buổi học A1 - Buổi sáng vào T2 08:00', type: 'schedule', read: false, created_at: new Date().toISOString() },
  { id: 'notif-2', user_id: 'demo-student', title: 'Bài tập sắp đến hạn', body: 'Bài tập Passé Composé hạn nộp 20/06', type: 'deadline', related_id: 'ass-1', read: false, created_at: new Date().toISOString() },
  { id: 'notif-3', user_id: 'demo-teacher', title: 'Bài tập mới nộp', body: 'Nguyễn Văn A đã nộp bài tập Viết đoạn văn', type: 'grade', related_id: 'ass-2', read: false, created_at: new Date().toISOString() },
];

export function loadDemoNotifications(userId?: string): DemoNotification[] {
  const raw = store<DemoNotification>(NOTIF_KEY);
  const list = raw.length > 0 ? raw : SEED_NOTIFICATIONS;
  return userId ? list.filter(n => n.user_id === userId) : list;
}

export function addDemoNotification(data: Partial<DemoNotification> & { user_id: string; title: string }): DemoNotification {
  const list = loadDemoNotifications();
  const n: DemoNotification = { id: uid('notif'), user_id: data.user_id, title: data.title, body: data.body || '', type: data.type || 'system', read: false, created_at: new Date().toISOString() };
  list.unshift(n); save(NOTIF_KEY, list); return n;
}

export function markNotificationRead(id: string) {
  const list = loadDemoNotifications();
  const n = list.find(x => x.id === id);
  if (n) { n.read = true; save(NOTIF_KEY, list); }
}

export function markAllNotificationsRead(userId: string) {
  const list = loadDemoNotifications();
  list.forEach(n => { if (n.user_id === userId) n.read = true; });
  save(NOTIF_KEY, list);
}

export function getUnreadCount(userId: string): number {
  return loadDemoNotifications(userId).filter(n => !n.read).length;
}

/* ==================== DOCUMENTS ==================== */
export interface DemoDocument {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'link';
  url: string;
  cefr_level: string;
  tags: string[];
  uploaded_by: string;
  shared: boolean;
  created_at: string;
}

const DOC_KEY = 'demo_documents';
const SEED_DOCUMENTS: DemoDocument[] = [
  { id: 'doc-1', title: 'Bảng chia động từ tiếng Pháp', description: 'Bảng chia động từ cơ bản nhóm 1, 2, 3', type: 'pdf', url: '#', cefr_level: 'A1', tags: ['ngữ pháp', 'động từ'], uploaded_by: 'teacher-1', shared: true, created_at: '2026-01-15' },
  { id: 'doc-2', title: 'Bài ngữ âm A1', description: 'File audio luyện phát âm các âm cơ bản', type: 'audio', url: '#', cefr_level: 'A1', tags: ['phát âm', 'nghe'], uploaded_by: 'teacher-1', shared: true, created_at: '2026-02-01' },
  { id: 'doc-3', title: 'Video hội thoại A2', description: 'Video hội thoại mua sắm bằng tiếng Pháp', type: 'video', url: '#', cefr_level: 'A2', tags: ['hội thoại', 'nghe'], uploaded_by: 'teacher-2', shared: true, created_at: '2026-03-10' },
];

export function loadDemoDocuments(cefrLevel?: string): DemoDocument[] {
  const raw = store<DemoDocument>(DOC_KEY);
  const list = raw.length > 0 ? raw : SEED_DOCUMENTS;
  return cefrLevel ? list.filter(d => d.cefr_level === cefrLevel) : list;
}

export function saveDemoDocument(data: Partial<DemoDocument> & { title: string; type: string; url: string }): DemoDocument {
  const list = loadDemoDocuments();
  const d: DemoDocument = { id: uid('doc'), title: data.title, description: data.description || '', type: data.type as any, url: data.url, cefr_level: data.cefr_level || 'A1', tags: data.tags || [], uploaded_by: getDemoId() || 'demo-teacher', shared: data.shared ?? true, created_at: new Date().toISOString() };
  list.unshift(d); save(DOC_KEY, list); return d;
}

export function deleteDemoDocument(id: string) {
  save(DOC_KEY, loadDemoDocuments().filter(d => d.id !== id));
}

/* ==================== ATTENDANCE ==================== */
export interface DemoAttendance {
  id: string;
  session_id: string;
  student_id: string;
  status: 'present' | 'late' | 'absent' | 'excused';
  marked_by: string;
  marked_at: string;
}

const ATTEND_KEY = 'demo_attendance';

export function loadDemoAttendance(sessionId?: string): DemoAttendance[] {
  const all = store<DemoAttendance>(ATTEND_KEY);
  return sessionId ? all.filter(a => a.session_id === sessionId) : all;
}

export function markAttendance(sessionId: string, studentId: string, status: DemoAttendance['status']): DemoAttendance {
  const list = loadDemoAttendance();
  const existing = list.findIndex(a => a.session_id === sessionId && a.student_id === studentId);
  const record: DemoAttendance = { id: existing !== -1 ? list[existing].id : uid('att'), session_id: sessionId, student_id: studentId, status, marked_by: getDemoId() || 'demo-teacher', marked_at: new Date().toISOString() };
  if (existing !== -1) list[existing] = record;
  else list.push(record);
  save(ATTEND_KEY, list); return record;
}

/* ==================== VOCABULARY / GRAMMAR NOTES ==================== */
export interface DemoVocabNote {
  id: string;
  user_id: string;
  type: 'vocab' | 'grammar';
  french: string;
  vietnamese: string;
  example?: string;
  tags: string[];
  created_at: string;
}

const VOCAB_KEY = 'demo_vocab';
const SEED_VOCAB: DemoVocabNote[] = [
  { id: 'vocab-1', user_id: 'demo-student', type: 'vocab', french: 'Bonjour', vietnamese: 'Xin chào', example: 'Bonjour, comment allez-vous?', tags: ['cơ bản'], created_at: new Date().toISOString() },
  { id: 'vocab-2', user_id: 'demo-student', type: 'vocab', french: 'Merci', vietnamese: 'Cảm ơn', example: 'Merci beaucoup!', tags: ['cơ bản'], created_at: new Date().toISOString() },
  { id: 'vocab-3', user_id: 'demo-student', type: 'grammar', french: 'Passé Composé', vietnamese: 'Thì quá khứ kép', example: 'J\'ai mangé.', tags: ['động từ'], created_at: new Date().toISOString() },
];

export function loadDemoVocab(userId: string, type?: 'vocab' | 'grammar'): DemoVocabNote[] {
  const raw = store<DemoVocabNote>(VOCAB_KEY);
  const list = raw.length > 0 ? raw : SEED_VOCAB;
  let filtered = list.filter(v => v.user_id === userId);
  if (type) filtered = filtered.filter(v => v.type === type);
  return filtered;
}

export function saveDemoVocab(data: Partial<DemoVocabNote> & { french: string; vietnamese: string; type: string }): DemoVocabNote {
  const list = loadDemoVocab('__all__');
  // filter correctly
  const all = store<DemoVocabNote>(VOCAB_KEY);
  const merged = all.length > 0 ? all : [];
  const v: DemoVocabNote = { id: uid('vocab'), user_id: getDemoId() || 'demo-student', type: data.type as any, french: data.french, vietnamese: data.vietnamese, example: data.example, tags: data.tags || [], created_at: new Date().toISOString() };
  merged.unshift(v); save(VOCAB_KEY, merged); return v;
}

export function deleteDemoVocab(id: string) {
  const list = store<DemoVocabNote>(VOCAB_KEY);
  save(VOCAB_KEY, list.filter(v => v.id !== id));
}
