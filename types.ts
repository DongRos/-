export enum SRSStage {
  New = 0,
  Learning = 1,
  Reviewing = 2,
  Mastered = 3
}

export interface Vocabulary {
  word: string;
  definition: string;
  example: string;
}

export interface GrammarPoint {
  title: string;
  explanation: string;
  example: string;
}

export interface StudyEntry {
  id: string;
  title: string;
  videoSource?: string;
  dateCreated: number; // Timestamp
  rawNotes: string;
  
  // AI Processed Content
  structuredVocabulary: Vocabulary[];
  structuredGrammar: GrammarPoint[];
  summary: string;

  // SRS Data
  nextReviewDate: number; // Timestamp
  interval: number; // Days
  easeFactor: number; // SM-2 Ease Factor (default 2.5)
  repetitionCount: number;
  stage: SRSStage;

  // Meta
  isFavorite?: boolean;
  isPinned?: boolean;
}

export interface DailyStats {
  date: string;
  reviewsCompleted: number;
  newItemsLearned: number;
}

export type ViewState = 'dashboard' | 'add-video' | 'review' | 'library';