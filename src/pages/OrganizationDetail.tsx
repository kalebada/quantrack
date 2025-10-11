import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Download, Award, Clock, TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrganizationDetailProps {
  organizationId: string;
  onBack: () => void;
}

export const OrganizationDetail = ({ organizationId, onBack }: OrganizationDetailProps) => {
  const [dateRange, setDateRange] = useState("all-time");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock data - will be replaced with actual data from Supabase
  const organization = {
    id: organizationId,
    name: "Community Food Bank",
    logoUrl: "",
    level: 5,
    totalPoints: 4250,
    totalHours: 70.83,
    nextLevelPoints: 5000,
  };

  const upcomingEvents = [
    { id: 1, title: "Food Distribution", date: "Jan 25, 2025", time: "9:00 AM - 1:00 PM", roleTag: "Volunteer" },
    { id: 2, title: "Fundraising Gala", date: "Feb 1, 2025", time: "6:00 PM - 10:00 PM", roleTag: "Executive" },
    { id: 3, title: "Community Outreach", date: "Feb 5, 2025", time: "2:00 PM - 5:00 PM", roleTag: "Volunteer" },
  ];

  const recentActivity = [
    { id: 1, title: "Food Packing", date: "Jan 15, 2025", hours: 4, status: "Completed" },
    { id: 2, title: "Warehouse Organization", date: "Jan 10, 2025", hours: 3, status: "Completed" },
  ];

  const progress = ((organization.totalPoints % 1000) / 10);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="text-xl font-bold">Quantrack</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Organization Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl border-2 border-primary/30">
            {organization.logoUrl ? (
              <img src={organization.logoUrl} alt={organization.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>🏢</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{organization.name}</h1>
            <p className="text-muted-foreground">Your engagement hub</p>
          </div>
        </div>

        {/* Level & Progress Card */}
        <Card className="mb-8 bg-card/70 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl">Your Progress</span>
              <Badge variant="default" className="bg-gradient-to-r from-primary to-accent border-0 text-lg px-4 py-2">
                <Award className="w-5 h-5 mr-2" />
                Level {organization.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Total Hours with Organization</span>
                </div>
                <div className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {organization.totalHours}
                </div>
                <p className="text-sm text-muted-foreground">
                  = {organization.totalPoints} points earned
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Next Level Progress</span>
                </div>
                <div className="text-3xl font-bold">
                  {organization.totalPoints % 1000} / 1000 pts
                </div>
                <Progress value={progress} className="h-3 bg-muted/50" />
                <p className="text-xs text-muted-foreground">
                  {1000 - (organization.totalPoints % 1000)} points until Level {organization.level + 1}
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Download Certificate</p>
                    <p className="text-xs text-muted-foreground">Official record of your hours</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="this-year">This Year</SelectItem>
                      <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-glass w-full sm:w-auto">
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar & Events */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-card/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.date} • {event.time}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {event.roleTag}
                        </Badge>
                      </div>
                      <Button variant="glass" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Event Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card/70 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.hours} hours • {activity.date}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-primary/10 text-primary border-0">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
