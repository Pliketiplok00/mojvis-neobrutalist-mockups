-- Migration 020: Allow multiple seasons of same type per year
--
-- Problem: The original schema had UNIQUE(season_type, year) which prevents
-- having multiple OFF seasons in the same year (e.g., OFF-A Jan-May, OFF-B Sep-Dec).
--
-- This migration safely drops that constraint if it exists.
-- The import script will be updated to use ON CONFLICT (id) instead.
--
-- Evidence: Staging DB shows departures linked to wrong seasons because
-- the import script's arbitrary first-match lookup was returning the
-- bus line's narrow OFF season instead of sea lines' full-year seasons.

-- Drop the UNIQUE constraint on (season_type, year) if it exists
-- The constraint name follows Postgres auto-naming: transport_seasons_season_type_year_key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'transport_seasons_season_type_year_key'
    AND conrelid = 'transport_seasons'::regclass
  ) THEN
    ALTER TABLE transport_seasons
      DROP CONSTRAINT transport_seasons_season_type_year_key;
    RAISE NOTICE 'Dropped constraint transport_seasons_season_type_year_key';
  ELSE
    RAISE NOTICE 'Constraint transport_seasons_season_type_year_key does not exist, skipping';
  END IF;
END $$;

-- Update table comment to document the new design
COMMENT ON TABLE transport_seasons IS
  'Transport seasons. Multiple seasons of same type per year are allowed (e.g., OFF-A Jan-May, OFF-B Sep-Dec). Keyed by deterministic UUID from seed id.';
