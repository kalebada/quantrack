-- Assign default role to all existing members who don't have any roles yet
DO $$
DECLARE
  org_record RECORD;
  member_record RECORD;
  default_role_id uuid;
BEGIN
  -- Loop through all organizations
  FOR org_record IN SELECT id FROM organizations LOOP
    -- Get or create the default role for this organization
    SELECT id INTO default_role_id
    FROM organization_roles
    WHERE organization_id = org_record.id
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- If no default role exists, create one
    IF default_role_id IS NULL THEN
      INSERT INTO organization_roles (organization_id, name, description)
      VALUES (org_record.id, 'Member', 'Default role for all organization members')
      RETURNING id INTO default_role_id;
    END IF;
    
    -- Loop through all members of this organization who don't have any roles
    FOR member_record IN 
      SELECT om.id as member_id
      FROM organization_members om
      LEFT JOIN member_role_assignments mra ON om.id = mra.member_id
      WHERE om.organization_id = org_record.id
        AND om.status = 'active'
        AND mra.id IS NULL
    LOOP
      -- Assign the default role to this member
      INSERT INTO member_role_assignments (member_id, role_id, assigned_by)
      VALUES (member_record.member_id, default_role_id, NULL)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;