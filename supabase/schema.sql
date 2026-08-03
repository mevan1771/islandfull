-- Supabase Schema for IslandFull Phase 1

-- Drop existing tables if they exist (for clean re-runs)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'tourist' CHECK (role IN ('tourist', 'provider', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities Table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  location TEXT NOT NULL, -- city/district
  description TEXT NOT NULL,
  inclusions TEXT[] DEFAULT '{}',
  duration TEXT NOT NULL, -- e.g., '2 hours', 'Half day'
  price_usd DECIMAL(10, 2) NOT NULL,
  price_lkr_approx DECIMAL(10, 2) NOT NULL,
  cover_image_url TEXT NOT NULL,
  gallery_urls TEXT[] DEFAULT '{}',
  card_image_url TEXT,
  max_capacity INTEGER NOT NULL DEFAULT 10,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  booking_type TEXT DEFAULT 'single_day' CHECK (booking_type IN ('single_day', 'multi_day')),
  pricing_model TEXT DEFAULT 'per_person' CHECK (pricing_model IN ('per_person', 'per_day', 'flat_rate')),
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  tourist_name TEXT NOT NULL,
  tourist_email TEXT NOT NULL,
  tourist_whatsapp TEXT NOT NULL,
  travel_date DATE NOT NULL,
  pax_count INTEGER NOT NULL CHECK (pax_count > 0),
  total_usd DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'redeemed', 'pending_payment')),
  end_date DATE,
  payment_request_sent_at TIMESTAMPTZ,
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic RLS Policies (For Phase 1, we can just allow read access for public data)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to activities" ON activities FOR SELECT USING (true);

-- Provider Policies for Bookings
CREATE POLICY "Providers can view their own bookings" 
ON bookings FOR SELECT 
USING (
  activity_id IN (
    SELECT id FROM activities WHERE host_id = auth.uid()
  )
);

CREATE POLICY "Providers can update their own bookings" 
ON bookings FOR UPDATE 
USING (
  activity_id IN (
    SELECT id FROM activities WHERE host_id = auth.uid()
  )
);

-- Global Settings Table
CREATE TABLE global_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to global_settings" ON global_settings FOR SELECT USING (true);
