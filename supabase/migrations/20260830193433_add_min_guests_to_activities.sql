-- Add min_guests column to activities table
ALTER TABLE activities ADD COLUMN min_guests INTEGER DEFAULT 1;
