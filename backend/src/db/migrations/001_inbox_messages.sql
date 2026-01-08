-- Inbox Messages Schema
-- Phase 1: Core inbox structure for MOJ VIS
--
-- Rules (per spec):
-- - Inbox is the single source of truth for all user-facing communication
-- - Max 2 tags per message (enforced via CHECK constraint)
-- - Tags from fixed taxonomy only
-- - Timestamps stored in UTC
-- - HR content required, EN content optional for municipal messages

-- Create enum type for tags
CREATE TYPE inbox_tag AS ENUM (
  'cestovni_promet',
  'pomorski_promet',
  'kultura',
  'opcenito',
  'hitno',
  'komiza',
  'vis'
);

-- Inbox messages table
CREATE TABLE IF NOT EXISTS inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content (HR required, EN optional for municipal)
  title_hr VARCHAR(255) NOT NULL,
  title_en VARCHAR(255),
  body_hr TEXT NOT NULL,
  body_en TEXT,

  -- Tags (max 2, from fixed taxonomy)
  tags inbox_tag[] NOT NULL DEFAULT '{}',

  -- Active window for banner eligibility
  active_from TIMESTAMPTZ,
  active_to TIMESTAMPTZ,

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255), -- admin user ID

  -- Constraints
  CONSTRAINT tags_max_two CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 2),
  CONSTRAINT active_window_valid CHECK (active_from IS NULL OR active_to IS NULL OR active_from < active_to)
);

-- Indexes for common queries
CREATE INDEX idx_inbox_messages_created_at ON inbox_messages(created_at DESC);
CREATE INDEX idx_inbox_messages_tags ON inbox_messages USING GIN(tags);
CREATE INDEX idx_inbox_messages_active_window ON inbox_messages(active_from, active_to)
  WHERE active_from IS NOT NULL OR active_to IS NOT NULL;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inbox_messages_updated_at
  BEFORE UPDATE ON inbox_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE inbox_messages IS 'Single source of truth for all user-facing communication in MOJ VIS';
COMMENT ON COLUMN inbox_messages.tags IS 'Max 2 tags from fixed taxonomy: cestovni_promet, pomorski_promet, kultura, opcenito, hitno, komiza, vis';
COMMENT ON COLUMN inbox_messages.active_from IS 'Start of active window for banner eligibility (UTC)';
COMMENT ON COLUMN inbox_messages.active_to IS 'End of active window for banner eligibility (UTC)';
