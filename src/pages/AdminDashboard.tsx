import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Calendar, CheckCircle, Settings, QrCode, UserPlus, Award as AwardIcon, Clock, ChevronDown, ListTodo } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import logo from "@/assets/logo.svg";
import { SettingsDialog } from "@/components/SettingsDialog";

const AdminDashboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [pendingHours, setPendingHours] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session.user) {
          await checkAuth(session.user.id);
        }
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAuth(session.user.id);
      } else {
        setLoading(false);
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAuth = async (userId: string) => {
    try {
      // Verify user is admin
      const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin'
      });

      if (roleError) {
        console.error("Error checking role:", roleError);
      }

      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You must be an admin to access this page",
          variant: "destructive",
        });
        navigate("/volunteer");
        return;
      }

      await loadOrganization(userId);
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: "Failed to load your admin profile. Please try logging in again.",
        variant: "destructive",
      });
      navigate("/login");
    }
  };

  const loadOrganization = async (userId: string) => {
    try {
      const { data: adminProfile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("organization_id, organizations!inner(*)")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading admin profile:", profileError);
      }

      if (adminProfile) {
        setOrganization(adminProfile.organizations);
        await loadStats(adminProfile.organization_id);
      } else {
        toast({
          title: "Setup Required",
          description: "Admin profile not found. Please contact support.",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading organization:", error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (orgId: string) => {
    try {
      // Get member count
      const { count: members } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "active");

      setMemberCount(members || 0);

      // Get event count
      const { count: events } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "upcoming");

      setEventCount(events || 0);

      // Get pending hours count
      const { count: pending } = await supabase
        .from("volunteer_sessions")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", orgId)
        .eq("status", "pending");

      setPendingHours(pending || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
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
  // Mock data for active volunteers over time
  const volunteerData = [
    { month: "Jan", volunteers: 45 },
    { month: "Feb", volunteers: 52 },
    { month: "Mar", volunteers: 68 },
    { month: "Apr", volunteers: 75 },
    { month: "May", volunteers: 89 },
    { month: "Jun", volunteers: 102 },
    { month: "Jul", volunteers: 118 },
    { month: "Aug", volunteers: 135 },
    { month: "Sep", volunteers: 142 },
    { month: "Oct", volunteers: 156 },
  ];

  const recentActivity = [
    { type: "joined", name: "Sarah Johnson", detail: "New member joined", time: "2 hours ago", icon: UserPlus },
    { type: "certificate", name: "Michael Chen", detail: "Certificate generated • 45 hours", time: "5 hours ago", icon: AwardIcon },
    { type: "joined", name: "Emily Rodriguez", detail: "New member joined", time: "1 day ago", icon: UserPlus },
    { type: "hours", name: "David Kim", detail: "Logged 8 hours • Food Drive", time: "1 day ago", icon: Clock },
    { type: "certificate", name: "Jessica Williams", detail: "Certificate generated • 32 hours", time: "2 days ago", icon: AwardIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img src={logo} alt="Quantrack Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">Quantrack Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Actions
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/manage-events'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Events
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/manage-members'}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/approve-hours'}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/qr-attendance'}>
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Attendance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/assign-tasks'}>
                  <ListTodo className="w-4 h-4 mr-2" />
                  Assign Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header with Organization Info */}
        <Card className="mb-8 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Organization Logo" className="w-16 h-16" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{organization?.name || "Your Organization"}</h1>
                <p className="text-muted-foreground">Manage your organization and volunteers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                  <p className="text-3xl font-bold">{memberCount}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Events</p>
                  <p className="text-3xl font-bold">{eventCount}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Hours</p>
                  <p className="text-3xl font-bold">{pendingHours}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/manage-members")}
              >
                <Users className="w-6 h-6" />
                <span>Manage Members</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/manage-events")}
              >
                <Calendar className="w-6 h-6" />
                <span>Manage Events</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/approve-hours")}
              >
                <CheckCircle className="w-6 h-6" />
                <span>Approve Hours</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/assign-tasks")}
              >
                <ListTodo className="w-6 h-6" />
                <span>Assign Tasks</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => navigate("/qr-attendance")}
              >
                <QrCode className="w-6 h-6" />
                <span>QR Attendance</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-6 h-6" />
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default AdminDashboard;
