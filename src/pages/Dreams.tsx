import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter,
  ArrowLeft,
  Star,
  Clock,
  Flame,
  TrendingUp
} from "lucide-react";
import { DreamCard } from "@/components/dreams/DreamCard";
import { DreamDialog } from "@/components/dreams/DreamDialog";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams">;

const Dreams = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<Dream | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchDreams();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const fetchDreams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("dreams")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDreams(data || []);
    } catch (error) {
      console.error("Error fetching dreams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = useCallback(() => {
    fetchDreams();
    setDialogOpen(false);
    setEditingDream(null);
  }, []);

  const handleEdit = (dream: Dream) => {
    setEditingDream(dream);
    setDialogOpen(true);
  };

  const handleDelete = async (dreamId: string) => {
    await supabase.from("dreams").delete().eq("id", dreamId);
    fetchDreams();
  };

  const handleToggleFavorite = async (dream: Dream) => {
    await supabase
      .from("dreams")
      .update({ is_favorite: !dream.is_favorite })
      .eq("id", dream.id);
    fetchDreams();
  };

  const filteredDreams = dreams.filter((dream) => {
    const matchesSearch = dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dream.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || dream.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || dream.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = ["all", "personal", "career", "health", "financial", "creative", "spiritual", "relationships", "adventure"];
  const priorities = ["all", "high", "medium", "low"];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dreams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8 fade-in">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display text-gradient-aurora">My Dreams</h1>
          <p className="text-sm text-muted-foreground">{dreams.length} dreams in your vault</p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 glow-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Dream
        </Button>
      </header>

      {/* Search & Filters */}
      <div className="glass-card p-4 mb-6 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dreams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary outline-none"
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>
                    {pri === "all" ? "All Priorities" : pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Dreams Grid */}
      {filteredDreams.length === 0 ? (
        <div className="glass-card p-12 text-center fade-in" style={{ animationDelay: "0.2s" }}>
          <Sparkles className="w-16 h-16 text-primary/50 mx-auto mb-4" />
          <h3 className="text-xl font-display mb-2">
            {dreams.length === 0 ? "Your vault is empty" : "No dreams match your filters"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {dreams.length === 0 
              ? "Start capturing your dreams, goals, and visions" 
              : "Try adjusting your search or filters"}
          </p>
          {dreams.length === 0 && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 glow-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Dream
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-in">
          {filteredDreams.map((dream) => (
            <DreamCard
              key={dream.id}
              dream={dream}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {/* Dream Dialog */}
      <DreamDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingDream(null);
        }}
        dream={editingDream}
        onSuccess={handleCreateOrUpdate}
      />
    </div>
  );
};

export default Dreams;
