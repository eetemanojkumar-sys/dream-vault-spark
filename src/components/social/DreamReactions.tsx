import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const REACTIONS = ["🔥", "❤️", "🌟", "💡", "🎯", "💪"] as const;

interface ReactionCount {
  reaction: string;
  count: number;
  reacted: boolean;
}

interface DreamReactionsProps {
  dreamId: string;
}

export function DreamReactions({ dreamId }: DreamReactionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState<ReactionCount[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [dreamId, user]);

  const fetchReactions = async () => {
    try {
      const { data: allReactions } = await supabase
        .from("dream_reactions")
        .select("reaction, user_id")
        .eq("dream_id", dreamId);

      const counts: ReactionCount[] = REACTIONS.map((r) => ({
        reaction: r,
        count: allReactions?.filter((ar) => ar.reaction === r).length || 0,
        reacted: allReactions?.some((ar) => ar.reaction === r && ar.user_id === user?.id) || false,
      }));

      setReactions(counts);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    }
  };

  const handleReaction = async (reaction: string) => {
    if (!user || loading) return;

    setLoading(reaction);
    const existing = reactions.find((r) => r.reaction === reaction);

    try {
      if (existing?.reacted) {
        await supabase
          .from("dream_reactions")
          .delete()
          .eq("dream_id", dreamId)
          .eq("user_id", user.id)
          .eq("reaction", reaction);
      } else {
        await supabase
          .from("dream_reactions")
          .insert({ dream_id: dreamId, user_id: user.id, reaction });
      }

      setReactions((prev) =>
        prev.map((r) =>
          r.reaction === reaction
            ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
            : r
        )
      );
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast({ title: "Error", description: "Failed to update reaction.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {reactions.map((r) => (
        <button
          key={r.reaction}
          onClick={() => handleReaction(r.reaction)}
          disabled={!user || loading === r.reaction}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
            r.reacted
              ? "bg-primary/20 border border-primary/40 scale-105"
              : "bg-muted/50 border border-border/50 hover:border-primary/30"
          } ${!user ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <span>{r.reaction}</span>
          {r.count > 0 && <span className="text-xs text-muted-foreground">{r.count}</span>}
        </button>
      ))}
    </div>
  );
}
