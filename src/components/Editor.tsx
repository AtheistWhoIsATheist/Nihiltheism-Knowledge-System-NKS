import { useState, useEffect } from 'react';
import { usePKMStore } from '@/src/store/pkmStore';
import { PKMDocument, DocumentType } from '../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
  const [conceptInput, setConceptInput] = useState('');

  useEffect(() => {
    if (existingDoc) {
      setTitle(existingDoc.title);
      setContent(existingDoc.content);
      setType(existingDoc.type);
      setProjectId(existingDoc.projectId as any);
      setConcepts(existingDoc.detectedConcepts);
    } else {
      setTitle('');
      setContent('');
      setType('note');
      setProjectId('general');
      setConcepts([]);
    }
  }, [existingDoc, documentId]);

  const handleSave = () => {
    if (!title.trim()) {
      toast('Title required', { description: 'Please enter a title for the document.' });
      return;
    }
    if (!content.trim()) {
      toast('Content required', { description: 'Document cannot be empty.' });
      return;
    }

    if (existingDoc) {
      updateDocument(existingDoc.id, { title, content, type, projectId, detectedConcepts: concepts });
      toast('Saved', { description: 'Document updated successfully.' });
    } else {
      addDocument({ title, content, type, projectId, detectedConcepts: concepts, resonanceScore: null });
      toast('Created', { description: 'New document added to PKM.' });
      onNavigate('dashboard');
    }
  };

  const handleAIEnhance = () => {
    // This would typically call a Supabase function to enhance text via Claude/Gemini
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
      if (!concepts.includes(conceptInput.trim())) {
        setConcepts([...concepts, conceptInput.trim()]);
      }
      setConceptInput('');
    }
  };

  const removeConcept = (c: string) => {
    setConcepts(concepts.filter(x => x !== c));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-muted/20 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => onNavigate('dashboard')} className="h-8 w-8 text-muted-foreground hover:text-foreground">
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
        
        <div className="mb-8 p-4 bg-muted/20 border border-border rounded-md">
          <div className="flex flex-wrap gap-2 mb-3">
            {concepts.map(c => (
              <Badge key={c} variant="secondary" className="cursor-pointer bg-card hover:bg-muted border border-border text-foreground font-mono text-[10px] uppercase tracking-widest" onClick={() => removeConcept(c)}>
                {c} <span className="ml-1 text-muted-foreground hover:text-destructive">×</span>
              </Badge>
            ))}
          </div>
          <Input 
            value={conceptInput}
            onChange={e => setConceptInput(e.target.value)}
            onKeyDown={addConcept}
            placeholder="Add concept matrix tags and press Enter..."
            className="h-8 max-w-sm bg-background border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-primary shadow-none"
          />
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
