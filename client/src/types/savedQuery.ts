export interface SavedQuery {
  id: string;
  connection?: string;
  question: string;
  query: string;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SavedQueryUsed {
  id: string;
  question: string;
}
