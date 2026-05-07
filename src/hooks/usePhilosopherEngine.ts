import { useState, useCallback } from 'react';

// Defines the data structure of a philosopher engine message
export type PhilosopherMessage = {
  id: string;
  role: 'user' | 'engine';
  content: string;
  timestamp: Date;
  metadata?: {
    mode?: string;
    modulesActive?: string[];
    proposedActions?: any[];
    questionsCount?: number;
    logicFlags?: any[];
    references?: string[];
  };
};

export type PhilosopherMode = 'EXPLORER' | 'DIALECTIC' | 'GENEALOGY' | 'CLOSE_READING' | 'SYNTHESIS' | 'WRITING' | 'DEFENSE' | 'ONTOLOGY' | 'OBJECTION' | 'PASTORAL_SILENCE';

export const usePhilosopherEngine = () => {
    const [messages, setMessages] = useState<PhilosopherMessage[]>([]);
    const [mode, setMode] = useState<PhilosopherMode>('EXPLORER');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (content: string) => {
        setIsLoading(true);
        const newMessage: PhilosopherMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage]);

        // Simulating an API call for now.
        // We will wire this up to Vertex SDK Claude later
        setTimeout(() => {
            const engineResponse: PhilosopherMessage = {
                id: (Date.now() + 1).toString(),
                role: 'engine',
                content: `Response to: ${content}`,
                timestamp: new Date(),
                metadata: {
                    mode: mode
                }
            }
             setMessages(prev => [...prev, engineResponse]);
             setIsLoading(false);
        }, 500)

    }, [mode])

    return {
        messages,
        mode,
        setMode,
        sendMessage,
        isLoading
    }
}
