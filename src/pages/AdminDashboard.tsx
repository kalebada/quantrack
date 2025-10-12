import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Calendar, CheckCircle, Settings, QrCode, UserPlus, Award as AwardIcon, Clock } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import logo from "@/assets/logo.svg";
import { SettingsDialog } from "@/components/SettingsDialog";

const AdminDashboard = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
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
                <h1 className="text-3xl font-bold mb-2">Community Food Bank</h1>
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group"
              onClick={() => window.location.href = '/manage-events'}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Manage Events</h3>
              <p className="text-sm text-muted-foreground">Create and manage volunteer events</p>
            </Card>

            <Card 
              className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group"
              onClick={() => window.location.href = '/manage-members'}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Manage Members</h3>
              <p className="text-sm text-muted-foreground">View and manage volunteer list</p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">QR Attendance</h3>
              <p className="text-sm text-muted-foreground">Scan volunteer check-ins</p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Approve Hours</h3>
              <p className="text-sm text-muted-foreground">Review and approve volunteer hours</p>
            </Card>
          </div>
        </div>

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
