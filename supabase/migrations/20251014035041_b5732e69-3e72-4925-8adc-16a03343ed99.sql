-- Fix the signup trigger to handle the foreign key chain properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  org_id uuid;
  profile_exists boolean;
BEGIN
  -- Get the role from metadata
  user_role := NEW.raw_user_meta_data->>'role';
  
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = NEW.id) INTO profile_exists;
  
  -- Always insert into profiles table if it doesn't exist
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
  END IF;
  
  -- Handle admin signup
  IF user_role = 'admin' THEN
    -- Create organization
    INSERT INTO public.organizations (
      name,
      organization_type,
      registration_number,
      address,
      city,
      country,
      established_date,
      mission_statement,
      website
    ) VALUES (
      NEW.raw_user_meta_data->>'organization_name',
      NEW.raw_user_meta_data->>'organization_type',
      COALESCE(NEW.raw_user_meta_data->>'registration_number', ''),
      NEW.raw_user_meta_data->>'address',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'country',
      (NEW.raw_user_meta_data->>'established_date')::date,
      COALESCE(NEW.raw_user_meta_data->>'mission_statement', ''),
      COALESCE(NEW.raw_user_meta_data->>'website', '')
    ) RETURNING id INTO org_id;
    
    -- Create admin profile
    INSERT INTO public.admin_profiles (id, organization_id, job_title, phone_number)
    VALUES (
      NEW.id,
      org_id,
      COALESCE(NEW.raw_user_meta_data->>'job_title', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
    );
    
    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT DO NOTHING;
    
  -- Handle volunteer signup
  ELSE
    -- Create volunteer profile (now profiles exists, so foreign key will work)
    INSERT INTO public.volunteer_profiles (
      id,
      date_of_birth,
      school_organization
    ) VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'date_of_birth')::date,
      COALESCE(NEW.raw_user_meta_data->>'school_organization', '')
    ) ON CONFLICT (id) DO NOTHING;
    
    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'volunteer'::app_role)
    ON CONFLICT DO NOTHING;
    
    -- If invite code provided, join organization
    IF NEW.raw_user_meta_data->>'invite_code' IS NOT NULL THEN
      -- Find organization by invite code
      SELECT id INTO org_id
      FROM public.organizations
      WHERE invite_code = NEW.raw_user_meta_data->>'invite_code';
      
      -- Join organization if found
      IF org_id IS NOT NULL THEN
        INSERT INTO public.organization_members (volunteer_id, organization_id, member_role)
        VALUES (NEW.id, org_id, 'volunteer')
        ON CONFLICT (organization_id, volunteer_id) DO NOTHING;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user_signup for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();