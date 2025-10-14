import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/formatters";
import { getMedalInfo } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ManageMembers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberNotes, setMemberNotes] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!adminProfile) return;

      const { data: membersData } = await supabase
        .from("organization_members")
        .select(`
          volunteer_id,
          member_role,
          total_hours,
          joined_at,
          profiles!organization_members_volunteer_id_fkey(full_name, email),
          volunteer_profiles!organization_members_volunteer_id_fkey(school_organization)
        `)
        .eq("organization_id", adminProfile.organization_id)
        .eq("status", "active");

      if (membersData) {
        const formatted = membersData.map((m: any) => ({
          id: m.volunteer_id,
          name: m.profiles?.full_name || "Unknown",
          email: m.profiles?.email || "",
          school: m.volunteer_profiles?.school_organization || "N/A",
          dateJoined: new Date(m.joined_at),
          totalHours: m.total_hours || 0,
          roles: [m.member_role],
        }));
        setMembers(formatted);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching members:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableRoles = [
    "Member",
    "Event Lead",
    "Volunteer Coordinator",
    "Team Captain",
    "Administrator",
    "Mentor",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold">Manage Members</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Actions */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-6">
              <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members by name or school..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading members...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Members Yet</h3>
                <p className="text-muted-foreground">Share your organization's invite code to add members</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header Row */}
                <div className="grid grid-cols-5 gap-4 pb-2 border-b border-border text-sm font-semibold text-muted-foreground">
                  <div>Name</div>
                  <div>School</div>
                  <div>Date Joined</div>
                  <div>Level</div>
                  <div>Roles</div>
                </div>

                {/* Member Rows */}
                {filteredMembers.map((member) => {
                const medalInfo = getMedalInfo(member.totalHours);
                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-5 gap-4 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-accent"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.school}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(member.dateJoined)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${medalInfo.color}15`,
                          borderColor: medalInfo.color,
                          color: medalInfo.color,
                        }}
                      >
                        {medalInfo.emoji} {medalInfo.name}
                      </Badge>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {member.roles.slice(0, 2).map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                      {member.roles.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.roles.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedMember.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Contact Information
                  </h3>
              <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="text-sm">{selectedMember.email}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">School/Organization</Label>
                      <p className="text-sm">{selectedMember.school}</p>
                    </div>
                  </div>
                </div>

                {/* Volunteer Info */}
                <div>
                  <h3 className="font-semibold mb-3">Volunteer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">School/Organization</Label>
                      <p className="text-sm">{selectedMember.school}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date Joined</Label>
                      <p className="text-sm">{formatDate(selectedMember.dateJoined)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Hours</Label>
                      <p className="text-sm">{selectedMember.totalHours} hours</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Level</Label>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${getMedalInfo(selectedMember.totalHours).color}15`,
                          borderColor: getMedalInfo(selectedMember.totalHours).color,
                          color: getMedalInfo(selectedMember.totalHours).color,
                        }}
                      >
                        {getMedalInfo(selectedMember.totalHours).emoji} {getMedalInfo(selectedMember.totalHours).name}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Roles Management */}
                <div>
                  <h3 className="font-semibold mb-3">Roles</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.roles.map((role: string) => (
                        <Badge key={role} variant="secondary" className="gap-1">
                          {role}
                          <button className="ml-1 hover:text-destructive">×</button>
                        </Badge>
                      ))}
                    </div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles
                          .filter((role) => !selectedMember.roles.includes(role))
                          .map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <Textarea
                    placeholder="Add notes about this member..."
                    rows={4}
                    defaultValue={selectedMember.notes}
                    onChange={(e) => setMemberNotes(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => setSelectedMember(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageMembers;
