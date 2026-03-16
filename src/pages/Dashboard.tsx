import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  TrendingUp, 
  Plus, 
  LogOut,
  Star,
  Clock,
  Flame,
  Compass,
  Settings,
  User,
  Stars,
  ArrowRight
} from "lucide-react";
import { NotificationBell } from "@/components/social/NotificationBell";
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

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setProfile(profileData);

      const { data: dreamsData } = await supabase
        .from("dreams")
        .select("*")
        .eq("user_id", user.id)
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
      <div className="min-h-screen flex items-center justify-center stars">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 float glow-primary">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground font-display text-lg">Loading your dreams...</p>
        </div>
      </div>
    );
  }

  const totalDreams = dreams.length;
  const completedDreams = dreams.filter(d => d.status === "completed").length;
  const activeDreams = dreams.filter(d => d.status === "active").length;
  const favoriteDreams = dreams.filter(d => d.is_favorite).length;
  const progressPercentage = totalDreams > 0 ? Math.round((completedDreams / totalDreams) * 100) : 0;

  const recentDreams = dreams.slice(0, 3);

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
      case "high":
        return <Flame className="w-4 h-4 text-destructive" />;
      case "medium":
        return <TrendingUp className="w-4 h-4 text-accent" />;
      default:
        return <Clock className="w-4 h-4 text-dream-cosmic" />;
    }
  };

  const stats = [
    {
      icon: Target,
      value: totalDreams,
      label: "Total Dreams",
      gradient: "from-primary/20 to-dream-shimmer/10",
      iconColor: "text-primary",
    },
    {
      icon: CheckCircle2,
      value: completedDreams,
      label: "Completed",
      gradient: "from-dream-aurora/20 to-dream-aurora/5",
      iconColor: "text-dream-aurora",
    },
    {
      icon: TrendingUp,
      value: activeDreams,
      label: "In Progress",
      gradient: "from-dream-cosmic/20 to-dream-cosmic/5",
      iconColor: "text-dream-cosmic",
    },
    {
      icon: Star,
      value: favoriteDreams,
      label: "Favorites",
      gradient: "from-accent/20 to-dream-gold/5",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 stars">
      {/* Subtle background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[10%] w-64 h-64 rounded-full bg-primary/5 blur-[80px] breathe-slow" />
        <div className="absolute bottom-[10%] left-[5%] w-48 h-48 rounded-full bg-dream-shimmer/5 blur-[60px] breathe" style={{ animationDelay: "-3s" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-8 fade-in">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-dream-shimmer/20 flex items-center justify-center glow-subtle border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display text-gradient-aurora">Dream Vault</h1>
            <p className="text-xs text-muted-foreground">Welcome back, <span className="text-foreground">{profile?.name || "Dreamer"}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link to="/dream-gpt">
            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hover:bg-primary/10" title="Dream GPT">
              <Stars className="w-5 h-5" />
            </Button>
          </Link>
          <NotificationBell />
          <Link to="/explore">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Compass className="w-5 h-5" />
            </Button>
          </Link>
          <Link to={`/profile/${user?.id}`}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-in">
        {stats.map(({ icon: Icon, value, label, gradient, iconColor }) => (
          <div key={label} className="glass-card-hover p-5 group">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <span className="text-3xl stat-number text-foreground">{value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress Section */}
      <div className="relative z-10 glass-card p-6 mb-8 fade-in overflow-hidden" style={{ animationDelay: "0.3s" }}>
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-foreground">Overall Progress</h2>
            <span className="text-3xl stat-number text-gradient-gold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-muted" />
          <p className="text-xs text-muted-foreground mt-3">
            {completedDreams} of {totalDreams} dreams achieved
          </p>
        </div>
      </div>

      {/* Dream GPT Promo Card */}
      <div className="relative z-10 mb-8 fade-in" style={{ animationDelay: "0.35s" }}>
        <Link to="/dream-gpt">
          <div className="glass-card-hover p-5 border-primary/20 group cursor-pointer overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-dream-shimmer/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-dream-shimmer/20 flex items-center justify-center border border-primary/20 group-hover:glow-primary transition-all duration-500">
                <Stars className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-foreground">Dream GPT</h3>
                <p className="text-xs text-muted-foreground">Your AI companion for exploring dreams & goals</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Dreams */}
      <div className="relative z-10 mb-8 fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-foreground">Recent Dreams</h2>
          <Link to="/dreams">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 group text-xs">
              View All
              <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {recentDreams.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 float">
              <Sparkles className="w-8 h-8 text-primary/50" />
            </div>
            <h3 className="text-lg font-display mb-2">No dreams yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Start capturing your dreams and goals</p>
            <Link to="/dreams">
              <Button className="bg-primary hover:bg-primary/90 glow-primary rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Dream
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recentDreams.map((dream) => (
              <Link key={dream.id} to={`/dreams/${dream.id}`}>
                <div className="glass-card-hover p-5 group cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${getCategoryColor(dream.category)}`}>
                      {dream.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(dream.priority)}
                      {dream.is_favorite && <Star className="w-4 h-4 text-accent fill-accent" />}
                    </div>
                  </div>
                  <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors duration-300 mb-2 line-clamp-1">
                    {dream.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {dream.description || "No description"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action */}
      <Link to="/dreams?new=true" className="relative z-10 block fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="glass-card p-6 border-dashed border-2 border-primary/20 hover:border-primary/50 transition-all duration-500 cursor-pointer group text-center hover:glow-subtle">
          <Plus className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500" />
          <p className="text-foreground font-medium text-sm">Add New Dream</p>
          <p className="text-xs text-muted-foreground mt-1">Capture your next goal or vision</p>
        </div>
      </Link>
    </div>
  );
};

export default Dashboard;
