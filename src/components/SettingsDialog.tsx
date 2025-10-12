import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Link as LinkIcon, Building2, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  // Mock data - replace with actual data from backend
  const inviteLink = `${window.location.origin}/join/ABC123XYZ`;
  const accessCode = "ABC123XYZ";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Organization Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Building2 className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Add Members
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="w-4 h-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="advanced">
              Advanced
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="general" className="space-y-6 m-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Community Food Bank" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-number">Registration Number</Label>
                  <Input id="reg-number" defaultValue="REG-2024-001" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-type">Organization Type</Label>
                  <Input id="org-type" defaultValue="Non-Profit" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" placeholder="https://example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea 
                    id="mission" 
                    placeholder="Enter your organization's mission statement"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Street address" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" />
                  </div>
                </div>

                <Button className="w-full">Save Changes</Button>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-6 m-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Invite Volunteers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share this link or access code with volunteers to join your organization.
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Invite Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={inviteLink} 
                          readOnly 
                          className="font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopy(inviteLink, "Invite link")}
                        >
                          {copied === "Invite link" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Access Code</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={accessCode} 
                          readOnly 
                          className="font-mono text-xl font-bold tracking-wider"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleCopy(accessCode, "Access code")}
                        >
                          {copied === "Access code" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Volunteers can enter this code when signing up
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Generate New Access Code
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6 m-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Role Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure roles and permissions for your organization members.
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Administrator</p>
                          <p className="text-sm text-muted-foreground">Full access to all features</p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Coordinator</p>
                          <p className="text-sm text-muted-foreground">Manage events and approve hours</p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Volunteer</p>
                          <p className="text-sm text-muted-foreground">Basic volunteer access</p>
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      + Add New Role
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 m-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure advanced options for your organization.
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="America/New_York" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-format">Date Format</Label>
                      <Input id="date-format" defaultValue="MM/DD/YYYY" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="established">Established Date</Label>
                      <Input id="established" type="date" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h4 className="font-semibold text-destructive mb-2">Danger Zone</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Irreversible actions that affect your organization.
                      </p>
                    </div>
                    <Button variant="destructive" className="w-full">
                      Delete Organization
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
