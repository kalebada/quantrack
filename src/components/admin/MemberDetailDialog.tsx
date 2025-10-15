import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Calendar, Clock, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/formatters";
import { getMedalInfo } from "@/lib/formatters";

interface MemberEvent {
  event_name: string;
  event_date: string;
  checked_in_at: string;
}

interface MemberRole {
  id: string;
  role_id: string;
  role_name: string;
  role_description: string | null;
  assigned_at: string;
}

interface MemberDetailDialogProps {
  member: any;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const MemberDetailDialog = ({
  member,
  organizationId,
  open,
  onOpenChange,
  onUpdate,
}: MemberDetailDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<MemberEvent[]>([]);
  const [memberRoles, setMemberRoles] = useState<MemberRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [organizationMemberId, setOrganizationMemberId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && member) {
      loadMemberDetails();
    }
  }, [open, member]);

  const loadMemberDetails = async () => {
    setLoading(true);
    try {
      // Get organization_member id
      const { data: orgMemberData } = await supabase
        .from("organization_members")
        .select("id")
        .eq("volunteer_id", member.id)
        .eq("organization_id", organizationId)
        .single();

      if (orgMemberData) {
        setOrganizationMemberId(orgMemberData.id);
        
        // Load member roles
        await loadMemberRoles(orgMemberData.id);
      }

      // Load events attended
      const { data: eventsData } = await supabase
        .from("event_attendance")
        .select(`
          checked_in_at,
          events!inner(
            name,
            event_date
          )
        `)
        .eq("volunteer_id", member.id)
        .order("checked_in_at", { ascending: false });

      if (eventsData) {
        const formatted = eventsData.map((e: any) => ({
          event_name: e.events.name,
          event_date: e.events.event_date,
          checked_in_at: e.checked_in_at,
        }));
        setEvents(formatted);
      }

      // Load all available roles for this organization
      const { data: rolesData } = await supabase
        .from("organization_roles")
        .select("*")
        .eq("organization_id", organizationId)
        .order("name");

      if (rolesData) {
        setAvailableRoles(rolesData);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error loading member details:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load member details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMemberRoles = async (memberId: string) => {
    try {
      const { data: rolesData } = await supabase
        .from("member_role_assignments")
        .select(`
          id,
          role_id,
          assigned_at,
          organization_roles!inner(
            name,
            description
          )
        `)
        .eq("member_id", memberId);

      if (rolesData) {
        const formatted = rolesData.map((r: any) => ({
          id: r.id,
          role_id: r.role_id,
          role_name: r.organization_roles.name,
          role_description: r.organization_roles.description,
          assigned_at: r.assigned_at,
        }));
        setMemberRoles(formatted);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error loading member roles:", error);
      }
    }
  };

  const handleAddRole = async (roleId: string) => {
    if (!organizationMemberId) return;

    try {
      const { error } = await supabase
        .from("member_role_assignments")
        .insert({
          member_id: organizationMemberId,
          role_id: roleId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully",
      });

      await loadMemberRoles(organizationMemberId);
      onUpdate();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error adding role:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from("member_role_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully",
      });

      if (organizationMemberId) {
        await loadMemberRoles(organizationMemberId);
      }
      onUpdate();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error removing role:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  if (!member) return null;

  const medalInfo = getMedalInfo(member.totalHours);
  const unassignedRoles = availableRoles.filter(
    (role) => !memberRoles.some((mr) => mr.role_id === role.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {member.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading member details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm">{member.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">School/Organization</Label>
                    <p className="text-sm">{member.school}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volunteer Statistics */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Volunteer Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Date Joined</Label>
                    <p className="text-sm">{formatDate(member.dateJoined)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Hours</Label>
                    <p className="text-sm font-semibold">{member.totalHours} hours</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Level</Label>
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
                </div>
              </CardContent>
            </Card>

            {/* Role Management */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Roles
                </h3>
                <div className="space-y-4">
                  {/* Assigned Roles */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Assigned Roles
                    </Label>
                    {memberRoles.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No roles assigned</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {memberRoles.map((role) => (
                          <Badge key={role.id} variant="secondary" className="gap-2">
                            {role.role_name}
                            <button
                              onClick={() => handleRemoveRole(role.id)}
                              className="hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Role */}
                  {unassignedRoles.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Add Role
                      </Label>
                      <Select onValueChange={handleAddRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role to assign..." />
                        </SelectTrigger>
                        <SelectContent>
                          {unassignedRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                              {role.description && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  - {role.description}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Events Attended */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Events Attended ({events.length})
                </h3>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No events attended yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {events.map((event, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div>
                          <p className="font-medium text-sm">{event.event_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(event.event_date))}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Checked in: {new Date(event.checked_in_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
