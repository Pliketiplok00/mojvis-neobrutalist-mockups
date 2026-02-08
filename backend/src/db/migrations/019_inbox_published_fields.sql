-- Inbox Published Fields Migration
-- Package 2: Draft/Publish workflow for inbox messages
--
-- Rules (per spec):
-- - New messages are DRAFTS by default (published_at = NULL)
-- - Published messages are visible to public endpoints
-- - Existing messages are backfilled as published (published_at = created_at)
-- - Push is triggered ONLY on publish action, not on save
--
-- Columns added:
-- - published_at: timestamp when message was published (NULL = draft)
-- - published_by: admin who published the message

-- Add published_at column
ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ NULL;

-- Add published_by column
ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS published_by VARCHAR(255) NULL;

-- Backfill existing non-deleted messages as published
-- Set published_at = created_at and published_by = created_by
-- This ensures existing visible messages remain visible after migration
UPDATE inbox_messages
SET
  published_at = created_at,
  published_by = created_by
WHERE
  published_at IS NULL
  AND deleted_at IS NULL;

-- Index for efficient public endpoint filtering
-- Public queries filter by: published_at IS NOT NULL AND deleted_at IS NULL
CREATE INDEX IF NOT EXISTS idx_inbox_messages_published
  ON inbox_messages(published_at)
  WHERE published_at IS NOT NULL AND deleted_at IS NULL;

-- Comments for documentation
COMMENT ON COLUMN inbox_messages.published_at IS 'Timestamp when message was published. NULL = draft (not visible to public). Set on explicit publish action.';
COMMENT ON COLUMN inbox_messages.published_by IS 'Admin ID who published the message.';
