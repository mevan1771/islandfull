-- Enable RLS on cancellation_tiers
ALTER TABLE cancellation_tiers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to cancellation_tiers
CREATE POLICY "Allow public read access on cancellation_tiers" ON cancellation_tiers FOR SELECT USING (true);

-- Allow authenticated admins to insert, update, delete
CREATE POLICY "Allow admins to insert cancellation_tiers" ON cancellation_tiers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Allow admins to update cancellation_tiers" ON cancellation_tiers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Allow admins to delete cancellation_tiers" ON cancellation_tiers FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);
