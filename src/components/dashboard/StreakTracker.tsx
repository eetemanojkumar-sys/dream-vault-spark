import { useMemo } from "react";
import { Flame } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;

interface StreakTrackerProps {
  dreams: Dream[];
}

export function StreakTracker({ dreams }: StreakTrackerProps) {
  const { currentStreak, longestStreak } = useMemo(() => {
    if (dreams.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique dates of dream activity
    const dates = [...new Set(
      dreams.map(d => new Date(d.created_at).toDateString())
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let current = 0;
    let longest = 0;
    let streak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if streak includes today or yesterday
    if (dates[0] === today || dates[0] === yesterday) {
      current = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime();
        if (diff <= 86400000 * 1.5) {
          current++;
        } else break;
      }
    }

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const diff = new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime();
      if (diff <= 86400000 * 1.5) {
        streak++;
        longest = Math.max(longest, streak);
      } else {
        streak = 1;
      }
    }
    longest = Math.max(longest, streak, current);

    return { currentStreak: current, longestStreak: longest };
  }, [dreams]);

  const flameSize = currentStreak >= 7 ? "w-8 h-8" : currentStreak >= 3 ? "w-6 h-6" : "w-5 h-5";
  const flameColor = currentStreak >= 7
    ? "text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"
    : currentStreak >= 3
    ? "text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.4)]"
    : "text-muted-foreground";

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      {currentStreak >= 3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5" />
      )}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${currentStreak >= 3 ? "animate-pulse" : ""}`}>
            <Flame className={`${flameSize} ${flameColor} transition-all duration-500`} />
          </div>
          <div>
            <p className="text-2xl stat-number text-foreground">{currentStreak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm stat-number text-muted-foreground">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground">Best</p>
        </div>
      </div>
      {/* Streak dots for last 7 days */}
      <div className="flex gap-1.5 mt-3 justify-center">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(Date.now() - (6 - i) * 86400000).toDateString();
          const isActive = dreams.some(d => new Date(d.created_at).toDateString() === date);
          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_6px_rgba(251,146,60,0.4)]"
                  : "bg-muted/50 border border-border/30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
