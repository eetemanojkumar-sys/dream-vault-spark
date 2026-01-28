import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  ArrowLeft,
  Star,
  Calendar,
  Edit2,
  Trash2,
  Plus,
  Brain,
  Lightbulb,
  Rocket,
  Loader2,
  BookOpen,
  ImageIcon,
  RefreshCw,
  Share2
} from "lucide-react";
import { DreamDialog } from "@/components/dreams/DreamDialog";
import { ShareDreamDialog } from "@/components/dreams/ShareDreamDialog";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams"> & { is_public?: boolean; share_token?: string };
type Milestone = Tables<"milestones">;

const DreamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dream, setDream] = useState<Dream | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState("");
  const [aiInsight, setAiInsight] = useState<{ type: string; content: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user && id) {
      fetchData();
    }
  }, [user, authLoading, id, navigate]);

  const fetchData = async () => {
    if (!user || !id) return;

    try {
      const { data: dreamData, error: dreamError } = await supabase
        .from("dreams")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (dreamError || !dreamData) {
        navigate("/dreams");
        return;
      }

      setDream(dreamData);

      const { data: milestonesData } = await supabase
        .from("milestones")
        .select("*")
        .eq("dream_id", id)
        .order("sort_order", { ascending: true });

      setMilestones(milestonesData || []);
    } catch (error) {
      console.error("Error fetching dream:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim() || !dream) return;

    const { error } = await supabase.from("milestones").insert({
      dream_id: dream.id,
      title: newMilestone.trim(),
      sort_order: milestones.length,
    });

    if (!error) {
      setNewMilestone("");
      fetchData();
    }
  };

  const handleToggleMilestone = async (milestone: Milestone) => {
    await supabase
      .from("milestones")
      .update({
        completed: !milestone.completed,
        completed_at: !milestone.completed ? new Date().toISOString() : null,
      })
      .eq("id", milestone.id);
    fetchData();
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    await supabase.from("milestones").delete().eq("id", milestoneId);
    fetchData();
  };

  const handleToggleFavorite = async () => {
    if (!dream) return;
    await supabase
      .from("dreams")
      .update({ is_favorite: !dream.is_favorite })
      .eq("id", dream.id);
    fetchData();
  };

  const handleDelete = async () => {
    if (!dream) return;
    await supabase.from("dreams").delete().eq("id", dream.id);
    navigate("/dreams");
  };

  const getAiInsight = async (type: "summary" | "action_steps" | "motivation") => {
    if (!dream) return;

    setAiLoading(true);
    setAiInsight(null);

    try {
      const response = await supabase.functions.invoke("dream-insights", {
        body: {
          type,
          dream: {
            title: dream.title,
            description: dream.description,
            category: dream.category,
            priority: dream.priority,
            milestones: milestones.map((m) => ({ title: m.title, completed: m.completed })),
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAiInsight({ type, content: response.data.insight });
    } catch (error) {
      console.error("AI insight error:", error);
      toast({
        title: "AI Insight Failed",
        description: error instanceof Error ? error.message : "Could not generate insight",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const generateStory = async () => {
    if (!dream) return;

    setStoryLoading(true);
    setStory(null);

    try {
      const response = await supabase.functions.invoke("dream-story", {
        body: {
          dream: {
            title: dream.title,
            description: dream.description,
            category: dream.category,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setStory(response.data.story);
      toast({
        title: "Story Generated!",
        description: "Your dream has been transformed into an immersive narrative.",
      });
    } catch (error) {
      console.error("Story generation error:", error);
      toast({
        title: "Story Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate story",
        variant: "destructive",
      });
    } finally {
      setStoryLoading(false);
    }
  };

  const generateImage = async () => {
    if (!dream) return;

    setImageLoading(true);

    try {
      const response = await supabase.functions.invoke("dream-image", {
        body: {
          dreamId: dream.id,
          dream: {
            title: dream.title,
            description: dream.description,
            category: dream.category,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Refresh dream data to get the new image URL
      fetchData();
      toast({
        title: "Image Generated!",
        description: "A visual representation of your dream has been created.",
      });
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Image Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate image",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dream...</p>
        </div>
      </div>
    );
  }

  if (!dream) return null;

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercentage = milestones.length > 0 
    ? Math.round((completedMilestones / milestones.length) * 100) 
    : 0;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: "bg-purple-500/20 text-purple-300",
      career: "bg-blue-500/20 text-blue-300",
      health: "bg-green-500/20 text-green-300",
      financial: "bg-yellow-500/20 text-yellow-300",
      creative: "bg-pink-500/20 text-pink-300",
      spiritual: "bg-indigo-500/20 text-indigo-300",
      relationships: "bg-rose-500/20 text-rose-300",
      adventure: "bg-orange-500/20 text-orange-300",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6 fade-in">
        <Link to="/dreams">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShareDialogOpen(true)}
          className={dream.is_public ? "text-primary" : "text-muted-foreground hover:text-foreground"}
          title={dream.is_public ? "Shared publicly" : "Share dream"}
        >
          <Share2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          className={dream.is_favorite ? "text-yellow-400" : "text-muted-foreground"}
        >
          <Star className={`w-5 h-5 ${dream.is_favorite ? "fill-yellow-400" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDialogOpen(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </header>

      {/* Dream Details */}
      <div className="glass-card p-6 md:p-8 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
        {/* Dream Image */}
        {dream.image_url && (
          <div className="mb-6 rounded-xl overflow-hidden border border-primary/20">
            <img 
              src={dream.image_url} 
              alt={dream.title} 
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`text-sm px-3 py-1 rounded-full ${getCategoryColor(dream.category)}`}>
            {dream.category}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground capitalize">
            {dream.priority} priority
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground capitalize">
            {dream.status}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display text-foreground mb-4">{dream.title}</h1>
        
        {dream.description && (
          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{dream.description}</p>
        )}

        {dream.target_date && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Target: {new Date(dream.target_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* AI Story Narrator & Image Generator */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Story Narrator */}
        <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display text-foreground">AI Story Narrator</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateStory}
              disabled={storyLoading}
              className="border-primary/50 hover:bg-primary/10"
            >
              {storyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Writing...
                </>
              ) : story ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Story
                </>
              )}
            </Button>
          </div>

          {storyLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Crafting your dream narrative...</p>
              </div>
            </div>
          )}

          {story && !storyLoading && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap italic">
                "{story}"
              </p>
            </div>
          )}

          {!story && !storyLoading && (
            <div className="p-8 text-center border border-dashed border-muted rounded-lg">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Transform your dream into an immersive first-person narrative
              </p>
            </div>
          )}
        </div>

        {/* Image Generator */}
        <div className="glass-card p-6 fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-display text-foreground">AI Dream Visualizer</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateImage}
              disabled={imageLoading}
              className="border-primary/50 hover:bg-primary/10"
            >
              {imageLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : dream.image_url ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          {imageLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Visualizing your dream...</p>
              </div>
            </div>
          )}

          {!imageLoading && !dream.image_url && (
            <div className="p-8 text-center border border-dashed border-muted rounded-lg">
              <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Generate a dreamy, ethereal visualization of your dream
              </p>
            </div>
          )}

          {!imageLoading && dream.image_url && (
            <div className="rounded-lg overflow-hidden border border-primary/20">
              <img 
                src={dream.image_url} 
                alt={dream.title} 
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Progress & Milestones */}
      <div className="glass-card p-6 md:p-8 mb-6 fade-in" style={{ animationDelay: "0.25s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-foreground">Milestones</h2>
          <span className="text-lg font-display text-gradient-gold">{progressPercentage}%</span>
        </div>

        <Progress value={progressPercentage} className="h-2 bg-muted mb-6" />

        <div className="space-y-3 mb-4">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
            >
              <Checkbox
                checked={milestone.completed}
                onCheckedChange={() => handleToggleMilestone(milestone)}
                className="border-primary data-[state=checked]:bg-primary"
              />
              <span
                className={`flex-1 ${
                  milestone.completed ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {milestone.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteMilestone(milestone.id)}
                className="opacity-0 group-hover:opacity-100 text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Add a milestone..."
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
            className="bg-muted/50 border-border/50"
          />
          <Button onClick={handleAddMilestone} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Insights */}
      <div className="glass-card p-6 md:p-8 fade-in" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-xl font-display text-foreground mb-4">AI Insights</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="outline"
            onClick={() => getAiInsight("summary")}
            disabled={aiLoading}
            className="border-primary/50 hover:bg-primary/10"
          >
            <Brain className="w-4 h-4 mr-2" />
            Summary
          </Button>
          <Button
            variant="outline"
            onClick={() => getAiInsight("action_steps")}
            disabled={aiLoading}
            className="border-primary/50 hover:bg-primary/10"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Action Steps
          </Button>
          <Button
            variant="outline"
            onClick={() => getAiInsight("motivation")}
            disabled={aiLoading}
            className="border-primary/50 hover:bg-primary/10"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Motivation
          </Button>
        </div>

        {aiLoading && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-muted-foreground">Generating insight...</span>
          </div>
        )}

        {aiInsight && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary capitalize">{aiInsight.type.replace("_", " ")}</span>
            </div>
            <p className="text-foreground whitespace-pre-wrap">{aiInsight.content}</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <DreamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dream={dream}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
      />

      {/* Share Dialog */}
      <ShareDreamDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        dream={dream}
        onUpdate={fetchData}
      />
    </div>
  );
};

export default DreamDetail;
