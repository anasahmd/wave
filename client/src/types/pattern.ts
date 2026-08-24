export interface LearnedPattern {
  id: string;
  connection?: string;
  question: string;
  query: string;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PatternUsed {
  id: string;
  question: string;
}
