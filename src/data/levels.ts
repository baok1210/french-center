export const LEVEL_DESCRIPTIONS = {
  Beginner:
    'Your students are absolute beginners, they know some common words and basic grammar structure but not much else. Please make sure to accommodate the text appropriately. The ideal comprehension level is about 85% for the students to learn the best.',
  Intermediate:
    'Your students are intermediates, they know a decent amount of words and non-complex grammar structures. Please make sure to accommodate the text appropriately. The ideal comprehension level is about 85% for the students to learn the best.',
  Advanced:
    'Your students are advanced, they know many words and most grammar structures, but they are not quite fluent. Please make sure to accommodate the text appropriately. The ideal comprehension level is about 85% for the students to learn the best.',
} as const;

export const LEVEL_OPTIONS = [
  { value: 'Beginner', label: 'Sơ cấp (Beginner)' },
  { value: 'Intermediate', label: 'Trung cấp (Intermediate)' },
  { value: 'Advanced', label: 'Cao cấp (Advanced)' },
] as const;

export const GENERATE_OPTIONS = [
  { value: 'Dialog', label: 'Hội thoại (Dialog)' },
  { value: 'Article', label: 'Bài báo (Article)' },
  { value: 'Story', label: 'Câu chuyện (Story)' },
  { value: 'Lesson', label: 'Bài học (Lesson)' },
] as const;
