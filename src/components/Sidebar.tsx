import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, FileText, Brain, Search, Lightbulb, MessageSquare, Network, Plus, PenSquare, X } from 'lucide-react';
import { usePKMStore } from '@/src/store/pkmStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ currentView, onNavigate, isOpen, setIsOpen }: SidebarProps) {
  const { documents, gaps, logSearch } = usePKMStore();
  const [searchQuery, setSearchQuery] = useState('');

  const journal314Docs = documents.filter(d => d.projectId === 'journal314');
  const renDocs = documents.filter(d => d.projectId === 'ren');
  const generalDocs = documents.filter(d => d.projectId === 'general');

  const openGapsCount = gaps.filter(g => g.status === 'open').length;

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      logSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 border-r border-border bg-background flex flex-col pt-4 transition-transform duration-300 ease-in-out h-[100dvh]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-serif bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              Nihiltheism PKM
            </h2>
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search & Enter..." 
            className="pl-9 bg-muted/30 border-border h-8 text-xs text-foreground focus-visible:ring-primary shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6 pb-6">
          {/* Dashboard & Core */}
          <div className="space-y-1">
            <Button variant={currentView === 'dashboard' ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-sm hover:bg-muted font-medium" onClick={() => onNavigate('dashboard')}>
              <Brain className="mr-2 h-4 w-4" /> Dashboard
            </Button>
            <Button variant={currentView === 'chat' ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-sm hover:bg-muted font-medium text-primary hover:text-primary" onClick={() => onNavigate('chat')}>
              <MessageSquare className="mr-2 h-4 w-4" /> Socratech Ω Chat
            </Button>
            <Button variant={currentView === 'gaps' ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-sm hover:bg-muted font-medium" onClick={() => onNavigate('gaps')}>
              <Lightbulb className="mr-2 h-4 w-4" /> Knowledge Gaps
              {openGapsCount > 0 && (
                <span className="ml-auto bg-destructive/20 text-destructive text-[10px] uppercase font-bold tracking-wider px-1.5 rounded">{openGapsCount}</span>
              )}
            </Button>
            <Button variant={currentView === 'connections' ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-sm hover:bg-muted font-medium" onClick={() => onNavigate('connections')}>
              <Network className="mr-2 h-4 w-4" /> Map Connections
            </Button>
            <Button variant={currentView === 'proposals' ? 'secondary' : 'ghost'} className="w-full justify-start h-8 text-sm hover:bg-muted font-medium" onClick={() => onNavigate('proposals')}>
              <Lightbulb className="mr-2 h-4 w-4" /> Weekly Proposals
            </Button>
          </div>

          {/* Projects */}
          <div>
            <h4 className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex justify-between items-center">
              Projects
              <button onClick={() => onNavigate('editor')} className="hover:text-foreground"><Plus className="h-3 w-3" /></button>
            </h4>
            
            <div className="space-y-4">
              {/* Journal314 */}
              <div className="space-y-1">
                <div className="flex items-center px-2 text-xs font-semibold text-foreground/80 mb-1">
                  <Folder className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> Journal314
                </div>
                {journal314Docs.map(doc => (
                  <Button 
                    key={doc.id} 
                    variant={currentView === `editor-${doc.id}` ? 'secondary' : 'ghost'} 
                    className="w-full justify-start h-7 text-xs pl-8 font-normal hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onNavigate('editor', doc.id)}
                  >
                    {doc.type === 'note' ? <FileText className="mr-2 h-3 w-3" /> : <PenSquare className="mr-2 h-3 w-3" />}
                    <span className="truncate">{doc.title}</span>
                  </Button>
                ))}
              </div>

              {/* REN */}
              <div className="space-y-1">
                <div className="flex items-center px-2 text-xs font-semibold text-foreground/80 mb-1">
                  <Folder className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> REN
                </div>
                {renDocs.map(doc => (
                  <Button 
                    key={doc.id} 
                    variant={currentView === `editor-${doc.id}` ? 'secondary' : 'ghost'} 
                    className="w-full justify-start h-7 text-xs pl-8 font-normal hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onNavigate('editor', doc.id)}
                  >
                    {doc.type === 'note' ? <FileText className="mr-2 h-3 w-3" /> : <PenSquare className="mr-2 h-3 w-3" />}
                    <span className="truncate">{doc.title}</span>
                  </Button>
                ))}
              </div>

              {/* General */}
               <div className="space-y-1">
                <div className="flex items-center px-2 text-xs font-semibold text-foreground/80 mb-1">
                  <Folder className="h-3.5 w-3.5 mr-2 text-muted-foreground" /> General
                </div>
                {generalDocs.map(doc => (
                  <Button 
                    key={doc.id} 
                    variant={currentView === `editor-${doc.id}` ? 'secondary' : 'ghost'} 
                    className="w-full justify-start h-7 text-xs pl-8 font-normal hover:bg-muted text-muted-foreground hover:text-foreground"
                    onClick={() => onNavigate('editor', doc.id)}
                  >
                     {doc.type === 'note' ? <FileText className="mr-2 h-3 w-3" /> : <PenSquare className="mr-2 h-3 w-3" />}
                    <span className="truncate">{doc.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
    </>
  );
}
