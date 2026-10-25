ALTER TABLE transport_trip_requests
  ADD COLUMN IF NOT EXISTS guest_requests TEXT;
