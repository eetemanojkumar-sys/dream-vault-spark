import { Link } from "react-router-dom";
import { Heart, MessageCircle, User, BookOpen, Share2 } from "lucide-react";
import { useState, useRef } from "react";

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
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personal: "bg-primary/15 text-primary border border-primary/20",
      career: "bg-dream-cosmic/15 text-dream-cosmic border border-dream-cosmic/20",
      health: "bg-dream-aurora/15 text-dream-aurora border border-dream-aurora/20",
      financial: "bg-accent/15 text-accent border border-accent/20",
      creative: "bg-dream-sunset/15 text-dream-sunset border border-dream-sunset/20",
      spiritual: "bg-dream-glow/15 text-dream-glow border border-dream-glow/20",
      relationships: "bg-dream-sunset/15 text-dream-sunset border border-dream-sunset/20",
      adventure: "bg-accent/15 text-accent border border-accent/20",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  // Double-tap to like (Instagram-style)
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350) {
      if (isAuthenticated && !dream.is_liked) {
        onLike(dream.id);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
      }
    }
    lastTap.current = now;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  return (
    <div className="glass-card-hover overflow-hidden group">
      {/* Header - user info */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link to={`/profile/${dream.user_id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-dream-shimmer p-[1.5px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
              {dream.profile?.avatar_url ? (
                <img src={dream.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{dream.profile?.name || "Dreamer"}</p>
            <p className="text-[10px] text-muted-foreground">{timeAgo(dream.created_at)}</p>
          </div>
        </Link>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${getCategoryColor(dream.category)}`}>
          {dream.category}
        </span>
      </div>

      {/* Content - double tap to like */}
      <div className="relative" onClick={handleDoubleTap}>
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

        <div className="px-4 py-3">
          <Link to={`/shared/${dream.share_token}`}>
            <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
              {dream.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {dream.description || "A dream worth pursuing..."}
            </p>
          </Link>
        </div>

        {/* Double-tap heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart className="w-20 h-20 text-red-500 fill-red-500 animate-[scaleIn_0.3s_ease-out_forwards] drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 py-3 border-t border-border/10">
        <button
          onClick={() => isAuthenticated && onLike(dream.id)}
          disabled={!isAuthenticated}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
            dream.is_liked
              ? "text-red-400"
              : "text-muted-foreground hover:text-red-400 hover:bg-red-400/5"
          } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : "active:scale-90"}`}
        >
          <Heart className={`w-5 h-5 transition-transform duration-300 ${dream.is_liked ? "fill-current scale-110" : "hover:scale-110"}`} />
          <span className="stat-number text-xs">{dream.likes_count}</span>
        </button>

        <Link
          to={`/shared/${dream.share_token}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="stat-number text-xs">{dream.comments_count}</span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={() => {
            if (dream.share_token) {
              navigator.clipboard.writeText(`${window.location.origin}/shared/${dream.share_token}`);
            }
          }}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
