ALTER TABLE activities 
ADD COLUMN cancellation_tier TEXT DEFAULT 'MODERATE' CHECK (cancellation_tier IN ('FLEXIBLE', 'MODERATE', 'STRICT', 'NON_REFUNDABLE'));
