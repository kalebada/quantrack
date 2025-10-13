import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, User, Calendar, FileText, CheckCircle, XCircle, ArrowLeft, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.svg";

interface HourRequest {
  id: string;
  volunteer_id: string;
  session_date: string;
  hours_worked: number;
  description: string | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const ApproveHours = () => {
  const [requests, setRequests] = useState<HourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<HourRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .single();

      if (!adminProfile) return;

      let query = supabase
        .from("volunteer_sessions")
        .select(`
          *,
          profiles!volunteer_sessions_volunteer_id_fkey (
            full_name,
            email
          )
        `)
        .eq("organization_id", adminProfile.organization_id)
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data as any || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load hour requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("volunteer_sessions")
        .update({ 
          status: "approved",
          verified_by: user.user?.id 
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Hours Approved",
        description: `Approved ${selectedRequest.hours_worked} hours for ${selectedRequest.profiles.full_name}`,
      });

      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve hours",
        variant: "destructive",
      });
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from("volunteer_sessions")
        .update({ status: "denied" })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Hours Denied",
        description: `Denied request from ${selectedRequest.profiles.full_name}`,
      });

      setSelectedRequest(null);
      setAdminNote("");
      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny hours",
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter(req => 
    req.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const deniedCount = requests.filter(r => r.status === "denied").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-1">
              <img src={logo} alt="Quantrack Logo" className="h-8 w-8" />
              <span className="text-xl font-bold">Quantrack Admin</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Approve Volunteer Hours</h1>
          <p className="text-muted-foreground">Review and approve volunteer hour submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Denied</p>
                  <p className="text-3xl font-bold">{deniedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by volunteer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Hour Requests ({filteredRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading requests...</div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search" : "No hour requests match your filters"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <Card 
                    key={request.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{request.profiles.full_name}</span>
                            <Badge 
                              variant={
                                request.status === "approved" ? "default" :
                                request.status === "denied" ? "destructive" :
                                "secondary"
                              }
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{request.hours_worked} hours</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(request.session_date), "MMM dd, yyyy")}</span>
                            </div>
                          </div>

                          {request.description && (
                            <div className="flex items-start gap-1 text-sm">
                              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-muted-foreground line-clamp-2">{request.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Hour Request</DialogTitle>
            <DialogDescription>
              Review and approve or deny this volunteer hour request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volunteer</label>
                  <p className="text-sm">{selectedRequest.profiles.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.profiles.email}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Badge 
                    variant={
                      selectedRequest.status === "approved" ? "default" :
                      selectedRequest.status === "denied" ? "destructive" :
                      "secondary"
                    }
                  >
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours Worked</label>
                  <p className="text-2xl font-bold text-primary">{selectedRequest.hours_worked} hours</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm">{format(new Date(selectedRequest.session_date), "MMMM dd, yyyy")}</p>
                </div>
              </div>

              {selectedRequest.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedRequest.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Submitted</label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedRequest.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Note (Optional)</label>
                  <Textarea
                    placeholder="Add a note about this decision..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={handleDeny}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApproveHours;
