import { useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;

const categoryConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  personal: { emoji: "🌟", color: "hsl(270, 60%, 65%)", bg: "bg-primary/20" },
  career: { emoji: "💼", color: "hsl(200, 80%, 55%)", bg: "bg-dream-cosmic/20" },
  health: { emoji: "💪", color: "hsl(180, 60%, 50%)", bg: "bg-dream-aurora/20" },
  financial: { emoji: "💰", color: "hsl(42, 80%, 60%)", bg: "bg-accent/20" },
  creative: { emoji: "🎨", color: "hsl(330, 70%, 60%)", bg: "bg-dream-sunset/20" },
  spiritual: { emoji: "🧘", color: "hsl(280, 50%, 70%)", bg: "bg-dream-glow/20" },
  relationships: { emoji: "❤️", color: "hsl(350, 70%, 60%)", bg: "bg-dream-sunset/20" },
  adventure: { emoji: "🌍", color: "hsl(25, 80%, 55%)", bg: "bg-accent/20" },
};

interface CategoryChartProps {
  dreams: Dream[];
}

export function CategoryChart({ dreams }: CategoryChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    dreams.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
        config: categoryConfig[category] || { emoji: "✨", color: "#888", bg: "bg-muted/20" },
      }))
      .sort((a, b) => b.count - a.count);
  }, [dreams]);

  const total = dreams.length;
  if (total === 0) return null;

  // Build a visual donut using conic gradient
  let cumulativePercent = 0;
  const conicStops = data.map(d => {
    const pct = (d.count / total) * 100;
    const start = cumulativePercent;
    cumulativePercent += pct;
    return `${d.config.color} ${start}% ${cumulativePercent}%`;
  }).join(", ");

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-medium text-foreground mb-4">Dream Categories</h3>
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${conicStops})`,
            }}
          />
          <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
            <span className="text-xs stat-number text-foreground">{total}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {data.slice(0, 6).map(d => (
            <div key={d.category} className="flex items-center gap-1.5">
              <span className="text-xs">{d.config.emoji}</span>
              <span className="text-[10px] text-muted-foreground capitalize truncate">{d.category}</span>
              <span className="text-[10px] stat-number text-foreground ml-auto">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
