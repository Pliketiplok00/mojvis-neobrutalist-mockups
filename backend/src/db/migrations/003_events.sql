-- Migration: 003_events
-- Phase 2: Events module
--
-- Event fields per spec (NO extras):
-- - id
-- - title_hr / title_en (REQUIRED)
-- - description_hr / description_en
-- - start_datetime
-- - end_datetime (optional)
-- - location_hr / location_en (optional)
-- - is_all_day (boolean)
-- - created_at / updated_at
--
-- NOT included per spec:
-- - capacity
-- - registration
-- - ticketing
-- - categories
-- - recurrence rules
-- - images

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Required bilingual title
  title_hr TEXT NOT NULL,
  title_en TEXT NOT NULL,

  -- Optional bilingual description
  description_hr TEXT,
  description_en TEXT,

  -- Date/time
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,

  -- Optional bilingual location
  location_hr TEXT,
  location_en TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying events by date (for calendar view)
CREATE INDEX IF NOT EXISTS idx_events_start_datetime
  ON events(start_datetime);

-- Index for querying events happening on a specific date
CREATE INDEX IF NOT EXISTS idx_events_start_date
  ON events(DATE(start_datetime AT TIME ZONE 'Europe/Zagreb'));

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_events_updated_at ON events;
CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Comment
COMMENT ON TABLE events IS 'Events for the MOJ VIS calendar (Phase 2)';
