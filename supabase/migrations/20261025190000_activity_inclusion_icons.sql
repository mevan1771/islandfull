ALTER TABLE activities
ADD COLUMN IF NOT EXISTS inclusion_icons TEXT[] DEFAULT '{}';
