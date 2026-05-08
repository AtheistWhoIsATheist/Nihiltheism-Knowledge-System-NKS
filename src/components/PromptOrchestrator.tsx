import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Edit2, Play, Search, Network, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { SOCRATECH_OMEGA_PROMPT } from "../constants/socratech-omega";
import { ONTOLOGY_GENERATOR_PROMPT } from "../constants/ontology-generator";
import { PHILOSOPHICAL_ANALYST_PROMPT } from "../constants/philosophical-analyst";
import { AGENT_BUILDER_PROMPT } from "../constants/agent-builder";
import { AGENT_ORCHESTRATION_PROMPT } from "../constants/agent-orchestration";
import { FRONTEND_DESIGN_PROMPT } from "../constants/frontend-design";
import { THREEJS_SKILLS_PROMPT } from "../constants/threejs-skills";
import { ELITE_SOFTWARE_ARCHITECT_PROMPT } from "../constants/elite-software-architect";
import { SENIOR_ENGINEERING_EXECUTION_PROMPT } from "../constants/senior-engineering-execution";
import { FILE_INGESTION_SYSTEM_PROMPT } from "../constants/file-ingestion-system";

export type StoredPrompt = {
  id: string;
  name: string;
  content: string;
  tags: string[];
  createdAt: string;
};

const DEFAULT_PROMPTS: StoredPrompt[] = [
  { id: "p-1", name: "Socratech Omega", content: SOCRATECH_OMEGA_PROMPT, tags: ["system", "core"], createdAt: new Date().toISOString() },
  { id: "p-2", name: "Ontology Generator", content: ONTOLOGY_GENERATOR_PROMPT, tags: ["graph", "infranodus"], createdAt: new Date().toISOString() },
  { id: "p-3", name: "Philosophical Analyst", content: PHILOSOPHICAL_ANALYST_PROMPT, tags: ["analysis", "philosophy"], createdAt: new Date().toISOString() },
  { id: "p-4", name: "Agent Builder", content: AGENT_BUILDER_PROMPT, tags: ["ai", "agents"], createdAt: new Date().toISOString() },
  { id: "p-5", name: "Agent Orchestration", content: AGENT_ORCHESTRATION_PROMPT, tags: ["ai", "orchestrator"], createdAt: new Date().toISOString() },
  { id: "p-6", name: "Frontend Design", content: FRONTEND_DESIGN_PROMPT, tags: ["ui", "design"], createdAt: new Date().toISOString() },
  { id: "p-7", name: "Three.js Skills", content: THREEJS_SKILLS_PROMPT, tags: ["3d", "webgl"], createdAt: new Date().toISOString() },
  { id: "p-8", name: "Elite Architect", content: ELITE_SOFTWARE_ARCHITECT_PROMPT, tags: ["code", "architecture"], createdAt: new Date().toISOString() },
  { id: "p-9", name: "Sr Engineer Exec", content: SENIOR_ENGINEERING_EXECUTION_PROMPT, tags: ["code", "execution"], createdAt: new Date().toISOString() },
  { id: "p-10", name: "File Ingestion", content: FILE_INGESTION_SYSTEM_PROMPT, tags: ["system", "data"], createdAt: new Date().toISOString() },
];

const STORAGE_KEY = "nihiltheism-prompt-storage-v1";

interface PromptOrchestratorProps {
  onSelectPrompt: (content: string) => void;
  currentSystemPrompt: string;
}

