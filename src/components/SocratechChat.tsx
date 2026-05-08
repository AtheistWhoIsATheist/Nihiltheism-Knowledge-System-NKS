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
  X
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
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
      <div className="flex-1 h-full bg-background text-foreground p-0 md:p-4 lg:p-6 overflow-hidden">
        <div className="mx-auto h-full max-w-[1600px] flex md:grid gap-4 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr_auto]">
          {/* Threads Sidebar */}
          <Card className={cn(
            "border-border bg-card/70 backdrop-blur-md overflow-hidden flex-col md:flex rounded-none md:rounded-lg border-x-0 md:border-x",
            mobileView === 'threads' ? "flex flex-1" : "hidden md:flex"
          )}>
            <CardHeader className="pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Ultra Chat Sessions
                </CardTitle>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('chat')}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground tracking-wide">Persistent conversation memory and fast context switching.</CardDescription>
              <Button onClick={() => { createThread(); setMobileView('chat'); }} className="w-full mt-2 font-medium tracking-wide">
                <MessageSquarePlus className="mr-2 h-4 w-4" /> New Session
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-6">
                <div className="space-y-2 pb-6">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => { setActiveThreadId(thread.id); setMobileView('chat'); }}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        thread.id === activeThreadId
                          ? "border-primary bg-primary/10 hover:bg-primary/15"
                          : "border-border bg-card hover:bg-muted/50"
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
          </Card>

          {/* Main Chat Interface */}
          <Card className={cn(
            "border-border bg-card/70 backdrop-blur-md overflow-hidden flex-col flex-1 rounded-none md:rounded-lg border-x-0 border-y-0 md:border-x md:border-y",
            mobileView === 'chat' ? "flex" : "hidden md:flex"
          )}>
            <CardHeader className="pb-3 shrink-0 px-4 md:px-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setMobileView('threads')}>
                    <MenuSquare className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <div>
                    <CardTitle className="text-xl font-serif">Ultra-Supreme Nihiltheistic Interface</CardTitle>
                    <CardDescription className="tracking-wide hidden sm:block">
                      Elite pro-user chat flow with model control, context memory, and fast export.
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button size="sm" variant="secondary" onClick={copyLastAssistantMessage} className="hidden sm:flex">
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                   <Button size="icon" variant="secondary" onClick={copyLastAssistantMessage} className="sm:hidden h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  
                  <Button size="sm" variant="secondary" onClick={exportThreadMarkdown} className="hidden sm:flex">
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                  <Button size="icon" variant="secondary" onClick={exportThreadMarkdown} className="sm:hidden h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button size="sm" variant="secondary" onClick={regenerateLastResponse} disabled={isSending} className="hidden sm:flex">
                    <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                  </Button>
                  <Button size="icon" variant="secondary" onClick={regenerateLastResponse} disabled={isSending} className="sm:hidden h-8 w-8">
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => { setIsRightPanelOpen((prev) => !prev); setMobileView('controls'); }} className="hidden lg:flex">
                    <Settings2 className="h-4 w-4 mr-1" /> Controls
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMobileView('controls')} className="lg:hidden flex">
                    <Settings2 className="h-4 w-4 mr-1" /> Controls
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator className="bg-border" />
            <CardContent className="pt-4 flex-1 flex flex-col overflow-hidden px-4 md:px-6">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pb-4">
                  {activeThread.messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 border ${
                          message.role === "user"
                            ? "bg-primary/10 border-primary/20"
                            : "bg-muted/30 border-border"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                          {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                          {message.role}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-serif text-foreground/90">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="mt-auto space-y-3 shrink-0 pb-2">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Compose prompt... (Cmd+Enter)"
                  className="min-h-[80px] max-h-[160px] bg-background border-border placeholder:text-muted-foreground/50 font-serif resize-none shadow-none focus-visible:ring-primary text-base md:text-sm"
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="outline" className="border-border bg-background text-[10px] uppercase tracking-widest font-mono hidden xs:inline-flex">~{promptTokens} tok</Badge>
                    <Badge variant="outline" className="border-border bg-background text-[10px] uppercase tracking-widest font-mono">{activeThread.model.split('/').pop()}</Badge>
                    {activeThread.includeContext && <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] uppercase tracking-widest mt-0 hidden sm:inline-flex">Vault On</Badge>}
                  </div>
                  <Button onClick={() => void sendMessage()} disabled={isSending || !input.trim()} className="font-semibold tracking-wide uppercase text-xs h-9 ml-auto shrink-0">
                    {isSending ? <RefreshCw className="h-4 w-4 md:mr-2 animate-spin" /> : <Send className="h-4 w-4 md:mr-2" />}
                    <span className="hidden md:inline">Send</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel Controls */}
          {(isRightPanelOpen || mobileView === 'controls') && (
            <Card className={cn(
              "w-full lg:w-[300px] border-border bg-card/70 backdrop-blur-md overflow-hidden flex-col rounded-none lg:rounded-lg",
              mobileView === 'controls' ? "flex flex-1 border-x-0" : "hidden lg:flex"
            )}>
              <CardHeader className="shrink-0 flex flex-row items-center justify-between pb-4 lg:pb-6">
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Brain className="h-4 w-4 text-mystic-purple" /> Pro Controls
                </CardTitle>
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setMobileView('chat')}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <Tabs defaultValue="model" className="space-y-4">
                  <TabsList className="grid grid-cols-2 bg-muted/40 p-1">
                    <TabsTrigger value="model" className="data-[state=active]:bg-background text-xs uppercase tracking-widest font-bold">Runtime</TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-background text-xs uppercase tracking-widest font-bold">System</TabsTrigger>
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
                        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-none"
                      >
                        {AVAILABLE_MODELS.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
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

                  <TabsContent value="system" className="space-y-3">
                    <Label htmlFor="system" className="text-foreground text-xs uppercase tracking-widest font-bold">System Prompt</Label>
                    <Textarea
                      id="system"
                      value={activeThread.systemPrompt}
                      onChange={(event) =>
                        updateActiveThread((thread) => ({ ...thread, systemPrompt: event.target.value }))
                      }
                      className="min-h-[200px] h-[30vh] max-h-[500px] bg-background border-border text-sm leading-relaxed shadow-none resize-none font-mono text-muted-foreground"
                    />
                    <div className="grid grid-cols-2 gap-2 pb-2">
                       <Button
                        variant="outline"
                        size="sm"
                        className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\nACTIVATE JOURNAL314 MODE: focus on cross-traditional evidentiary corpus analysis, structural recurrence. Do not overclaim universality.",
                          }))
                        }
                      >
                       + Journal314
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\nACTIVATE REN MODE: Handle the Religious Experience of Nihilism structure, apophatic silence, nonexistence, dread, and transcendence.",
                          }))
                        }
                      >
                       + REN Mode
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\nACTIVATE EDITORIAL MODE: Focus on recursion, densification, manuscript repair, structural consolidation, and anti-inflation discipline.",
                          }))
                        }
                      >
                       + Editorial
                      </Button>
                       <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\nACTIVATE DEFENSE MODE: Hostile doctoral tribunal. Demand operational definitions, expose hidden premises. Identify the weakest link.",
                          }))
                        }
                      >
                       + Defense
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + ONTOLOGY_GENERATOR_PROMPT,
                          }))
                        }
                      >
                       + Ontology (InfraNodus)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + PHILOSOPHICAL_ANALYST_PROMPT,
                          }))
                        }
                      >
                       + S.P. Analyst
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + AGENT_BUILDER_PROMPT,
                          }))
                        }
                      >
                       + Agent Builder
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + AGENT_ORCHESTRATION_PROMPT,
                          }))
                        }
                      >
                       + Agent Orchestration
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + FRONTEND_DESIGN_PROMPT,
                          }))
                        }
                      >
                       + Frontend Design
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + THREEJS_SKILLS_PROMPT,
                          }))
                        }
                      >
                       + Three.js Skills
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + ELITE_SOFTWARE_ARCHITECT_PROMPT,
                          }))
                        }
                      >
                       + Elite Architect
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                         className="text-[10px] uppercase font-bold tracking-widest border-border hover:bg-muted col-span-2"
                        onClick={() =>
                          updateActiveThread((thread) => ({
                            ...thread,
                            systemPrompt: thread.systemPrompt + "\n\n" + SENIOR_ENGINEERING_EXECUTION_PROMPT,
                          }))
                        }
                      >
                       + Sr. Engineer Exec
                      </Button>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full text-xs font-bold uppercase tracking-widest"
                      onClick={() =>
                        updateActiveThread((thread) => ({
                          ...thread,
                          systemPrompt: DEFAULT_SYSTEM_PROMPT,
                        }))
                      }
                    >
                      Reset Core
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

