import { create } from 'zustand'
import { NKSEntity, Relation } from '../types/store'
import { v4 as uuidv4 } from 'uuid'

interface GraphState {
    nodes: Record<string, NKSEntity>;
    edges: Record<string, Relation>;
    addNode: (node: Omit<NKSEntity, 'id' | 'createdAt' | 'updatedAt'>) => string;
    updateNode: (id: string, updates: Partial<NKSEntity>) => void;
    addEdge: (edge: Omit<Relation, 'id'>) => string;
}

export const useGraphStore = create<GraphState>((set) => ({
    nodes: {},
    edges: {},
    addNode: (nodeData) => {
        const id = uuidv4();
        const now = new Date().toISOString()
        const newNode: NKSEntity = {
            ...nodeData,
            id,
            createdAt: now,
            updatedAt: now
        }
        set((state) => ({
            nodes: {
                ...state.nodes,
                [id]: newNode
            }
        }))
        return id;
    },
    updateNode: (id, updates) => {
        set((state) => {
            const current = state.nodes[id]
            if(!current) return state;
            return {
                nodes: {
                    ...state.nodes,
                    [id]: {
                        ...current,
                        ...updates,
                        updatedAt: new Date().toISOString()
                    }
                }
            }
        })
    },
    addEdge: (edgeData) => {
        const id = uuidv4();
        const newEdge: Relation = {
            ...edgeData,
            id
        }
        set((state) => ({
            edges: {
                ...state.edges,
                [id]: newEdge
            }
        }))
        return id;
    }
}))
