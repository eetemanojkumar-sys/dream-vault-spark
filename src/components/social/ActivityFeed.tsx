import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Target, User, Loader2 } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "new_dream";
  dream_id: string;
  dream_title: string;
  dream_category: string;
  share_token: string | null;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  created_at: string;
}

export function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchActivity();
  }, [user]);

  const fetchActivity = async () => {
    if (!user) return;

    try {
      // Get who the user follows
      const { data: follows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (!follows || follows.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const followingIds = follows.map((f) => f.following_id);

      // Get recent public dreams from followed users
      const { data: dreams } = await supabase
        .from("dreams")
        .select("id, title, category, share_token, user_id, created_at")
        .in("user_id", followingIds)
        .eq("is_public", true)
        .not("share_token", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!dreams || dreams.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // Get profiles
      const userIds = [...new Set(dreams.map((d) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const items: ActivityItem[] = dreams.map((d) => {
        const profile = profilesMap.get(d.user_id);
        return {
          id: d.id,
          type: "new_dream",
          dream_id: d.id,
          dream_title: d.title,
          dream_category: d.category,
          share_token: d.share_token,
          user_id: d.user_id,
          user_name: profile?.name || null,
          user_avatar: profile?.avatar_url || null,
          created_at: d.created_at,
        };
      });

      setActivities(items);
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-10 h-10 text-primary/50 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No activity yet. Follow dreamers to see their updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
          <Link to={`/profile/${activity.user_id}`}>
            {activity.user_avatar ? (
              <img src={activity.user_avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <Link to={`/profile/${activity.user_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                {activity.user_name || "Dreamer"}
              </Link>{" "}
              <span className="text-muted-foreground">shared a new dream</span>
            </p>
            <Link
              to={activity.share_token ? `/shared/${activity.share_token}` : "#"}
              className="flex items-center gap-2 mt-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              <span className="truncate">{activity.dream_title}</span>
            </Link>
            <span className="text-xs text-muted-foreground mt-1 block">{timeAgo(activity.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
