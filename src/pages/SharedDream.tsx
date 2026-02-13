import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Calendar,
  Star,
  Clock,
  Flame,
  TrendingUp,
  ExternalLink,
  Heart,
  User
} from "lucide-react";
import { CommentSection } from "@/components/social/CommentSection";
import { DreamReactions } from "@/components/social/DreamReactions";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams"> & { is_public?: boolean; share_token?: string };
type Milestone = Tables<"milestones">;
type Profile = { name: string | null; avatar_url: string | null };

const SharedDream = () => {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const [dream, setDream] = useState<Dream | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchSharedDream();
    }
  }, [token, user]);

  const fetchSharedDream = async () => {
    try {
      const { data: dreamData, error: dreamError } = await supabase
        .from("dreams")
        .select("*")
        .eq("share_token", token)
        .eq("is_public", true)
        .single();

      if (dreamError || !dreamData) {
        setError("This dream is not available or has been made private.");
        setLoading(false);
        return;
      }

      setDream(dreamData as Dream);

      // Fetch author profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("user_id", dreamData.user_id)
        .single();
      
      setProfile(profileData || null);

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from("milestones")
        .select("*")
        .eq("dream_id", dreamData.id)
        .order("sort_order", { ascending: true });

      setMilestones(milestonesData || []);

      // Fetch likes count
      const { count } = await supabase
        .from("dream_likes")
        .select("*", { count: "exact", head: true })
        .eq("dream_id", dreamData.id);
      
      setLikesCount(count || 0);

      // Check if current user liked
      if (user) {
        const { data: likeData } = await supabase
          .from("dream_likes")
          .select("id")
          .eq("dream_id", dreamData.id)
          .eq("user_id", user.id)
          .single();
        
        setIsLiked(!!likeData);
      }
    } catch (err) {
      console.error("Error fetching shared dream:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !dream) return;

    if (isLiked) {
      await supabase
        .from("dream_likes")
        .delete()
        .eq("dream_id", dream.id)
        .eq("user_id", user.id);
      setIsLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase
        .from("dream_likes")
        .insert({ dream_id: dream.id, user_id: user.id });
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flame className="w-4 h-4 text-red-400" />;
      case "medium":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared dream...</p>
        </div>
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display text-foreground mb-2">Dream Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "This dream doesn't exist or is no longer public."}
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90">
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Dream Vault
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const progressPercentage = milestones.length > 0 
    ? Math.round((completedMilestones / milestones.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/explore" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-display text-xl text-foreground">Dream Vault</span>
          </Link>
          {user ? (
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="border-primary/50">
                My Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="border-primary/50">
                Create Your Dreams
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        {/* Author & Shared Badge */}
        <div className="flex items-center justify-between mb-6 fade-in">
          <Link 
            to={`/profile/${dream.user_id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.name || "User"} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{profile?.name || "Dreamer"}</p>
              <p className="text-xs text-muted-foreground">Shared Dream</p>
            </div>
          </Link>
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLiked 
                ? "bg-red-500/20 text-red-400" 
                : "bg-muted/50 text-muted-foreground hover:text-red-400"
            } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </button>
        </div>

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
            <div className="flex items-center gap-1">
              {getPriorityIcon(dream.priority)}
              <span className="text-sm text-muted-foreground capitalize">{dream.priority} priority</span>
            </div>
            {dream.is_favorite && (
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            )}
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

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="glass-card p-6 md:p-8 mb-6 fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display text-foreground">Progress</h2>
              <span className="text-lg font-display text-gradient-gold">{progressPercentage}%</span>
            </div>

            <Progress value={progressPercentage} className="h-2 bg-muted mb-6" />

            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    milestone.completed 
                      ? "bg-primary border-primary" 
                      : "border-muted-foreground"
                  }`}>
                    {milestone.completed && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={milestone.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions */}
        <div className="glass-card p-6 md:p-8 mb-6 fade-in" style={{ animationDelay: "0.25s" }}>
          <h3 className="text-lg font-display text-foreground mb-3">Reactions</h3>
          <DreamReactions dreamId={dream.id} />
        </div>

        {/* Comments Section */}
        <div className="glass-card p-6 md:p-8 mb-6 fade-in" style={{ animationDelay: "0.3s" }}>
          <CommentSection dreamId={dream.id} />
        </div>

        {/* CTA */}
        {!user && (
          <div className="glass-card p-6 md:p-8 text-center fade-in" style={{ animationDelay: "0.4s" }}>
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-display text-foreground mb-2">Start Your Dream Journey</h2>
            <p className="text-muted-foreground mb-6">
              Create your own dream vault and track your aspirations with AI-powered insights.
            </p>
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default SharedDream;
