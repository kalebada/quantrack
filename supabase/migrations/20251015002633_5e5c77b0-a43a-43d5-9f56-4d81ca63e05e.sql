-- Create organization_roles table for custom roles per organization
CREATE TABLE public.organization_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create member_role_assignments junction table for many-to-many relationship
CREATE TABLE public.member_role_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.organization_members(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.organization_roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(member_id, role_id)
);

-- Enable RLS
ALTER TABLE public.organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_role_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_roles
CREATE POLICY "Admins can manage roles for their organization"
ON public.organization_roles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Members can view roles for their organizations"
ON public.organization_roles
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE volunteer_id = auth.uid()
  )
);

-- RLS Policies for member_role_assignments
CREATE POLICY "Admins can manage role assignments for their org members"
ON public.member_role_assignments
FOR ALL
USING (
  member_id IN (
    SELECT id FROM organization_members 
    WHERE organization_id IN (
      SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Members can view their own role assignments"
ON public.member_role_assignments
FOR SELECT
USING (
  member_id IN (
    SELECT id FROM organization_members WHERE volunteer_id = auth.uid()
  )
);

-- Add trigger for updated_at on organization_roles
CREATE TRIGGER update_organization_roles_updated_at
BEFORE UPDATE ON public.organization_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();