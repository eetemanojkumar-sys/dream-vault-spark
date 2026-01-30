import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  isFollowing: boolean;
  onFollowChange: (isFollowing: boolean) => void;
}

export function FollowButton({ targetUserId, isFollowing, onFollowChange }: FollowButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
        
        onFollowChange(false);
      } else {
        await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: targetUserId });
        
        onFollowChange(true);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isFollowing) {
    return (
      <Button
        onClick={handleClick}
        disabled={loading}
        variant="outline"
        className="border-primary/50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <UserMinus className="w-4 h-4 mr-2" />
        )}
        Unfollow
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="bg-primary hover:bg-primary/90"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UserPlus className="w-4 h-4 mr-2" />
      )}
      Follow
    </Button>
  );
}
