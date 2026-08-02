import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Users, Sparkles, Flame, Clock, UserCheck, MessageCircle, Compass, ChevronDown } from "lucide-react";
import { ExploreDreamCard } from "@/components/social/ExploreDreamCard";
import { DreamReactions } from "@/components/social/DreamReactions";
import { CommentSection } from "@/components/social/CommentSection";
import { cn } from "@/lib/utils";

interface FeedDream {
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

type SortMode = "latest" | "loved" | "following";

const Community = () => {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<FeedDream[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("latest");
  const [openComments, setOpenComments] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const { data: dreamsData } = await supabase
        .from("dreams")
        .select("id, title, description, category, image_url, created_at, user_id, share_token")
        .eq("is_public", true)
        .not("share_token", "is", null)
        .order("created_at", { ascending: false })
        .limit(60);

      if (!dreamsData?.length) {
        setDreams([]);
        return;
      }

      const userIds = [...new Set(dreamsData.map((d) => d.user_id))];
      const [{ data: profilesData }, { data: likesData }, { data: commentsData }] = await Promise.all([
        supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds),
        supabase.from("dream_likes").select("dream_id, user_id"),
        supabase.from("dream_comments").select("dream_id"),
      ]);

      const profilesMap = new Map(profilesData?.map((p) => [p.user_id, p]) || []);
      const likesCount = new Map<string, number>();
      const myLikes = new Set<string>();
      likesData?.forEach((l) => {
        likesCount.set(l.dream_id, (likesCount.get(l.dream_id) || 0) + 1);
        if (user && l.user_id === user.id) myLikes.add(l.dream_id);
      });
      const commentsCount = new Map<string, number>();
      commentsData?.forEach((c) => commentsCount.set(c.dream_id, (commentsCount.get(c.dream_id) || 0) + 1));

      setDreams(
        dreamsData.map((d) => ({
          ...d,
          profile: profilesMap.get(d.user_id) || undefined,
          likes_count: likesCount.get(d.id) || 0,
          comments_count: commentsCount.get(d.id) || 0,
          is_liked: myLikes.has(d.id),
        }))
      );

      if (user) {
        const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
        setFollowingIds(follows?.map((f) => f.following_id) || []);
      }
    } catch (error) {
      console.error("Error loading community feed:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const channel = supabase
      .channel("community-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "dreams" }, () => fetchFeed())
      .on("postgres_changes", { event: "*", schema: "public", table: "dream_likes" }, (payload) => {
        setDreams((prev) =>
          prev.map((d) => {
            if (payload.eventType === "INSERT" && d.id === (payload.new as any).dream_id)
              return { ...d, likes_count: d.likes_count + 1 };
            if (payload.eventType === "DELETE" && d.id === (payload.old as any).dream_id)
              return { ...d, likes_count: Math.max(0, d.likes_count - 1) };
            return d;
          })
        );
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFeed]);

  const handleLike = async (dreamId: string) => {
    if (!user) return;
    const dream = dreams.find((d) => d.id === dreamId);
    if (!dream) return;
    setDreams((prev) =>
      prev.map((d) =>
        d.id === dreamId
          ? { ...d, is_liked: !d.is_liked, likes_count: d.is_liked ? d.likes_count - 1 : d.likes_count + 1 }
          : d
      )
    );
    if (dream.is_liked) {
      await supabase.from("dream_likes").delete().eq("dream_id", dreamId).eq("user_id", user.id);
    } else {
      await supabase.from("dream_likes").insert({ dream_id: dreamId, user_id: user.id });
    }
  };

  const visibleDreams = (() => {
    if (sort === "loved") return [...dreams].sort((a, b) => b.likes_count - a.likes_count);
    if (sort === "following") return dreams.filter((d) => followingIds.includes(d.user_id));
    return dreams;
  })();

  const totalDreamers = new Set(dreams.map((d) => d.user_id)).size;
  const totalEngagement = dreams.reduce((sum, d) => sum + d.likes_count + d.comments_count, 0);

  const tabs: { id: SortMode; label: string; icon: typeof Clock }[] = [
    { id: "latest", label: "Latest", icon: Clock },
    { id: "loved", label: "Most loved", icon: Flame },
    ...(user ? [{ id: "following" as SortMode, label: "Following", icon: UserCheck }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-10 h-10 text-primary animate-pulse mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading the community…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight text-foreground flex-1">Community</h1>
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs h-8">
              <Compass className="w-3.5 h-3.5 mr-1" /> Explore
            </Button>
          </Link>
          {!user && (
            <Link to="/auth">
              <Button size="sm" className="text-xs h-8 rounded-lg">Join</Button>
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4">
        {/* Community pulse */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Dreams shared", value: dreams.length },
            { label: "Dreamers", value: totalDreamers },
            { label: "Engagements", value: totalEngagement },
          ].map((s) => (
            <div key={s.label} className="surface-card p-3 text-center">
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all",
                sort === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border/30 hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-3 mt-4">
          {visibleDreams.length === 0 ? (
            <div className="surface-card p-10 text-center">
              <Users className="w-10 h-10 text-primary/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-1.5">Nothing here yet</h3>
              <p className="text-sm text-muted-foreground">
                {sort === "following" ? "Follow dreamers to fill your feed." : "Be the first to share a dream."}
              </p>
            </div>
          ) : (
            visibleDreams.map((dream) => (
              <div key={dream.id} className="space-y-0">
                <ExploreDreamCard dream={dream} onLike={handleLike} isAuthenticated={!!user} />
                <div className="surface-card mt-1 p-3 space-y-3">
                  <DreamReactions dreamId={dream.id} />
                  <button
                    onClick={() => setOpenComments(openComments === dream.id ? null : dream.id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {openComments === dream.id ? "Hide comments" : `Comments (${dream.comments_count})`}
                    <ChevronDown
                      className={cn("w-3.5 h-3.5 transition-transform", openComments === dream.id && "rotate-180")}
                    />
                  </button>
                  {openComments === dream.id && (
                    <div className="pt-2 border-t border-border/20">
                      <CommentSection dreamId={dream.id} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
