-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_hours INTEGER NOT NULL,
  due_date DATE NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL
);

-- Create task assignments table (for assigning to specific people or roles)
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' NOT NULL
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Admins can manage tasks for their organization"
ON public.tasks
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  AND organization_id IN (
    SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Volunteers can view tasks for their organizations"
ON public.tasks
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE volunteer_id = auth.uid()
  )
);

-- RLS Policies for task_assignments
CREATE POLICY "Admins can manage assignments for their org tasks"
ON public.task_assignments
FOR ALL
USING (
  task_id IN (
    SELECT id FROM tasks WHERE organization_id IN (
      SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
    )
  )
)
WITH CHECK (
  task_id IN (
    SELECT id FROM tasks WHERE organization_id IN (
      SELECT organization_id FROM admin_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Volunteers can view their own assignments"
ON public.task_assignments
FOR SELECT
USING (
  volunteer_id = auth.uid() OR
  role IN (
    SELECT member_role FROM organization_members WHERE volunteer_id = auth.uid()
  )
);

CREATE POLICY "Volunteers can update their own assignments"
ON public.task_assignments
FOR UPDATE
USING (volunteer_id = auth.uid())
WITH CHECK (volunteer_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();