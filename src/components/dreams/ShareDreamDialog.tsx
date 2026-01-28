import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Globe, Lock, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Dream = Tables<"dreams"> & { is_public?: boolean; share_token?: string };

interface ShareDreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dream: Dream;
  onUpdate: () => void;
}

export function ShareDreamDialog({ open, onOpenChange, dream, onUpdate }: ShareDreamDialogProps) {
  const { toast } = useToast();
  const [isPublic, setIsPublic] = useState(dream.is_public || false);
  const [shareToken, setShareToken] = useState(dream.share_token || "");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken 
    ? `${window.location.origin}/shared/${shareToken}` 
    : "";

  const handleTogglePublic = async (checked: boolean) => {
    setLoading(true);
    try {
      let newToken = shareToken;
      
      if (checked && !shareToken) {
        // Generate new share token
        const { data: tokenData } = await supabase.rpc("generate_share_token");
        newToken = tokenData || crypto.randomUUID().replace(/-/g, "");
      }

      const { error } = await supabase
        .from("dreams")
        .update({ 
          is_public: checked, 
          share_token: checked ? newToken : shareToken 
        })
        .eq("id", dream.id);

      if (error) throw error;

      setIsPublic(checked);
      if (checked && newToken) setShareToken(newToken);
      
      toast({
        title: checked ? "Dream is now public" : "Dream is now private",
        description: checked 
          ? "Anyone with the link can view this dream." 
          : "Only you can see this dream now.",
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error updating dream visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update dream visibility.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateLink = async () => {
    setLoading(true);
    try {
      const { data: tokenData } = await supabase.rpc("generate_share_token");
      const newToken = tokenData || crypto.randomUUID().replace(/-/g, "");

      const { error } = await supabase
        .from("dreams")
        .update({ share_token: newToken })
        .eq("id", dream.id);

      if (error) throw error;

      setShareToken(newToken);
      toast({
        title: "New link generated",
        description: "Previous share link will no longer work.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error regenerating link:", error);
      toast({
        title: "Error",
        description: "Failed to generate new link.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Share Dream</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="w-5 h-5 text-primary" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="public-toggle" className="text-foreground">
                  {isPublic ? "Public" : "Private"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPublic 
                    ? "Anyone with the link can view" 
                    : "Only you can see this dream"}
                </p>
              </div>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleTogglePublic}
              disabled={loading}
            />
          </div>

          {/* Share Link */}
          {isPublic && shareToken && (
            <div className="space-y-3">
              <Label className="text-muted-foreground">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-muted/50 border-border/50 text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="shrink-0 border-primary/50"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateLink}
                disabled={loading}
                className="text-muted-foreground hover:text-foreground"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Generate new link
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
