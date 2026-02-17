-- Migration: 025_fix_pharmacy_closed_text
-- Fix "Zatvoreno" to "Closed" for English display
-- Update locations to use localized time values

-- Extend hours structure to support localized time text
-- Update the Ljekarne entry with properly localized time values
UPDATE public_services
SET locations = '[
  {
    "name_hr": "Ljekarna Vis",
    "name_en": "Pharmacy Vis",
    "address": "Vukovarska ul. 2, 21480 Vis",
    "phone": "+385 21 711 434",
    "hours": [
      {"time": "08:00-13:00, 17:00-19:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"},
      {"time": "08:00-13:00", "description_hr": "Sub", "description_en": "Sat"},
      {"time": "-", "description_hr": "Ned (zatvoreno)", "description_en": "Sun (closed)"}
    ]
  },
  {
    "name_hr": "Ljekarna Komiža",
    "name_en": "Pharmacy Komiža",
    "address": "Ul. San Pedra, 21485 Komiža",
    "phone": "+385 21 713 445",
    "hours": [
      {"time": "09:00-16:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"},
      {"time": "-", "description_hr": "Sub - Ned (zatvoreno)", "description_en": "Sat - Sun (closed)"}
    ]
  }
]'::jsonb
WHERE title_hr = 'Ljekarne';
