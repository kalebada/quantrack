-- Fix 1: Update public_organizations view to use SECURITY INVOKER
CREATE OR REPLACE VIEW public.public_organizations
WITH (security_invoker = true)
AS 
  SELECT 
    id, 
    name, 
    mission_statement, 
    website, 
    invite_code,
    organization_type
  FROM public.organizations;

-- Fix 2: Add length constraint on volunteer_sessions.description
ALTER TABLE public.volunteer_sessions 
ADD CONSTRAINT volunteer_sessions_description_length_check 
CHECK (length(description) <= 2000);