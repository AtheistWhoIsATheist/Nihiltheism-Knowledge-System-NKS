export type DocumentType = 'note' | 'essay' | 'prompt';

export interface PKMDocument {
  id: string;
  type: DocumentType;
  projectId: string | 'journal314' | 'ren' | 'general';
  title: string;
  content: string;
  tags?: string[];
  summary?: string;
  detectedConcepts: string[];
  resonanceScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  description: string;
}

export interface KnowledgeGap {
  id: string;
  title: string;
  description: string;
  recommendedAuthors: string[];
  recommendedBooks: string[];
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface SearchQuery {
  id: string;
  query: string;
  timestamp: string;
}
