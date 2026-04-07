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
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-40 glass border-b border-border/20 px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <h1 className="text-xl font-display text-gradient-aurora">Dream Vault</h1>
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="space-y-4">
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
      personal: "bg-primary/15 text-primary border border-primary/20",
      career: "bg-dream-cosmic/15 text-dream-cosmic border border-dream-cosmic/20",
      health: "bg-dream-aurora/15 text-dream-aurora border border-dream-aurora/20",
      financial: "bg-accent/15 text-accent border border-accent/20",
      creative: "bg-dream-sunset/15 text-dream-sunset border border-dream-sunset/20",
      spiritual: "bg-dream-glow/15 text-dream-glow border border-dream-glow/20",
      relationships: "bg-dream-sunset/15 text-dream-sunset border border-dream-sunset/20",
      adventure: "bg-accent/15 text-accent border border-accent/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Flame className="w-3.5 h-3.5 text-destructive" />;
      case "medium": return <TrendingUp className="w-3.5 h-3.5 text-accent" />;
      default: return <Clock className="w-3.5 h-3.5 text-dream-cosmic" />;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/20 px-4 py-3 fade-in">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center pulse-glow">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-display text-gradient-aurora">Dream Vault</h1>
          </div>
          <div className="flex items-center gap-0.5">
            <NotificationBell />
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground w-9 h-9">
                <Settings className="w-4.5 h-4.5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground w-9 h-9">
              <LogOut className="w-4.5 h-4.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Stories Bar */}
        <div className="py-4 border-b border-border/10 fade-in" style={{ animationDelay: "0.1s" }}>
          <StoriesBar />
        </div>

        {/* Stats Row with animated counters */}
        <div className="grid grid-cols-4 gap-2 py-4 fade-in" style={{ animationDelay: "0.15s" }}>
          {[
            { icon: Target, value: totalDreams, label: "Dreams", color: "text-primary", glow: "shadow-[0_0_15px_hsl(var(--primary)/0.15)]" },
            { icon: CheckCircle2, value: completedDreams, label: "Done", color: "text-dream-aurora", glow: "shadow-[0_0_15px_hsl(var(--dream-aurora)/0.15)]" },
            { icon: TrendingUp, value: activeDreams, label: "Active", color: "text-dream-cosmic", glow: "shadow-[0_0_15px_hsl(var(--dream-cosmic)/0.15)]" },
            { icon: Star, value: favoriteDreams, label: "Faves", color: "text-accent", glow: "shadow-[0_0_15px_hsl(var(--accent)/0.15)]" },
          ].map(({ icon: Icon, value, label, color, glow }) => (
            <div key={label} className={`text-center py-3 glass rounded-xl hover:scale-105 transition-transform duration-300 ${glow}`}>
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <AnimatedCounter value={value} className="text-lg stat-number text-foreground block" />
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Streak Tracker */}
        <div className="mb-4 fade-in" style={{ animationDelay: "0.2s" }}>
          <StreakTracker dreams={dreams} />
        </div>

        {/* Progress */}
        <div className="glass-card p-4 mb-4 fade-in" style={{ animationDelay: "0.25s" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Completion Progress</span>
            <span className="text-lg stat-number text-gradient-gold">{progressPercentage}%</span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2.5 bg-muted" />
            {progressPercentage > 0 && (
              <div
                className="absolute top-0 h-2.5 rounded-full opacity-50 blur-sm bg-primary"
                style={{ width: `${progressPercentage}%` }}
              />
            )}
          </div>
        </div>

        {/* Category Chart */}
        {dreams.length > 0 && (
          <div className="mb-4 fade-in" style={{ animationDelay: "0.3s" }}>
            <CategoryChart dreams={dreams} />
          </div>
        )}

        {/* Achievement Badges */}
        <div className="mb-4 fade-in" style={{ animationDelay: "0.35s" }}>
          <AchievementBadges dreams={dreams} />
        </div>

        {/* Dream GPT Card */}
        <Link to="/dream-gpt" className="block mb-4 fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="glass-card-hover p-4 border-primary/20 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-dream-shimmer/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-dream-shimmer/20 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Stars className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base text-foreground">Dream GPT</h3>
                <p className="text-[11px] text-muted-foreground truncate">Your AI dream companion</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </Link>

        {/* Feed */}
        <div className="mb-4 fade-in" style={{ animationDelay: "0.45s" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display text-foreground">Your Feed</h2>
            <Link to="/dreams">
              <Button variant="ghost" size="sm" className="text-primary text-xs group">
                See All <ChevronRight className="w-3 h-3 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>

          {recentDreams.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 float">
                <Sparkles className="w-7 h-7 text-primary/50" />
              </div>
              <h3 className="font-display text-lg mb-2">No dreams yet</h3>
              <p className="text-sm text-muted-foreground mb-5">Start capturing your dreams</p>
              <Link to="/dreams?new=true">
                <Button className="bg-primary hover:bg-primary/90 glow-primary rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Create First Dream
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 stagger-in">
              {recentDreams.map((dream) => (
                <Link key={dream.id} to={`/dreams/${dream.id}`}>
                  <div className="glass-card-hover overflow-hidden group cursor-pointer">
                    <div className="flex items-center gap-3 p-4 pb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-dream-shimmer flex items-center justify-center ring-2 ring-primary/20">
                        <span className="text-xs font-bold text-primary-foreground">
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
                      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors mb-1">
                        {dream.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {dream.description || "No description"}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 px-4 py-3 border-t border-border/10">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {dream.is_favorite ? (
                          <Star className="w-4 h-4 text-accent fill-accent" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {getPriorityIcon(dream.priority)}
                        <span className="text-[10px] capitalize">{dream.priority}</span>
                      </div>
                      {dream.story && (
                        <div className="flex items-center gap-1 text-primary/70">
                          <Stars className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Story</span>
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
