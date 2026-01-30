import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  User,
  ArrowLeft,
  Settings,
  UserPlus,
  UserMinus,
  Heart
} from "lucide-react";
import { ExploreDreamCard } from "@/components/social/ExploreDreamCard";
import { FollowButton } from "@/components/social/FollowButton";

interface ProfileData {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
}

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
  } | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [dreams, setDreams] = useState<PublicDream[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, bio, is_public")
        .eq("user_id", userId)
        .single();

      if (profileError || !profileData) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      // Check if profile is public or own profile
      if (!profileData.is_public && !isOwnProfile) {
        setError("This profile is private");
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch public dreams
      const { data: dreamsData } = await supabase
        .from("dreams")
        .select("id, title, description, category, image_url, created_at, user_id, share_token")
        .eq("user_id", userId)
        .eq("is_public", true)
        .not("share_token", "is", null)
        .order("created_at", { ascending: false });

      // Fetch likes and comments counts
      const dreamIds = dreamsData?.map(d => d.id) || [];
      
      let likesCountMap = new Map<string, number>();
      let commentsCountMap = new Map<string, number>();
      let userLikes = new Set<string>();

      if (dreamIds.length > 0) {
        const { data: likesData } = await supabase
          .from("dream_likes")
          .select("dream_id")
          .in("dream_id", dreamIds);

        likesData?.forEach(like => {
          likesCountMap.set(like.dream_id, (likesCountMap.get(like.dream_id) || 0) + 1);
        });

        const { data: commentsData } = await supabase
          .from("dream_comments")
          .select("dream_id")
          .in("dream_id", dreamIds);

        commentsData?.forEach(comment => {
          commentsCountMap.set(comment.dream_id, (commentsCountMap.get(comment.dream_id) || 0) + 1);
        });

        if (user) {
          const { data: userLikesData } = await supabase
            .from("dream_likes")
            .select("dream_id")
            .eq("user_id", user.id)
            .in("dream_id", dreamIds);
          
          userLikes = new Set(userLikesData?.map(l => l.dream_id) || []);
        }
      }

      const enrichedDreams: PublicDream[] = (dreamsData || []).map(dream => ({
        ...dream,
        profile: { name: profileData.name, avatar_url: profileData.avatar_url },
        likes_count: likesCountMap.get(dream.id) || 0,
        comments_count: commentsCountMap.get(dream.id) || 0,
        is_liked: userLikes.has(dream.id),
      }));

      setDreams(enrichedDreams);

      // Fetch followers count
      const { count: followers } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);
      
      setFollowersCount(followers || 0);

      // Fetch following count
      const { count: following } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);
      
      setFollowingCount(following || 0);

      // Check if current user is following
      if (user && userId !== user.id) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .single();
        
        setIsFollowing(!!followData);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Something went wrong");
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

  const handleFollowChange = (newIsFollowing: boolean) => {
    setIsFollowing(newIsFollowing);
    setFollowersCount(prev => newIsFollowing ? prev + 1 : prev - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-display text-foreground mb-2">Profile Not Available</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/explore">
            <Button className="bg-primary hover:bg-primary/90">
              Explore Dreams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8 fade-in">
        <Link to="/explore">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1" />
        {isOwnProfile && (
          <Link to="/settings">
            <Button variant="outline" className="border-primary/50">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        )}
      </header>

      {/* Profile Card */}
      <div className="glass-card p-6 md:p-8 mb-8 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.name || "User"} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary/30"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30">
              <User className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-display text-foreground mb-2">
              {profile.name || "Dreamer"}
            </h1>
            
            {profile.bio && (
              <p className="text-muted-foreground mb-4 max-w-lg">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
              <div className="text-center">
                <span className="text-xl font-display text-foreground">{dreams.length}</span>
                <p className="text-xs text-muted-foreground">Dreams</p>
              </div>
              <div className="text-center">
                <span className="text-xl font-display text-foreground">{followersCount}</span>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <span className="text-xl font-display text-foreground">{followingCount}</span>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Follow Button */}
            {!isOwnProfile && user && (
              <FollowButton
                targetUserId={userId!}
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dreams */}
      <div className="fade-in" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-xl font-display text-foreground mb-4">Public Dreams</h2>
        
        {dreams.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Sparkles className="w-12 h-12 text-primary/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No public dreams yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dreams.map((dream) => (
              <ExploreDreamCard
                key={dream.id}
                dream={dream}
                onLike={handleLike}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
