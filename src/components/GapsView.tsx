import { usePKMStore } from '@/src/store/pkmStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, CircleDashed, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export function GapsView() {
  const { gaps } = usePKMStore();

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
            <h1 className="text-4xl font-serif text-foreground tracking-tight">Knowledge Gaps</h1>
            <p className="text-muted-foreground text-sm tracking-wide mt-2">Philosophical anomalies and unresolved aporias.</p>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid gap-6">
          {gaps.map((gap) => (
            <motion.div variants={itemVariants} key={gap.id}>
              <Card className="glass-card border-white/5 hover:bg-white/5 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl leading-tight font-serif text-foreground/90">{gap.title}</CardTitle>
                    <Badge variant={gap.status === 'open' ? 'destructive' : gap.status === 'investigating' ? 'default' : 'secondary'} className="capitalize shrink-0 text-[10px] tracking-widest uppercase shadow-[0_0_10px_rgba(255,59,59,0.2)]">
                      {gap.status === 'open' ? <CircleDashed className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {gap.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground/80 leading-relaxed font-sans">{gap.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    {gap.recommendedAuthors.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          <Users className="w-3 h-3 mr-2" /> Recommended Thinkers
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gap.recommendedAuthors.map(author => (
                            <Badge key={author} variant="outline" className="bg-accent/5 text-accent border-accent/20 tracking-wider text-[10px] uppercase font-mono">{author}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {gap.recommendedBooks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                          <BookOpen className="w-3 h-3 mr-2" /> Key Texts
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gap.recommendedBooks.map(book => (
                            <Badge key={book} variant="outline" className="bg-primary/5 text-primary border-primary/20 tracking-wider text-[10px] uppercase font-mono">{book}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button size="sm" variant="ghost" className="text-foreground border border-white/10 hover:bg-white/10 font-bold text-[10px] uppercase tracking-widest">Start Investigation</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {gaps.length === 0 && (
            <motion.div variants={itemVariants} className="text-center py-12 text-muted-foreground tracking-widest text-sm uppercase">
              No contradictions detected.
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
