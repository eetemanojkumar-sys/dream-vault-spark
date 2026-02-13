import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Notification = Tables<"notifications">;

const Notifications = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchNotifications();
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8 fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-display text-gradient-aurora">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="border-primary/50">
            <Check className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="glass-card p-12 text-center fade-in">
          <Bell className="w-12 h-12 text-primary/50 mx-auto mb-4" />
          <h3 className="text-lg font-display mb-2">No notifications yet</h3>
          <p className="text-muted-foreground text-sm">
            Interact with the community and you'll see updates here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 stagger-in">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${
                n.read ? "bg-muted/20" : "bg-primary/5 border border-primary/20"
              }`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.message}</p>
                <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                {!n.read && (
                  <button onClick={() => markAsRead(n.id)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
