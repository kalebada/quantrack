import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const sessionSchema = z.object({
  description: z.string().trim().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  hours: z.number().positive("Hours must be greater than 0"),
});

interface SubmitHoursDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export const SubmitHoursDialog = ({ isOpen, onClose, organizationId }: SubmitHoursDialogProps) => {
  const [date, setDate] = useState<Date>();
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!date || !hours || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      toast({
        title: "Invalid Hours",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      });
      return;
    }

    // Validate description length
    const validation = sessionSchema.safeParse({
      description: description.trim(),
      hours: hoursNum,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("volunteer_sessions").insert({
        volunteer_id: user.id,
        organization_id: organizationId,
        session_date: format(date, "yyyy-MM-dd"),
        hours_worked: hoursNum,
        description: description.trim(),
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Hours Submitted",
        description: "Your hours have been submitted for approval",
      });

      setDate(undefined);
      setHours("");
      setDescription("");
      onClose();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error submitting hours:", error);
      }
      toast({
        title: "Error",
        description: "Failed to submit hours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Volunteer Hours</DialogTitle>
          <DialogDescription>
            Record your volunteer work for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked *</Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              min="0"
              placeholder="e.g., 3.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the volunteer work you did..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000 characters
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Hours"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
