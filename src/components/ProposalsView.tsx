import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
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

export function ProposalsView() {
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
             <h1 className="text-4xl font-serif text-foreground tracking-tight">Weekly Socratech Proposals</h1>
            <p className="text-muted-foreground text-sm tracking-wide mt-2">Automated suggestions extrapolated from identified knowledge gaps.</p>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card glass-card-hover border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 px-2 py-1 rounded shadow-[0_0_10px_rgba(138,43,226,0.2)]">Week 42</span>
                </div>
                <CardTitle className="font-serif text-2xl tracking-tight text-foreground/90">The Groundlessness of Action</CardTitle>
                <CardDescription className="text-muted-foreground/80 leading-relaxed mt-2 text-xs">Based on your recent notes on Cioran and the Void...</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-foreground/80 leading-relaxed font-sans max-w-4xl">
                  Socratech Ω suggests you explore the intersection of <strong className="text-primary font-medium">Ascetic Renunciation</strong> and <strong className="text-accent font-medium">Nihilistic Despair</strong>. While previously categorized distinctly in your Journal314 notes, recent connections imply they may be operational variants of the same phenomenological void-contact. 
                </p>
                <div className="flex gap-4 items-start bg-[#060609]/60 p-5 rounded-md border border-white/5 mt-4 shadow-inner">
                  <BookOpen className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                  <div className="space-y-2">
                    <p className="text-[10px] tracking-widest font-bold text-muted-foreground/80 uppercase">Recommended Reading</p>
                    <p className="text-sm font-sans text-muted-foreground italic">"The Trouble with Being Born" <span className="not-italic text-sm text-foreground/60">— Emil Cioran</span></p>
                    <p className="text-sm font-sans text-muted-foreground italic">"The Dark Night of the Soul" <span className="not-italic text-sm text-foreground/60">— St. John of the Cross</span></p>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button size="sm" variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 tracking-widest uppercase text-[10px] font-bold h-9">Create Draft</Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/5 tracking-widest uppercase text-[10px] font-bold h-9">Dismiss</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card border-white/5 opacity-60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 bg-white/5 border border-white/5 px-2 py-1 rounded">Week 41</span>
                </div>
                <CardTitle className="font-serif text-2xl tracking-tight text-foreground/70">Apophatic AI Capabilities</CardTitle>
                <CardDescription className="text-muted-foreground/60 leading-relaxed mt-2 text-xs">Based on your notes regarding ENPAS and formalization.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-foreground/60 leading-relaxed font-sans max-w-4xl">
                  Proposal to investigate the boundary limits of synthetic intelligence engaging in mystical literature. Can a formalized structure represent apophatic theology without fundamentally negating it?
                </p>
                <div className="pt-2">
                  <Button size="sm" variant="outline" disabled className="opacity-50 tracking-widest uppercase text-[10px] font-bold border-white/5 bg-[#060609]/50 h-9">Draft Created</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
