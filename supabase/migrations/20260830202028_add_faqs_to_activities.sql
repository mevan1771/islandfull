-- Add faqs column to activities table
ALTER TABLE activities ADD COLUMN faqs JSONB DEFAULT '[]'::jsonb;
