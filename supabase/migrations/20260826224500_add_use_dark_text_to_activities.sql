-- Add use_dark_text column to activities table
ALTER TABLE activities ADD COLUMN IF NOT EXISTS use_dark_text BOOLEAN DEFAULT false;
