export type UserTier = 'Free';
export type SkillType = 'vocabulary' | 'grammar' | 'listening' | 'reading';
export type LessonType = 'video' | 'audio' | 'text' | 'flashcard' | 'quiz';
export type GoalType = 'comprehensive' | 'review';
export type Difficulty = 'A1' | 'A2' | 'B1';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  tier: UserTier;
  avatar_url?: string;
  progress_pct: number;
  created_at: string;
}

export interface Level {
  id: string;
  difficulty: Difficulty;
  title_fr: string;
  title_vi: string;
  description: string;
  icon: string;
  vocab_count: number;
  grammar_points: number;
  order: number;
}

export interface Module {
  id: string;
  level_id: string;
  skill: SkillType;
  title_fr: string;
  title_vi: string;
  description: string;
  icon: string;
  order: number;
}

export interface Lesson {
  id: string;
  module_id: string;
  type: LessonType;
  title_fr: string;
  title_vi: string;
  content: LessonContent;
  duration_min: number;
  order: number;
}

export type LessonContent = VideoContent | AudioContent | TextContent | FlashcardContent | QuizContent;

export interface VideoContent {
  type: 'video';
  video_url: string;
  transcript_fr: string;
  transcript_vi: string;
  exercises: Exercise[];
}

export interface AudioContent {
  type: 'audio';
  audio_url: string;
  transcript_fr: string;
  transcript_vi: string;
  duration_sec: number;
}

export interface TextContent {
  type: 'text';
  body_fr: string;
  body_vi: string;
  vocabulary: InlineVocab[];
  questions: Question[];
}

export interface FlashcardContent {
  type: 'flashcard';
  cards: Flashcard[];
}

export interface QuizContent {
  type: 'quiz';
  questions: Question[];
}

export interface Flashcard {
  id: string;
  image_url?: string;
  term_fr: string;
  term_vi: string;
  example_fr?: string;
  example_vi?: string;
}

export interface InlineVocab {
  word_fr: string;
  word_vi: string;
}

export interface Question {
  id: string;
  question_fr: string;
  question_vi: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

export interface Exercise {
  id: string;
  instruction_fr: string;
  instruction_vi: string;
  prompt: string;
  answer: string;
}

export interface UserLibrary {
  id: string;
  user_id: string;
  lesson_id: string;
  added_at: string;
  progress: number;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score?: number;
  completed_at?: string;
}

export interface WizardState {
  step: number;
  difficulty?: Difficulty;
  goal?: GoalType;
  duration_min?: number;
}
