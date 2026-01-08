-- Migration 005: Static Pages (CMS)
-- Phase 3: Static Content Pages
--
-- Rules:
-- - Draft/publish workflow (admin edits draft, supervisor publishes)
-- - HR and EN both REQUIRED for static pages
-- - Exactly 8 block types
-- - Header mandatory (exactly 1)
-- - Max 1 map block per page
-- - Per-block locking (structure + content)

-- Create static_pages table
CREATE TABLE IF NOT EXISTS static_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,

  -- Draft content (what admin edits)
  -- Stored as JSONB for flexibility
  draft_header JSONB NOT NULL,
  draft_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  draft_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  draft_updated_by VARCHAR(255),

  -- Published content (what mobile sees)
  -- NULL if never published
  published_header JSONB,
  published_blocks JSONB,
  published_at TIMESTAMPTZ,
  published_by VARCHAR(255),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by VARCHAR(255),

  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]*[a-z0-9])?$')
);

-- Index for slug lookups (public API)
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON static_pages(slug);

-- Index for published pages (public API list)
CREATE INDEX IF NOT EXISTS idx_static_pages_published ON static_pages(published_at) WHERE published_at IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE static_pages IS 'Static content pages with draft/publish workflow';
COMMENT ON COLUMN static_pages.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN static_pages.draft_header IS 'Draft header content (JSON: type, title_hr, title_en, subtitle_hr, subtitle_en, icon?, images?)';
COMMENT ON COLUMN static_pages.draft_blocks IS 'Draft content blocks array (JSON: id, type, content, order, structure_locked, content_locked)';
COMMENT ON COLUMN static_pages.published_header IS 'Published header (NULL if never published)';
COMMENT ON COLUMN static_pages.published_blocks IS 'Published blocks (NULL if never published)';
COMMENT ON COLUMN static_pages.published_at IS 'Last publish timestamp';
COMMENT ON COLUMN static_pages.published_by IS 'Supervisor who published';
