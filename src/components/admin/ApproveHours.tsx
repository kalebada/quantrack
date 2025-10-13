import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, FileText, CheckCircle, XCircle } from "lucide-react";
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

export const ApproveHours = () => {
  const [requests, setRequests] = useState<HourRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<HourRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .single();

      if (!adminProfile) return;

      const { data, error } = await supabase
        .from("volunteer_sessions")
        .select(`
          *,
          profiles!volunteer_sessions_volunteer_id_fkey (
            full_name,
            email
          )
        `)
        .eq("organization_id", adminProfile.organization_id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

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
      const { error } = await supabase
        .from("volunteer_sessions")
        .update({ 
          status: "approved",
          verified_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Hours Approved",
        description: `Approved ${selectedRequest.hours_worked} hours for ${selectedRequest.profiles.full_name}`,
      });

      setSelectedRequest(null);
      fetchPendingRequests();
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
      fetchPendingRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny hours",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading requests...</div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
        <p className="text-muted-foreground">No pending hour requests to review</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{requests.length} Pending Requests</h3>
        </div>

        <div className="space-y-3">
          {requests.map((request) => (
            <Card 
              key={request.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedRequest(request)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{request.profiles.full_name}</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-muted-foreground line-clamp-2">{request.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Hour Request</DialogTitle>
            <DialogDescription>
              Review and approve or deny this volunteer hour request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Volunteer</label>
                <p className="text-sm">{selectedRequest.profiles.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedRequest.profiles.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours Worked</label>
                  <p className="text-sm">{selectedRequest.hours_worked} hours</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm">{format(new Date(selectedRequest.session_date), "MMM dd, yyyy")}</p>
                </div>
              </div>

              {selectedRequest.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Submitted</label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedRequest.created_at), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Note (Optional)</label>
                <Textarea
                  placeholder="Add a note about this approval..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeny}>
              <XCircle className="w-4 h-4 mr-2" />
              Deny
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
