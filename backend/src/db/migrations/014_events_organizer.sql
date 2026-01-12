-- Migration: Add required organizer fields (HR/EN) to events
-- Organizer is required for all events (who is hosting/organizing the event)

-- Step 1: Add columns as nullable first
ALTER TABLE events ADD COLUMN organizer_hr TEXT;
ALTER TABLE events ADD COLUMN organizer_en TEXT;

-- Step 2: Backfill existing rows with default municipality value
UPDATE events SET organizer_hr = 'Grad Vis' WHERE organizer_hr IS NULL;
UPDATE events SET organizer_en = 'Municipality of Vis' WHERE organizer_en IS NULL;

-- Step 3: Make columns NOT NULL now that all rows have values
ALTER TABLE events ALTER COLUMN organizer_hr SET NOT NULL;
ALTER TABLE events ALTER COLUMN organizer_en SET NOT NULL;
