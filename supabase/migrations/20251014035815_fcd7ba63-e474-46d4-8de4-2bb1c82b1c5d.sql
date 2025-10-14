-- Remove admins from organization_members table (they manage, not volunteer)
DELETE FROM public.organization_members
WHERE volunteer_id IN (
  SELECT user_id 
  FROM public.user_roles 
  WHERE role = 'admin'
);