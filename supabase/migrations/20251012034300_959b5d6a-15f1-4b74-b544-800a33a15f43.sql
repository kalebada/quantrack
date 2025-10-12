-- ============================================
-- SECURITY FIX: Critical Privilege Escalation & Data Exposure
-- ============================================

-- 1. Create app_role enum for secure role management
CREATE TYPE app_role AS ENUM ('admin', 'volunteer', 'coordinator');

-- 2. Create user_roles table (separate from profiles)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Migrate existing roles from profiles to user_roles
INSERT INTO user_roles (user_id, role)
SELECT id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'volunteer' THEN 'volunteer'::app_role
    ELSE 'volunteer'::app_role
  END
FROM profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Add RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
USING (user_id = auth.uid());

-- Only allow role insertion through controlled processes (no direct user INSERT)
CREATE POLICY "System can insert roles"
ON user_roles FOR INSERT
WITH CHECK (false); -- Disable direct inserts, use functions/triggers only

-- 6. Fix volunteer_sessions RLS - Remove public access
DROP POLICY IF EXISTS "Anyone can view volunteer sessions for verification" ON volunteer_sessions;

-- Add restricted policies for volunteer_sessions
CREATE POLICY "Volunteers view own sessions"
ON volunteer_sessions FOR SELECT
USING (volunteer_id = auth.uid());

CREATE POLICY "Admins view org sessions"
ON volunteer_sessions FOR SELECT
USING (
  has_role(auth.uid(), 'admin') 
  AND organization_id IN (
    SELECT organization_id 
    FROM admin_profiles 
    WHERE id = auth.uid()
  )
);

-- 7. Fix certificates RLS - Remove public access
DROP POLICY IF EXISTS "Anyone can view certificates for verification" ON certificates;

-- Add restricted policies for certificates
CREATE POLICY "Volunteers view own certificates"
ON certificates FOR SELECT
USING (volunteer_id = auth.uid());

CREATE POLICY "Admins view org certificates"
ON certificates FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  AND organization_id IN (
    SELECT organization_id 
    FROM admin_profiles 
    WHERE id = auth.uid()
  )
);

-- 8. Create secure verification function for public certificate verification
CREATE OR REPLACE FUNCTION verify_certificate(cert_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Return sanitized certificate data without exposing IDs
  SELECT json_build_object(
    'valid', true,
    'volunteer_name', p.full_name,
    'organization', o.name,
    'start_date', c.start_date,
    'end_date', c.end_date,
    'total_hours', c.total_hours,
    'generated_at', c.generated_at
  ) INTO result
  FROM certificates c
  JOIN profiles p ON c.volunteer_id = p.id
  JOIN organizations o ON c.organization_id = o.id
  WHERE c.certificate_code = cert_code;
  
  RETURN COALESCE(result, json_build_object('valid', false));
END;
$$;

-- 9. Create secure verification function for public volunteer verification
CREATE OR REPLACE FUNCTION verify_volunteer(member_code uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- If volunteer found, get their session history (sanitized)
  IF result IS NOT NULL THEN
    SELECT json_agg(
      json_build_object(
        'organization', o.name,
        'session_date', vs.session_date,
        'hours_worked', vs.hours_worked,
        'description', vs.description
      ) ORDER BY vs.session_date DESC
    ) INTO sessions_data
    FROM volunteer_sessions vs
    JOIN organizations o ON vs.organization_id = o.id
    WHERE vs.volunteer_id = member_code;
    
    result := result || json_build_object('sessions', COALESCE(sessions_data, '[]'::json));
  END IF;
  
  RETURN COALESCE(result, json_build_object('valid', false));
END;
$$;

-- 10. Update existing RLS policies that reference admin role
DROP POLICY IF EXISTS "Admins can insert sessions for their organization" ON volunteer_sessions;
CREATE POLICY "Admins can insert sessions for their organization"
ON volunteer_sessions FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin')
  AND organization_id IN (
    SELECT organization_id 
    FROM admin_profiles 
    WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can create certificates for their organization" ON certificates;
CREATE POLICY "Admins can create certificates for their organization"
ON certificates FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin')
  AND organization_id IN (
    SELECT organization_id 
    FROM admin_profiles 
    WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can view their organization members" ON organization_members;
CREATE POLICY "Admins can view their organization members"
ON organization_members FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  AND organization_id IN (
    SELECT organization_id 
    FROM admin_profiles 
    WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
CREATE POLICY "Admins can update their organization"
ON organizations FOR UPDATE
USING (
  has_role(auth.uid(), 'admin')
  AND id IN (
    SELECT organization_id 
    FROM admin_profiles 
    WHERE id = auth.uid()
  )
);

-- 11. Add trigger to auto-assign volunteer role on profile creation
CREATE OR REPLACE FUNCTION assign_default_volunteer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign volunteer role when profile is created
  -- Only if no role exists yet
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = NEW.id) THEN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'volunteer'::app_role)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assign_volunteer_role_on_profile_creation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_default_volunteer_role();

-- 12. Add function to safely assign admin role (called during signup)
CREATE OR REPLACE FUNCTION assign_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove volunteer role if it exists
  DELETE FROM user_roles WHERE user_id = _user_id AND role = 'volunteer';
  
  -- Assign admin role
  INSERT INTO user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT DO NOTHING;
END;
$$;