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
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  const { initializeMockData } = usePKMStore();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentId, setCurrentId] = useState<string | undefined>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setCurrentId(id);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigating
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
      <div className="dark flex h-[100dvh] bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30 relative">
        <Sidebar 
          currentView={currentView === 'editor' && currentId ? `editor-${currentId}` : currentView} 
          onNavigate={handleNavigate} 
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden relative w-full">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center p-4 border-b border-border bg-background shrink-0 z-10 h-14">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="mr-3 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-serif font-bold text-lg text-foreground">Nihiltheism PKM</span>
          </div>

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
