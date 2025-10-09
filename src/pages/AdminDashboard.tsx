import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Users, Calendar, Award, Settings, QrCode } from "lucide-react";

const AdminDashboard = () => {
  const stats = {
    totalVolunteers: 156,
    activeEvents: 8,
    hoursThisMonth: 1240,
    certificates: 89,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-xl font-bold">QuanTrack Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Food Bank Dashboard</h1>
          <p className="text-muted-foreground">Manage your organization and volunteers</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Volunteers</span>
            </div>
            <div className="text-3xl font-bold">{stats.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground mt-1">+12 this month</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Active Events</span>
            </div>
            <div className="text-3xl font-bold">{stats.activeEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">3 upcoming this week</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Hours This Month</span>
            </div>
            <div className="text-3xl font-bold">{stats.hoursThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Certificates Issued</span>
            </div>
            <div className="text-3xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground mt-1">This year</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Create Event</h3>
              <p className="text-sm text-muted-foreground">Schedule new volunteer event</p>
            </Card>

            <Card className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Manage Volunteers</h3>
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
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Generate Certificates</h3>
              <p className="text-sm text-muted-foreground">Issue service certificates</p>
            </Card>
          </div>
        </div>

        {/* Recent Volunteers & Upcoming Events */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Volunteers</h2>
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                      JD
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">Volunteer • 24 hours</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
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
    </div>
  );
};

export default AdminDashboard;
