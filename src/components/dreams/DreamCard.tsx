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

export function DreamCard({ dream, onEdit, onDelete, onToggleFavorite }: DreamCardProps) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flame className="w-4 h-4 text-red-400" />;
      case "medium":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/20 text-green-300",
      completed: "bg-blue-500/20 text-blue-300",
      paused: "bg-yellow-500/20 text-yellow-300",
      archived: "bg-muted text-muted-foreground",
    };
    return styles[status] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="glass-card p-5 hover:glow-subtle transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(dream.category)}`}>
            {dream.category}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(dream.status)}`}>
            {dream.status}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {getPriorityIcon(dream.priority)}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(dream);
            }}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                dream.is_favorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem onClick={() => onEdit(dream)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(dream.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Link to={`/dreams/${dream.id}`}>
        <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {dream.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {dream.description || "No description"}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {dream.story && (
            <div className="flex items-center gap-1 text-primary">
              <BookOpen className="w-3 h-3" />
              <span>Story</span>
            </div>
          )}
          {dream.target_date && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Target: {new Date(dream.target_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
