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
    <div className="flex-1 h-full bg-background p-4 md:p-6 lg:p-12 overflow-y-auto w-full mx-auto scroll-smooth">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-10"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-serif text-foreground tracking-tight">Knowledge Gaps</h1>
            <p className="text-muted-foreground text-sm tracking-wide mt-2">Philosophical anomalies and unresolved aporias.</p>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid gap-6">
          {gaps.map((gap) => (
            <motion.div variants={itemVariants} key={gap.id}>
              <Card className="border-border bg-card/60 hover:bg-card transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl leading-tight font-serif text-foreground">{gap.title}</CardTitle>
                    <Badge variant={gap.status === 'open' ? 'destructive' : gap.status === 'investigating' ? 'default' : 'secondary'} className="capitalize shrink-0 text-xs tracking-widest">
                      {gap.status === 'open' ? <CircleDashed className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {gap.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base text-foreground/80 leading-relaxed font-serif">{gap.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                    {gap.recommendedAuthors.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          <Users className="w-3 h-3 mr-2" /> Recommended Thinkers
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gap.recommendedAuthors.map(author => (
                            <Badge key={author} variant="outline" className="bg-background text-accent border-accent/30 tracking-wide text-xs">{author}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {gap.recommendedBooks.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                          <BookOpen className="w-3 h-3 mr-2" /> Key Texts
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gap.recommendedBooks.map(book => (
                            <Badge key={book} variant="outline" className="bg-background text-primary border-primary/30 tracking-wide text-xs">{book}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button size="sm" variant="outline" className="text-foreground border-border hover:bg-muted font-medium text-xs uppercase tracking-widest">Start Investigation</Button>
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
