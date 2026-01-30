import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Send, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentSectionProps {
  dreamId: string;
}

export function CommentSection({ dreamId }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [dreamId]);

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from("dream_comments")
        .select("id, user_id, content, created_at")
        .eq("dream_id", dreamId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // Fetch profiles
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);

      const enrichedComments: Comment[] = commentsData.map(comment => ({
        ...comment,
        profile: profilesMap.get(comment.user_id) || null,
      }));

      setComments(enrichedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("dream_comments")
        .insert({
          dream_id: dreamId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      fetchComments();
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await supabase
        .from("dream_comments")
        .delete()
        .eq("id", commentId);

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display text-foreground">
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      {user ? (
        <div className="flex gap-3">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-muted/50 border-border/50 resize-none"
            rows={2}
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            className="bg-primary hover:bg-primary/90 self-end"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      ) : (
        <div className="glass p-4 rounded-lg text-center">
          <p className="text-muted-foreground text-sm mb-2">Sign in to leave a comment</p>
          <Link to="/auth">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link to={`/profile/${comment.user_id}`}>
                {comment.profile?.avatar_url ? (
                  <img 
                    src={comment.profile.avatar_url} 
                    alt={comment.profile.name || "User"} 
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/profile/${comment.user_id}`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {comment.profile?.name || "Dreamer"}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
