-- Migration 021: Add line_number to transport_lines
-- Adds public line number (e.g., "602", "659") for display purposes.
-- This is the official registry number, separate from the internal UUID.

-- Add nullable line_number column
ALTER TABLE transport_lines
ADD COLUMN IF NOT EXISTS line_number VARCHAR(20);

-- Backfill known sea line numbers
UPDATE transport_lines SET line_number = '602'
WHERE id = 'ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8' AND line_number IS NULL;

UPDATE transport_lines SET line_number = '612'
WHERE id = 'ea884ee0-9c2e-5c0b-a1c9-3ec1197ffa0b' AND line_number IS NULL;

UPDATE transport_lines SET line_number = '659'
WHERE id = '1fe9e29f-3e9e-55d8-aa87-1f34287c8abe' AND line_number IS NULL;

UPDATE transport_lines SET line_number = '9602'
WHERE id = 'e8fb699d-6ddc-5562-be14-57b6a29494f1' AND line_number IS NULL;

-- Add index for lookup by line_number
CREATE INDEX IF NOT EXISTS idx_transport_lines_line_number
  ON transport_lines(line_number) WHERE line_number IS NOT NULL;

COMMENT ON COLUMN transport_lines.line_number IS 'Public line number (e.g., "602", "659"). Official registry identifier.';
