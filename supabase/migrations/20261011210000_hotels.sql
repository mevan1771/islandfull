CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES hosts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  reference_code TEXT UNIQUE,
  location TEXT,
  address TEXT,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'hotel',
  star_rating INTEGER CHECK (star_rating IS NULL OR (star_rating >= 1 AND star_rating <= 5)),
  cover_image_url TEXT,
  gallery_urls TEXT[] NOT NULL DEFAULT '{}',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  check_in_time TEXT NOT NULL DEFAULT '14:00',
  check_out_time TEXT NOT NULL DEFAULT '11:00',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  commission_rate NUMERIC NOT NULL DEFAULT 15,
  is_custom_commission BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hotel_room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  bed_config TEXT,
  room_size_sqm NUMERIC,
  max_adults INTEGER NOT NULL DEFAULT 2,
  max_children INTEGER NOT NULL DEFAULT 0,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  quantity INTEGER NOT NULL DEFAULT 1,
  nightly_rate_usd NUMERIC NOT NULL DEFAULT 0,
  extra_adult_rate_usd NUMERIC,
  amenities TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hotels_status_idx ON hotels (status, is_paused, created_at DESC);
CREATE INDEX IF NOT EXISTS hotels_location_idx ON hotels (location);
CREATE INDEX IF NOT EXISTS hotels_property_type_idx ON hotels (property_type);
CREATE INDEX IF NOT EXISTS hotel_room_types_hotel_idx ON hotel_room_types (hotel_id, sort_order);

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_room_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hotels_public_read ON hotels;
CREATE POLICY hotels_public_read ON hotels
  FOR SELECT
  USING (status = 'published' AND is_paused = false);

DROP POLICY IF EXISTS hotel_room_types_public_read ON hotel_room_types;
CREATE POLICY hotel_room_types_public_read ON hotel_room_types
  FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM hotels h
      WHERE h.id = hotel_room_types.hotel_id
        AND h.status = 'published'
        AND h.is_paused = false
    )
  );

INSERT INTO categories (name, slug, category_type, sort_order)
SELECT v.name, v.slug, v.category_type, v.sort_order
FROM (
  VALUES
    ('Boutique', 'boutique', 'hotel', 1),
    ('Beach', 'beach', 'hotel', 2),
    ('City', 'city', 'hotel', 3),
    ('Villa', 'villa', 'hotel', 4),
    ('Resort', 'resort', 'hotel', 5),
    ('Homestay', 'homestay', 'hotel', 6),
    ('Guesthouse', 'guesthouse', 'hotel', 7)
) AS v(name, slug, category_type, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c
  WHERE c.slug = v.slug AND c.category_type = 'hotel'
);
