ALTER TABLE activities ADD COLUMN IF NOT EXISTS popularity_score INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS activities_popularity_score_idx ON activities (popularity_score DESC);

CREATE OR REPLACE FUNCTION bump_popularity(p_activity_id uuid, p_delta integer)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE activities
  SET popularity_score = GREATEST(0, COALESCE(popularity_score, 0) + p_delta)
  WHERE id = p_activity_id;
$$;

UPDATE activities a
SET popularity_score =
  COALESCE(a.like_count, 0) * 2
  + COALESCE((
    SELECT COUNT(*)::int * 10
    FROM bookings b
    WHERE b.activity_id = a.id
      AND b.status IN ('confirmed', 'completed', 'redeemed', 'paid')
  ), 0);
