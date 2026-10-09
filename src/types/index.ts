export interface SearchFilters {
  document_type?: string;
  designation?: string;
  knowledge_type?: string;
  knowledge_sub_type?: string;
  industry?: string;
  sub_industry?: string;
  solution?: string;
  client_name?: string;
  client_type?: string;
  year?: string;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  top_k?: number;
  similarity_threshold?: number;
}

export interface SearchResult {
  document_name: string;
  summary: string;
  document_type: string;
  designation: string | null;
  knowledge_type: string | null;
  knowledge_sub_type: string | null;
  industry: string | null;
  sub_industry: string | null;
  solution: string | null;
  client_name: string | null;
  client_type: string | null;
  year: string | null;
  link: string | null;
  taggings: string | null;
  similarity_score: number | null;
  relevance_pct: number | null;
  rank: number;
}

export interface SearchMoreResponse {
  results: SearchResult[];
  page: number;
  has_more: boolean;
  session_id: string;
  total_relevant: number;
  message?: string;
}

export interface FilterOptions {
  document_type: string[];
  designation: string[];
  knowledge_type: string[];
  knowledge_sub_type: string[];
  industry: string[];
  sub_industry: string[];
  solution: string[];
  client_name: string[];
  client_type: string[];
  year: string[];
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: number;
  cachedResults: SearchResult[];
}

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface RankedDocument {
  rank: number;
  document_name: string;
  document_type: string;
  summary: string;
}
