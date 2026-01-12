-- Migration: Add optional image_url field to events
-- Allows events to have a hero/header image displayed in detail view

ALTER TABLE events ADD COLUMN image_url TEXT;

-- No index needed as we don't query by image_url
-- Field is nullable by default (NULL when no image)