export function PromptOrchestrator({ onSelectPrompt, currentSystemPrompt }: PromptOrchestratorProps) {
  const [prompts, setPrompts] = useState<StoredPrompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<StoredPrompt | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setPrompts(DEFAULT_PROMPTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROMPTS));
    } else {
      setPrompts(JSON.parse(saved));
    }
  }, []);

  const savePrompt = () => {
    if (!editingPrompt || !editingPrompt.name.trim() || !editingPrompt.content.trim()) {
      toast.error("Name and content are required.");
      return;
    }
    let updated: StoredPrompt[];
    if (prompts.some((p) => p.id === editingPrompt.id)) {
      updated = prompts.map((p) => p.id === editingPrompt.id ? editingPrompt : p);
    } else {
      updated = [{ ...editingPrompt, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...prompts];
    }
    setPrompts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setEditingPrompt(null);
    toast.success("Prompt saved.");
  };

  const deletePrompt = (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success("Prompt deleted.");
  };

  const filteredPrompts = prompts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {editingPrompt ? (
        <div className="flex flex-col space-y-3 p-3 neumorphic-inner border border-white/5 rounded-lg animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 duration-200 shadow-inner">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">{editingPrompt.id ? "Edit Prompt" : "New Prompt"}</h4>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setEditingPrompt(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Input 
            value={editingPrompt.name} 
            onChange={(e) => setEditingPrompt({...editingPrompt, name: e.target.value})}
            placeholder="Prompt Name"
            className="h-8 text-xs bg-[#060609]/80 border-white/10 text-foreground"
          />
          <Input 
            value={editingPrompt.tags.join(", ")} 
            onChange={(e) => setEditingPrompt({...editingPrompt, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
            placeholder="Tags (comma-separated)"
            className="h-8 text-xs bg-[#060609]/80 border-white/10 text-foreground"
          />
          <Textarea 
            value={editingPrompt.content} 
            onChange={(e) => setEditingPrompt({...editingPrompt, content: e.target.value})}
            placeholder="System prompt instructions..."
            className="min-h-[150px] text-[11px] font-mono bg-[#060609]/80 border-white/10 resize-y text-foreground/80 leading-relaxed"
          />
          <Button size="sm" onClick={savePrompt} className="w-full text-[10px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-[0_0_10px_rgba(138,43,226,0.5)]">
            Save Prompt
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-xs bg-[#060609]/80 border-white/5 focus-visible:ring-primary shadow-inner text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-[10px] font-bold uppercase tracking-widest border-dashed border-white/20 bg-transparent opacity-70 hover:opacity-100 hover:bg-white/5 hover:border-white/30"
            onClick={() => setEditingPrompt({ id: "", name: "", content: "", tags: [], createdAt: "" })}
          >
            <Plus className="mr-2 h-3 w-3" /> Create Custom Prompt
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-[0_0_10px_rgba(138,43,226,0.2)] transition-all"
            onClick={() => {
              if (currentSystemPrompt) {
                setEditingPrompt({ id: "", name: "Extracted State", content: currentSystemPrompt, tags: ["session"], createdAt: "" });
              } else {
                toast.error("No active system prompt to save.");
              }
            }}
          >
            <Network className="mr-2 h-3 w-3" /> Save Current Session Prompt
          </Button>

          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-3 pb-4 pt-1">
              {filteredPrompts.map(prompt => (
                <div key={prompt.id} className="group relative flex flex-col p-3 rounded-xl border border-white/5 glass-card glass-card-hover transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-wide truncate pr-2 text-foreground/90">{prompt.name}</span>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setEditingPrompt(prompt)}>
                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deletePrompt(prompt.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {prompt.tags.map(tag => (
                         <span key={tag} className="text-[9px] uppercase tracking-wider font-mono text-muted-foreground/80 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded text-left">
                           {tag}
                         </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-1">
                    <Button 
                      size="sm" 
                      variant="default"
                      className="h-7 flex-1 text-[10px] uppercase font-bold tracking-widest bg-white/10 hover:bg-white/20 text-foreground"
                      onClick={() => onSelectPrompt(prompt.content)}
                    >
                      <Play className="mr-1.5 h-3 w-3" /> Replace
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="h-7 flex-1 text-[10px] uppercase font-bold tracking-widest bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                      onClick={() => onSelectPrompt(currentSystemPrompt + "\n\n" + prompt.content)}
                    >
                      <Plus className="mr-1.5 h-3 w-3" /> Append
                    </Button>
                  </div>
                </div>
              ))}
              {filteredPrompts.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-8">
                  No prompts found.
                </div>
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
