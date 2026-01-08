-- Migration 006: Transport (Road & Sea Timetables)
-- Phase 4: Unified transport data model
--
-- Key design decisions:
-- - Road and Sea use the SAME data structure (unified model)
-- - Lines are bidirectional with ordered stop sequences per direction
-- - Departures define explicit arrival times per stop (null = skipped)
-- - Seasons define non-overlapping date ranges
-- - Day types are EXPLICIT: MON, TUE, WED, THU, FRI, SAT, SUN, PRAZNIK
-- - Contacts are BY LINE, not globally by transport type
-- - Holidays are NOT stored in DB (hardcoded in application)
--
-- READ-ONLY: No admin editing of transport data.
-- Data is imported via seed scripts only.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Transport Type Enum
-- ============================================================
CREATE TYPE transport_type AS ENUM ('road', 'sea');

-- ============================================================
-- Season Type Enum
-- ============================================================
CREATE TYPE season_type AS ENUM ('OFF', 'PRE', 'HIGH', 'POST');

-- ============================================================
-- Day Type Enum (EXPLICIT weekdays, no generic WEEKDAY)
-- ============================================================
CREATE TYPE day_type AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'PRAZNIK');

-- ============================================================
-- Transport Stops
-- ============================================================
-- Stops are shared across lines (a stop can appear on multiple lines)
-- For sea transport, these are ports; for road, bus stops

CREATE TABLE IF NOT EXISTS transport_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Bilingual stop name
  name_hr TEXT NOT NULL,
  name_en TEXT NOT NULL,

  -- Transport type (a stop belongs to road OR sea, not both)
  transport_type transport_type NOT NULL,

  -- Optional coordinates for map display
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_stops_type
  ON transport_stops(transport_type);

-- ============================================================
-- Transport Lines
-- ============================================================
-- A line is a named route (e.g., "Split - Hvar - Vis (katamaran)")
-- Lines are bidirectional and belong to either road or sea transport

CREATE TABLE IF NOT EXISTS transport_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transport type (road or sea)
  transport_type transport_type NOT NULL,

  -- Bilingual line name
  name_hr TEXT NOT NULL,
  name_en TEXT NOT NULL,

  -- Optional subtype (e.g., "katamaran", "trajekt", "autobus")
  subtype_hr TEXT,
  subtype_en TEXT,

  -- Display order (for sorting in lists)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Active flag (soft disable without deletion)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_lines_type
  ON transport_lines(transport_type, display_order);

-- ============================================================
-- Transport Line Contacts (BY LINE, not global)
-- ============================================================
-- Each line has its own operator contact data

CREATE TABLE IF NOT EXISTS transport_line_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent line (required - contacts are BY LINE)
  line_id UUID NOT NULL REFERENCES transport_lines(id) ON DELETE CASCADE,

  -- Operator name (bilingual)
  operator_hr TEXT NOT NULL,
  operator_en TEXT NOT NULL,

  -- Contact details
  phone TEXT,
  email TEXT,
  website TEXT,

  -- Display order (for lines with multiple contacts)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one primary contact per line
  UNIQUE(line_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_transport_line_contacts_line
  ON transport_line_contacts(line_id);

-- ============================================================
-- Transport Routes (Directional Stop Sequences)
-- ============================================================
-- A route defines the ordered list of POSSIBLE stops for a line + direction
-- Each line has exactly 2 routes (direction 0 and 1)
-- Direction is resolved via route_id, not free-form strings

CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent line
  line_id UUID NOT NULL REFERENCES transport_lines(id) ON DELETE CASCADE,

  -- Direction identifier (0 or 1)
  direction INTEGER NOT NULL CHECK (direction IN (0, 1)),

  -- Bilingual direction label (e.g., "Split -> Vis", "Vis -> Split")
  direction_label_hr TEXT NOT NULL,
  direction_label_en TEXT NOT NULL,

  -- Origin and destination stop IDs (for quick reference)
  origin_stop_id UUID NOT NULL REFERENCES transport_stops(id),
  destination_stop_id UUID NOT NULL REFERENCES transport_stops(id),

  -- Typical duration in minutes (for display)
  typical_duration_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one route per line + direction
  UNIQUE(line_id, direction)
);

CREATE INDEX IF NOT EXISTS idx_transport_routes_line
  ON transport_routes(line_id);

-- ============================================================
-- Route Stops (Ordered Stop Sequence for a Route)
-- ============================================================
-- Defines the ordered list of possible stops for each route

