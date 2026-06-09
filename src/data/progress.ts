'use client';

import type { Lesson, Module, Level } from '@/types/learning';
import { getLevelById, getModulesByLevel, getLessonsByModule } from './seed';

export interface LearningPath {
  level: string;
  goal: string;
  duration: string;
  createdAt: number;
}

export interface LearningProgress {
  currentLessonId: string | null;
  completedLessonIds: string[];
  startedAt: number;
  updatedAt: number;
}

const PATH_KEY = 'learning_path';
const PROGRESS_KEY = 'learning_progress';

export function getLearningPath(): LearningPath | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PATH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getProgress(): LearningProgress {
  if (typeof window === 'undefined') {
    return { currentLessonId: null, completedLessonIds: [], startedAt: 0, updatedAt: 0 };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : { currentLessonId: null, completedLessonIds: [], startedAt: 0, updatedAt: 0 };
  } catch {
    return { currentLessonId: null, completedLessonIds: [], startedAt: 0, updatedAt: 0 };
  }
}

function saveProgress(p: LearningProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...p, updatedAt: Date.now() }));
}

export function initProgressFromPath(): void {
  const path = getLearningPath();
  if (!path) return;
  const progress = getProgress();
  if (progress.startedAt > 0) return;

  const modules = getModulesByLevel(path.level);
  if (modules.length === 0) return;
  const lessons = getLessonsByModule(modules[0].id);
  if (lessons.length === 0) return;

  saveProgress({
    currentLessonId: lessons[0].id,
    completedLessonIds: [],
    startedAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export function completeLesson(lessonId: string): void {
  const p = getProgress();
  if (p.completedLessonIds.includes(lessonId)) return;
  p.completedLessonIds.push(lessonId);

  const next = findNextLesson(p.completedLessonIds);
  p.currentLessonId = next?.id || p.currentLessonId;
  saveProgress(p);
}

export function isLessonCompleted(lessonId: string): boolean {
  return getProgress().completedLessonIds.includes(lessonId);
}

export function getCompletionCount(moduleId: string): number {
  const p = getProgress();
  const lessons = getLessonsByModule(moduleId);
  return lessons.filter(l => p.completedLessonIds.includes(l.id)).length;
}

export function getLevelCompletionCount(levelId: string): number {
  const p = getProgress();
  const modules = getModulesByLevel(levelId);
  return modules.reduce((sum, m) => sum + getLessonsByModule(m.id).filter(l => p.completedLessonIds.includes(l.id)).length, 0);
}

export function getLevelTotalLessons(levelId: string): number {
  const modules = getModulesByLevel(levelId);
  return modules.reduce((sum, m) => sum + getLessonsByModule(m.id).length, 0);
}

function findNextLesson(completedIds: string[]): Lesson | null {
  const path = getLearningPath();
  if (!path) return null;

  const modules = getModulesByLevel(path.level);
  for (const mod of modules) {
    const lessons = getLessonsByModule(mod.id);
    for (const lesson of lessons) {
      if (!completedIds.includes(lesson.id)) return lesson;
    }
  }
  return null;
}

export function getNextLesson(): { lesson: Lesson; module: Module; level: Level } | null {
  const path = getLearningPath();
  const progress = getProgress();
  if (!path) return null;

  const next = findNextLesson(progress.completedLessonIds);
  if (!next) return null;

  const level = getLevelById(path.level);
  const allMods = getModulesByLevel(path.level);
  const mod = allMods.find(m => m.id === next.module_id);
  if (!level || !mod) return null;

  return { lesson: next, module: mod, level };
}

export function getSuggestedLessons(maxCount: number = 5): { lesson: Lesson; module: Module; level: Level }[] {
  const path = getLearningPath();
  const progress = getProgress();
  if (!path) return [];

  const result: { lesson: Lesson; module: Module; level: Level }[] = [];
  const level = getLevelById(path.level);
  if (!level) return [];

  const modules = getModulesByLevel(path.level);
  for (const mod of modules) {
    const lessons = getLessonsByModule(mod.id);
    for (const lesson of lessons) {
      if (progress.completedLessonIds.includes(lesson.id)) continue;
      if (result.length >= maxCount) break;
      result.push({ lesson, module: mod, level });
    }
    if (result.length >= maxCount) break;
  }
  return result;
}

export function getTotalCompleted(): number {
  return getProgress().completedLessonIds.length;
}

export function getTotalLessonsInPath(): number {
  const path = getLearningPath();
  if (!path) return 0;
  const modules = getModulesByLevel(path.level);
  return modules.reduce((sum, m) => sum + getLessonsByModule(m.id).length, 0);
}
