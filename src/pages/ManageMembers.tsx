import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { getMedalInfo } from "@/lib/formatters";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { MemberDetailDialog } from "@/components/admin/MemberDetailDialog";

const ManageMembers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
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

      setOrganizationId(adminProfile.organization_id);

      // First, get all organization members
      const { data: membersData, error: membersError } = await supabase
        .from("organization_members")
        .select(`
          id,
          volunteer_id,
          member_role,
          total_hours,
          joined_at,
          profiles!organization_members_volunteer_id_fkey(full_name, email),
          volunteer_profiles!organization_members_volunteer_id_fkey(school_organization)
        `)
        .eq("organization_id", adminProfile.organization_id)
        .eq("status", "active");

      if (membersError) {
        if (import.meta.env.DEV) {
          console.error("Error fetching members:", membersError);
        }
        throw membersError;
      }

      if (membersData) {
        // For each member, fetch their role assignments
        const formatted = await Promise.all(
          membersData.map(async (m: any) => {
            const { data: roleData } = await supabase
              .from("member_role_assignments")
              .select(`
                organization_roles!inner(name)
              `)
              .eq("member_id", m.id);

            const roles = roleData?.map((r: any) => r.organization_roles.name) || [];

            return {
              id: m.volunteer_id,
              memberId: m.id,
              name: m.profiles?.full_name || "Unknown",
              email: m.profiles?.email || "",
              school: m.volunteer_profiles?.school_organization || "N/A",
              dateJoined: new Date(m.joined_at),
              totalHours: m.total_hours || 0,
              roles: roles.length > 0 ? roles : ["No roles assigned"],
            };
          })
        );
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
        {/* Role Management */}
        {organizationId && (
          <RoleManagement 
            organizationId={organizationId} 
            onRolesChange={fetchMembers}
          />
        )}

        {/* Search */}
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
      {organizationId && selectedMember && (
        <MemberDetailDialog
          member={selectedMember}
          organizationId={organizationId}
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          onUpdate={fetchMembers}
        />
      )}
    </div>
  );
};

export default ManageMembers;
