import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, Play, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_volunteers: number | null;
  status: string;
}

export const QRAttendance = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .single();

      if (!adminProfile) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", adminProfile.organization_id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "active" })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event Started",
        description: "Event is now active for QR check-ins",
      });

      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start event",
        variant: "destructive",
      });
    }
  };

  const handleCreateQuickEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("organization_id")
        .single();

      if (!adminProfile) return;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const now = new Date();
      const { error } = await supabase
        .from("events")
        .insert({
          organization_id: adminProfile.organization_id,
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          event_date: now.toISOString().split("T")[0],
          start_time: now.toTimeString().split(" ")[0],
          end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000).toTimeString().split(" ")[0],
          location: formData.get("location") as string,
          status: "active",
          created_by: user.user.id,
        });

      if (error) throw error;

      toast({
        title: "Event Created",
        description: "Quick event started successfully",
      });

      setShowQuickStart(false);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const activeEvents = events.filter((e) => e.status === "active");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Button onClick={() => setShowQuickStart(true)} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          Start Immediate Event
        </Button>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeEvents.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Coming Up ({upcomingEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            {activeEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active events
              </div>
            ) : (
              activeEvents.map((event) => (
                <Card 
                  key={event.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{event.name}</h4>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.start_time} - {event.end_time}</span>
                        </div>
                      </div>

                      <Button size="sm" className="w-full mt-2">
                        <QrCode className="w-4 h-4 mr-2" />
                        Scan Attendance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming events
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <Card 
                  key={event.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{event.name}</h4>
                        <Badge variant="secondary">Upcoming</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{event.start_time} - {event.end_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEvent(event.id);
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Event
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showQuickStart} onOpenChange={setShowQuickStart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Immediate Event</DialogTitle>
            <DialogDescription>
              Create and start an event immediately for QR attendance tracking
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateQuickEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" name="name" placeholder="Community Cleanup" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input id="location" name="location" placeholder="Central Park" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Optional event description"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowQuickStart(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Play className="w-4 h-4 mr-2" />
                Start Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
            <DialogDescription>Event Details</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <p className="text-sm">{format(new Date(selectedEvent.event_date), "MMMM dd, yyyy")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <p className="text-sm">{selectedEvent.start_time} - {selectedEvent.end_time}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <p className="text-sm">{selectedEvent.location}</p>
              </div>

              {selectedEvent.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.status === "active" && (
                <Button className="w-full mt-4">
                  <QrCode className="w-4 h-4 mr-2" />
                  Open QR Scanner
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
