import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schema for event signup answers
const answerSchema = z.string().max(2000, "Answer must be less than 2000 characters");

const EventSignupForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySignedUp, setAlreadySignedUp] = useState(false);

  useEffect(() => {
    fetchEventAndQuestions();
  }, [eventId]);

  const fetchEventAndQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Check if already signed up
      const { data: signupData } = await supabase
        .from("event_signups")
        .select("id")
        .eq("event_id", eventId)
        .eq("volunteer_id", user.id)
        .maybeSingle();

      if (signupData) {
        setAlreadySignedUp(true);
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("event_questions")
        .select("*")
        .eq("event_id", eventId)
        .order("question_order", { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Initialize answers
      const initialAnswers: Record<string, string> = {};
      questionsData?.forEach((q) => {
        initialAnswers[q.question_text] = "";
      });
      setAnswers(initialAnswers);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching event:", error);
      }
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Check rate limit (max 10 signups per hour)
    const { isRateLimited, recordAttempt, getTimeUntilReset, formatTimeRemaining } = await import("@/lib/rateLimit");
    
    const rateLimitConfig = {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      storageKey: "event_signup_rate_limit",
    };

    if (isRateLimited(rateLimitConfig)) {
      const timeRemaining = getTimeUntilReset(rateLimitConfig);
      toast({
        title: "Too Many Signups",
        description: `You've reached the maximum of 10 event signups per hour. Please try again in ${formatTimeRemaining(timeRemaining)}.`,
        variant: "destructive",
      });
      return;
    }

    // Validate required questions
    const unansweredRequired = questions.filter(
      (q) => q.is_required && !answers[q.question_text]?.trim()
    );

    if (unansweredRequired.length > 0) {
      toast({
        title: "Missing Answers",
        description: "Please answer all required questions",
        variant: "destructive",
      });
      return;
    }

    // Validate answer lengths
    const invalidAnswers = Object.entries(answers).filter(([_, answer]) => {
      const validation = answerSchema.safeParse(answer);
      return !validation.success;
    });

    if (invalidAnswers.length > 0) {
      toast({
        title: "Answer Too Long",
        description: "Each answer must be less than 2000 characters",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("event_signups").insert({
        event_id: eventId,
        volunteer_id: user.id,
        answers: answers,
      });

      if (error) throw error;

      // Record successful signup for rate limiting
      recordAttempt(rateLimitConfig);

      toast({
        title: "Successfully Signed Up!",
        description: "You have been registered for this event.",
      });

      navigate(-1); // Go back to previous page
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Error signing up:", error);
      }
      toast({
        title: "Error",
        description: error.message || "Failed to sign up for event",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold">Event Signup</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {event.start_time} - {event.end_time}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground mt-4">
                  {event.description}
                </p>
              )}
            </div>

            {alreadySignedUp ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  You are already signed up for this event!
                </p>
              </div>
            ) : (
              <>
                {/* Questions */}
                {questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Signup Questions</h3>
                    {questions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <Label>
                          {question.question_text}
                          {question.is_required && <span className="text-destructive"> *</span>}
                        </Label>
                        {question.question_type === "text" && (
                          <div className="space-y-1">
                            <Textarea
                              value={answers[question.question_text] || ""}
                              onChange={(e) =>
                                setAnswers({
                                  ...answers,
                                  [question.question_text]: e.target.value,
                                })
                              }
                              placeholder="Your answer..."
                              rows={3}
                              maxLength={2000}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                              {(answers[question.question_text] || "").length}/2000 characters
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Signing Up..." : "Sign Up for Event"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventSignupForm;
