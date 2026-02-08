-- Migration 017: Add 'promet' to inbox_tag enum
-- This is idempotent - safe to run multiple times or in environments where 'promet' already exists

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'inbox_tag'::regtype
    AND enumlabel = 'promet'
  ) THEN
    ALTER TYPE inbox_tag ADD VALUE 'promet';
  END IF;
END $$;
