import { usePKMStore } from '@/src/store/pkmStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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

  const getDoc = (id: string) => documents.find(d => d.id === id);

  return (
    <div className="flex-1 h-full bg-background p-4 md:p-6 lg:p-12 overflow-y-auto w-full mx-auto scroll-smooth">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-10"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-serif text-foreground tracking-tight">Synthesized Connections</h1>
            <p className="text-muted-foreground text-sm tracking-wide mt-2">Resonant links between isolated phenomenological reports.</p>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid gap-6">
          {connections.map((conn) => {
            const source = getDoc(conn.sourceId);
            const target = getDoc(conn.targetId);

            if (!source || !target) return null;

            return (
              <motion.div variants={itemVariants} key={conn.id}>
                <Card className="border-border bg-card/60 hover:bg-card transition-colors">
                  <CardHeader className="pb-3 border-b border-border">
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <Badge variant="outline" className="text-foreground bg-background border-border truncate max-w-[200px] text-xs font-mono">{source.title}</Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Badge variant="outline" className="text-foreground bg-background border-border truncate max-w-[200px] text-xs font-mono">{target.title}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex gap-4">
                      <Link2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-base text-foreground/80 leading-relaxed font-serif">{conn.description}</p>
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
