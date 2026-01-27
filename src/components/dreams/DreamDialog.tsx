import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import type { Database } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;
type DreamCategory = Database["public"]["Enums"]["dream_category"];
type DreamPriority = Database["public"]["Enums"]["dream_priority"];
type DreamStatus = Database["public"]["Enums"]["dream_status"];

interface DreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dream?: Dream | null;
  onSuccess: () => void;
}

export function DreamDialog({ open, onOpenChange, dream, onSuccess }: DreamDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "personal" as DreamCategory,
    priority: "medium" as DreamPriority,
    status: "active" as DreamStatus,
    target_date: "",
  });

  useEffect(() => {
    if (dream) {
      setFormData({
        title: dream.title,
        description: dream.description || "",
        category: dream.category,
        priority: dream.priority,
        status: dream.status,
        target_date: dream.target_date || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "personal",
        priority: "medium",
        status: "active",
        target_date: "",
      });
    }
  }, [dream, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your dream",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        target_date: formData.target_date || null,
        user_id: user.id,
      };

      if (dream) {
        const { error } = await supabase
          .from("dreams")
          .update(data)
          .eq("id", dream.id);

        if (error) throw error;

        toast({
          title: "Dream Updated",
          description: "Your dream has been updated successfully",
        });
      } else {
        const { error } = await supabase.from("dreams").insert(data);

        if (error) throw error;

        toast({
          title: "Dream Created",
          description: "Your dream has been added to the vault",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving dream:", error);
      toast({
        title: "Error",
        description: "Failed to save dream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories: DreamCategory[] = [
    "personal",
    "career",
    "health",
    "financial",
    "creative",
    "spiritual",
    "relationships",
    "adventure",
  ];

  const priorities: DreamPriority[] = ["low", "medium", "high"];
  const statuses: DreamStatus[] = ["active", "paused", "completed", "archived"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Sparkles className="w-5 h-5 text-primary" />
            {dream ? "Edit Dream" : "Create New Dream"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What's your dream?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-muted/50 border-border/50"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your dream in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-muted/50 border-border/50 min-h-[100px]"
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as DreamCategory })}
                className="w-full bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as DreamPriority })}
                className="w-full bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none"
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as DreamStatus })}
                className="w-full bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Target Date</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="bg-muted/50 border-border/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 glow-primary"
            >
              {loading ? "Saving..." : dream ? "Update Dream" : "Create Dream"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
