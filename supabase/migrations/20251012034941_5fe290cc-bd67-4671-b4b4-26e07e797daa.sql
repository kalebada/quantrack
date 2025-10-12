-- Fix 1: Drop the old role column from profiles table (duplicate role storage)
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Drop the old user_role enum (no longer needed)
DROP TYPE IF EXISTS user_role;

-- Fix 2: Update update_updated_at() function with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix 3: Restrict organization creation to authenticated users with admin role
DROP POLICY IF EXISTS "Anyone can create organizations" ON organizations;

CREATE POLICY "Only admins can create organizations"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix 4: Restrict member_role assignment in organization_members
DROP POLICY IF EXISTS "Volunteers can join organizations" ON organization_members;

CREATE POLICY "Volunteers can join with default role"
ON organization_members FOR INSERT
TO authenticated
WITH CHECK (
  volunteer_id = auth.uid()
  AND member_role = 'volunteer'
);

-- Fix 5: Only allow org admins to update member roles
CREATE POLICY "Admins can update member roles"
ON organization_members FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

-- Fix 6: Add explicit anonymous blocking policies for PII tables
CREATE POLICY "Block anonymous access to profiles"
ON profiles FOR SELECT
TO anon
USING (false);

CREATE POLICY "Block anonymous access to admin profiles"
ON admin_profiles FOR SELECT
TO anon
USING (false);

CREATE POLICY "Block anonymous access to volunteer profiles"
ON volunteer_profiles FOR SELECT
TO anon
USING (false);