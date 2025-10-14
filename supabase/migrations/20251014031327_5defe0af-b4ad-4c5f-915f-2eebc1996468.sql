-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.assign_default_volunteer_role() CASCADE;

-- Create function to handle new volunteer signup
CREATE OR REPLACE FUNCTION public.handle_volunteer_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Insert volunteer profile
  INSERT INTO public.volunteer_profiles (id, date_of_birth, school_organization)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::date, CURRENT_DATE),
    COALESCE(NEW.raw_user_meta_data->>'school_organization', '')
  );

  -- Check if team_code is provided and join organization
  IF NEW.raw_user_meta_data->>'team_code' IS NOT NULL AND NEW.raw_user_meta_data->>'team_code' != '' THEN
    -- Find organization by invite code
    SELECT id INTO org_id
    FROM public.organizations
    WHERE invite_code = NEW.raw_user_meta_data->>'team_code'
    LIMIT 1;

    -- If organization found, add membership
    IF org_id IS NOT NULL THEN
      INSERT INTO public.organization_members (volunteer_id, organization_id, member_role)
      VALUES (NEW.id, org_id, 'volunteer');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create function to handle new admin signup
CREATE OR REPLACE FUNCTION public.handle_admin_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Create organization
  INSERT INTO public.organizations (
    name,
    organization_type,
    established_date,
    registration_number,
    website,
    mission_statement,
    address,
    city,
    country
  ) VALUES (
    NEW.raw_user_meta_data->>'organization_name',
    COALESCE(NEW.raw_user_meta_data->>'organization_type', 'Other'),
    COALESCE((NEW.raw_user_meta_data->>'established_date')::date, CURRENT_DATE),
    COALESCE(NEW.raw_user_meta_data->>'registration_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'website', ''),
    COALESCE(NEW.raw_user_meta_data->>'mission_statement', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  ) RETURNING id INTO new_org_id;

  -- Create admin profile
  INSERT INTO public.admin_profiles (
    id,
    organization_id,
    phone_number,
    job_title
  ) VALUES (
    NEW.id,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'job_title', '')
  );

  -- Assign admin role
  PERFORM public.assign_admin_role(NEW.id);

  RETURN NEW;
END;
$$;

-- Create router function to handle both signup types
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is an admin signup (has organization_name)
  IF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
    RETURN public.handle_admin_signup();
  ELSE
    RETURN public.handle_volunteer_signup();
  END IF;
END;
$$;

-- Create the actual trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();