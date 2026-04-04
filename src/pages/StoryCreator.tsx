import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  Loader2,
  Sparkles,
  ArrowLeft,
  Send,
  CheckCircle2,
  Wand2,
  Pencil,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type DreamCategory = Database["public"]["Enums"]["dream_category"];

const categories: { value: DreamCategory; label: string; emoji: string }[] = [
  { value: "personal", label: "Personal", emoji: "🌟" },
  { value: "career", label: "Career", emoji: "💼" },
  { value: "health", label: "Health", emoji: "💪" },
  { value: "financial", label: "Financial", emoji: "💰" },
  { value: "creative", label: "Creative", emoji: "🎨" },
  { value: "spiritual", label: "Spiritual", emoji: "🧘" },
  { value: "relationships", label: "Relationships", emoji: "❤️" },
  { value: "adventure", label: "Adventure", emoji: "🌍" },
];

const STORY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dream-story`;

const StoryCreator = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DreamCategory>("creative");
  const [generatedStory, setGeneratedStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  const generateStory = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a story title.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGeneratedStory("");

    try {
      const resp = await fetch(STORY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          dream: {
            title: title.trim(),
            description: description.trim() || "No description provided",
            category,
          },
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => null);
        throw new Error(errData?.error || `Request failed (${resp.status})`);
      }

      const data = await resp.json();
      setGeneratedStory(data.story || "Unable to generate story.");
    } catch (error) {
      console.error("Story generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate story",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publishStory = async () => {
    if (!user || !generatedStory) return;

    setIsPublishing(true);
    try {
      // Generate share token first
      const { data: tokenData } = await supabase.rpc("generate_share_token");
      const shareToken = tokenData || crypto.randomUUID();

      const { data, error } = await supabase.from("dreams").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        story: generatedStory,
        is_public: true,
        share_token: shareToken,
        priority: "medium",
        status: "active",
      }).select("id").single();

      if (error) throw error;

      setPublished(true);
      toast({
        title: "🎉 Story Published!",
        description: "Your story has been published and is now visible to the community.",
      });

      setTimeout(() => {
        navigate(`/dreams/${data.id}`);
      }, 1500);
    } catch (error) {
      console.error("Publish error:", error);
      toast({
        title: "Publish Failed",
        description: error instanceof Error ? error.message : "Could not publish story",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Story Creator</h1>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div className="glass rounded-2xl p-5 space-y-4 border border-border/30">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-foreground mb-1.5 block">
              Story Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="bg-background/50 border-border/50"
              disabled={published}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-foreground mb-1.5 block">
              Brief Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your story idea in a few lines..."
              rows={3}
              className="bg-background/50 border-border/50 resize-none"
              disabled={published}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-1.5 block">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DreamCategory)} disabled={published}>
              <SelectTrigger className="bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateStory}
            disabled={!title.trim() || isGenerating || published}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Story...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Story
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated Story */}
      {(generatedStory || isGenerating) && (
        <div className="glass rounded-2xl border border-border/30 overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Generated Story</span>
          </div>

          <ScrollArea className="max-h-[50vh] p-5">
            {isGenerating && !generatedStory ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Crafting your story...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none text-foreground [&_p]:my-2 [&_p]:leading-relaxed">
                <ReactMarkdown>{generatedStory}</ReactMarkdown>
              </div>
            )}
          </ScrollArea>

          {generatedStory && !published && (
            <div className="px-5 py-4 border-t border-border/30 flex gap-3">
              <Button
                variant="outline"
                onClick={generateStory}
                disabled={isGenerating}
                className="flex-1 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate
              </Button>
              <Button
                onClick={publishStory}
                disabled={isPublishing}
                className="flex-1 gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Story
                  </>
                )}
              </Button>
            </div>
          )}

          {published && (
            <div className="px-5 py-4 border-t border-border/30">
              <div className="flex items-center justify-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Published successfully! Redirecting...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryCreator;
