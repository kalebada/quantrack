import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QrCode, Plus } from "lucide-react";
import { MemberQRCode } from "@/components/MemberQRCode";
import { OrganizationCard } from "@/components/OrganizationCard";
import { OrganizationDetail } from "./OrganizationDetail";
import { TasksCard } from "@/components/TasksCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const VolunteerDashboard = () => {
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      await loadUserData(user.id);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        setMember(profile);
      }

      // Load organizations
      const { data: memberships } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          total_hours,
          organizations!inner(id, name, logo_url)
        `)
        .eq("volunteer_id", userId)
        .eq("status", "active");

      if (memberships) {
        const orgs = memberships.map((m: any) => ({
          id: m.organization_id,
          name: m.organizations.name,
          logoUrl: m.organizations.logo_url || "",
          level: Math.floor(m.total_hours / 10) + 1,
          totalPoints: m.total_hours,
        }));
        setOrganizations(orgs);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast({
        title: "Error",
        description: "Failed to load your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find organization by invite code
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("invite_code", inviteCode.trim())
        .single();

      if (orgError || !org) {
        toast({
          title: "Invalid Code",
          description: "Organization not found with this invite code",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ensure volunteer profile exists (for users who signed up before the fix)
      const { data: volProfile } = await supabase
        .from("volunteer_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!volProfile) {
        // Create volunteer profile if it doesn't exist
        const { error: profileError } = await supabase
          .from("volunteer_profiles")
          .insert([{
            id: user.id,
            date_of_birth: "2000-01-01",
            school_organization: "",
          }]);

        if (profileError) {
          console.error("Error creating volunteer profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to create volunteer profile. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from("organization_members")
        .select("id")
        .eq("volunteer_id", user.id)
        .eq("organization_id", org.id)
        .single();

      if (existing) {
        toast({
          title: "Already Joined",
          description: "You are already a member of this organization",
        });
        setShowJoinDialog(false);
        return;
      }

      // Join organization
      const { error: joinError } = await supabase
        .from("organization_members")
        .insert({
          volunteer_id: user.id,
          organization_id: org.id,
          member_role: "volunteer",
        });

      if (joinError) throw joinError;

      toast({
        title: "Success!",
        description: "You have joined the organization",
      });

      setShowJoinDialog(false);
      setInviteCode("");
      await loadUserData(user.id);
    } catch (error) {
      console.error("Error joining organization:", error);
      toast({
        title: "Error",
        description: "Failed to join organization",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (selectedOrgId) {
    return (
      <OrganizationDetail
        organizationId={selectedOrgId}
        onBack={() => setSelectedOrgId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={logo} alt="Quantrack Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Quantrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {member?.full_name || 'Volunteer'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">Track your engagement and multiply your impact</p>
        </div>

        {/* QR Code Button */}
        <div className="mb-8 flex justify-center">
          <Button
            onClick={() => setShowQRCode(true)}
            variant="premium"
            size="lg"
            className="text-lg px-8 py-6"
          >
            <QrCode className="w-6 h-6 mr-3" />
            <span className="font-semibold">My Code</span>
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Tasks Section - Takes up 1 column */}
          <div>
            <TasksCard />
          </div>

          {/* Organizations Section - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">My Organizations</h2>
              <Button variant="hero" size="sm" className="gap-2" onClick={() => setShowJoinDialog(true)}>
                <Plus className="w-4 h-4" />
                Join Organization
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {organizations.map((org) => (
                <OrganizationCard
                  key={org.id}
                  id={org.id}
                  name={org.name}
                  logoUrl={org.logoUrl}
                  level={org.level}
                  totalPoints={org.totalPoints}
                  onClick={() => setSelectedOrgId(org.id)}
                />
              ))}

              {/* Add New Org Card */}
              <Card 
                className="p-6 bg-card/70 backdrop-blur-sm border-dashed border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[180px]"
                onClick={() => setShowJoinDialog(true)}
              >
                <div className="text-center">
                  <Plus className="w-10 h-10 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                    Join New Organization
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <MemberQRCode
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        memberId={member?.id || ""}
        memberName={member?.full_name || "Volunteer"}
      />

      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Organization</DialogTitle>
            <DialogDescription>
              Enter the invite code provided by the organization administrator
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="Enter code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleJoinOrganization}>
                Join
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerDashboard;
