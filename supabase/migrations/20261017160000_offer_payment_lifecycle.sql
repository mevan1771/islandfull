ALTER TABLE offers ADD COLUMN IF NOT EXISTS payment_expires_at TIMESTAMPTZ;

ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check CHECK (
  status IN ('pending', 'accepted', 'countered', 'declined', 'expired', 'paid')
);

CREATE INDEX IF NOT EXISTS offers_payment_expires_at_idx
  ON offers (payment_expires_at)
  WHERE status = 'accepted' AND payment_expires_at IS NOT NULL;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES offers(id) ON DELETE SET NULL;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_listing_xor;
ALTER TABLE bookings ADD CONSTRAINT bookings_listing_xor CHECK (
  NOT (activity_id IS NOT NULL AND hotel_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS bookings_hotel_id_idx ON bookings (hotel_id);
CREATE INDEX IF NOT EXISTS bookings_offer_id_idx ON bookings (offer_id);
