ALTER TABLE hosts
ADD COLUMN IF NOT EXISTS service_types TEXT[] NOT NULL DEFAULT ARRAY['tour']::TEXT[];

UPDATE hosts
SET service_types = ARRAY['tour']::TEXT[]
WHERE service_types IS NULL OR cardinality(service_types) = 0;
