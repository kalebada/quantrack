import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, Users, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const ManageEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1: Event Details, 2: Questions
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Form state - Step 1
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxVolunteers, setMaxVolunteers] = useState("");
  const [location, setLocation] = useState("");
  const [memberRoles, setMemberRoles] = useState<string[]>(["volunteer"]);
  
  // Form state - Step 2 (Questions)
  const [questions, setQuestions] = useState<Array<{question_text: string, question_type: string, is_required: boolean}>>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  // Event detail state
  const [signups, setSignups] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("organization_id", adminProfile.organization_id)
        .order("event_date", { ascending: true });

      if (eventsData) {
        setEvents(eventsData);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextToQuestions = () => {
    if (!eventName || !eventDate || !startTime || !endTime || !location) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setCreateStep(2);
  };

  const addQuestion = () => {
    if (!currentQuestion.trim()) return;
    setQuestions([...questions, { question_text: currentQuestion, question_type: "text", is_required: true }]);
    setCurrentQuestion("");
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: eventData, error: eventError } = await supabase.from("events").insert({
        organization_id: organizationId,
        name: eventName,
        description: eventDescription,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        location: location,
        max_volunteers: maxVolunteers ? parseInt(maxVolunteers) : null,
        member_roles: memberRoles,
        created_by: user.id,
      }).select().single();

      if (eventError) throw eventError;

      // Insert questions
      if (questions.length > 0 && eventData) {
        const questionsToInsert = questions.map((q, index) => ({
          event_id: eventData.id,
          question_text: q.question_text,
          question_type: q.question_type,
          is_required: q.is_required,
          question_order: index + 1,
        }));

        const { error: questionsError } = await supabase
          .from("event_questions")
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      toast({
        title: "Event Created!",
        description: "Your event has been created successfully.",
      });

      // Reset form
      resetForm();
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEventName("");
    setEventDescription("");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setMaxVolunteers("");
    setLocation("");
    setMemberRoles(["volunteer"]);
    setQuestions([]);
    setCurrentQuestion("");
    setShowCreateDialog(false);
    setCreateStep(1);
  };

  const handleViewEvent = async (event: any) => {
    setSelectedEvent(event);
    
    // Fetch signups
    const { data: signupsData } = await supabase
      .from("event_signups")
      .select("*, profiles(full_name)")
      .eq("event_id", event.id);
    
    if (signupsData) setSignups(signupsData);
    
    // Fetch attendance
    const { data: attendanceData } = await supabase
      .from("event_attendance")
      .select("volunteer_id")
      .eq("event_id", event.id);
    
    if (attendanceData) setAttendance(attendanceData);
    
    setShowDetailDialog(true);
  };

  const handleToggleAttendance = async (volunteerId: string) => {
    if (!selectedEvent) return;
    
    const isPresent = attendance.some(a => a.volunteer_id === volunteerId);
    
    if (isPresent) {
      await supabase
        .from("event_attendance")
        .delete()
        .eq("event_id", selectedEvent.id)
        .eq("volunteer_id", volunteerId);
      
      setAttendance(attendance.filter(a => a.volunteer_id !== volunteerId));
    } else {
      await supabase
        .from("event_attendance")
        .insert({ event_id: selectedEvent.id, volunteer_id: volunteerId });
      
      setAttendance([...attendance, { volunteer_id: volunteerId }]);
    }
    
    toast({
      title: isPresent ? "Attendance Removed" : "Attendance Marked",
      description: isPresent ? "Volunteer removed from attendance" : "Volunteer marked as present",
    });
  };

  const isEventActive = (event: any) => {
    if (!event.event_date || !event.start_time || !event.end_time) return false;
    
    const now = new Date();
    const eventDate = new Date(event.event_date);
    const [startHour, startMin] = event.start_time.split(':').map(Number);
    const [endHour, endMin] = event.end_time.split(':').map(Number);
    
    const eventStart = new Date(eventDate);
    eventStart.setHours(startHour, startMin, 0);
    
    const eventEnd = new Date(eventDate);
    eventEnd.setHours(endHour, endMin, 0);
    
    return now >= eventStart && now <= eventEnd;
  };

  const toggleMemberRole = (role: string) => {
    if (memberRoles.includes(role)) {
      setMemberRoles(memberRoles.filter(r => r !== role));
    } else {
      setMemberRoles([...memberRoles, role]);
    }
  };

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
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold">Manage Events</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Upcoming Events */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Events</span>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                Create Event
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                <p className="text-muted-foreground">Create your first event to get started</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.id} className="p-4 bg-muted border-border hover:border-accent transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{event.name}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {event.start_time} - {event.end_time}
                      </div>
                      {event.max_volunteers && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          Max: {event.max_volunteers}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleViewEvent(event)}
                      >
                        View Event
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowCreateDialog(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {createStep === 1 ? "Create New Event - Details" : "Create New Event - Questions"}
            </DialogTitle>
          </DialogHeader>
          
          {createStep === 1 ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input
                  placeholder="Enter event name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the event..."
                  rows={4}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input 
                  type="date" 
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input 
                  placeholder="Event location" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Volunteers (Optional)</Label>
                <Input 
                  type="number" 
                  placeholder="50" 
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Member Roles (Who can view & signup)</Label>
                <div className="space-y-2">
                  {["volunteer", "member", "leader", "coordinator"].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={memberRoles.includes(role)}
                        onCheckedChange={() => toggleMemberRole(role)}
                      />
                      <label htmlFor={role} className="text-sm capitalize cursor-pointer">
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleNextToQuestions} className="flex-1">
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Add Signup Questions (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Create questions that volunteers must answer when signing up for this event.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter question..."
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                />
                <Button onClick={addQuestion}>Add</Button>
              </div>
              
              {questions.length > 0 && (
                <div className="space-y-2">
                  <Label>Questions ({questions.length})</Label>
                  {questions.map((q, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1">{index + 1}. {q.question_text}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setCreateStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleCreateEvent} className="flex-1">
                  Create Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Event Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Time:</strong> {selectedEvent.start_time} - {selectedEvent.end_time}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
                {selectedEvent.description && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Description:</strong> {selectedEvent.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Signups ({signups.length}
                    {selectedEvent.max_volunteers && `/${selectedEvent.max_volunteers}`})
                  </h3>
                  <Button
                    variant={isEventActive(selectedEvent) ? "default" : "secondary"}
                    size="sm"
                    disabled={!isEventActive(selectedEvent)}
                  >
                    Take Attendance
                  </Button>
                </div>
                
                {signups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No signups yet</p>
                ) : (
                  <div className="space-y-2">
                    {signups.map((signup: any) => (
                      <Card key={signup.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{signup.profiles?.full_name}</p>
                            {signup.answers && Object.keys(signup.answers).length > 0 && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(signup.answers).map(([question, answer]: any) => (
                                  <p key={question} className="text-xs text-muted-foreground">
                                    <strong>{question}:</strong> {answer}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          {isEventActive(selectedEvent) && (
                            <Checkbox
                              checked={attendance.some(a => a.volunteer_id === signup.volunteer_id)}
                              onCheckedChange={() => handleToggleAttendance(signup.volunteer_id)}
                            />
                          )}
                          {attendance.some(a => a.volunteer_id === signup.volunteer_id) && (
                            <Badge variant="default" className="ml-2">Present</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageEvents;
