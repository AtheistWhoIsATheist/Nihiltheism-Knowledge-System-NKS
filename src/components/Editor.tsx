import { useState, useEffect, useRef } from 'react';
import { usePKMStore } from '@/src/store/pkmStore';
import { PKMDocument, DocumentType } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Sparkles, Trash2, ArrowLeft, Tags, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorProps {
  documentId?: string;
  onNavigate: (view: string) => void;
}

export function Editor({ documentId, onNavigate }: EditorProps) {
  const { documents, addDocument, updateDocument, deleteDocument } = usePKMStore();
  const existingDoc = documents.find(d => d.id === documentId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<DocumentType>('note');
  const [projectId, setProjectId] = useState<'journal314' | 'ren' | 'general'>('general');
  const [concepts, setConcepts] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [conceptInput, setConceptInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (existingDoc) {
      setTitle(existingDoc.title);
      setContent(existingDoc.content);
      setType(existingDoc.type);
      setProjectId(existingDoc.projectId as any);
      setConcepts(existingDoc.detectedConcepts || []);
      setTags(existingDoc.tags || []);
    } else {
      setTitle('');
      setContent('');
      setType('note');
      setProjectId('general');
      setConcepts([]);
      setTags([]);
    }
  }, [existingDoc, documentId]);

  useEffect(() => {
    const isCurrentlyDirty = 
      title !== (existingDoc?.title || '') ||
      content !== (existingDoc?.content || '') ||
      type !== (existingDoc?.type || 'note') ||
      projectId !== (existingDoc?.projectId || 'general') ||
      JSON.stringify(concepts) !== JSON.stringify(existingDoc?.detectedConcepts || []) ||
      JSON.stringify(tags) !== JSON.stringify(existingDoc?.tags || []);
    setIsDirty(isCurrentlyDirty);
    
    if (isCurrentlyDirty && saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  }, [title, content, type, projectId, concepts, tags, existingDoc]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isDirty && existingDoc && title.trim()) {
        setSaveStatus('saving');
        updateDocument(existingDoc.id, { title, content, type, projectId, detectedConcepts: concepts, tags });
        setTimeout(() => setSaveStatus('saved'), 800);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [title, content, type, projectId, concepts, tags, isDirty, existingDoc, updateDocument]);

  const handleSave = () => {
    if (!title.trim()) {
      toast('Title required', { description: 'Please enter a title for the document.' });
      return;
    }
    if (!content.trim()) {
      toast('Content required', { description: 'Document cannot be empty.' });
      return;
    }

    setSaveStatus('saving');
    if (existingDoc) {
      updateDocument(existingDoc.id, { title, content, type, projectId, detectedConcepts: concepts, tags });
      toast('Saved', { description: 'Document updated successfully.' });
    } else {
      addDocument({ title, content, type, projectId, detectedConcepts: concepts, tags, resonanceScore: null });
      toast('Created', { description: 'New document added to PKM.' });
      onNavigate('dashboard');
    }
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const handleBackNavigation = () => {
    if (isDirty && !existingDoc) {
      setShowConfirm(true);
    } else if (isDirty && existingDoc) {
      handleSave();
      onNavigate('dashboard');
    } else {
      onNavigate('dashboard');
    }
  };

  const confirmDiscard = () => {
    setShowConfirm(false);
    onNavigate('dashboard');
  };

  const handleAIEnhance = () => {
    toast('AI Enhance', { description: 'Socratech Ω analyzing text for apophatic discipline...' });
  };

  const handleDelete = () => {
    if (existingDoc) {
      deleteDocument(existingDoc.id);
      toast('Deleted', { description: 'Document removed.' });
      onNavigate('dashboard');
    }
  };

  const addConcept = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && conceptInput.trim()) {
      if (!concepts.includes(conceptInput.trim())) setConcepts([...concepts, conceptInput.trim()]);
      setConceptInput('');
    }
  };

  const removeConcept = (c: string) => setConcepts(concepts.filter(x => x !== c));

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(x => x !== t));

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent text-foreground overflow-hidden relative">
      {/* Confirmation Dialog overlay */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0f] border border-white/10 p-6 rounded-lg shadow-xl max-w-sm w-full"
            >
              <h3 className="text-lg font-serif font-bold text-foreground mb-2">Unsaved Changes</h3>
              <p className="text-sm text-muted-foreground mb-6">You have an unsaved draft. Are you sure you want to discard it?</p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowConfirm(false)} className="text-muted-foreground">Cancel</Button>
                <Button variant="destructive" onClick={confirmDiscard}>Discard</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0 bg-[#0c0c10]/40 backdrop-blur-md z-10 glass">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBackNavigation} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
             <select 
              value={type} 
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="bg-background border border-border rounded-md text-sm px-2 py-1 text-foreground focus:outline-none focus:border-primary uppercase tracking-widest font-mono text-[10px]"
            >
              <option value="note">Note</option>
              <option value="essay">Essay</option>
              <option value="prompt">Prompt</option>
            </select>
            <select 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value as any)}
              className="bg-background border border-border rounded-md text-sm px-2 py-1 text-foreground focus:outline-none focus:border-primary uppercase tracking-widest font-mono text-[10px]"
            >
              <option value="general">General</option>
              <option value="journal314">Journal314</option>
              <option value="ren">REN</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.span 
                key="saving"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-[10px] text-muted-foreground uppercase tracking-widest mr-2 animate-pulse flex items-center"
              >
                Autosaving...
              </motion.span>
            )}
            {saveStatus === 'saved' && (
              <motion.span 
                key="saved"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-[10px] text-primary/80 uppercase tracking-widest mr-2 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Saved
              </motion.span>
            )}
          </AnimatePresence>

          {existingDoc && (
             <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 uppercase tracking-widest text-[10px] px-2 md:px-3">
               <Trash2 className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden md:inline">Delete</span>
             </Button>
          )}
          <Button variant="secondary" size="sm" onClick={handleAIEnhance} className="bg-muted hover:bg-muted/80 text-foreground uppercase tracking-widest text-[10px] px-2 md:px-3">
            <Sparkles className="h-3.5 w-3.5 md:mr-2 text-primary" /> <span className="hidden md:inline">Enhance</span>
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest text-[10px] px-2 md:px-3">
            <Save className="h-3.5 w-3.5 md:mr-2" /> <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Document Title..." 
          className="text-4xl md:text-5xl font-bold font-serif border-0 bg-transparent px-0 focus-visible:ring-0 mb-8 text-foreground placeholder:text-muted focus-visible:ring-offset-0 leading-tight"
        />
        
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-[#0a0a0f]/50 border border-white/5 rounded-md glass-card">
            <div className="mb-2 text-[10px] tracking-widest text-muted-foreground/80 uppercase font-bold flex items-center">
              <Sparkles className="w-3 h-3 mr-1.5" /> Concepts
            </div>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
              <AnimatePresence>
                {concepts.map(c => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Badge variant="secondary" className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-foreground font-mono text-[10px] uppercase tracking-widest transition-colors" onClick={() => removeConcept(c)}>
                      {c} <span className="ml-1 text-muted-foreground hover:text-destructive">×</span>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Input 
              value={conceptInput}
              onChange={e => setConceptInput(e.target.value)}
              onKeyDown={addConcept}
              placeholder="Add concept matrix tags..."
              className="h-8 w-full bg-white/5 border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
            />
          </div>

          <div className="p-4 bg-[#0a0a0f]/50 border border-white/5 rounded-md glass-card">
            <div className="mb-2 text-[10px] tracking-widest text-muted-foreground/80 uppercase font-bold flex items-center">
              <Tags className="w-3 h-3 mr-1.5" /> Tags
            </div>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
              <AnimatePresence>
                {tags.map(t => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Badge variant="outline" className="cursor-pointer bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary font-mono text-[10px] uppercase tracking-widest transition-colors" onClick={() => removeTag(t)}>
                      {t} <span className="ml-1 text-primary/50 hover:text-destructive">×</span>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Input 
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add semantic tags..."
              className="h-8 w-full bg-white/5 border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        <Textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin the sequence..."
          className="min-h-[60vh] border-0 bg-transparent px-0 focus-visible:ring-0 resize-none text-lg md:text-xl leading-relaxed text-foreground/90 font-serif placeholder:text-muted-foreground/50 focus-visible:ring-offset-0 shadow-none"
        />
      </div>
    </div>
  );
}
