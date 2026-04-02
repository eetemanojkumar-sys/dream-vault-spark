import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Sparkles } from "lucide-react";

interface StoryUser {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  has_recent_dream: boolean;
}

const StoriesBar = () => {
  const { user } = useAuth();
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);

  useEffect(() => {
    fetchStoryUsers();
  }, [user]);

  const fetchStoryUsers = async () => {
    try {
      // Get users who posted public dreams in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentDreams } = await supabase
        .from("dreams")
        .select("user_id")
        .eq("is_public", true)
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: false });

      if (!recentDreams || recentDreams.length === 0) {
        setStoryUsers([]);
        return;
      }

      const uniqueUserIds = [...new Set(recentDreams.map(d => d.user_id))];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", uniqueUserIds);

      const users: StoryUser[] = (profiles || []).map(p => ({
        user_id: p.user_id,
        name: p.name,
        avatar_url: p.avatar_url,
        has_recent_dream: true,
      }));

      setStoryUsers(users);
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const getInitial = (name: string | null) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
      {/* Your Story */}
      {user && (
        <Link to="/dreams?new=true" className="flex flex-col items-center gap-1 min-w-[68px]">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Your Story</span>
        </Link>
      )}

      {/* Other users' stories */}
      {storyUsers
        .filter(s => s.user_id !== user?.id)
        .map((storyUser) => (
          <Link
            key={storyUser.user_id}
            to={`/profile/${storyUser.user_id}`}
            className="flex flex-col items-center gap-1 min-w-[68px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-dream-shimmer to-dream-aurora p-[2px]">
              <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center overflow-hidden">
                {storyUser.avatar_url ? (
                  <img
                    src={storyUser.avatar_url}
                    alt={storyUser.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-display text-primary">
                    {getInitial(storyUser.name)}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[68px]">
              {storyUser.name || "Dreamer"}
            </span>
          </Link>
        ))}

      {storyUsers.filter(s => s.user_id !== user?.id).length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 glass rounded-2xl min-w-[200px]">
          <Sparkles className="w-4 h-4 text-primary/50" />
          <span className="text-xs text-muted-foreground">No stories yet today</span>
        </div>
      )}
    </div>
  );
};

export default StoriesBar;
