import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, User, Loader2 } from "lucide-react";

interface SearchResult {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, bio")
        .eq("is_public", true)
        .ilike("name", `%${value.trim()}%`)
        .limit(10);

      setResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-muted/50 border-border/50"
        />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Link
              key={user.user_id}
              to={`/profile/${user.user_id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || "User"} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{user.name || "Dreamer"}</p>
                {user.bio && <p className="text-sm text-muted-foreground truncate">{user.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
