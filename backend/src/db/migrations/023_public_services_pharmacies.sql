-- Migration: 023_public_services_pharmacies
-- Add Ljekarne (Pharmacies) category with two locations
--
-- Ljekarna Vis: Vukovarska ul. 2, 21480 Vis, tel: 021 711 434
-- Ljekarna Komiža: Ul. San Pedra, 21485 Komiža, tel: 021 713 445

-- Insert pharmacies after existing services (order_index 7, 8)
INSERT INTO public_services (type, title_hr, title_en, subtitle_hr, subtitle_en, icon, icon_bg_color, order_index, address, contacts, working_hours, note_hr, note_en) VALUES
(
  'permanent',
  'Ljekarna Vis',
  'Pharmacy Vis',
  'Ljekarna u gradu Visu',
  'Pharmacy in town of Vis',
  'pill',
  'primary',
  7,
  'Vukovarska ul. 2, 21480 Vis',
  '[{"type": "phone", "value": "+385 21 711 434"}]'::jsonb,
  '[{"time": "07:30-20:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"}, {"time": "08:00-13:00", "description_hr": "Sub", "description_en": "Sat"}]'::jsonb,
  NULL,
  NULL
),
(
  'permanent',
  'Ljekarna Komiža',
  'Pharmacy Komiža',
  'Ljekarna u Komiži',
  'Pharmacy in Komiža',
  'pill',
  'primary',
  8,
  'Ul. San Pedra, 21485 Komiža',
  '[{"type": "phone", "value": "+385 21 713 445"}]'::jsonb,
  '[{"time": "07:30-14:30", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"}, {"time": "08:00-12:00", "description_hr": "Sub", "description_en": "Sat"}]'::jsonb,
  NULL,
  NULL
);

-- Comment
COMMENT ON COLUMN public_services.id IS 'Pharmacies added for Vis and Komiža - migration 023';
