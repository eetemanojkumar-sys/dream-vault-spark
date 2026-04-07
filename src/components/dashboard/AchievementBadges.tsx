import { useMemo } from "react";
import { Award, Sparkles, Target, Flame, BookOpen, Heart, Users, Zap } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;

interface Badge {
  id: string;
  icon: typeof Award;
  label: string;
  description: string;
  unlocked: boolean;
  gradient: string;
}

interface AchievementBadgesProps {
  dreams: Dream[];
}

export function AchievementBadges({ dreams }: AchievementBadgesProps) {
  const badges = useMemo<Badge[]>(() => {
    const total = dreams.length;
    const completed = dreams.filter(d => d.status === "completed").length;
    const favorites = dreams.filter(d => d.is_favorite).length;
    const stories = dreams.filter(d => d.story).length;
    const categories = new Set(dreams.map(d => d.category)).size;

    return [
      {
        id: "first",
        icon: Sparkles,
        label: "First Dream",
        description: "Created your first dream",
        unlocked: total >= 1,
        gradient: "from-primary to-dream-shimmer",
      },
      {
        id: "five",
        icon: Target,
        label: "Dream Catcher",
        description: "Created 5 dreams",
        unlocked: total >= 5,
        gradient: "from-dream-cosmic to-dream-aurora",
      },
      {
        id: "ten",
        icon: Zap,
        label: "Visionary",
        description: "Created 10 dreams",
        unlocked: total >= 10,
        gradient: "from-accent to-dream-gold",
      },
      {
        id: "complete",
        icon: Award,
        label: "Achiever",
        description: "Completed a dream",
        unlocked: completed >= 1,
        gradient: "from-dream-aurora to-green-400",
      },
      {
        id: "storyteller",
        icon: BookOpen,
        label: "Storyteller",
        description: "Generated a story",
        unlocked: stories >= 1,
        gradient: "from-dream-sunset to-primary",
      },
      {
        id: "explorer",
        icon: Users,
        label: "Explorer",
        description: "Used 4+ categories",
        unlocked: categories >= 4,
        gradient: "from-dream-nebula to-dream-cosmic",
      },
      {
        id: "curator",
        icon: Heart,
        label: "Curator",
        description: "Favorited 3+ dreams",
        unlocked: favorites >= 3,
        gradient: "from-red-400 to-dream-sunset",
      },
      {
        id: "prolific",
        icon: Flame,
        label: "Prolific",
        description: "Created 25 dreams",
        unlocked: total >= 25,
        gradient: "from-orange-400 to-red-500",
      },
    ];
  }, [dreams]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Achievements</h3>
        <span className="text-[10px] text-muted-foreground">{unlockedCount}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {badges.map(badge => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1 group relative"
              title={`${badge.label}: ${badge.description}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  badge.unlocked
                    ? `bg-gradient-to-br ${badge.gradient} shadow-lg`
                    : "bg-muted/30 border border-border/20"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    badge.unlocked ? "text-foreground" : "text-muted-foreground/30"
                  }`}
                />
              </div>
              <span
                className={`text-[9px] text-center leading-tight ${
                  badge.unlocked ? "text-foreground" : "text-muted-foreground/40"
                }`}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
