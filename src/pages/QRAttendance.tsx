import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, Play, QrCode, ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.svg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  created_at: string;
}

const QRAttendance = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
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
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

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

  const handleCompleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "completed" })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Event Completed",
        description: "Event has been marked as completed",
      });

      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete event",
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

  const handleCreateScheduledEvent = async (e: React.FormEvent<HTMLFormElement>) => {
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

      const { error } = await supabase
        .from("events")
        .insert({
          organization_id: adminProfile.organization_id,
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          event_date: formData.get("date") as string,
          start_time: formData.get("start_time") as string,
          end_time: formData.get("end_time") as string,
          location: formData.get("location") as string,
          max_volunteers: formData.get("max_volunteers") ? parseInt(formData.get("max_volunteers") as string) : null,
          status: "upcoming",
          created_by: user.user.id,
        });

      if (error) throw error;

      toast({
        title: "Event Created",
        description: "Event scheduled successfully",
      });

      setShowCreateEvent(false);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEvent) return;

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          event_date: formData.get("date") as string,
          start_time: formData.get("start_time") as string,
          end_time: formData.get("end_time") as string,
          location: formData.get("location") as string,
          max_volunteers: formData.get("max_volunteers") ? parseInt(formData.get("max_volunteers") as string) : null,
        })
        .eq("id", editingEvent.id);

      if (error) throw error;

      toast({
        title: "Event Updated",
        description: "Event details updated successfully",
      });

      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventToDelete.id);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "Event has been removed",
      });

      setEventToDelete(null);
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const activeEvents = events.filter((e) => e.status === "active");
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const completedEvents = events.filter((e) => e.status === "completed");

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
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">QR Attendance</h1>
            <p className="text-muted-foreground">Manage events and track volunteer attendance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowQuickStart(true)}>
              <Play className="w-4 h-4 mr-2" />
              Quick Start
            </Button>
            <Button variant="outline" onClick={() => setShowCreateEvent(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Events</p>
                  <p className="text-3xl font-bold">{activeEvents.length}</p>
                </div>
                <Play className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-3xl font-bold">{upcomingEvents.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">{completedEvents.length}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading events...</div>
              </div>
            ) : (
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="active">
                    Active ({activeEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingEvents.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedEvents.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3">
                  {activeEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active events. Start an immediate event or activate an upcoming one.
                    </div>
                  ) : (
                    activeEvents.map((event) => (
                      <Card 
                        key={event.id}
                        className="cursor-pointer hover:border-primary transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{event.name}</h4>
                                <Badge className="bg-green-500">Active Now</Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCompleteEvent(event.id)}
                                >
                                  Complete
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{event.start_time} - {event.end_time}</span>
                              </div>
                              {event.max_volunteers && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>Max {event.max_volunteers} volunteers</span>
                                </div>
                              )}
                            </div>

                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}

                            <Button size="sm" className="w-full">
                              <QrCode className="w-4 h-4 mr-2" />
                              Open QR Scanner
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-3">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming events scheduled
                    </div>
                  ) : (
                    upcomingEvents.map((event) => (
                      <Card 
                        key={event.id}
                        className="hover:border-primary transition-colors"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{event.name}</h4>
                                <Badge variant="secondary">Upcoming</Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingEvent(event)}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEventToDelete(event)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                              {event.max_volunteers && (
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>Max {event.max_volunteers} volunteers</span>
                                </div>
                              )}
                            </div>

                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}

                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleStartEvent(event.id)}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Event Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-3">
                  {completedEvents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No completed events yet
                    </div>
                  ) : (
                    completedEvents.map((event) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">{event.name}</h4>
                                <Badge variant="outline">Completed</Badge>
                              </div>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(event.event_date), "MMM dd, yyyy")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Dialog */}
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

      {/* Create Scheduled Event Dialog */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
            <DialogDescription>
              Create a new event for future date and time
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateScheduledEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Event Name *</Label>
              <Input id="create-name" name="name" placeholder="Community Cleanup" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-date">Date *</Label>
                <Input id="create-date" name="date" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-max">Max Volunteers</Label>
                <Input id="create-max" name="max_volunteers" type="number" min="1" placeholder="Optional" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-start">Start Time *</Label>
                <Input id="create-start" name="start_time" type="time" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-end">End Time *</Label>
                <Input id="create-end" name="end_time" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-location">Location *</Label>
              <Input id="create-location" name="location" placeholder="Central Park" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea 
                id="create-description" 
                name="description" 
                placeholder="Event details and instructions"
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowCreateEvent(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details
            </DialogDescription>
          </DialogHeader>

          {editingEvent && (
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Event Name *</Label>
                <Input id="edit-name" name="name" defaultValue={editingEvent.name} required />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date *</Label>
                  <Input id="edit-date" name="date" type="date" defaultValue={editingEvent.event_date} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-max">Max Volunteers</Label>
                  <Input id="edit-max" name="max_volunteers" type="number" min="1" defaultValue={editingEvent.max_volunteers || ""} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Start Time *</Label>
                  <Input id="edit-start" name="start_time" type="time" defaultValue={editingEvent.start_time} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-end">End Time *</Label>
                  <Input id="edit-end" name="end_time" type="time" defaultValue={editingEvent.end_time} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location *</Label>
                <Input id="edit-location" name="location" defaultValue={editingEvent.location} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={editingEvent.description || ""}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Pencil className="w-4 h-4 mr-2" />
                  Update Event
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QRAttendance;
