import type { LearningResource, ResourceGroup } from '@/types/resources';

const CATEGORY_LABELS: Record<string, string> = {
  Video: 'Video',
  Audio: 'Audio',
  Audio_Text: 'Audio + Transcript',
  Website: 'Website',
  Course: 'Khóa học',
  Article: 'Bài viết',
  Product: 'Sản phẩm',
  Pronunciation: 'Phát âm',
  Keyboard: 'Bàn phím',
};

const CATEGORY_ORDER: string[] = [
  'Video',
  'Audio',
  'Audio_Text',
  'Website',
  'Course',
  'Pronunciation',
  'Article',
  'Product',
  'Keyboard',
];

export function groupResourcesByCategory(
  resources: LearningResource[]
): ResourceGroup[] {
  const groups: Record<string, LearningResource[]> = {};

  for (const r of resources) {
    if (!groups[r.category]) groups[r.category] = [];
    groups[r.category].push(r);
  }

  return CATEGORY_ORDER.filter((cat) => groups[cat]).map((cat) => ({
    category: cat as ResourceGroup['category'],
    label: CATEGORY_LABELS[cat] || cat,
    resources: groups[cat],
  }));
}
