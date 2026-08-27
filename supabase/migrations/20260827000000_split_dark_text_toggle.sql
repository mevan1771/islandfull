-- Add use_dark_text_desktop and use_dark_text_mobile columns
ALTER TABLE activities ADD COLUMN IF NOT EXISTS use_dark_text_desktop BOOLEAN DEFAULT false;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS use_dark_text_mobile BOOLEAN DEFAULT false;

-- Migrate existing data (if use_dark_text is true, set both to true)
UPDATE activities SET use_dark_text_desktop = use_dark_text, use_dark_text_mobile = use_dark_text WHERE use_dark_text IS NOT NULL;

-- Notify postgrest to reload schema
NOTIFY pgrst, 'reload schema';
