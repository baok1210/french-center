export type FrenchLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type GenerateType = 'Dialog' | 'Article' | 'Story' | 'Lesson';

export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface PromptTemplate {
  instructions: string;
  substituteContext: string;
}

export interface PromptCollection {
  context: string;
  generalQuestion: { instructions: string };
  generateDialog: PromptTemplate;
  generateArticle: PromptTemplate;
  generateStory: PromptTemplate;
  generateLesson: PromptTemplate;
}

export interface GenerateRequest {
  type: GenerateType;
  level: FrenchLevel;
}

export interface ChatRequest {
  messages: ChatMessage[];
  question: string;
}

export interface TranslateRequest {
  text: string;
  source: 'en' | 'fr';
  target: 'en' | 'fr';
}

export interface LookupRequest {
  word: string;
  direction: 'en-fr' | 'fr-en';
}
