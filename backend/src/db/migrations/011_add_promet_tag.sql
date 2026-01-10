-- Add 'promet' to inbox_tag enum
--
-- Background:
-- TypeScript types define 'promet' as the canonical unified transport tag,
-- with 'cestovni_promet' and 'pomorski_promet' marked as DEPRECATED.
-- However, the DB enum was never updated to include 'promet', causing
-- INSERT failures when Admin saves messages with tags ["promet", "hitno"].
--
-- This migration adds 'promet' to the enum while keeping deprecated values intact.
-- See: docs/INBOX_SAVE_PROMET_HITNO_DEBUG.md

-- PostgreSQL 10+ supports IF NOT EXISTS for ALTER TYPE ADD VALUE
-- This is safe to run multiple times and does not require transaction guards
ALTER TYPE inbox_tag ADD VALUE IF NOT EXISTS 'promet';

-- Update documentation comment to reflect new tag
COMMENT ON COLUMN inbox_messages.tags IS 'Max 2 tags from fixed taxonomy: promet (unified transport), kultura, opcenito, hitno, komiza, vis. Deprecated: cestovni_promet, pomorski_promet';
