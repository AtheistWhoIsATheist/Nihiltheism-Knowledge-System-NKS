import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Brain,
  Copy,
  Download,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  User,
  MenuSquare,
  X,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { SOCRATECH_OMEGA_PROMPT } from "../constants/socratech-omega";
import { PromptOrchestrator } from "./PromptOrchestrator";

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type ChatThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  model: string;
  includeContext: boolean;
  systemPrompt: string;
  messages: ChatMessage[];
};

const THREAD_STORAGE_KEY = "nihiltheism-ultra-chat-threads";
const ACTIVE_THREAD_STORAGE_KEY = "nihiltheism-ultra-chat-active-thread";

const AVAILABLE_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "anthropic/claude-3.5-sonnet",
];

const DEFAULT_SYSTEM_PROMPT = SOCRATECH_OMEGA_PROMPT;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const createNewThread = (): ChatThread => {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: "Untitled Session",
    createdAt: now,
    updatedAt: now,
    model: AVAILABLE_MODELS[0],
    includeContext: true,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    messages: [
      {
        id: createId(),
        role: "assistant",
        content:
          "Welcome to the Ultra-Supreme Nihiltheistic Chat Interface. Ask anything, attach your research assumptions, and I'll reason with rigor.",
        createdAt: now,
      },
    ],
  };
};

const estimateTokens = (text: string) => Math.ceil(text.trim().length / 4);

