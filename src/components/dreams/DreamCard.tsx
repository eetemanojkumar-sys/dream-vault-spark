import { Link } from "react-router-dom";
import { Star, Clock, Flame, TrendingUp, MoreVertical, Edit2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;

interface DreamCardProps {
  dream: Dream;
  onEdit: (dream: Dream) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (dream: Dream) => void;
}

const categoryStyles: Record<string, string> = {
  personal: "bg-primary/10 text-primary",
  career: "bg-dream-cosmic/10 text-dream-cosmic",
  health: "bg-dream-aurora/10 text-dream-aurora",
  financial: "bg-accent/10 text-accent",
  creative: "bg-dream-sunset/10 text-dream-sunset",
  spiritual: "bg-dream-glow/10 text-dream-glow",
  relationships: "bg-dream-sunset/10 text-dream-sunset",
  adventure: "bg-accent/10 text-accent",
};

const statusStyles: Record<string, string> = {
  active: "bg-dream-aurora/10 text-dream-aurora",
  completed: "bg-primary/10 text-primary",
  paused: "bg-accent/10 text-accent",
  archived: "bg-muted text-muted-foreground",
};

export function DreamCard({ dream, onEdit, onDelete, onToggleFavorite }: DreamCardProps) {
  return (
    <div className="surface-card p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${categoryStyles[dream.category] || "bg-muted text-muted-foreground"}`}>
            {dream.category}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusStyles[dream.status] || "bg-muted text-muted-foreground"}`}>
            {dream.status}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {dream.priority === "high" ? <Flame className="w-3.5 h-3.5 text-destructive" /> :
           dream.priority === "medium" ? <TrendingUp className="w-3.5 h-3.5 text-accent" /> :
           <Clock className="w-3.5 h-3.5 text-dream-cosmic" />}
          <button
            onClick={(e) => { e.preventDefault(); onToggleFavorite(dream); }}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${dream.is_favorite ? "text-accent fill-accent" : "text-muted-foreground"}`} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}>
                <MoreVertical className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={() => onEdit(dream)}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(dream.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Link to={`/dreams/${dream.id}`}>
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
          {dream.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {dream.description || "No description"}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {dream.story && (
            <div className="flex items-center gap-1 text-primary">
              <BookOpen className="w-3 h-3" />
              <span>Story</span>
            </div>
          )}
          {dream.target_date && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(dream.target_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
