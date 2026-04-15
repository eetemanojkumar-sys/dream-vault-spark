import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { DreamCardSkeleton, StatCardSkeleton } from "@/components/ui/shimmer-skeleton";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import {
  Sparkles, Target, CheckCircle2, TrendingUp, Plus, LogOut,
  Star, Clock, Flame, Settings, Stars, ArrowRight,
} from "lucide-react";
import { NotificationBell } from "@/components/social/NotificationBell";
import { ChevronRight } from "lucide-react";
import StoriesBar from "@/components/social/StoriesBar";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;
type Profile = Tables<"profiles">;

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { navigate("/auth"); return; }
    if (user) fetchData();
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(profileData);

      const { data: dreamsData } = await supabase
        .from("dreams").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setDreams(dreamsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/auth"); };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Dream Vault</h1>
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <DreamCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const totalDreams = dreams.length;
  const completedDreams = dreams.filter(d => d.status === "completed").length;
  const activeDreams = dreams.filter(d => d.status === "active").length;
  const favoriteDreams = dreams.filter(d => d.is_favorite).length;
  const progressPercentage = totalDreams > 0 ? Math.round((completedDreams / totalDreams) * 100) : 0;
  const recentDreams = dreams.slice(0, 5);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: "bg-primary/10 text-primary",
      career: "bg-dream-cosmic/10 text-dream-cosmic",
      health: "bg-dream-aurora/10 text-dream-aurora",
      financial: "bg-accent/10 text-accent",
      creative: "bg-dream-sunset/10 text-dream-sunset",
      spiritual: "bg-dream-glow/10 text-dream-glow",
      relationships: "bg-dream-sunset/10 text-dream-sunset",
      adventure: "bg-accent/10 text-accent",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Flame className="w-3 h-3 text-destructive" />;
      case "medium": return <TrendingUp className="w-3 h-3 text-accent" />;
      default: return <Clock className="w-3 h-3 text-dream-cosmic" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 py-3 fade-in">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Dream Vault</h1>
          </div>
          <div className="flex items-center gap-0.5">
            <NotificationBell />
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-8 h-8">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground w-8 h-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Stories */}
        <div className="py-3 border-b border-border/10 fade-in" style={{ animationDelay: "0.05s" }}>
          <StoriesBar />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 py-4 fade-in" style={{ animationDelay: "0.1s" }}>
          {[
            { icon: Target, value: totalDreams, label: "Dreams", color: "text-primary", bg: "bg-primary/10" },
            { icon: CheckCircle2, value: completedDreams, label: "Done", color: "text-dream-aurora", bg: "bg-dream-aurora/10" },
            { icon: TrendingUp, value: activeDreams, label: "Active", color: "text-dream-cosmic", bg: "bg-dream-cosmic/10" },
            { icon: Star, value: favoriteDreams, label: "Faves", color: "text-accent", bg: "bg-accent/10" },
          ].map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className="text-center py-3 surface-card hover:scale-[1.02] transition-transform duration-200">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <AnimatedCounter value={value} className="text-lg stat-number text-foreground block" />
              <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Streak */}
        <div className="mb-3 fade-in" style={{ animationDelay: "0.15s" }}>
          <StreakTracker dreams={dreams} />
        </div>

        {/* Progress */}
        <div className="surface-card p-4 mb-3 fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Completion Progress</span>
            <span className="text-base stat-number text-gradient-gold">{progressPercentage}%</span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2 bg-muted" />
            {progressPercentage > 0 && (
              <div className="absolute top-0 h-2 rounded-full opacity-40 blur-sm bg-primary"
                style={{ width: `${progressPercentage}%` }} />
            )}
          </div>
        </div>

        {/* Category Chart */}
        {dreams.length > 0 && (
          <div className="mb-3 fade-in" style={{ animationDelay: "0.25s" }}>
            <CategoryChart dreams={dreams} />
          </div>
        )}

        {/* Badges */}
        <div className="mb-3 fade-in" style={{ animationDelay: "0.3s" }}>
          <AchievementBadges dreams={dreams} />
        </div>

        {/* Dream GPT */}
        <Link to="/dream-gpt" className="block mb-4 fade-in" style={{ animationDelay: "0.35s" }}>
          <div className="surface-card p-4 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-dream-shimmer/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Stars className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">Dream GPT</h3>
                <p className="text-[11px] text-muted-foreground truncate">Your AI dream companion</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>

        {/* Feed */}
        <div className="mb-4 fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Your Feed</h2>
            <Link to="/dreams">
              <Button variant="ghost" size="sm" className="text-primary text-xs font-medium group h-8">
                See All <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {recentDreams.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-primary/50" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">No dreams yet</h3>
              <p className="text-sm text-muted-foreground mb-5">Start capturing your dreams</p>
              <Link to="/dreams?new=true">
                <Button className="bg-primary hover:bg-primary/90 rounded-xl text-sm h-10">
                  <Plus className="w-4 h-4 mr-2" /> Create First Dream
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3 stagger-in">
              {recentDreams.map((dream) => (
                <Link key={dream.id} to={`/dreams/${dream.id}`}>
                  <div className="surface-card overflow-hidden group cursor-pointer">
                    <div className="flex items-center gap-3 p-4 pb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-dream-shimmer flex items-center justify-center">
                        <span className="text-[11px] font-bold text-primary-foreground">
                          {profile?.name?.charAt(0)?.toUpperCase() || "D"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{profile?.name || "You"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(dream.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(dream.category)}`}>
                        {dream.category}
                      </span>
                    </div>

                    <div className="px-4 pb-2">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                        {dream.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {dream.description || "No description"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/10">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {dream.is_favorite ? <Star className="w-3.5 h-3.5 text-accent fill-accent" /> : <Star className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getPriorityIcon(dream.priority)}
                        <span className="text-[10px] capitalize font-medium">{dream.priority}</span>
                      </div>
                      {dream.story && (
                        <div className="flex items-center gap-1 text-primary/60">
                          <Stars className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Story</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
