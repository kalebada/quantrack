import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubmitHoursDialog } from "@/components/SubmitHoursDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Award, Clock, TrendingUp, Calendar as CalendarIcon, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatHours, getMedalInfo, getMedalProgress } from "@/lib/formatters";
import { Leaderboard } from "@/components/Leaderboard";

interface OrganizationDetailProps {
  organizationId: string;
  onBack: () => void;
}

export const OrganizationDetail = ({ organizationId, onBack }: OrganizationDetailProps) => {
  const [dateRange, setDateRange] = useState("all-time");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showSubmitHours, setShowSubmitHours] = useState(false);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (!organizationId) return;
      
      // Check auth first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && mounted) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view this page",
          variant: "destructive",
        });
        onBack();
        return;
      }

      if (mounted) {
        await loadData();
        await loadLeaderboard();
      }
    };

    initializeData();

    return () => {
      mounted = false;
    };
  }, [organizationId]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view this page",
          variant: "destructive",
        });
        onBack();
        return;
      }

      // Load organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .maybeSingle();

      if (orgError) {
        console.error("Error loading organization:", orgError);
      }

      if (orgData) {
        setOrganization(orgData);
      } else {
        toast({
          title: "Organization Not Found",
          description: "The organization you're looking for doesn't exist",
          variant: "destructive",
        });
        onBack();
        return;
      }

      // Load member hours
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select("total_hours, status")
        .eq("volunteer_id", user.id)
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (memberError) {
        console.error("Error loading member data:", memberError);
      }

      if (memberData) {
        setMember({
          id: user.id,
          totalHours: memberData.total_hours || 0,
        });
      } else {
        // User is not a member of this organization
        toast({
          title: "Not a Member",
          description: "You are not a member of this organization",
          variant: "destructive",
        });
        onBack();
        return;
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!organization || !member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Organization not found</p>
          <Button onClick={onBack}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const medal = getMedalInfo(member?.totalHours || 0);
  const medalProgress = getMedalProgress(member?.totalHours || 0);

  const upcomingEvents = [
    { id: 1, title: "Food Distribution", date: "Jan 25, 2025", time: "9:00 AM - 1:00 PM", roleTag: "Volunteer" },
    { id: 2, title: "Fundraising Gala", date: "Feb 1, 2025", time: "6:00 PM - 10:00 PM", roleTag: "Executive" },
    { id: 3, title: "Community Outreach", date: "Feb 5, 2025", time: "2:00 PM - 5:00 PM", roleTag: "Volunteer" },
  ];

  const recentActivity = [
    { id: 1, title: "Food Packing", date: "Jan 15, 2025", hours: 4, status: "Completed" },
    { id: 2, title: "Warehouse Organization", date: "Jan 10, 2025", hours: 3, status: "Completed" },
    { id: 3, title: "Community Kitchen", date: "Jan 5, 2025", hours: 5.5, status: "Completed" },
  ];

  const [leaderboardMembers, setLeaderboardMembers] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [organizationId]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("volunteer_id, total_hours, profiles!organization_members_volunteer_id_fkey(full_name)")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("total_hours", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading leaderboard:", error);
        return;
      }

      if (data) {
        const formatted = data.map((m: any, index: number) => ({
          id: m.volunteer_id,
          name: m.profiles?.full_name || "Unknown",
          avatarUrl: "",
          totalHours: m.total_hours || 0,
          rank: index + 1,
        }));
        setLeaderboardMembers(formatted);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    }
  };

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
            {organization?.logo_url ? (
              <img src={organization.logo_url} alt={organization?.name || "Organization"} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <span>🏢</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">{organization?.name || "Organization"}</h1>
            <p className="text-muted-foreground">Your engagement hub</p>
          </div>
        </div>

        {/* Level & Progress Card with Tabs */}
        <Card className="mb-8 bg-card/70 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-2xl">Your Progress</span>
              <Badge
                variant="default"
                className={`bg-gradient-to-r ${medal.color} border-0 text-lg px-4 py-2 text-white`}
              >
                {medal.emoji} {medal.name}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="progress" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="progress">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  My Progress
                </TabsTrigger>
                <TabsTrigger value="leaderboard">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="progress" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">Total Hours with Organization</span>
                    </div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                      {formatHours(member?.totalHours || 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Earned {medal.name} Medal
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm">
                        Next Medal: {medal.maxHours ? getMedalInfo(medal.maxHours).name : "Max Level"}
                      </span>
                    </div>
                    <div className="text-3xl font-bold">
                      {medal.maxHours
                        ? `${formatHours(member?.totalHours || 0)} / ${formatHours(medal.maxHours)}`
                        : "Max Level Achieved!"}
                    </div>
                    {medal.maxHours && (
                      <>
                        <Progress value={medalProgress} className="h-3 bg-muted/50" />
                        <p className="text-xs text-muted-foreground">
                          {formatHours(medal.maxHours - (member?.totalHours || 0))} until {getMedalInfo(medal.maxHours).name}
                        </p>
                      </>
                    )}
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
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => setShowSubmitHours(true)}
                      >
                        Submit Hours
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="leaderboard">
                <Leaderboard members={leaderboardMembers} currentUserId={member?.id || ""} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Events Section with Tabs */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-card/70 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="recent">Recent Attended</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-3">
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
                </TabsContent>

                <TabsContent value="recent" className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 rounded-lg bg-background/50 border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold">{activity.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{activity.date}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-primary/10 text-primary border-0 text-xs">
                              {activity.status}
                            </Badge>
                            <span className="text-sm font-medium text-primary">
                              {formatHours(activity.hours)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
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
      </div>

      <SubmitHoursDialog
        isOpen={showSubmitHours}
        onClose={() => setShowSubmitHours(false)}
        organizationId={organizationId}
      />
    </div>
  );
};
