import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Search, 
  Filter,
  Compass,
  Heart,
  MessageCircle,
  User
} from "lucide-react";
import { ExploreDreamCard } from "@/components/social/ExploreDreamCard";
import { UserSearch } from "@/components/social/UserSearch";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PublicDream {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  share_token: string | null;
  profile?: {
    name: string | null;
    avatar_url: string | null;
  };
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

  // Recompute trending from current dreams state
  const recomputeTrending = useCallback((currentDreams: PublicDream[]) => {
    const sorted = [...currentDreams]
      .sort((a, b) => b.likes_count - a.likes_count)
      .slice(0, 12);
    setTrendingDreams(sorted);
  }, []);

  useEffect(() => {
    fetchPublicDreams();
  }, [user]);

  // Real-time subscriptions for likes and reactions
  useEffect(() => {
    const channel = supabase
      .channel("explore-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dream_likes" },
        (payload) => {
          setDreams((prev) => {
            let updated: PublicDream[];
            if (payload.eventType === "INSERT") {
              updated = prev.map((d) =>
                d.id === payload.new.dream_id
                  ? { ...d, likes_count: d.likes_count + 1 }
                  : d
              );
            } else if (payload.eventType === "DELETE") {
              updated = prev.map((d) =>
                d.id === payload.old.dream_id
                  ? { ...d, likes_count: Math.max(0, d.likes_count - 1) }
                  : d
              );
            } else {
              updated = prev;
            }
            recomputeTrending(updated);
            return updated;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dream_reactions" },
        (payload) => {
          // Reactions affect trending score — just re-sort trending
          setDreams((prev) => {
            recomputeTrending(prev);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [recomputeTrending]);

  const fetchPublicDreams = async () => {
    try {
      // Fetch public dreams
      const { data: dreamsData, error: dreamsError } = await supabase
        .from("dreams")
        .select("id, title, description, category, image_url, created_at, user_id, share_token")
        .eq("is_public", true)
        .not("share_token", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (dreamsError) throw dreamsError;

      if (!dreamsData || dreamsData.length === 0) {
        setDreams([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(dreamsData.map(d => d.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      // Fetch likes counts
      const { data: likesData } = await supabase
        .from("dream_likes")
        .select("dream_id");

      const likesCountMap = new Map<string, number>();
      likesData?.forEach(like => {
        likesCountMap.set(like.dream_id, (likesCountMap.get(like.dream_id) || 0) + 1);
      });

      // Fetch comments counts
      const { data: commentsData } = await supabase
        .from("dream_comments")
        .select("dream_id");

      const commentsCountMap = new Map<string, number>();
      commentsData?.forEach(comment => {
        commentsCountMap.set(comment.dream_id, (commentsCountMap.get(comment.dream_id) || 0) + 1);
      });

      // Check which dreams current user has liked
      let userLikes = new Set<string>();
      if (user) {
        const { data: userLikesData } = await supabase
          .from("dream_likes")
          .select("dream_id")
          .eq("user_id", user.id);
        
        userLikes = new Set(userLikesData?.map(l => l.dream_id) || []);
      }

      // Combine all data
      const enrichedDreams: PublicDream[] = dreamsData.map(dream => ({
        ...dream,
        profile: profilesMap.get(dream.user_id) || null,
        likes_count: likesCountMap.get(dream.id) || 0,
        comments_count: commentsCountMap.get(dream.id) || 0,
        is_liked: userLikes.has(dream.id),
      }));

      setDreams(enrichedDreams);
      recomputeTrending(enrichedDreams);
    } catch (error) {
      console.error("Error fetching public dreams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (dreamId: string) => {
    if (!user) return;

    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return;

    if (dream.is_liked) {
      await supabase
        .from("dream_likes")
        .delete()
        .eq("dream_id", dreamId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("dream_likes")
        .insert({ dream_id: dreamId, user_id: user.id });
    }

    // Update local state
    setDreams(prev => prev.map(d => 
      d.id === dreamId 
        ? { 
            ...d, 
            is_liked: !d.is_liked, 
            likes_count: d.is_liked ? d.likes_count - 1 : d.likes_count + 1 
          }
        : d
    ));
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
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Discovering dreams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8 fade-in">
        <div className="p-3 rounded-xl bg-primary/20">
          <Compass className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-display text-gradient-aurora">Explore Dreams</h1>
          <p className="text-sm text-muted-foreground">Discover dreams from the community</p>
        </div>
        {user ? (
          <Link to="/dashboard">
            <Button variant="outline" className="border-primary/50">
              My Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/auth">
            <Button className="bg-primary hover:bg-primary/90">
              Join Dream Vault
            </Button>
          </Link>
        )}
      </header>

      {/* Tabs: Dreams / Activity / People */}
      <Tabs defaultValue="dreams" className="fade-in" style={{ animationDelay: "0.1s" }}>
        <TabsList className="glass mb-6 w-full md:w-auto">
          <TabsTrigger value="dreams">Dreams</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          {user && <TabsTrigger value="activity">Activity</TabsTrigger>}
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>

        <TabsContent value="dreams">
          {/* Search & Filters */}
          <div className="glass-card p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search dreams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

      {/* Dreams Grid */}
      {filteredDreams.length === 0 ? (
        <div className="glass-card p-12 text-center fade-in" style={{ animationDelay: "0.2s" }}>
          <Compass className="w-16 h-16 text-primary/50 mx-auto mb-4" />
          <h3 className="text-xl font-display mb-2">No public dreams yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your dreams with the community!
          </p>
          {!user && (
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 glow-primary">
                Get Started
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-in">
          {filteredDreams.map((dream) => (
            <ExploreDreamCard
              key={dream.id}
              dream={dream}
              onLike={handleLike}
              isAuthenticated={!!user}
            />
          ))}
        </div>
      )}
        </TabsContent>

        <TabsContent value="trending">
          {trendingDreams.length === 0 ? (
            <div className="glass-card p-12 text-center fade-in" style={{ animationDelay: "0.2s" }}>
              <Sparkles className="w-16 h-16 text-primary/50 mx-auto mb-4" />
              <h3 className="text-xl font-display mb-2">No trending dreams yet</h3>
              <p className="text-muted-foreground">Dreams with the most reactions and likes appear here</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-in">
              {trendingDreams.map((dream) => (
                <ExploreDreamCard
                  key={dream.id}
                  dream={dream}
                  onLike={handleLike}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="activity">
            <div className="glass-card p-6">
              <h2 className="text-xl font-display text-foreground mb-4">Following Activity</h2>
              <ActivityFeed />
            </div>
          </TabsContent>
        )}

        <TabsContent value="people">
          <div className="glass-card p-6">
            <h2 className="text-xl font-display text-foreground mb-4">Find Dreamers</h2>
            <UserSearch />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Explore;
