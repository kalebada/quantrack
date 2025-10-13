-- Create events table for managing volunteer events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  max_volunteers INTEGER,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add status field to volunteer_sessions for approval workflow
ALTER TABLE public.volunteer_sessions
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied'));

-- Add event_id to volunteer_sessions to link sessions to events
ALTER TABLE public.volunteer_sessions
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Admins can create events for their organization
CREATE POLICY "Admins can create events for their organization"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

-- Admins can view their organization's events
CREATE POLICY "Admins can view their organization events"
ON public.events
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

-- Admins can update their organization's events
CREATE POLICY "Admins can update their organization events"
ON public.events
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

-- Volunteers can view events for organizations they're members of
CREATE POLICY "Volunteers can view events"
ON public.events
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE volunteer_id = auth.uid()
  )
);

-- Add trigger for events updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Update volunteer_sessions RLS policies to handle approval workflow
DROP POLICY IF EXISTS "Admins can insert sessions for their organization" ON public.volunteer_sessions;
CREATE POLICY "Admins can manage sessions for their organization"
ON public.volunteer_sessions
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);