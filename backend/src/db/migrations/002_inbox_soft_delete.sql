-- Inbox Soft Delete Migration
-- Phase 1 Compliance: Soft delete policy for inbox messages
--
-- Rules:
-- - Hard delete is NOT allowed for inbox messages
-- - deleted_at timestamp indicates soft-deleted state
-- - Public endpoints MUST exclude messages where deleted_at IS NOT NULL
-- - Deleted messages behave as non-existent for users (404)

-- Add deleted_at column for soft delete
ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Index for efficient filtering of non-deleted messages
CREATE INDEX IF NOT EXISTS idx_inbox_messages_deleted_at
  ON inbox_messages(deleted_at)
  WHERE deleted_at IS NULL;

-- Comment for documentation
COMMENT ON COLUMN inbox_messages.deleted_at IS 'Soft delete timestamp. NULL = active, NOT NULL = soft-deleted. Hard delete is not allowed.';
