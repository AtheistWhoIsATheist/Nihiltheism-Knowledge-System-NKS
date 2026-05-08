import { useState, useEffect } from 'react';
import { usePKMStore } from '@/src/store/pkmStore';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Dashboard } from './components/Dashboard';
import { GapsView } from './components/GapsView';
import { ConnectionsView } from './components/ConnectionsView';
import { ProposalsView } from './components/ProposalsView';
import NihiltheismEngine from './components/SocratechChat';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  const { initializeMockData } = usePKMStore();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setCurrentId(id);
    setIsMobileOpen(false); // Close sidebar on mobile after navigating
  };

  const getMotionProps = () => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { ease: "easeOut" as const, duration: 0.5 },
    className: "flex-1 flex overflow-hidden w-full h-full"
  });

  return (
    <>
      <div className="dark flex h-[100dvh] bg-[#020204] text-foreground overflow-hidden font-sans selection:bg-primary/30 relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-[#101018]/20 to-[#020204]"></div>
        <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        <Sidebar 
          currentView={currentView === 'editor' && currentId ? `editor-${currentId}` : currentView} 
          onNavigate={handleNavigate} 
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isDesktopCollapsed={isDesktopCollapsed}
          setIsDesktopCollapsed={setIsDesktopCollapsed}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative w-full z-10">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center p-4 border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl shrink-0 z-10 h-14">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="mr-3 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-serif font-bold text-lg text-foreground">Nihiltheism PKM</span>
          </div>

          {isDesktopCollapsed && (
             <div className="absolute top-4 left-4 z-20 hidden lg:block">
                <Button variant="outline" size="icon" onClick={() => setIsDesktopCollapsed(false)} className="h-8 w-8 bg-[#060609]/80 backdrop-blur-md border-white/10 text-muted-foreground hover:text-foreground shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
             </div>
          )}

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div key="dashboard" {...getMotionProps()}>
                <Dashboard onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentView === 'editor' && (
              <motion.div key={`editor-${currentId || 'new'}`} {...getMotionProps()}>
                <Editor documentId={currentId} onNavigate={handleNavigate} />
              </motion.div>
            )}
            {currentView === 'chat' && (
               <motion.div key="chat" {...getMotionProps()}>
                <NihiltheismEngine />
              </motion.div>
            )}
            {currentView === 'gaps' && (
              <motion.div key="gaps" {...getMotionProps()}>
                 <GapsView />
              </motion.div>
            )}
            {currentView === 'connections' && (
               <motion.div key="connections" {...getMotionProps()}>
                  <ConnectionsView />
               </motion.div>
            )}
            {currentView === 'proposals' && (
               <motion.div key="proposals" {...getMotionProps()}>
                  <ProposalsView />
               </motion.div>
            )}
          </AnimatePresence>
          </div>
        </main>
      </div>
      <Toaster theme="dark" />
    </>
  );
}
