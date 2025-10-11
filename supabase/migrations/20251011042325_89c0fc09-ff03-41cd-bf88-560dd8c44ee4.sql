-- Create certificates table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_code text UNIQUE NOT NULL,
  volunteer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_hours integer NOT NULL,
  generated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create volunteer work/attendance tracking table
CREATE TABLE public.volunteer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  session_date date NOT NULL,
  hours_worked integer NOT NULL,
  description text,
  verified_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_sessions ENABLE ROW LEVEL SECURITY;

-- Certificates are publicly viewable for verification
CREATE POLICY "Anyone can view certificates for verification"
ON public.certificates FOR SELECT
USING (true);

-- Volunteer sessions are publicly viewable for verification
CREATE POLICY "Anyone can view volunteer sessions for verification"
ON public.volunteer_sessions FOR SELECT
USING (true);

-- Only admins of the organization can create certificates
CREATE POLICY "Admins can create certificates for their organization"
ON public.certificates FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

-- Volunteers can insert their own sessions
CREATE POLICY "Volunteers can insert their own sessions"
ON public.volunteer_sessions FOR INSERT
WITH CHECK (volunteer_id = auth.uid());

-- Admins can insert sessions for their organization
CREATE POLICY "Admins can insert sessions for their organization"
ON public.volunteer_sessions FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_volunteer_sessions_updated_at
  BEFORE UPDATE ON public.volunteer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for faster lookups
CREATE INDEX idx_certificates_code ON public.certificates(certificate_code);
CREATE INDEX idx_volunteer_sessions_volunteer ON public.volunteer_sessions(volunteer_id);