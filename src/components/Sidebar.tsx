import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, FileText, Brain, Search, Lightbulb, MessageSquare, Network, Plus, PenSquare, X, PanelLeftClose, Sparkles } from 'lucide-react';
import { usePKMStore } from '@/src/store/pkmStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (isCollapsed: boolean) => void;
}

export function Sidebar({ currentView, onNavigate, isMobileOpen, setIsMobileOpen, isDesktopCollapsed, setIsDesktopCollapsed }: SidebarProps) {
  const { documents, gaps, logSearch, summarizeDocument } = usePKMStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [summarizingIds, setSummarizingIds] = useState<Set<string>>(new Set());

  const handleSummarize = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSummarizingIds(prev => new Set(prev).add(id));
    await summarizeDocument(id);
    setSummarizingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

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

  const renderDocList = (docs: typeof documents, title: string) => (
    <div className="space-y-1">
      <div className="flex items-center px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">
        <Folder className="h-3 w-3 mr-2" /> {title}
      </div>
      {docs.map(doc => (
        <div key={doc.id} className="group relative pr-1">
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start h-auto py-2 text-xs pl-8 font-normal transition-all duration-300 items-start", currentView === `editor-${doc.id}` ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}
            onClick={() => onNavigate('editor', doc.id)}
          >
            <div className="shrink-0 mt-0.5">
              {doc.type === 'note' ? <FileText className="mr-2 h-3.5 w-3.5" /> : <PenSquare className="mr-2 h-3.5 w-3.5" />}
            </div>
            <div className="flex flex-col items-start overflow-hidden text-left flex-1 min-w-0 pr-6">
              <span className="truncate w-full">{doc.title}</span>
              {doc.summary && (
                <span className="text-[9px] text-muted-foreground/60 w-full line-clamp-2 mt-1 leading-tight">{doc.summary}</span>
              )}
            </div>
          </Button>
          {!doc.summary && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-2 top-1.5 h-6 w-6 transition-all duration-300",
                summarizingIds.has(doc.id) ? "opacity-100 text-primary animate-pulse" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}
              title="AI Summarize"
              onClick={(e) => handleSummarize(e, doc.id)}
              disabled={summarizingIds.has(doc.id)}
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex flex-col pt-4 transition-all duration-300 ease-in-out h-[100dvh] shrink-0 border-r border-white/5 bg-[#030305]/80 backdrop-blur-2xl",
        isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0",
        isDesktopCollapsed ? "lg:w-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0" : "w-64"
      )}>
        <div className="px-4 pb-4 min-w-[16rem]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-serif bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent truncate">
              Nihiltheism
            </h2>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground relative z-50 shrink-0" onClick={() => setIsDesktopCollapsed(true)}>
                <PanelLeftClose className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" onClick={() => setIsMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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

      <ScrollArea className="flex-1 px-3 min-w-[16rem]">
        <div className="space-y-6 pb-6">
          {/* Dashboard & Core */}
          <div className="space-y-1.5">
            <Button variant="ghost" className={cn("w-full justify-start h-9 text-sm transition-all duration-300", currentView === 'dashboard' ? 'bg-white/10 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')} onClick={() => onNavigate('dashboard')}>
              <Brain className={cn("mr-3 h-4 w-4", currentView === 'dashboard' ? 'text-primary' : '')} /> Dashboard
            </Button>
            <Button variant="ghost" className={cn("w-full justify-start h-9 text-sm transition-all duration-300", currentView === 'chat' ? 'bg-primary/10 text-primary shadow-[0_0_10px_rgba(138,43,226,0.1)] border border-primary/20' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')} onClick={() => onNavigate('chat')}>
              <MessageSquare className={cn("mr-3 h-4 w-4", currentView === 'chat' ? 'text-primary' : '')} /> Socratech Ω Chat
            </Button>
            <Button variant="ghost" className={cn("w-full justify-start h-9 text-sm transition-all duration-300", currentView === 'gaps' ? 'bg-white/10 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')} onClick={() => onNavigate('gaps')}>
              <Lightbulb className={cn("mr-3 h-4 w-4", currentView === 'gaps' ? 'text-primary' : '')} /> Knowledge Gaps
              {openGapsCount > 0 && (
                <span className="ml-auto bg-destructive/20 text-destructive text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded shadow-[0_0_5px_rgba(255,59,59,0.2)]">{openGapsCount}</span>
              )}
            </Button>
            <Button variant="ghost" className={cn("w-full justify-start h-9 text-sm transition-all duration-300", currentView === 'connections' ? 'bg-white/10 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')} onClick={() => onNavigate('connections')}>
              <Network className={cn("mr-3 h-4 w-4", currentView === 'connections' ? 'text-primary' : '')} /> Map Connections
            </Button>
            <Button variant="ghost" className={cn("w-full justify-start h-9 text-sm transition-all duration-300", currentView === 'proposals' ? 'bg-white/10 text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')} onClick={() => onNavigate('proposals')}>
              <Lightbulb className={cn("mr-3 h-4 w-4", currentView === 'proposals' ? 'text-primary' : '')} /> Weekly Proposals
            </Button>
          </div>

          {/* Projects */}
          <div>
            <h4 className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex justify-between items-center">
              Projects
              <button onClick={() => onNavigate('editor')} className="hover:text-foreground"><Plus className="h-3 w-3" /></button>
            </h4>
            
            <div className="space-y-4">
              {renderDocList(journal314Docs, 'Journal314')}
              {renderDocList(renDocs, 'REN')}
              {renderDocList(generalDocs, 'General')}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
    </>
  );
}
