import { Link } from "react-router-dom";
import { Heart, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface ExploreDreamCardProps {
  dream: PublicDream;
  onLike: (dreamId: string) => void;
  isAuthenticated: boolean;
}

export function ExploreDreamCard({ dream, onLike, isAuthenticated }: ExploreDreamCardProps) {
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

  return (
    <div className="glass-card overflow-hidden hover:glow-subtle transition-all group">
      {/* Image */}
      {dream.image_url && (
        <Link to={`/shared/${dream.share_token}`}>
          <div className="aspect-video overflow-hidden">
            <img 
              src={dream.image_url} 
              alt={dream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      )}
      
      <div className="p-5">
        {/* Author */}
        <Link to={`/profile/${dream.user_id}`} className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity">
          {dream.profile?.avatar_url ? (
            <img 
              src={dream.profile.avatar_url} 
              alt={dream.profile.name || "User"} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
          )}
          <span className="text-sm text-muted-foreground">
            {dream.profile?.name || "Dreamer"}
          </span>
        </Link>

        {/* Category */}
        <div className="mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(dream.category)}`}>
            {dream.category}
          </span>
        </div>

        {/* Title & Description */}
        <Link to={`/shared/${dream.share_token}`}>
          <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {dream.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {dream.description || "A dream worth pursuing..."}
          </p>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/50">
          <button
            onClick={() => isAuthenticated && onLike(dream.id)}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              dream.is_liked 
                ? "text-red-400" 
                : "text-muted-foreground hover:text-red-400"
            } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <Heart className={`w-4 h-4 ${dream.is_liked ? "fill-current" : ""}`} />
            <span>{dream.likes_count}</span>
          </button>
          
          <Link 
            to={`/shared/${dream.share_token}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{dream.comments_count}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
