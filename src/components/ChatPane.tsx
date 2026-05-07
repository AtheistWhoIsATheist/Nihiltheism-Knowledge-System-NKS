import { useState } from 'react';
import { usePhilosopherEngine, PhilosopherMode } from '../hooks/usePhilosopherEngine';

export function ChatPane() {
    const { messages, sendMessage, isLoading, mode, setMode } = usePhilosopherEngine();
    const [input, setInput] = useState('');

    const handleSend = () => {
        if(!input.trim()) return;
        sendMessage(input);
        setInput('');
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative border-l border-border">
          {/* Header */}
          <header className="h-14 border-b border-border flex items-center px-4 shrink-0 bg-background/95 backdrop-blur z-10 sticky top-0">
             <div className="text-sm font-medium text-muted-foreground mr-4">Philosopher Engine</div>
             <select 
                value={mode} 
                onChange={(e) => setMode(e.target.value as PhilosopherMode)}
                className="bg-transparent border border-border rounded text-sm px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
             >
                <option value="EXPLORER">EXPLORER</option>
                <option value="DIALECTIC">DIALECTIC</option>
                <option value="SYNTHESIS">SYNTHESIS</option>
                <option value="GENEALOGY">GENEALOGY</option>
                <option value="DEFENSE">DEFENSE</option>
             </select>
          </header>

          {/* Chat Interface */}
          <div className="flex-1 overflow-y-auto p-4 w-full space-y-6">
              {messages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center space-y-4 max-w-sm">
                         <h2 className="text-xl text-foreground font-medium">Engine Offline</h2>
                         <p className="text-sm">Initiate dialectic sequence...</p>
                      </div>
                  </div>
              )}
              {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[90%] rounded-xl px-4 py-3 ${
                         msg.role === 'user' 
                         ? 'bg-primary text-primary-foreground' 
                         : 'bg-muted text-foreground border border-border/50'
                     }`}>
                         {msg.role === 'engine' && msg.metadata?.mode && (
                             <div className="text-[10px] uppercase tracking-wider mb-2 opacity-60 font-mono">
                                [{msg.metadata.mode}]
                             </div>
                         )}
                         <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                            {msg.content}
                         </div>
                     </div>
                  </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                     <div className="bg-muted text-muted-foreground border border-border/50 rounded-xl px-4 py-3 text-sm animate-pulse">
                         Analyzing...
                     </div>
                  </div>
              )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-border shrink-0">
             <div className="flex flex-col gap-2">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Command or query..."
                    className="flex-1 resize-none h-20 bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="flex justify-end">
                    <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-medium text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        Execute
                    </button>
                </div>
             </div>
          </div>
      </div>
    )
}
