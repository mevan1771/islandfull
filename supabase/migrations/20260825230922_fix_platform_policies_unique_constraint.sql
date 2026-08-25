-- Drop the unique constraint on the 'type' column to allow multiple versions of the same policy type
ALTER TABLE platform_policies DROP CONSTRAINT IF EXISTS platform_policies_type_key;

-- Add a composite unique constraint on 'type' and 'version' to ensure each version of a policy is unique
ALTER TABLE platform_policies ADD CONSTRAINT platform_policies_type_version_key UNIQUE (type, version);