CREATE TABLE IF NOT EXISTS transport_route_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent route
  route_id UUID NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,

  -- Stop reference
  stop_id UUID NOT NULL REFERENCES transport_stops(id),

  -- Order in sequence (0-indexed)
  stop_order INTEGER NOT NULL,

  -- Unique constraint: each stop appears once per route at a specific order
  UNIQUE(route_id, stop_order),
  UNIQUE(route_id, stop_id)
);

CREATE INDEX IF NOT EXISTS idx_transport_route_stops_route
  ON transport_route_stops(route_id, stop_order);

-- ============================================================
-- Seasons (Non-Overlapping Date Ranges)
-- ============================================================
-- Seasons define validity periods for departures
-- IMPORTANT: Date ranges MUST NOT overlap (enforced in application)

CREATE TABLE IF NOT EXISTS transport_seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Season type
  season_type season_type NOT NULL,

  -- Year (seasons are year-specific)
  year INTEGER NOT NULL,

  -- Date range (inclusive)
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,

  -- Bilingual label
  label_hr TEXT NOT NULL,
  label_en TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (date_from <= date_to),

  -- Unique: one season type per year
  UNIQUE(season_type, year)
);

CREATE INDEX IF NOT EXISTS idx_transport_seasons_dates
  ON transport_seasons(date_from, date_to);

CREATE INDEX IF NOT EXISTS idx_transport_seasons_year
  ON transport_seasons(year);

-- ============================================================
-- Departures
-- ============================================================
-- A departure is a specific service on a route
-- Includes season, day type, and stop times
-- stop_times is a JSONB array aligned to route stop order
-- null values mean the stop is SKIPPED (not rendered)

CREATE TABLE IF NOT EXISTS transport_departures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent route (direction is resolved via route_id)
  route_id UUID NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,

  -- Season this departure is valid for
  season_id UUID NOT NULL REFERENCES transport_seasons(id),

  -- Day type (MON, TUE, WED, THU, FRI, SAT, SUN, PRAZNIK)
  day_type day_type NOT NULL,

  -- Departure time from origin (HH:MM format, stored as TIME)
  departure_time TIME NOT NULL,

  -- Stop times as JSONB array aligned to route stop order
  -- Example: ["06:30", null, "06:45", "07:00"]
  -- null means the stop is SKIPPED for this departure (NOT rendered)
  stop_times JSONB NOT NULL,

  -- Optional notes (bilingual)
  notes_hr TEXT,
  notes_en TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_departures_route
  ON transport_departures(route_id, season_id, day_type);

CREATE INDEX IF NOT EXISTS idx_transport_departures_time
  ON transport_departures(departure_time);

CREATE INDEX IF NOT EXISTS idx_transport_departures_season
  ON transport_departures(season_id);

-- ============================================================
-- Updated_at Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_transport_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_transport_stops_updated_at
  BEFORE UPDATE ON transport_stops
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

CREATE TRIGGER trigger_transport_lines_updated_at
  BEFORE UPDATE ON transport_lines
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

CREATE TRIGGER trigger_transport_line_contacts_updated_at
  BEFORE UPDATE ON transport_line_contacts
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

CREATE TRIGGER trigger_transport_routes_updated_at
  BEFORE UPDATE ON transport_routes
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

CREATE TRIGGER trigger_transport_departures_updated_at
  BEFORE UPDATE ON transport_departures
  FOR EACH ROW EXECUTE FUNCTION update_transport_updated_at();

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE transport_stops IS 'Transport stops (bus stops / ports). Phase 4.';
COMMENT ON TABLE transport_lines IS 'Transport lines (bus routes / ferry routes). Phase 4.';
COMMENT ON TABLE transport_line_contacts IS 'Operator contacts BY LINE. Phase 4.';
COMMENT ON TABLE transport_routes IS 'Directional routes with stop sequences. Phase 4.';
COMMENT ON TABLE transport_route_stops IS 'Ordered stops for each route. Phase 4.';
COMMENT ON TABLE transport_seasons IS 'Season date ranges (non-overlapping). Phase 4.';
COMMENT ON TABLE transport_departures IS 'Individual departures with stop times (null = skipped). Phase 4.';

COMMENT ON COLUMN transport_departures.stop_times IS 'JSONB array aligned to route stops. null = stop SKIPPED (not rendered).';
COMMENT ON COLUMN transport_departures.day_type IS 'Explicit day type: MON, TUE, WED, THU, FRI, SAT, SUN, PRAZNIK. No generic WEEKDAY.';
