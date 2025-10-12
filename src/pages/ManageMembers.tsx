import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Plus, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/formatters";
import { getMedalInfo } from "@/lib/formatters";

const ManageMembers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberNotes, setMemberNotes] = useState("");

  // Mock members data
  const members = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      school: "Central High School",
      dateJoined: new Date(2024, 8, 15),
      totalHours: 45,
      phone: "(555) 123-4567",
      address: "123 Main St, City, ST 12345",
      emergencyContact: "Jane Johnson (555) 123-4568",
      roles: ["Member", "Event Lead"],
      notes: "Excellent leadership during food drive events.",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.c@email.com",
      school: "Westside Academy",
      dateJoined: new Date(2024, 7, 22),
      totalHours: 78,
      phone: "(555) 234-5678",
      address: "456 Oak Ave, City, ST 12345",
      emergencyContact: "Lisa Chen (555) 234-5679",
      roles: ["Member", "Volunteer Coordinator"],
      notes: "Very reliable, always on time.",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      school: "North Valley High",
      dateJoined: new Date(2024, 9, 5),
      totalHours: 23,
      phone: "(555) 345-6789",
      address: "789 Pine Rd, City, ST 12345",
      emergencyContact: "Carlos Rodriguez (555) 345-6790",
      roles: ["Member"],
      notes: "",
    },
  ];

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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
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
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="text-sm">{selectedMember.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <p className="text-sm">{selectedMember.address}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Emergency Contact</Label>
                      <p className="text-sm">{selectedMember.emergencyContact}</p>
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
