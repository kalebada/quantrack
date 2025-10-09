import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Download, Calendar, Clock, Award, TrendingUp } from "lucide-react";

const VolunteerDashboard = () => {
  // Mock data
  const organizations = [
    { id: 1, name: "Community Food Bank", logo: "🏢", hours: 24, role: "Volunteer" },
    { id: 2, name: "Youth Education Center", logo: "📚", hours: 16, role: "Executive" },
  ];

  const stats = {
    totalHours: 40,
    currentYearHours: 40,
    level: 3,
    progress: 65,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-xl font-bold">QuanTrack</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Profile
            </Button>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
          <p className="text-muted-foreground">Track your volunteer hours and stay engaged</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Hours</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalHours}</div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs">
              <Download className="w-3 h-3 mr-1" />
              Download Certificate
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">This Year</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.currentYearHours}</div>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs">
              <Download className="w-3 h-3 mr-1" />
              Download Certificate
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Level</span>
            </div>
            <div className="text-3xl font-bold mb-2">{stats.level}</div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary border-border">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Certificates</span>
            </div>
            <div className="text-3xl font-bold">3</div>
          </Card>
        </div>

        {/* Organizations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Organizations</h2>
            <Button variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Join Organization
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="p-6 bg-card border-border hover:border-accent transition-all duration-300 hover:shadow-lg cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{org.logo}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {org.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{org.hours} hours</span>
                    </div>
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                      {org.role}
                    </span>
                  </div>
                </div>
              </Card>
            ))}

            {/* Add New Org Card */}
            <Card className="p-6 bg-secondary/50 border-dashed border-2 border-border hover:border-accent transition-all duration-300 cursor-pointer group flex items-center justify-center min-h-[140px]">
              <div className="text-center">
                <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Join New Organization
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Community Cleanup Event</p>
                  <p className="text-sm text-muted-foreground">4 hours • Jan 15, 2025</p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md">Completed</span>
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Food Bank Distribution</p>
                  <p className="text-sm text-muted-foreground">3 hours • Jan 12, 2025</p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md">Completed</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Youth Mentorship Session</p>
                  <p className="text-sm text-muted-foreground">2 hours • Jan 20, 2025</p>
                </div>
                <span className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-md">Upcoming</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
