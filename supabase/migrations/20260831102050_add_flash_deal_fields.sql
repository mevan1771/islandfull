ALTER TABLE activities
ADD COLUMN IF NOT EXISTS discount_price numeric,
ADD COLUMN IF NOT EXISTS deal_end_date timestamptz;
