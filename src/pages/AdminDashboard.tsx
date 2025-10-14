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
  const navigate = useNavigate();
  const { toast } = useToast();

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

      // Check if user is admin
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (!hasAdminRole) {
        navigate("/volunteer");
        return;
      }

      await loadOrganization(user.id);
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/login");
    }
  };

  const loadOrganization = async (userId: string) => {
    try {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id, organizations!inner(*)")
        .eq("id", userId)
        .single();

      if (adminProfile) {
        setOrganization(adminProfile.organizations);
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

        {/* Active Volunteers Analytics */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Active Volunteers Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                volunteers: {
                  label: "Volunteers",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <AreaChart data={volunteerData}>
                <defs>
                  <linearGradient id="colorVolunteers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="volunteers"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorVolunteers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>


        {/* Recent Activity & Upcoming Events */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                {recentActivity.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === "joined" ? "bg-green-500/10" :
                        activity.type === "certificate" ? "bg-primary/10" :
                        "bg-blue-500/10"
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          activity.type === "joined" ? "text-green-500" :
                          activity.type === "certificate" ? "text-primary" :
                          "text-blue-500"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">{activity.detail}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Community Cleanup</p>
                      <p className="text-sm text-muted-foreground">Jan 25, 2025 • 4 hours</p>
                      <p className="text-xs text-muted-foreground mt-1">32 volunteers registered</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default AdminDashboard;
