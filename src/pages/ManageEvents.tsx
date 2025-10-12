import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, ArrowLeft, Plus, Users, Link as LinkIcon, ClipboardCheck, Copy } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ManageEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [signupLink, setSignupLink] = useState("");

  // Mock events data
  const events = [
    { id: 1, date: new Date(2025, 0, 15), name: "Food Drive", type: "Distribution", signups: 24 },
    { id: 2, date: new Date(2025, 0, 22), name: "Community Cleanup", type: "Service", signups: 18 },
    { id: 3, date: new Date(2025, 0, 28), name: "Fundraiser Gala", type: "Fundraising", signups: 42 },
  ];

  const handleCreateEvent = () => {
    const link = `${window.location.origin}/event-signup/${eventName.toLowerCase().replace(/\s+/g, '-')}`;
    setSignupLink(link);
    toast({
      title: "Event Created!",
      description: "Your event has been created successfully.",
    });
  };

  const copySignupLink = () => {
    navigator.clipboard.writeText(signupLink);
    toast({
      title: "Link Copied!",
      description: "Signup link copied to clipboard.",
    });
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Event Calendar</span>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Event</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="details" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="details">Event Details</TabsTrigger>
                        <TabsTrigger value="signup">Signup Form</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="details" className="space-y-4">
                        <div className="space-y-2">
                          <Label>Event Name</Label>
                          <Input
                            placeholder="Enter event name"
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Event Type</Label>
                          <Select value={eventType} onValueChange={setEventType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="distribution">Food Distribution</SelectItem>
                              <SelectItem value="service">Community Service</SelectItem>
                              <SelectItem value="fundraising">Fundraising</SelectItem>
                              <SelectItem value="education">Education/Training</SelectItem>
                              <SelectItem value="administrative">Administrative</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Label>Date & Time</Label>
                          <div className="flex gap-2">
                            <Input type="date" />
                            <Input type="time" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (hours)</Label>
                          <Input type="number" placeholder="4" />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Volunteers</Label>
                          <Input type="number" placeholder="50" />
                        </div>
                        <Button onClick={handleCreateEvent} className="w-full">
                          Create Event
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="signup" className="space-y-4">
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Customize the signup form fields for this event
                          </p>
                          <div className="space-y-2">
                            <Label>Required Fields</Label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked disabled />
                                <span className="text-sm">Full Name</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked disabled />
                                <span className="text-sm">Email</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">Phone Number</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="checkbox" defaultChecked />
                                <span className="text-sm">School/Organization</span>
                              </div>
                            </div>
                          </div>
                          
                          {signupLink && (
                            <div className="space-y-2 p-4 bg-muted rounded-lg">
                              <Label>Signup Link</Label>
                              <div className="flex gap-2">
                                <Input value={signupLink} readOnly />
                                <Button size="icon" variant="outline" onClick={copySignupLink}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="attendance" className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Attendance tracking will be available during the scheduled event time
                        </p>
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <ClipboardCheck className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Attendance Options</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <input type="radio" name="attendance" defaultChecked />
                              <span>QR Code Check-in</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="radio" name="attendance" />
                              <span>Manual Check-in</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="radio" name="attendance" />
                              <span>Both Methods</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="p-4 bg-muted border-border cursor-pointer hover:border-accent transition-colors">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-xs text-muted-foreground">{event.type}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        {event.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{event.signups} signed up</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Users className="w-3 h-3 mr-1" />
                          View Signups
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <LinkIcon className="w-3 h-3 mr-1" />
                          Link
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
