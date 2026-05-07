import { create } from 'zustand';
import { PKMDocument, Connection, KnowledgeGap, SearchQuery } from '../lib/types';

interface PKMState {
  documents: PKMDocument[];
  connections: Connection[];
  gaps: KnowledgeGap[];
  searchHistory: SearchQuery[];
  
  // Actions
  addDocument: (doc: Omit<PKMDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, doc: Partial<PKMDocument>) => void;
  deleteDocument: (id: string) => void;
  
  addConnection: (connection: Omit<Connection, 'id'>) => void;
  addKnowledgeGap: (gap: Omit<KnowledgeGap, 'id' | 'createdAt'>) => void;
  logSearch: (query: string) => void;

  // Mock initial data load
  initializeMockData: () => void;
}

// Generate simple mock IDs
const genId = () => Math.random().toString(36).substring(2, 9);

export const usePKMStore = create<PKMState>((set) => ({
  documents: [],
  connections: [],
  gaps: [],
  searchHistory: [],

  addDocument: (doc) => set((state) => ({
    documents: [
      {
        ...doc,
        id: genId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...state.documents
    ]
  })),

  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(d => 
      d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
    )
  })),

  deleteDocument: (id) => set((state) => ({
    documents: state.documents.filter(d => d.id !== id),
    // Also remove associated connections
    connections: state.connections.filter(c => c.sourceId !== id && c.targetId !== id)
  })),

  addConnection: (conn) => set((state) => ({
    connections: [...state.connections, { ...conn, id: genId() }]
  })),

  addKnowledgeGap: (gap) => set((state) => ({
    gaps: [{ ...gap, id: genId(), createdAt: new Date().toISOString() }, ...state.gaps]
  })),

  logSearch: (query) => set((state) => ({
    searchHistory: [{ id: genId(), query, timestamp: new Date().toISOString() }, ...state.searchHistory.slice(0, 49)]
  })),

  initializeMockData: () => set((state) => {
    if (state.documents.length > 0) return state; // Don't override if already loaded

    const now = new Date().toISOString();
    return {
      documents: [
        {
          id: 'mock-1',
          type: 'note',
          projectId: 'journal314',
          title: 'Initial reading of Cioran',
          content: "Cioran's approach to the void is visceral rather than strictly analytical. He does not build a system to contain the void; he allows the void to dismantle the system.",
          detectedConcepts: ['Despair', 'Anti-system', 'The Void'],
          resonanceScore: 0.85,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'mock-2',
          type: 'essay',
          projectId: 'ren',
          title: 'The Religious Experience of Nihilism - Draft 1',
          content: 'Nihilism is typically categorized as an absence of religious experience, but what if the encounter with meaninglessness is structurally identical to the apophatic encounter with God?',
          detectedConcepts: ['Apophatic Theology', 'Structural Identity', 'Meaninglessness'],
          resonanceScore: 0.92,
          createdAt: now,
          updatedAt: now
        }
      ],
      gaps: [
        {
          id: 'gap-1',
          title: 'The Bridge Between Apophatic Mysticism and Secular Despair',
          description: 'It is unclear whether the phenomenological state of the mystic entering the "Cloud of Unknowing" is neurologically or psychologically identical to the secular nihilist experiencing profound meaning-collapse, despite similarities in their language.',
          recommendedAuthors: ['St. John of the Cross', 'Emil Cioran', 'Arthur Schopenhauer'],
          recommendedBooks: ['The Dark Night of the Soul', 'The Trouble with Being Born'],
          status: 'open',
          createdAt: now
        }
      ],
      connections: [
        {
          id: 'conn-1',
          sourceId: 'mock-1',
          targetId: 'mock-2',
          description: "Cioran's visceral dismantling of systems acts as a preliminary stage to recognizing the structural identity of nihilism and apophatic theology."
        }
      ]
    };
  })
}));
