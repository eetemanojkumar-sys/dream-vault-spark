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
  Stars
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
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      setProfile(profileData);

      // Fetch dreams
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dreams...</p>
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-subtle">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display text-gradient-aurora">Dream Vault</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {profile?.name || "Dreamer"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-in">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <span className="text-3xl font-display text-foreground">{totalDreams}</span>
          </div>
          <p className="text-sm text-muted-foreground">Total Dreams</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-3xl font-display text-foreground">{completedDreams}</span>
          </div>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-3xl font-display text-foreground">{activeDreams}</span>
          </div>
          <p className="text-sm text-muted-foreground">In Progress</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="text-3xl font-display text-foreground">{favoriteDreams}</span>
          </div>
          <p className="text-sm text-muted-foreground">Favorites</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="glass-card p-6 mb-8 fade-in" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-foreground">Overall Progress</h2>
          <span className="text-2xl font-display text-gradient-gold">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3 bg-muted" />
        <p className="text-sm text-muted-foreground mt-3">
          {completedDreams} of {totalDreams} dreams achieved
        </p>
      </div>

      {/* Recent Dreams */}
      <div className="mb-8 fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display text-foreground">Recent Dreams</h2>
          <Link to="/dreams">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>

        {recentDreams.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Sparkles className="w-12 h-12 text-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-display mb-2">No dreams yet</h3>
            <p className="text-muted-foreground mb-4">Start capturing your dreams and goals</p>
            <Link to="/dreams">
              <Button className="bg-primary hover:bg-primary/90 glow-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Dream
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentDreams.map((dream) => (
              <Link key={dream.id} to={`/dreams/${dream.id}`}>
                <div className="glass-card p-5 hover:glow-subtle transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(dream.category)}`}>
                      {dream.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(dream.priority)}
                      {dream.is_favorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
                    </div>
                  </div>
                  <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                    {dream.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dream.description || "No description"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action */}
      <Link to="/dreams?new=true" className="block fade-in" style={{ animationDelay: "0.5s" }}>
        <div className="glass-card p-6 border-dashed border-2 border-primary/30 hover:border-primary/60 transition-all cursor-pointer group text-center">
          <Plus className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-foreground font-medium">Add New Dream</p>
          <p className="text-sm text-muted-foreground">Capture your next goal or vision</p>
        </div>
      </Link>
    </div>
  );
};

export default Dashboard;
