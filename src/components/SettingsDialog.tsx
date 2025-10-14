import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchOrganization();
    }
  }, [open]);

  const fetchOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id, organizations!inner(*)")
        .eq("id", user.id)
        .single();

      if (adminProfile) {
        setOrganization(adminProfile.organizations);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching organization:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (organization?.invite_code) {
      navigator.clipboard.writeText(organization.invite_code);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Organization Settings
          </DialogTitle>
          <DialogDescription>
            Manage your organization's settings and information
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Invite Code */}
            <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Label>Invite Code</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Share this code with volunteers to join your organization
              </p>
              <div className="flex gap-2">
                <Input 
                  value={organization?.invite_code || ""} 
                  readOnly 
                  className="font-mono text-lg"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={copyInviteCode}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input 
                id="org-name" 
                value={organization?.name || ""} 
                readOnly
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Additional organization settings coming soon
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};