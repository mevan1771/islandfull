ALTER TABLE activities ADD COLUMN IF NOT EXISTS allow_offers BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  clerk_user_id TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  offer_amount NUMERIC NOT NULL,
  travel_date DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  special_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'countered', 'declined')),
  admin_counter_amount NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS offers_created_at_idx ON offers (created_at DESC);
CREATE INDEX IF NOT EXISTS offers_activity_id_idx ON offers (activity_id);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
