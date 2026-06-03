export type ResourceCategory =
  | 'Video'
  | 'Audio'
  | 'Audio_Text'
  | 'Website'
  | 'Course'
  | 'Article'
  | 'Product'
  | 'Pronunciation'
  | 'Keyboard';

export type SubtitleLang = 'French' | 'English' | 'Both';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: ResourceCategory;
  language: string;
  subtitle: SubtitleLang | null;
  is_kids: boolean;
  is_free: boolean;
  tags: string[];
  created_at: string;
}

export type ResourceGroup = {
  category: ResourceCategory;
  label: string;
  resources: LearningResource[];
};
