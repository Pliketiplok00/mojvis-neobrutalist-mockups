-- Migration 016: Transport Departure Markers
-- Adds support for per-departure markers (e.g., "*") with route-level explanation notes
--
-- Design:
-- - marker TEXT on departures: optional marker symbol (e.g., "*", "†")
-- - marker_note_hr/en TEXT on routes: explanation displayed below departure list
--
-- Example usage:
-- - Departure with marker="*" displays as "06:30 *"
-- - Route with marker_note_hr="* samo radnim danom" shows note below departures

-- Add marker column to departures
ALTER TABLE transport_departures
  ADD COLUMN IF NOT EXISTS marker TEXT;

-- Add marker note columns to routes
ALTER TABLE transport_routes
  ADD COLUMN IF NOT EXISTS marker_note_hr TEXT,
  ADD COLUMN IF NOT EXISTS marker_note_en TEXT;

-- Comments
COMMENT ON COLUMN transport_departures.marker IS 'Optional marker symbol displayed after time (e.g., "*", "†")';
COMMENT ON COLUMN transport_routes.marker_note_hr IS 'Croatian explanation of markers (displayed below departure list)';
COMMENT ON COLUMN transport_routes.marker_note_en IS 'English explanation of markers (displayed below departure list)';
