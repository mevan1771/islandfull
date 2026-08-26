-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access on cancellation_tiers" ON cancellation_tiers;
DROP POLICY IF EXISTS "Allow public read" ON cancellation_tiers;

-- Create a new policy to force public read access
CREATE POLICY "Allow public read" ON cancellation_tiers FOR SELECT USING (true);