export default function NihiltheismEngine() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [mobileView, setMobileView] = useState<'chat' | 'threads' | 'controls'>('chat');
  const [inputMode, setInputMode] = useState<'write' | 'preview'>('write');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedThreads = localStorage.getItem(THREAD_STORAGE_KEY);
    const savedActiveThread = localStorage.getItem(ACTIVE_THREAD_STORAGE_KEY);

    if (!savedThreads) {
      const starterThread = createNewThread();
      setThreads([starterThread]);
      setActiveThreadId(starterThread.id);
      return;
    }

    const parsedThreads: ChatThread[] = JSON.parse(savedThreads);
    if (!parsedThreads.length) {
      const starterThread = createNewThread();
      setThreads([starterThread]);
      setActiveThreadId(starterThread.id);
      return;
    }

    setThreads(parsedThreads);
    const activeExists = parsedThreads.some((thread) => thread.id === savedActiveThread);
    setActiveThreadId(activeExists ? savedActiveThread ?? parsedThreads[0].id : parsedThreads[0].id);
  }, []);

  useEffect(() => {
    if (!threads.length) return;
    localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (!activeThreadId) return;
    localStorage.setItem(ACTIVE_THREAD_STORAGE_KEY, activeThreadId);
  }, [activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadId, threads]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId),
    [threads, activeThreadId],
  );

  const updateActiveThread = (updater: (thread: ChatThread) => ChatThread) => {
    setThreads((prev) => prev.map((thread) => (thread.id === activeThreadId ? updater(thread) : thread)));
  };

  const createThread = () => {
    const newThread = createNewThread();
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  };

  const deleteThread = (threadId: string) => {
    if (threads.length === 1) {
      toast("Cannot delete", {
        description: "Keep at least one thread active.",
      });
      return;
    }

    const updatedThreads = threads.filter((thread) => thread.id !== threadId);
    setThreads(updatedThreads);
    if (activeThreadId === threadId) {
      setActiveThreadId(updatedThreads[0].id);
    }
  };

  const sendMessage = async (overridePrompt?: string) => {
    if (!activeThread || isSending) return;

    const userText = (overridePrompt ?? input).trim();
    if (!userText) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    };

    const optimisticMessages = [...activeThread.messages, userMessage];
    updateActiveThread((thread) => ({
      ...thread,
      title: thread.messages.length <= 1 ? userText.slice(0, 48) : thread.title,
      updatedAt: new Date().toISOString(),
      messages: optimisticMessages,
    }));

    setInput("");
    setIsSending(true);

    try {
      const payloadMessages = optimisticMessages
        .filter((message) => message.role !== "system")
        .map((message) => ({ role: message.role, content: message.content }));

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: payloadMessages,
          model: activeThread.model,
          includeContext: activeThread.includeContext,
          systemPrompt: activeThread.systemPrompt,
        },
      });

      if (error) {
        throw error;
      }

      const assistantContent =
        data?.choices?.[0]?.message?.content ??
        "No response payload received. Please check your model credentials and edge function logs.";

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: assistantContent,
        createdAt: new Date().toISOString(),
      };

      updateActiveThread((thread) => ({
        ...thread,
        updatedAt: new Date().toISOString(),
        messages: [...thread.messages, assistantMessage],
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown chat error";
      toast("Send failed", {
        description: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const regenerateLastResponse = async () => {
    if (!activeThread) return;

    const lastUserMessage = [...activeThread.messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) {
      toast("No user prompt", { description: "Send a prompt before regenerating." });
      return;
    }

    updateActiveThread((thread) => ({
      ...thread,
      messages: thread.messages.filter((message) => message.role !== "assistant" || message.id !== thread.messages.at(-1)?.id),
    }));

    await sendMessage(lastUserMessage.content);
  };

  const exportThreadMarkdown = () => {
    if (!activeThread) return;

    const markdown = [`# ${activeThread.title}`, "", `Model: ${activeThread.model}`, ""];
    for (const message of activeThread.messages) {
      markdown.push(`## ${message.role.toUpperCase()}`);
      markdown.push(message.content);
      markdown.push("");
    }

    const blob = new Blob([markdown.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeThread.title.toLowerCase().replace(/\s+/g, "-") || "thread"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyLastAssistantMessage = async () => {
    if (!activeThread) return;
    const lastAssistant = [...activeThread.messages].reverse().find((message) => message.role === "assistant");
    if (!lastAssistant) return;
    await navigator.clipboard.writeText(lastAssistant.content);
    toast("Copied", { description: "Last assistant response copied to clipboard." });
  };

  if (!activeThread) {
    return <div className="min-h-screen bg-background" />;
  }

  const promptTokens = estimateTokens(input);

  return (
    <>
      <Toaster theme="dark" />
      <div className="flex-1 h-full bg-transparent text-foreground p-0 md:p-4 lg:p-6 overflow-hidden">
        <div className="mx-auto h-full max-w-[1600px] flex md:grid gap-4 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr_auto]">
          {/* Threads Sidebar */}
          <div className={cn(
            "glass-card border-white/5 overflow-hidden flex-col md:flex rounded-none md:rounded-xl md:border",
            mobileView === 'threads' ? "flex flex-1" : "hidden md:flex"
          )}>
            <CardHeader className="pb-4 shrink-0 cerebral-smoke border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground font-serif">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  Ultra Chat Sessions
                </CardTitle>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('chat')}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground/80 tracking-wide text-xs">Persistent conversation memory and fast context switching.</CardDescription>
              <Button onClick={() => { createThread(); setMobileView('chat'); }} className="w-full mt-3 font-bold tracking-widest text-[10px] uppercase bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                <MessageSquarePlus className="mr-2 h-3.5 w-3.5" /> New Session
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 bg-transparent">
              <ScrollArea className="h-full px-6">
                <div className="space-y-3 pb-6 pt-4">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => { setActiveThreadId(thread.id); setMobileView('chat'); }}
                      className={`w-full rounded-xl border p-3 text-left transition-all duration-300 ${
                        thread.id === activeThreadId
                          ? "border-primary/40 bg-primary/10 shadow-[0_0_15px_rgba(138,43,226,0.15)]"
                          : "border-white/5 bg-[#060609]/40 hover:bg-[#121218]/80 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold tracking-wide truncate">{thread.title}</p>
                        <Trash2
                          className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteThread(thread.id);
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(thread.updatedAt).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </div>

          {/* Main Chat Interface */}
          <div className={cn(
            "glass-card border-white/5 overflow-hidden flex-col flex-1 rounded-none md:rounded-xl border-x-0 border-y-0 md:border",
            mobileView === 'chat' ? "flex" : "hidden md:flex"
          )}>
            <CardHeader className="pb-3 shrink-0 px-4 md:px-6 cerebral-smoke border-b border-white/5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2 hover:bg-white/5" onClick={() => setMobileView('threads')}>
                    <MenuSquare className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl font-serif text-foreground tracking-tight">Ultra-Supreme Nihiltheistic Interface</CardTitle>
                    <CardDescription className="tracking-wide hidden sm:block text-muted-foreground/80 text-xs">
                      Elite pro-user chat flow with model control, context memory, and fast export.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={copyLastAssistantMessage} className="hidden sm:flex bg-white/5 hover:bg-white/10 text-foreground border-white/5">
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                   <Button size="icon" variant="secondary" onClick={copyLastAssistantMessage} className="sm:hidden h-8 w-8 bg-white/5 hover:bg-white/10 text-foreground border-white/5">
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button size="sm" variant="secondary" onClick={exportThreadMarkdown} className="hidden sm:flex bg-white/5 hover:bg-white/10 text-foreground border-white/5">
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                  <Button size="icon" variant="secondary" onClick={exportThreadMarkdown} className="sm:hidden h-8 w-8 bg-white/5 hover:bg-white/10 text-foreground border-white/5">
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button size="sm" variant="secondary" onClick={regenerateLastResponse} disabled={isSending} className="hidden sm:flex bg-white/5 hover:bg-white/10 text-foreground border-white/5">
                    <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                  </Button>
                  <Button size="icon" variant="secondary" onClick={regenerateLastResponse} disabled={isSending} className="sm:hidden h-8 w-8 bg-white/5 hover:bg-white/10 text-foreground border-white/5">
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => { setIsRightPanelOpen((prev) => !prev); setMobileView('controls'); }} className="hidden lg:flex border-primary/20 text-primary hover:bg-primary/10">
                    <Settings2 className="h-4 w-4 mr-1" /> Controls
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMobileView('controls')} className="lg:hidden flex border-primary/20 text-primary hover:bg-primary/10">
                    <Settings2 className="h-4 w-4 mr-1" /> Controls
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex-1 flex flex-col overflow-hidden px-4 md:px-6 bg-transparent">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-6 pb-4 pt-6">
                  {activeThread.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[100%] md:max-w-[85%] rounded-xl px-5 py-4 border shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${
                          message.role === "user"
                            ? "neumorphic-dark border-primary/20 rounded-tr-sm"
                            : "glass border-white/5 rounded-tl-sm"
                        }`}
                      >
                        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
                          {message.role === "user" ? <User className="h-3.5 w-3.5 text-primary/80" /> : <Bot className="h-3.5 w-3.5 text-foreground/80" />}
                          {message.role}
                        </div>
                        <div className={cn(
                          "text-sm leading-relaxed font-sans prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#060609]/80 prose-pre:border prose-pre:border-white/5"
                        )}>
                          {message.role === "assistant" || message.role === "user" ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap font-serif">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="mt-auto space-y-3 shrink-0 pb-2">
                <div className="relative rounded-xl overflow-hidden neumorphic-inner border border-white/5 focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/40 transition-all flex flex-col shadow-inner">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060609]/80 border-b border-white/5 shrink-0">
                    <button onClick={() => setInputMode('write')} className={cn("text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded transition-colors", inputMode === 'write' ? "bg-white/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>Write</button>
                    <button onClick={() => setInputMode('preview')} className={cn("text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded transition-colors", inputMode === 'preview' ? "bg-white/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>Preview</button>
                  </div>
                  {inputMode === 'write' ? (
                    <Textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                          event.preventDefault();
                          void sendMessage();
                        }
                      }}
                      placeholder="Compose prompt using markdown... (Cmd+Enter)"
                      className="min-h-[80px] max-h-[200px] bg-transparent border-0 placeholder:text-muted-foreground/40 font-sans resize-none shadow-none focus-visible:ring-0 text-base md:text-sm p-4 text-foreground/90"
                    />
                  ) : (
                    <div className="min-h-[80px] max-h-[200px] overflow-y-auto p-4 text-sm text-foreground bg-transparent prose prose-sm prose-invert max-w-none">
                      {input ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{input}</ReactMarkdown> : <span className="text-muted-foreground/40 italic font-serif">Engage the void...</span>}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="border-white/10 bg-[#060609]/50 text-[10px] uppercase tracking-widest font-mono hidden xs:inline-flex text-foreground/70">~{promptTokens} tok</Badge>
                    <Badge variant="outline" className="border-white/10 bg-[#060609]/50 text-[10px] uppercase tracking-widest font-mono text-foreground/70">{activeThread.model.split('/').pop()}</Badge>
                    {activeThread.includeContext && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-widest mt-0 hidden sm:inline-flex shadow-[0_0_10px_rgba(138,43,226,0.1)]">Vault On</Badge>}
                  </div>
                  <Button 
                    onClick={() => void sendMessage()} 
                    disabled={isSending || !input.trim()} 
                    className="font-bold tracking-widest uppercase text-[10px] h-9 ml-auto shrink-0 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(138,43,226,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                  >
                    {isSending ? <RefreshCw className="h-4 w-4 md:mr-2 animate-spin" /> : <Send className="h-4 w-4 md:mr-2" />}
                    <span className="hidden md:inline">Send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Right Panel Controls */}
          {(isRightPanelOpen || mobileView === 'controls') && (
            <div className={cn(
              "glass-card border-white/5 w-full lg:w-[300px] overflow-hidden flex-col rounded-none lg:rounded-xl",
              mobileView === 'controls' ? "flex flex-1 border-x-0" : "hidden lg:flex"
            )}>
              <CardHeader className="shrink-0 flex flex-row items-center justify-between pb-4 lg:pb-6 cerebral-smoke border-b border-white/5">
                <CardTitle className="text-base font-serif flex items-center gap-2 text-foreground">
                  <Brain className="h-4 w-4 text-primary" /> Pro Controls
                </CardTitle>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setMobileView('chat')}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-4 bg-transparent">
                <Tabs defaultValue="model" className="space-y-4">
                  <TabsList className="grid grid-cols-2 bg-[#060609]/60 p-1 glass">
                    <TabsTrigger value="model" className="data-[state=active]:bg-white/10 text-xs uppercase tracking-widest font-bold">Runtime</TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-white/10 text-xs uppercase tracking-widest font-bold">System</TabsTrigger>
                  </TabsList>

                  <TabsContent value="model" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-foreground text-xs uppercase tracking-widest font-bold">Model</Label>
                      <select
                        id="model"
                        value={activeThread.model}
                        onChange={(event) =>
                          updateActiveThread((thread) => ({ ...thread, model: event.target.value }))
                        }
                        className="w-full h-10 rounded-md border border-white/5 bg-[#060609]/80 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-none"
                      >
                        {AVAILABLE_MODELS.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-white/5 p-4 bg-[#0a0a0f]/50 glass-card">
                      <div>
                        <p className="text-sm font-bold tracking-wide text-foreground">Include vault context</p>
                        <p className="text-xs text-muted-foreground mt-1">Inject notes + tags into system context.</p>
                      </div>
                      <Switch
                        checked={activeThread.includeContext}
                        onCheckedChange={(checked) =>
                          updateActiveThread((thread) => ({ ...thread, includeContext: checked }))
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="system" className="space-y-3 flex flex-col h-full overflow-hidden">
                    <Label htmlFor="system" className="text-foreground text-xs uppercase tracking-widest font-bold">System Prompt</Label>
                    <Textarea
                      id="system"
                      value={activeThread.systemPrompt}
                      onChange={(event) =>
                        updateActiveThread((thread) => ({ ...thread, systemPrompt: event.target.value }))
                      }
                      className="min-h-[120px] max-h-[300px] shrink-0 bg-[#060609]/80 border-white/5 text-[11px] leading-relaxed shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] font-mono text-muted-foreground focus-visible:ring-primary"
                    />
                    <div className="flex-1 overflow-hidden mt-2">
                       <PromptOrchestrator 
                          currentSystemPrompt={activeThread.systemPrompt}
                          onSelectPrompt={(content) => updateActiveThread(t => ({...t, systemPrompt: content}))} 
                       />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

