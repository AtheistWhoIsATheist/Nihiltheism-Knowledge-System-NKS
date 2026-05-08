import { useState } from 'react';
import { usePKMStore } from '@/src/store/pkmStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, ArrowRight, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { KnowledgeGraph } from './KnowledgeGraph';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, filter: 'blur(2px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4 } }
};

export function ConnectionsView() {
  const { documents, connections } = usePKMStore();
  const [showGraph, setShowGraph] = useState(false);

  const getDoc = (id: string) => documents.find(d => d.id === id);

  if (showGraph) {
    return <KnowledgeGraph onClose={() => setShowGraph(false)} />;
  }

  return (
    <div className="flex-1 h-full bg-transparent p-4 md:p-6 lg:p-12 overflow-y-auto w-full mx-auto scroll-smooth">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-10"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-serif text-foreground tracking-tight">Synthesized Connections</h1>
            <p className="text-muted-foreground text-sm tracking-wide mt-2">Resonant links between isolated phenomenological reports.</p>
          </div>
          <Button onClick={() => setShowGraph(true)} className="bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 font-bold tracking-widest uppercase text-[10px] shadow-[0_0_15px_rgba(11,153,255,0.15)] backdrop-blur-md transition-all">
            <Network className="w-3.5 h-3.5 mr-2" /> Visualize Graph
          </Button>
        </motion.div>

        <motion.div variants={containerVariants} className="grid gap-6">
          {connections.map((conn) => {
            const source = getDoc(conn.sourceId);
            const target = getDoc(conn.targetId);

            if (!source || !target) return null;

            return (
              <motion.div variants={itemVariants} key={conn.id}>
                <Card className="glass-card border-white/5 hover:bg-white/5 transition-all">
                  <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <Badge variant="outline" className="text-foreground bg-white/5 border-white/10 truncate max-w-[200px] text-[10px] uppercase font-mono shadow-[0_0_10px_rgba(255,255,255,0.02)]">{source.title}</Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                      <Badge variant="outline" className="text-foreground bg-white/5 border-white/10 truncate max-w-[200px] text-[10px] uppercase font-mono shadow-[0_0_10px_rgba(255,255,255,0.02)]">{target.title}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex gap-4">
                      <Link2 className="w-4 h-4 text-accent/80 shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground/80 leading-relaxed font-sans">{conn.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {connections.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-12 text-muted-foreground tracking-widest text-sm uppercase">
              No inferential bridges mapped yet.
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
