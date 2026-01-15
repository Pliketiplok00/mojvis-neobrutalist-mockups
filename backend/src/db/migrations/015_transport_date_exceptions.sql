-- Migration 015: Transport Date Exceptions
-- Add date-based exception fields to transport_departures
--
-- These fields allow fine-grained control over when departures are valid:
-- - date_from/date_to: departure only valid within this date range
-- - include_dates: departure only valid on these specific dates
-- - exclude_dates: departure NOT valid on these dates (overrides all)
--
-- All fields are optional. Existing behavior unchanged when NULL.

-- Add date range constraint columns
ALTER TABLE transport_departures
  ADD COLUMN IF NOT EXISTS date_from DATE,
  ADD COLUMN IF NOT EXISTS date_to DATE;

-- Add specific date lists (stored as JSONB arrays of YYYY-MM-DD strings)
ALTER TABLE transport_departures
  ADD COLUMN IF NOT EXISTS include_dates JSONB,
  ADD COLUMN IF NOT EXISTS exclude_dates JSONB;

-- Add constraint for valid date range (if both are provided)
ALTER TABLE transport_departures
  ADD CONSTRAINT valid_departure_date_range
  CHECK (date_from IS NULL OR date_to IS NULL OR date_from <= date_to);

-- Add index for date range queries (partial index for non-null values)
CREATE INDEX IF NOT EXISTS idx_transport_departures_date_range
  ON transport_departures(date_from, date_to)
  WHERE date_from IS NOT NULL OR date_to IS NOT NULL;

-- Comments
COMMENT ON COLUMN transport_departures.date_from IS 'Departure valid from this date (YYYY-MM-DD). NULL = no start constraint.';
COMMENT ON COLUMN transport_departures.date_to IS 'Departure valid until this date (YYYY-MM-DD). NULL = no end constraint.';
COMMENT ON COLUMN transport_departures.include_dates IS 'JSONB array of YYYY-MM-DD strings. If non-empty, departure valid ONLY on these dates.';
COMMENT ON COLUMN transport_departures.exclude_dates IS 'JSONB array of YYYY-MM-DD strings. Departure NOT valid on these dates (overrides all).';
