'use client';

export interface ReviewCard {
  id: string;
  lesson_id: string;
  term_fr: string;
  term_vi: string;
  example_fr?: string;
  example_vi?: string;
  image_url?: string;
  ease: number;
  interval: number;
  repetitions: number;
  due_date: number;
  last_reviewed?: number;
}

const STORAGE_KEY = 'review_cards';

export function getReviewCards(): ReviewCard[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveReviewCards(cards: ReviewCard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function addCardsToReview(newCards: Omit<ReviewCard, 'ease' | 'interval' | 'repetitions' | 'due_date'>[]) {
  const cards = getReviewCards();
  const now = Date.now();
  for (const nc of newCards) {
    if (!cards.find(c => c.id === nc.id)) {
      cards.push({ ...nc, ease: 2.5, interval: 0, repetitions: 0, due_date: now });
    }
  }
  saveReviewCards(cards);
}

export function getDueCards(): ReviewCard[] {
  const now = Date.now();
  return getReviewCards().filter(c => c.due_date <= now);
}

export function getDueCount(): number {
  return getDueCards().length;
}

const MAX_EASE = 3.0;
const MIN_EASE = 1.3;

function clampEase(e: number) {
  return Math.max(MIN_EASE, Math.min(MAX_EASE, e));
}

export function rateCard(card: ReviewCard, quality: 1 | 2 | 3 | 4): ReviewCard {
  const q = quality as number;
  let { ease, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    const newEase = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    ease = clampEase(newEase);
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * ease);
    repetitions += 1;
  }

  const due_date = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ...card, ease, interval, repetitions, due_date, last_reviewed: Date.now() };
}

export function updateCardRating(cardId: string, quality: 1 | 2 | 3 | 4) {
  const cards = getReviewCards();
  const idx = cards.findIndex(c => c.id === cardId);
  if (idx === -1) return;
  cards[idx] = rateCard(cards[idx], quality);
  saveReviewCards(cards);
}

export function removeCard(cardId: string) {
  saveReviewCards(getReviewCards().filter(c => c.id !== cardId));
}

export function getReviewStats() {
  const cards = getReviewCards();
  const now = Date.now();
  return {
    total: cards.length,
    due: cards.filter(c => c.due_date <= now).length,
    reviewed: cards.filter(c => c.last_reviewed).length,
    streak: calcStreak(cards),
  };
}

function calcStreak(cards: ReviewCard[]): number {
  const reviewed = cards.filter(c => c.last_reviewed).map(c => c.last_reviewed!).sort((a, b) => b - a);
  if (reviewed.length === 0) return 0;
  let streak = 1;
  const today = new Date();
  const lastDate = new Date(reviewed[0]);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0;
  for (let i = 1; i < reviewed.length; i++) {
    const prev = new Date(reviewed[i - 1]);
    const curr = new Date(reviewed[i]);
    const diff = Math.floor((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) streak++;
    else if (diff > 1) break;
  }
  return streak;
}
