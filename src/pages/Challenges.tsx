import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Users, Flame, Star, Compass, Heart, Briefcase, Sparkles, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;

const ICON_MAP: Record<string, typeof Trophy> = {
  trophy: Trophy,
  compass: Compass,
  heart: Heart,
  briefcase: Briefcase,
  flame: Flame,
  star: Star,
};

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  category: string | null;
  start_date: string;
  end_date: string;
  badge_name: string;
  badge_icon: string;
  is_active: boolean;
  created_at: string;
  entries_count: number;
  has_entered: boolean;
}

interface LeaderboardEntry {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  likes_count: number;
}

const Challenges = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userDreams, setUserDreams] = useState<Dream[]>([]);
  const [selectedDream, setSelectedDream] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  useEffect(() => {
    fetchChallenges();
    if (user) fetchUserDreams();
  }, [user]);

  useEffect(() => {
    if (activeChallenge) fetchLeaderboard(activeChallenge.id);
  }, [activeChallenge]);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from("dream_challenges")
        .select("*")
        .order("start_date", { ascending: false });
      if (error) throw error;

      const { data: entries } = await supabase
        .from("challenge_entries")
        .select("challenge_id, user_id");

      const enriched: Challenge[] = (data || []).map((c: any) => ({
        ...c,
        entries_count: entries?.filter(e => e.challenge_id === c.id).length || 0,
        has_entered: user ? entries?.some(e => e.challenge_id === c.id && e.user_id === user.id) || false : false,
      }));

      setChallenges(enriched);
      const active = enriched.find(c => c.is_active);
      if (active) setActiveChallenge(active);
    } catch (err) {
      console.error("Error fetching challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDreams = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("dreams")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    setUserDreams(data || []);
  };

  const fetchLeaderboard = async (challengeId: string) => {
    const { data: entries } = await supabase
      .from("challenge_entries")
      .select("user_id, dream_id")
      .eq("challenge_id", challengeId);

    if (!entries || entries.length === 0) {
      setLeaderboard([]);
      return;
    }

    const dreamIds = entries.map(e => e.dream_id);
    const userIds = [...new Set(entries.map(e => e.user_id))];

    const [{ data: likes }, { data: profiles }] = await Promise.all([
      supabase.from("dream_likes").select("dream_id").in("dream_id", dreamIds),
      supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds),
    ]);

    const likesMap = new Map<string, number>();
    likes?.forEach(l => likesMap.set(l.dream_id, (likesMap.get(l.dream_id) || 0) + 1));

    const board: LeaderboardEntry[] = entries.map(e => {
      const profile = profiles?.find(p => p.user_id === e.user_id);
      return {
        user_id: e.user_id,
        name: profile?.name || "Dreamer",
        avatar_url: profile?.avatar_url,
        likes_count: likesMap.get(e.dream_id) || 0,
      };
    }).sort((a, b) => b.likes_count - a.likes_count);

    setLeaderboard(board);
  };

  const submitEntry = async (challengeId: string) => {
    if (!user || !selectedDream) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("challenge_entries").insert({
        challenge_id: challengeId,
        user_id: user.id,
        dream_id: selectedDream,
      });
      if (error) throw error;
      toast({ title: "🏆 Entry submitted!", description: "Your dream is now competing in the challenge!" });
      setSelectedDream("");
      fetchChallenges();
      fetchLeaderboard(challengeId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/20 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display text-gradient-aurora flex-1">Challenges</h1>
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">Explore</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Active Challenge Hero */}
        {activeChallenge && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-dream-shimmer/10 to-dream-cosmic/20 border border-primary/20 p-5 fade-in">
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                <Flame className="w-3 h-3 mr-1" /> ACTIVE
              </Badge>
            </div>
            
            {(() => {
              const IconComp = ICON_MAP[activeChallenge.badge_icon] || Trophy;
              return (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-dream-shimmer flex items-center justify-center mb-3 shadow-lg shadow-primary/30">
                  <IconComp className="w-7 h-7 text-primary-foreground" />
                </div>
              );
            })()}

            <h2 className="text-lg font-display text-foreground mb-1">{activeChallenge.title}</h2>
            <p className="text-sm text-muted-foreground mb-3">{activeChallenge.description}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {getDaysLeft(activeChallenge.end_date)} days left
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> {activeChallenge.entries_count} entries
              </span>
            </div>

            <Progress value={getProgress(activeChallenge.start_date, activeChallenge.end_date)} className="h-1.5 mb-3" />

            <div className="flex items-center gap-2 text-xs">
              <Star className="w-3 h-3 text-dream-gold" />
              <span className="text-foreground font-medium">Prize: {activeChallenge.badge_name} Badge</span>
            </div>

            {/* Entry form */}
            {user && !activeChallenge.has_entered && (
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground mb-2">Submit a public dream to compete:</p>
                <div className="flex gap-2">
                  <select
                    value={selectedDream}
                    onChange={e => setSelectedDream(e.target.value)}
                    className="flex-1 bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
                  >
                    <option value="">Select a dream...</option>
                    {userDreams
                      .filter(d => !activeChallenge.category || d.category === activeChallenge.category)
                      .map(d => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => submitEntry(activeChallenge.id)}
                    disabled={!selectedDream || submitting}
                    className="text-xs"
                  >
                    {submitting ? "..." : "Enter"}
                  </Button>
                </div>
              </div>
            )}

            {activeChallenge.has_entered && (
              <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2 text-xs text-primary">
                <Check className="w-4 h-4" />
                <span className="font-medium">You've entered this challenge!</span>
              </div>
            )}

            {!user && (
              <div className="mt-4">
                <Link to="/auth">
                  <Button size="sm" className="text-xs w-full">Sign in to compete</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard */}
        {activeChallenge && leaderboard.length > 0 && (
          <Card className="glass-card border-border/20 fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Trophy className="w-4 h-4 text-dream-gold" /> Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((entry, i) => (
                <Link
                  key={entry.user_id}
                  to={`/profile/${entry.user_id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-dream-gold/20 text-dream-gold" :
                    i === 1 ? "bg-muted/60 text-muted-foreground" :
                    i === 2 ? "bg-dream-sunset/20 text-dream-sunset" :
                    "bg-muted/30 text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-dream-shimmer/30 flex items-center justify-center overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-foreground">{entry.name?.charAt(0)?.toUpperCase() || "?"}</span>
                    )}
                  </div>
                  <span className="flex-1 text-sm text-foreground font-medium">{entry.name}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {entry.likes_count}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Past & Upcoming Challenges */}
        <div className="fade-in" style={{ animationDelay: "0.15s" }}>
          <h3 className="text-sm font-display text-foreground mb-3">All Challenges</h3>
          <div className="space-y-3">
            {challenges.filter(c => c.id !== activeChallenge?.id).map(challenge => {
              const IconComp = ICON_MAP[challenge.badge_icon] || Trophy;
              const isUpcoming = new Date(challenge.start_date) > new Date();
              return (
                <Card key={challenge.id} className="glass-card border-border/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                      <IconComp className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{challenge.title}</h4>
                      <p className="text-[10px] text-muted-foreground">{challenge.entries_count} entries • {challenge.badge_name}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {isUpcoming ? "Upcoming" : "Ended"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
