-- Create a function to fix existing users with missing profiles
CREATE OR REPLACE FUNCTION public.fix_existing_users()
RETURNS TABLE(user_id uuid, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  user_email text;
  user_name text;
  user_role app_role;
BEGIN
  -- Loop through all users
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data->>'full_name' as full_name
    FROM auth.users au
  LOOP
    user_id := user_record.id;
    user_email := user_record.email;
    user_name := COALESCE(user_record.full_name, user_record.email);
    
    -- Check if user has a role
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_roles.user_id = user_record.id
    LIMIT 1;
    
    -- If no role, assume volunteer (safest default)
    IF user_role IS NULL THEN
      -- Create profile if missing
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (user_record.id, user_email, user_name)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
      
      -- Create volunteer profile if missing
      INSERT INTO public.volunteer_profiles (id, date_of_birth, school_organization)
      VALUES (user_record.id, '2000-01-01', '')
      ON CONFLICT (id) DO NOTHING;
      
      -- Add volunteer role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (user_record.id, 'volunteer'::app_role)
      ON CONFLICT DO NOTHING;
      
      status := 'Fixed as volunteer';
    ELSE
      -- User has a role, just ensure profiles exist
      INSERT INTO public.profiles (id, email, full_name)
      VALUES (user_record.id, user_email, user_name)
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
      
      IF user_role = 'volunteer' THEN
        INSERT INTO public.volunteer_profiles (id, date_of_birth, school_organization)
        VALUES (user_record.id, '2000-01-01', '')
        ON CONFLICT (id) DO NOTHING;
      END IF;
      
      status := 'Already configured';
    END IF;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Run the fix function
SELECT * FROM public.fix_existing_users();

-- Drop the function after use
DROP FUNCTION IF EXISTS public.fix_existing_users();