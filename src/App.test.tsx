import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import { usePhilosopherEngine } from './hooks/usePhilosopherEngine'

// Mock the hook so we can test App component independently
vi.mock('./hooks/usePhilosopherEngine', () => ({
  usePhilosopherEngine: vi.fn(),
}))

describe('App', () => {
    it('renders the engine offline state initially', () => {
        vi.mocked(usePhilosopherEngine).mockReturnValue({
            messages: [],
            mode: 'EXPLORER',
            setMode: vi.fn(),
            sendMessage: vi.fn(),
            isLoading: false
        })

        render(<App />)
        expect(screen.getByText('Ontology Seed Loaded')).toBeInTheDocument()
        expect(screen.getByText('Engine Offline')).toBeInTheDocument()
    })

    it('renders messages correctly', () => {
         vi.mocked(usePhilosopherEngine).mockReturnValue({
            messages: [
                { id: '1', role: 'user', content: 'What is nihiltheism?', timestamp: new Date() },
                { id: '2', role: 'engine', content: 'It is a framework.', timestamp: new Date(), metadata: { mode: 'EXPLORER' } }
            ],
            mode: 'EXPLORER',
            setMode: vi.fn(),
            sendMessage: vi.fn(),
            isLoading: false
        })

        render(<App />)
        expect(screen.getByText('What is nihiltheism?')).toBeInTheDocument()
        expect(screen.getByText('It is a framework.')).toBeInTheDocument()
    })

    it('can send a message', async () => {
        const sendMessage = vi.fn()
         vi.mocked(usePhilosopherEngine).mockReturnValue({
            messages: [],
            mode: 'EXPLORER',
            setMode: vi.fn(),
            sendMessage,
            isLoading: false
        })

        render(<App />)
        
        const input = screen.getByPlaceholderText(/Command or query/i)
        fireEvent.change(input, { target: { value: 'Hello engine' } })
        
        const button = screen.getByRole('button', { name: /Execute/i })
        fireEvent.click(button)

        expect(sendMessage).toHaveBeenCalledWith('Hello engine')
    })
})
