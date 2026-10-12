ALTER TABLE hotels ADD COLUMN IF NOT EXISTS allow_offers BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE offers ALTER COLUMN activity_id DROP NOT NULL;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE;

UPDATE offers SET hotel_id = NULL WHERE hotel_id IS NOT NULL AND activity_id IS NOT NULL;

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_listing_xor;
ALTER TABLE offers ADD CONSTRAINT offers_listing_xor CHECK (
  (activity_id IS NOT NULL AND hotel_id IS NULL)
  OR (activity_id IS NULL AND hotel_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS offers_hotel_id_idx ON offers (hotel_id);
