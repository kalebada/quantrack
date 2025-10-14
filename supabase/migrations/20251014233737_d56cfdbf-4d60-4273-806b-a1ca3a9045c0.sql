-- Add member_roles array to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS member_roles text[] DEFAULT '{}';

-- Create event_questions table for custom signup questions
CREATE TABLE IF NOT EXISTS event_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'text',
  is_required boolean NOT NULL DEFAULT true,
  question_order integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create event_signups table for volunteer RSVPs
CREATE TABLE IF NOT EXISTS event_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  signed_up_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);

-- Create event_attendance table for tracking who attended
CREATE TABLE IF NOT EXISTS event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  volunteer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  checked_in_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);

-- Enable RLS on new tables
ALTER TABLE event_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_questions
CREATE POLICY "Admins can manage questions for their org events"
ON event_questions FOR ALL
USING (
  event_id IN (
    SELECT id FROM events WHERE organization_id IN (
      SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Volunteers can view questions for accessible events"
ON event_questions FOR SELECT
USING (
  event_id IN (
    SELECT id FROM events WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE volunteer_id = auth.uid()
    )
  )
);

-- RLS policies for event_signups
CREATE POLICY "Volunteers can manage their own signups"
ON event_signups FOR ALL
USING (volunteer_id = auth.uid());

CREATE POLICY "Admins can view signups for their org events"
ON event_signups FOR SELECT
USING (
  event_id IN (
    SELECT id FROM events WHERE organization_id IN (
      SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
    )
  )
);

-- RLS policies for event_attendance
CREATE POLICY "Admins can manage attendance for their org events"
ON event_attendance FOR ALL
USING (
  event_id IN (
    SELECT id FROM events WHERE organization_id IN (
      SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Volunteers can view their own attendance"
ON event_attendance FOR SELECT
USING (volunteer_id = auth.uid());