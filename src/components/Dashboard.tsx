import { usePKMStore } from '@/src/store/pkmStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, FileText, Lightbulb, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface DashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 150, damping: 20 }
  }
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const { documents, gaps, connections } = usePKMStore();

  const recentDocs = [...documents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <div className="flex-1 h-full bg-background p-4 md:p-6 lg:p-12 overflow-y-auto w-full mx-auto relative scroll-smooth">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-12"
      >
        <motion.div variants={itemVariants} className="flex items-end justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-foreground">PKM Engine</h1>
            <p className="text-muted-foreground text-sm mt-2 tracking-wide uppercase font-mono">Nihiltheism Synthesis Chamber</p>
          </div>
          <Button onClick={() => onNavigate('editor')} size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-medium tracking-tight">
            <FileText className="w-4 h-4 mr-2" /> New Entry
          </Button>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/40 border-border backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs tracking-widest uppercase font-semibold text-muted-foreground">Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-mono">{documents.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs tracking-widest uppercase font-semibold text-muted-foreground">Gaps</CardTitle>
              <Lightbulb className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-mono">{gaps.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs tracking-widest uppercase font-semibold text-muted-foreground">Connections</CardTitle>
              <Network className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-light font-mono">{connections.length}</div>
            </CardContent>
          </Card>
          <Card 
            className="group relative overflow-hidden border-primary/20 bg-background cursor-pointer hover:border-primary/50 transition-colors" 
            onClick={() => onNavigate('chat')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
              <CardTitle className="text-xs tracking-widest uppercase font-semibold text-primary">Socratech Ω</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-sm text-primary/80 mt-1 font-serif italic">Ready for dialectical inquiry</div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 pt-4">
          <motion.div variants={itemVariants}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Recent Vectors</h2>
            <div className="space-y-4">
              {recentDocs.map(doc => (
                <Card 
                  key={doc.id} 
                  className="bg-card/60 border-border hover:bg-muted/30 transition-colors cursor-pointer group hover:border-primary/30" 
                  onClick={() => onNavigate('editor', doc.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-serif text-lg font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">{doc.title}</h3>
                      <span className="text-[10px] uppercase tracking-widest border border-border text-muted-foreground px-2 py-0.5 rounded-full">{doc.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed mb-4 font-sans">
                      {doc.content}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span className="text-accent/80 font-semibold">{doc.projectId}</span>
                      <span>{formatDistanceToNow(new Date(doc.updatedAt))}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {recentDocs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground/60 border border-dashed border-border rounded-lg font-mono text-sm">
                  System dormant.
                </div>
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
             <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Weekly Synthesis</h2>
             <Card className="bg-card/40 border-border border-t-2 border-t-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <CardHeader className="pt-6">
                  <CardTitle className="text-xl text-foreground font-serif tracking-tight">The Groundlessness of Action</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs mt-2 leading-relaxed">Derived from recent entries on Cioran and existential void structures.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6 font-serif">
                    Socratech Ω suggests investigating the convergence of <span className="text-primary">Ascetic Renunciation</span> and <span className="text-accent">Nihilistic Despair</span>. While previously mapped distinctly in "Journal314", conceptual linkages reveal they may be operational variants of the same phenomenological absence.
                  </p>
                  <div className="flex">
                    <Button size="sm" variant="outline" onClick={() => onNavigate('proposals')} className="text-xs tracking-wider uppercase font-semibold h-9 border-border hover:bg-muted">
                      Initiate Protocol
                    </Button>
                  </div>
                </CardContent>
             </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
