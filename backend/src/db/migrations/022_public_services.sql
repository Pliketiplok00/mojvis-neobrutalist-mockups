-- Migration: 022_public_services
-- Public Services feature
--
-- Two types of services:
-- - permanent: Dom zdravlja, Banka, Pošta (fixed working hours)
-- - periodic: Veterinar, Bilježnik, Tehnički, Zubar (scheduled dates)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Public Services table
CREATE TABLE IF NOT EXISTS public_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Service type
  type VARCHAR(20) NOT NULL CHECK (type IN ('permanent', 'periodic')),

  -- Basic info (HR/EN)
  title_hr VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  subtitle_hr VARCHAR(255),
  subtitle_en VARCHAR(255),
  address VARCHAR(500),

  -- Contacts: [{ "type": "phone"|"email", "value": "..." }]
  contacts JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Icon and color
  icon VARCHAR(50) NOT NULL,
  icon_bg_color VARCHAR(50) NOT NULL,

  -- Working hours (permanent): [{ "time": "08:00-16:00", "description_hr": "...", "description_en": "..." }]
  working_hours JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Scheduled dates (periodic): [{ "date": "2026-02-15", "time_from": "10:00", "time_to": "14:00", "created_at": "..." }]
  scheduled_dates JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Note
  note_hr TEXT,
  note_en TEXT,

  -- Meta
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_public_services_order ON public_services(order_index);
CREATE INDEX IF NOT EXISTS idx_public_services_active ON public_services(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_public_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_public_services_updated_at ON public_services;
CREATE TRIGGER trigger_public_services_updated_at
  BEFORE UPDATE ON public_services
  FOR EACH ROW
  EXECUTE FUNCTION update_public_services_updated_at();

-- Seed: 7 predefined service categories
INSERT INTO public_services (type, title_hr, title_en, subtitle_hr, subtitle_en, icon, icon_bg_color, order_index, address, contacts, working_hours, note_hr, note_en) VALUES
(
  'permanent',
  'Dom zdravlja',
  'Health Center',
  'Primarna zdravstvena zaštita',
  'Primary healthcare',
  'hospital',
  'urgent',
  0,
  'Šetalište stare Isse 3, Vis',
  '[{"type": "phone", "value": "+385 21 711 033"}]'::jsonb,
  '[{"time": "07:00-20:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"}, {"time": "08:00-12:00", "description_hr": "Sub", "description_en": "Sat"}]'::jsonb,
  'Hitna pomoć dostupna 24/7 na broj 194',
  'Emergency available 24/7 at 194'
),
(
  'periodic',
  'Veterinarska ambulanta',
  'Veterinary Clinic',
  'Zdravstvena zaštita životinja',
  'Animal healthcare',
  'cat',
  'secondary',
  1,
  'Put Mula 12, Vis',
  '[{"type": "phone", "value": "+385 21 711 155"}]'::jsonb,
  '[]'::jsonb,
  NULL,
  NULL
),
(
  'periodic',
  'Javni bilježnik',
  'Notary Public',
  'Pravne usluge i ovjera dokumenata',
  'Legal services and document certification',
  'file-text',
  'lavender',
  2,
  'Trg 30. svibnja 5, Vis',
  '[{"type": "phone", "value": "+385 21 711 200"}]'::jsonb,
  '[]'::jsonb,
  'Preporuča se najava dolaska telefonom',
  'Phone appointment recommended'
),
(
  'periodic',
  'Tehnički pregled',
  'Vehicle Inspection',
  'Registracija vozila',
  'Vehicle registration',
  'car',
  'orange',
  3,
  'Poslovna zona Vis, bb',
  '[{"type": "phone", "value": "+385 21 711 300"}]'::jsonb,
  '[]'::jsonb,
  NULL,
  NULL
),
(
  'permanent',
  'Banka',
  'Bank',
  'Bankomati i poslovnice',
  'ATMs and branches',
  'landmark',
  'accent',
  4,
  'Obala sv. Jurja 18, Vis',
  '[]'::jsonb,
  '[{"time": "08:00-15:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"}]'::jsonb,
  'Bankomati dostupni 24/7',
  'ATMs available 24/7'
),
(
  'permanent',
  'Pošta',
  'Post Office',
  'Poštanske usluge',
  'Postal services',
  'mail',
  'primary',
  5,
  'Trg 30. svibnja 1, Vis',
  '[]'::jsonb,
  '[{"time": "08:00-14:00", "description_hr": "Pon - Pet", "description_en": "Mon - Fri"}, {"time": "08:00-12:00", "description_hr": "Sub", "description_en": "Sat"}]'::jsonb,
  NULL,
  NULL
),
(
  'periodic',
  'Zubar',
  'Dentist',
  'Stomatološke usluge',
  'Dental services',
  'tooth',
  'infoBackground',
  6,
  NULL,
  '[]'::jsonb,
  '[]'::jsonb,
  'Naručivanje putem Doma zdravlja',
  'Booking through Health Center'
);

-- Comment
COMMENT ON TABLE public_services IS 'Public services for MOJ VIS app (permanent and periodic)';
