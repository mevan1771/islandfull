-- Role Based Access Control & Audit Logging Setup

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admins can read all roles. Users can read their own role.
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());


-- 2. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Staff and admins can insert audit logs via triggers (Triggers run as superuser usually, but for direct inserts:)
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- 3. Audit Logging Trigger for Tours (activities table)
CREATE OR REPLACE FUNCTION log_tour_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_entity_id TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'Inserted new tour: ' || NEW.title;
    v_entity_id := NEW.id::text;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'Updated tour: ' || NEW.title;
    v_entity_id := NEW.id::text;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'Deleted tour: ' || OLD.title;
    v_entity_id := OLD.id::text;
  END IF;

  INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id)
  VALUES (v_user_id, v_action, 'activities', v_entity_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_tours_trigger ON public.activities;
CREATE TRIGGER audit_tours_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION log_tour_changes();


-- 4. RLS for activities (Tours)
-- Assuming RLS is already enabled. We want staff to be able to INSERT and UPDATE, but not DELETE.
-- Admins can do everything.

CREATE POLICY "Admin full access on activities" ON public.activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff insert access on activities" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'staff'
    )
  );

CREATE POLICY "Staff update access on activities" ON public.activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'staff'
    )
  );
