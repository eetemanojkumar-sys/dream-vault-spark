import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, Compass, TrendingUp, Flame } from "lucide-react";
import { ExploreDreamCard } from "@/components/social/ExploreDreamCard";
import { UserSearch } from "@/components/social/UserSearch";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StoriesBar from "@/components/social/StoriesBar";

interface PublicDream {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  share_token: string | null;
  profile?: { name: string | null; avatar_url: string | null };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

const Explore = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<PublicDream[]>([]);
  const [trendingDreams, setTrendingDreams] = useState<PublicDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const recomputeTrending = useCallback((currentDreams: PublicDream[]) => {
    const sorted = [...currentDreams].sort((a, b) => b.likes_count - a.likes_count).slice(0, 12);
    setTrendingDreams(sorted);
  }, []);

  useEffect(() => { fetchPublicDreams(); }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("explore-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "dream_likes" }, (payload) => {
        setDreams((prev) => {
          let updated: PublicDream[];
          if (payload.eventType === "INSERT") {
            updated = prev.map((d) => d.id === payload.new.dream_id ? { ...d, likes_count: d.likes_count + 1 } : d);
          } else if (payload.eventType === "DELETE") {
            updated = prev.map((d) => d.id === payload.old.dream_id ? { ...d, likes_count: Math.max(0, d.likes_count - 1) } : d);
          } else { updated = prev; }
          recomputeTrending(updated);
          return updated;
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "dream_reactions" }, () => {
        setDreams((prev) => { recomputeTrending(prev); return prev; });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [recomputeTrending]);

  const fetchPublicDreams = async () => {
    try {
      const { data: dreamsData, error } = await supabase
        .from("dreams")
        .select("id, title, description, category, image_url, created_at, user_id, share_token")
        .eq("is_public", true).not("share_token", "is", null)
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      if (!dreamsData || dreamsData.length === 0) { setDreams([]); setLoading(false); return; }

      const userIds = [...new Set(dreamsData.map(d => d.user_id))];
      const { data: profilesData } = await supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds);
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const { data: likesData } = await supabase.from("dream_likes").select("dream_id");
      const likesCountMap = new Map<string, number>();
      likesData?.forEach(like => { likesCountMap.set(like.dream_id, (likesCountMap.get(like.dream_id) || 0) + 1); });

      const { data: commentsData } = await supabase.from("dream_comments").select("dream_id");
      const commentsCountMap = new Map<string, number>();
      commentsData?.forEach(c => { commentsCountMap.set(c.dream_id, (commentsCountMap.get(c.dream_id) || 0) + 1); });

      let userLikes = new Set<string>();
      if (user) {
        const { data: userLikesData } = await supabase.from("dream_likes").select("dream_id").eq("user_id", user.id);
        userLikes = new Set(userLikesData?.map(l => l.dream_id) || []);
      }

      const enrichedDreams: PublicDream[] = dreamsData.map(dream => ({
        ...dream,
        profile: profilesMap.get(dream.user_id) || undefined,
        likes_count: likesCountMap.get(dream.id) || 0,
        comments_count: commentsCountMap.get(dream.id) || 0,
        is_liked: userLikes.has(dream.id),
      }));

      setDreams(enrichedDreams);
      recomputeTrending(enrichedDreams);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    } finally { setLoading(false); }
  };

  const handleLike = async (dreamId: string) => {
    if (!user) return;
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return;
    if (dream.is_liked) {
      await supabase.from("dream_likes").delete().eq("dream_id", dreamId).eq("user_id", user.id);
    } else {
      await supabase.from("dream_likes").insert({ dream_id: dreamId, user_id: user.id });
    }
    setDreams(prev => prev.map(d => d.id === dreamId ? { ...d, is_liked: !d.is_liked, likes_count: d.is_liked ? d.likes_count - 1 : d.likes_count + 1 } : d));
  };

  const filteredDreams = dreams.filter((dream) => {
    const matchesSearch = dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dream.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || dream.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "personal", "career", "health", "financial", "creative", "spiritual", "relationships", "adventure"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Discovering dreams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 py-3 fade-in">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Compass className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight text-foreground flex-1">Explore</h1>
          {user ? (
            <Link to="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-8">Home</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs h-8 rounded-lg">Join</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Stories */}
        <div className="py-3 border-b border-border/10 fade-in" style={{ animationDelay: "0.05s" }}>
          <StoriesBar />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="feed" className="mt-3 fade-in" style={{ animationDelay: "0.1s" }}>
          <TabsList className="bg-muted/50 w-full justify-start gap-0 overflow-x-auto border border-border/30 rounded-xl h-9">
            <TabsTrigger value="feed" className="text-xs rounded-lg data-[state=active]:bg-background">Feed</TabsTrigger>
            <TabsTrigger value="trending" className="text-xs rounded-lg data-[state=active]:bg-background">
              <Flame className="w-3 h-3 mr-1" />Trending
            </TabsTrigger>
            {user && <TabsTrigger value="activity" className="text-xs rounded-lg data-[state=active]:bg-background">Activity</TabsTrigger>}
            <TabsTrigger value="people" className="text-xs rounded-lg data-[state=active]:bg-background">People</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-4">
            <div className="surface-card p-3 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input placeholder="Search dreams..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/50 border-border/30 h-9 text-sm rounded-lg" />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-muted/50 border border-border/30 rounded-lg px-2 text-xs text-foreground focus:border-primary outline-none">
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {filteredDreams.length === 0 ? (
              <div className="surface-card p-10 text-center">
                <Compass className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1.5">No dreams found</h3>
                <p className="text-sm text-muted-foreground">Be the first to share!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDreams.map((dream) => (
                  <ExploreDreamCard key={dream.id} dream={dream} onLike={handleLike} isAuthenticated={!!user} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="mt-4">
            {trendingDreams.length === 0 ? (
              <div className="surface-card p-10 text-center">
                <TrendingUp className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <h3 className="text-base font-semibold mb-1.5">No trending dreams</h3>
                <p className="text-sm text-muted-foreground">Dreams with most reactions appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trendingDreams.map((dream, i) => (
                  <div key={dream.id} className="relative">
                    {i < 3 && (
                      <div className="absolute -left-1 -top-1 z-10 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[9px] font-bold text-accent-foreground">
                        #{i + 1}
                      </div>
                    )}
                    <ExploreDreamCard dream={dream} onLike={handleLike} isAuthenticated={!!user} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="activity" className="mt-4">
              <div className="surface-card p-4">
                <h2 className="text-sm font-semibold text-foreground mb-3">Following Activity</h2>
                <ActivityFeed />
              </div>
            </TabsContent>
          )}

          <TabsContent value="people" className="mt-4">
            <div className="surface-card p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Find Dreamers</h2>
              <UserSearch />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
