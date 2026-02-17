-- Migration: 024_public_services_locations
-- Add locations JSONB column for services with multiple locations
-- Consolidate Ljekarna Vis + Ljekarna Komiža into single "Ljekarne" service
--
-- Locations structure:
-- [{
--   "name_hr": "...", "name_en": "...",
--   "address": "...",
--   "phone": "...",
--   "hours": [{ "time": "...", "description_hr": "...", "description_en": "..." }]
-- }]

-- 1. Add locations column
ALTER TABLE public_services
ADD COLUMN IF NOT EXISTS locations JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 2. Delete the two separate pharmacy entries (from migration 023)
DELETE FROM public_services WHERE title_hr = 'Ljekarna Vis';
DELETE FROM public_services WHERE title_hr = 'Ljekarna Komiža';

-- 3. Insert consolidated "Ljekarne" service with locations array
INSERT INTO public_services (
  type, title_hr, title_en, subtitle_hr, subtitle_en,
  icon, icon_bg_color, order_index,
  address, contacts, working_hours, locations,
  note_hr, note_en
) VALUES (
  'permanent',
  'Ljekarne',
  'Pharmacies',
  'Ljekarne na otoku Visu',
  'Pharmacies on Vis island',
  'pill',
  'primary',
  7,
  NULL,  -- No single address (multiple locations)
  '[]'::jsonb,  -- No single contact (per-location contacts)
  '[]'::jsonb,  -- No single working hours (per-location hours)
  '[
    {
      "name_hr": "Ljekarna Vis",
      "name_en": "Pharmacy Vis",
      "address": "Vukovarska ul. 2, 21480 Vis",
      "phone": "+385 21 711 434",
      "hours": [
        {"time": "08:00-13:00, 17:00-19:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"},
        {"time": "08:00-13:00", "description_hr": "Sub", "description_en": "Sat"},
        {"time": "Zatvoreno", "description_hr": "Ned", "description_en": "Sun"}
      ]
    },
    {
      "name_hr": "Ljekarna Komiža",
      "name_en": "Pharmacy Komiža",
      "address": "Ul. San Pedra, 21485 Komiža",
      "phone": "+385 21 713 445",
      "hours": [
        {"time": "09:00-16:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"},
        {"time": "Zatvoreno", "description_hr": "Sub - Ned", "description_en": "Sat - Sun"}
      ]
    }
  ]'::jsonb,
  NULL,
  NULL
);

-- Comment
COMMENT ON COLUMN public_services.locations IS 'Array of location objects for services with multiple locations (e.g., pharmacies)';
