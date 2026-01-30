import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  ArrowLeft,
  Save,
  User,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  bio: string;
  avatar_url: string;
  is_public: boolean;
}

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    bio: "",
    avatar_url: "",
    is_public: true,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, bio, avatar_url, is_public")
        .eq("user_id", user!.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setProfile({
          name: data.name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          is_public: data.is_public ?? true,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          is_public: profile.is_public,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8 fade-in">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display text-gradient-aurora">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile</p>
        </div>
      </header>

      {/* Profile Form */}
      <div className="glass-card p-6 md:p-8 space-y-6 fade-in" style={{ animationDelay: "0.1s" }}>
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full object-cover border-4 border-primary/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30">
              <User className="w-10 h-10 text-primary" />
            </div>
          )}
          <div className="flex-1">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input
              id="avatar_url"
              placeholder="https://example.com/avatar.jpg"
              value={profile.avatar_url}
              onChange={(e) => setProfile(prev => ({ ...prev, avatar_url: e.target.value }))}
              className="bg-muted/50 border-border/50"
            />
          </div>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            className="bg-muted/50 border-border/50"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell others about yourself and your dreams..."
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="bg-muted/50 border-border/50 resize-none"
            rows={4}
          />
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div>
            <Label htmlFor="is_public" className="font-medium">Public Profile</Label>
            <p className="text-sm text-muted-foreground">
              Allow others to see your profile and public dreams
            </p>
          </div>
          <Switch
            id="is_public"
            checked={profile.is_public}
            onCheckedChange={(checked) => setProfile(prev => ({ ...prev, is_public: checked }))}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* View Profile Link */}
      {user && (
        <div className="mt-6 text-center fade-in" style={{ animationDelay: "0.2s" }}>
          <Link 
            to={`/profile/${user.id}`}
            className="text-primary hover:underline text-sm"
          >
            View your public profile →
          </Link>
        </div>
      )}
    </div>
  );
};

export default Settings;
