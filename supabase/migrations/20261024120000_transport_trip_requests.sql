CREATE TABLE IF NOT EXISTS transport_trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'van', 'bus', 'tuk-tuk', 'scooter')),
  wants_guide BOOLEAN NOT NULL DEFAULT false,
  travel_date DATE NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  offer_amount NUMERIC NOT NULL,
  guide_price NUMERIC NOT NULL,
  route_km NUMERIC NOT NULL DEFAULT 0,
  stops JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'paid')),
  accepted_host_id UUID REFERENCES hosts(id) ON DELETE SET NULL,
  accepted_activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  accepted_offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  payment_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transport_trip_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES transport_trip_requests(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, host_id)
);

ALTER TABLE offers ADD COLUMN IF NOT EXISTS trip_request_id UUID REFERENCES transport_trip_requests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS transport_trip_requests_guest_email_idx ON transport_trip_requests (guest_email);
CREATE INDEX IF NOT EXISTS transport_trip_requests_clerk_idx ON transport_trip_requests (clerk_user_id);
CREATE INDEX IF NOT EXISTS transport_trip_requests_status_idx ON transport_trip_requests (status);
CREATE INDEX IF NOT EXISTS transport_trip_recipients_host_idx ON transport_trip_recipients (host_id, status);
CREATE INDEX IF NOT EXISTS transport_trip_recipients_request_idx ON transport_trip_recipients (request_id);
CREATE INDEX IF NOT EXISTS offers_trip_request_id_idx ON offers (trip_request_id);

ALTER TABLE transport_trip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_trip_recipients ENABLE ROW LEVEL SECURITY;
