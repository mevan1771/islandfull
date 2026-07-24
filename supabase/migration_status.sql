-- Run this in your Supabase SQL editor to add the status column!
ALTER TABLE activities ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft'));
