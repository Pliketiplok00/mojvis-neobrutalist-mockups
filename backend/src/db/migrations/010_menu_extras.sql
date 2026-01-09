-- Migration 010: Menu Extras (Server-Driven Menu Items)
-- Phase: Server-Driven Menu Extras
--
-- Rules:
-- - Menu extras are additional menu items fetched from backend
-- - Core menu items remain hardcoded in mobile
-- - Extras link ONLY to static pages (StaticPage:<slug>)
-- - Ordered by `order` ASC, then `created_at` ASC

-- Create menu_extras table
CREATE TABLE IF NOT EXISTS menu_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Labels (bilingual, both required)
  label_hr VARCHAR(60) NOT NULL,
  label_en VARCHAR(60) NOT NULL,

  -- Navigation target (must be StaticPage:<slug>)
  target VARCHAR(255) NOT NULL,

  -- Display order (lower = first)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Enabled flag
  enabled BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT label_hr_length CHECK (char_length(label_hr) >= 2 AND char_length(label_hr) <= 60),
  CONSTRAINT label_en_length CHECK (char_length(label_en) >= 2 AND char_length(label_en) <= 60),
  CONSTRAINT target_format CHECK (target ~ '^StaticPage:[a-z0-9-]+$')
);

-- Index for public query (enabled, ordered)
CREATE INDEX IF NOT EXISTS idx_menu_extras_enabled_order
  ON menu_extras(display_order, created_at)
  WHERE enabled = true;

-- Comments for documentation
COMMENT ON TABLE menu_extras IS 'Additional menu items fetched from backend (appended after core items)';
COMMENT ON COLUMN menu_extras.label_hr IS 'Croatian label for the menu item (2-60 chars)';
COMMENT ON COLUMN menu_extras.label_en IS 'English label for the menu item (2-60 chars)';
COMMENT ON COLUMN menu_extras.target IS 'Navigation target, must be StaticPage:<slug>';
COMMENT ON COLUMN menu_extras.display_order IS 'Display order (ASC), duplicates allowed';
COMMENT ON COLUMN menu_extras.enabled IS 'Whether this item appears in public menu';
