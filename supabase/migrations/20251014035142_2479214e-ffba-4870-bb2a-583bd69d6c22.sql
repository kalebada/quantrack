-- Create a helper function to ensure volunteer profile setup
CREATE OR REPLACE FUNCTION public.ensure_volunteer_profile(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  user_email text;
  user_name text;
BEGIN
  -- Get user email from auth
  SELECT email, raw_user_meta_data->>'full_name'
  INTO user_email, user_name
  FROM auth.users
  WHERE id = _user_id;
  
  -- Ensure profiles record exists
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (_user_id, user_email, COALESCE(user_name, user_email))
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  -- Ensure volunteer_profiles record exists
  INSERT INTO public.volunteer_profiles (id, date_of_birth, school_organization)
  VALUES (_user_id, '2000-01-01', '')
  ON CONFLICT (id) DO NOTHING;
  
  -- Return success
  result := jsonb_build_object(
    'success', true,
    'profile_exists', true,
    'volunteer_profile_exists', true
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.ensure_volunteer_profile(uuid) TO authenticated;