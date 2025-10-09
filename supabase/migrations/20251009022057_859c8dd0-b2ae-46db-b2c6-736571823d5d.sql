-- Create user role enum
CREATE TYPE user_role AS ENUM ('volunteer', 'admin');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'volunteer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create volunteer profiles table
CREATE TABLE public.volunteer_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  school_organization TEXT NOT NULL,
  total_hours INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  organization_type TEXT NOT NULL,
  website TEXT,
  mission_statement TEXT,
  established_date DATE NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  logo_url TEXT,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin profiles table
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  job_title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create organization members table (volunteers joining organizations)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteer_profiles(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'volunteer',
  status TEXT NOT NULL DEFAULT 'active',
  total_hours INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, volunteer_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Volunteer profiles RLS policies
CREATE POLICY "Volunteers can view their own profile"
  ON public.volunteer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Volunteers can update their own profile"
  ON public.volunteer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Volunteers can insert their own profile"
  ON public.volunteer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organizations RLS policies
CREATE POLICY "Anyone can view organizations"
  ON public.organizations FOR SELECT
  USING (true);

CREATE POLICY "Admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (id IN (SELECT organization_id FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

-- Admin profiles RLS policies
CREATE POLICY "Admins can view their own profile"
  ON public.admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can update their own profile"
  ON public.admin_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert their own profile"
  ON public.admin_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organization members RLS policies
CREATE POLICY "Members can view their memberships"
  ON public.organization_members FOR SELECT
  USING (volunteer_id = auth.uid());

CREATE POLICY "Admins can view their organization members"
  ON public.organization_members FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM public.admin_profiles WHERE id = auth.uid()));

CREATE POLICY "Volunteers can join organizations"
  ON public.organization_members FOR INSERT
  WITH CHECK (volunteer_id = auth.uid());

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();