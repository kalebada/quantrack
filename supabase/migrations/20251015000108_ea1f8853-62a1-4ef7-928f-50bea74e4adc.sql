-- Fix 1: Restrict organization RLS policy to members/admins only
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;

CREATE POLICY "Members can view their organizations" ON public.organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE volunteer_id = auth.uid())
    OR id IN (SELECT organization_id FROM public.admin_profiles WHERE id = auth.uid())
  );

-- Create a public view for organization discovery (non-sensitive fields only)
CREATE OR REPLACE VIEW public.public_organizations AS 
  SELECT 
    id, 
    name, 
    mission_statement, 
    website, 
    invite_code,
    organization_type
  FROM public.organizations;

-- Grant access to the public view
GRANT SELECT ON public.public_organizations TO anon, authenticated;

-- Fix 2: Update verify_volunteer function to remove sensitive data
CREATE OR REPLACE FUNCTION public.verify_volunteer(member_code uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
  sessions_data json;
BEGIN
  -- Get volunteer public info
  SELECT json_build_object(
    'valid', true,
    'full_name', p.full_name,
    'level', vp.level,
    'total_hours', vp.total_hours,
    'school_organization', vp.school_organization
  ) INTO result
  FROM profiles p
  JOIN volunteer_profiles vp ON p.id = vp.id
  WHERE p.id = member_code;
  
  -- If volunteer found, get their approved session history (sanitized, no descriptions)
  IF result IS NOT NULL THEN
    SELECT json_agg(
      json_build_object(
        'organization', o.name,
        'session_date', vs.session_date,
        'hours_worked', vs.hours_worked
        -- Removed: 'description' field for privacy
      ) ORDER BY vs.session_date DESC
    ) INTO sessions_data
    FROM volunteer_sessions vs
    JOIN organizations o ON vs.organization_id = o.id
    WHERE vs.volunteer_id = member_code
      AND vs.status = 'approved'; -- Only show approved sessions
    
    result := result || json_build_object('sessions', COALESCE(sessions_data, '[]'::json));
  END IF;
  
  RETURN COALESCE(result, json_build_object('valid', false));
END;
$function$;

-- Add CHECK constraint for event signup answer length
ALTER TABLE public.event_signups 
ADD CONSTRAINT event_signups_answers_size_check 
CHECK (pg_column_size(answers) < 100000); -- Limit to ~100KB total