import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import {
  Loader2, Sparkles, ArrowLeft, Send, CheckCircle2,
  Wand2, Pencil, Eye, Type, Clock, RotateCcw, Globe,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DreamCategory = Database["public"]["Enums"]["dream_category"];

const STORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dream-story`;

// AI will pick the best category and tone from the description
const AUTO_CATEGORIES: DreamCategory[] = [
  "personal", "career", "health", "financial", "creative", "spiritual", "relationships", "adventure",
];

const StoryCreator = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [description, setDescription] = useState("");
  const [generatedStory, setGeneratedStory] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [detectedCategory, setDetectedCategory] = useState<DreamCategory>("creative");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [step, setStep] = useState<"input" | "result">("input");
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (step === "input" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [step]);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const wordCount = generatedStory.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const detectCategoryFromDescription = (desc: string): DreamCategory => {
    const lower = desc.toLowerCase();
    if (/career|job|work|business|promot|startup/i.test(lower)) return "career";
    if (/health|fit|gym|run|diet|meditat|yoga/i.test(lower)) return "health";
    if (/money|financ|invest|sav|rich|wealth/i.test(lower)) return "financial";
    if (/art|music|paint|write|creat|design|film|photo/i.test(lower)) return "creative";
    if (/spirit|faith|pray|soul|mindful/i.test(lower)) return "spiritual";
    if (/love|friend|family|relation|partner|marri/i.test(lower)) return "relationships";
    if (/travel|adventure|explor|mountain|ocean|hike/i.test(lower)) return "adventure";
    return "personal";
  };

  const generateTitleFromDescription = (desc: string): string => {
    // Create a short title from the first meaningful phrase
    const cleaned = desc.trim().replace(/\n/g, " ");
    const words = cleaned.split(/\s+/).slice(0, 6).join(" ");
    return words.length > 50 ? words.slice(0, 50) + "…" : words || "My Dream Story";
  };

  const handleCreate = async () => {
    if (!description.trim() || description.trim().length < 10) {
      toast({ title: "Tell us more", description: "Please write at least a short description (10+ characters).", variant: "destructive" });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const category = detectCategoryFromDescription(description);
    const title = generateTitleFromDescription(description);
    setDetectedCategory(category);
    setGeneratedTitle(title);
    setIsGenerating(true);
    setGeneratedStory("");
    setStep("result");

    try {
      const resp = await fetch(STORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          dream: { title, description: description.trim(), category },
          tone: "inspirational",
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || `Request failed (${resp.status})`);
      }

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") || contentType.includes("text/plain")) {
        const reader = resp.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  const token = parsed.choices?.[0]?.delta?.content || "";
                  if (token) setGeneratedStory(prev => prev + token);
                } catch {
                  if (data.trim()) setGeneratedStory(prev => prev + data);
                }
              }
            }
          }
        }
      } else {
        const data = await resp.json();
        setGeneratedStory(data.story || "Unable to generate story.");
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("Story generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate story",
        variant: "destructive",
      });
      setStep("input");
    } finally {
      setIsGenerating(false);
    }
  };

  const publishStory = async () => {
    if (!user || !generatedStory) return;
    setIsPublishing(true);
    try {
      const { data: tokenData } = await supabase.rpc("generate_share_token");
      const shareToken = tokenData || crypto.randomUUID();

      const { data, error } = await supabase.from("dreams").insert({
        user_id: user.id,
        title: generatedTitle,
        description: description.trim() || null,
        category: detectedCategory,
        story: generatedStory,
        is_public: true,
        share_token: shareToken,
        priority: "medium",
        status: "active",
      }).select("id").single();

      if (error) throw error;
      setPublished(true);
      toast({ title: "🎉 Published!", description: "Your story is live on the community feed." });
      setTimeout(() => navigate(`/dreams/${data.id}`), 1500);
    } catch (error) {
      console.error("Publish error:", error);
      toast({ title: "Publish Failed", description: error instanceof Error ? error.message : "Could not publish", variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const reset = () => {
    setDescription("");
    setGeneratedStory("");
    setGeneratedTitle("");
    setPublished(false);
    setIsEditing(false);
    setStep("input");
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-dream-shimmer/20 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-xl font-display text-gradient-aurora">Story Creator</h1>
        </div>
      </div>

      {/* Step 1: Input */}
      {step === "input" && (
        <div className="space-y-4 fade-in">
          <div className="glass rounded-2xl p-5 space-y-4 border border-border/30">
            <div className="text-center space-y-2 pb-2">
              <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
              <h2 className="text-lg font-semibold text-foreground">What's your dream?</h2>
              <p className="text-sm text-muted-foreground">
                Describe your dream in a few words — we'll turn it into a full story automatically.
              </p>
            </div>

            <Textarea
              ref={textareaRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I want to travel the world and write about different cultures..."
              rows={4}
              className="bg-background/50 border-border/50 resize-none text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && description.trim().length >= 10) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />

            <p className="text-[11px] text-muted-foreground text-center">
              Press Enter or tap the button below. Shift+Enter for new line.
            </p>

            <Button
              onClick={handleCreate}
              disabled={description.trim().length < 10 || isGenerating}
              className="w-full gap-2 h-12 text-base relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-dream-shimmer to-primary bg-[length:200%_100%] group-hover:animate-[shimmer_2s_infinite] opacity-0 group-hover:opacity-20 transition-opacity" />
              <Sparkles className="w-5 h-5" />
              Create My Story
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Result */}
      {step === "result" && (
        <div className="space-y-4 fade-in-scale">
          {/* Auto-detected info */}
          {generatedTitle && (
            <div className="glass rounded-xl p-4 border border-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground truncate">{generatedTitle}</h3>
                <p className="text-xs text-muted-foreground capitalize">{detectedCategory} • Inspirational</p>
              </div>
            </div>
          )}

          {/* Story content */}
          <div className="glass rounded-2xl border border-border/30 overflow-hidden">
            <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-primary" /> Writing...</>
                ) : (
                  <><Sparkles className="w-4 h-4 text-primary" /> Your Story</>
                )}
              </span>
              <div className="flex items-center gap-2">
                {generatedStory && !isGenerating && (
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mr-2">
                    <span className="flex items-center gap-1"><Type className="w-3 h-3" />{wordCount} words</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readingTime} min</span>
                  </div>
                )}
                {generatedStory && !published && !isGenerating && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-1.5 h-8 text-xs">
                    {isEditing ? <><Eye className="w-3.5 h-3.5" />Preview</> : <><Pencil className="w-3.5 h-3.5" />Edit</>}
                  </Button>
                )}
              </div>
            </div>

            <ScrollArea className="max-h-[50vh]">
              {isGenerating && !generatedStory ? (
                <div className="flex items-center justify-center py-16 px-5">
                  <div className="text-center space-y-3">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                      <div className="absolute inset-0 w-10 h-10 mx-auto rounded-full bg-primary/20 animate-ping" />
                    </div>
                    <p className="text-sm text-muted-foreground">Crafting your story from your description...</p>
                  </div>
                </div>
              ) : isEditing ? (
                <Textarea
                  value={generatedStory}
                  onChange={(e) => setGeneratedStory(e.target.value)}
                  className="min-h-[300px] border-0 rounded-none bg-transparent resize-none focus-visible:ring-0 text-sm leading-relaxed p-5"
                />
              ) : (
                <div className="prose prose-sm prose-invert max-w-none text-foreground [&_p]:my-2 [&_p]:leading-relaxed p-5">
                  <ReactMarkdown>{generatedStory}</ReactMarkdown>
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle rounded-sm" />
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Action buttons */}
            {generatedStory && !published && !isGenerating && (
              <div className="px-5 py-4 border-t border-border/30 space-y-3">
                <div className="flex gap-3">
                  <Button onClick={publishStory} disabled={isPublishing} className="flex-1 gap-2 h-12 text-base">
                    {isPublishing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
                    ) : (
                      <><Globe className="w-4 h-4" />Publish Story</>
                    )}
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCreate} disabled={isGenerating} className="flex-1 gap-2">
                    <RotateCcw className="w-4 h-4" />Regenerate
                  </Button>
                  <Button variant="ghost" onClick={reset} className="flex-1 gap-2">
                    <ArrowLeft className="w-4 h-4" />Start Over
                  </Button>
                </div>
              </div>
            )}

            {published && (
              <div className="px-5 py-4 border-t border-border/30">
                <div className="flex items-center justify-center gap-2 text-primary fade-in-scale">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Published! Redirecting...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCreator;
