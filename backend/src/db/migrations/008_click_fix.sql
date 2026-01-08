-- Click & Fix Schema
-- Phase 6: Anonymous issue reporting with location + photos
--
-- Key concepts:
-- - Anonymous issue reporting (device-based, no user accounts)
-- - Required location (lat/lng only, no address strings)
-- - Optional photos (0-3 images)
-- - Inbox integration: submissions appear in Sent, admin replies as Inbox messages
-- - Rate limit: 3 submissions per device per day (Europe/Zagreb timezone)
-- - Admin municipality scoping (same as Feedback)
-- - Status tracking: zaprimljeno -> u_razmatranju -> prihvaceno/odbijeno
-- - Reply thread (multiple admin replies allowed)

-- Reuse feedback_status enum if exists, otherwise create
-- Note: We reuse the same status values as feedback
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
    CREATE TYPE feedback_status AS ENUM (
      'zaprimljeno',
      'u_razmatranju',
      'prihvaceno',
      'odbijeno'
    );
  END IF;
END$$;

-- Reuse feedback_language enum if exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_language') THEN
    CREATE TYPE feedback_language AS ENUM ('hr', 'en');
  END IF;
END$$;

-- Main click_fix table
CREATE TABLE IF NOT EXISTS click_fix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Device identification (anonymous)
  device_id VARCHAR(255) NOT NULL,

  -- User context (from onboarding)
  user_mode user_mode NOT NULL,
  municipality municipality, -- NULL for visitors

  -- Submission language (HR or EN based on app language at submission time)
  language feedback_language NOT NULL,

  -- Content
  subject VARCHAR(120) NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 4000),

  -- Location (REQUIRED - lat/lng only)
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,

  -- Status (default: zaprimljeno)
  status feedback_status NOT NULL DEFAULT 'zaprimljeno',

  -- Link to Sent Inbox message (created on submission)
  sent_inbox_message_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Click & Fix photos (0-3 per submission)
CREATE TABLE IF NOT EXISTS click_fix_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent click_fix
  click_fix_id UUID NOT NULL REFERENCES click_fix(id) ON DELETE CASCADE,

  -- File metadata
  file_path VARCHAR(500) NOT NULL,   -- Path relative to uploads folder
  file_name VARCHAR(255) NOT NULL,   -- Original or sanitized filename
  mime_type VARCHAR(100) NOT NULL,   -- e.g., 'image/jpeg'
  file_size INTEGER NOT NULL,        -- Size in bytes

  -- Order (0, 1, 2)
  display_order INTEGER NOT NULL DEFAULT 0,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Click & Fix replies (admin -> user thread)
CREATE TABLE IF NOT EXISTS click_fix_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent click_fix
  click_fix_id UUID NOT NULL REFERENCES click_fix(id) ON DELETE CASCADE,

  -- Admin actor (for audit)
  admin_actor VARCHAR(255),

  -- Reply body (in the SAME language as original submission)
  body TEXT NOT NULL,

  -- Link to Inbox message delivered to user's device
  inbox_message_id UUID,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rate limiting table for Click & Fix
-- Separate from feedback to allow 3 feedback + 3 click_fix per day
CREATE TABLE IF NOT EXISTS click_fix_rate_limits (
  device_id VARCHAR(255) NOT NULL,
  submission_date DATE NOT NULL, -- Date in Europe/Zagreb timezone
  submission_count INTEGER NOT NULL DEFAULT 1,

  PRIMARY KEY (device_id, submission_date)
);

-- Add click_fix-related columns to inbox_messages
ALTER TABLE inbox_messages
ADD COLUMN IF NOT EXISTS click_fix_id UUID REFERENCES click_fix(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS click_fix_reply_id UUID REFERENCES click_fix_replies(id) ON DELETE SET NULL;

-- Add foreign key constraints for click_fix tables
ALTER TABLE click_fix
ADD CONSTRAINT fk_click_fix_sent_inbox
FOREIGN KEY (sent_inbox_message_id)
REFERENCES inbox_messages(id) ON DELETE SET NULL;

ALTER TABLE click_fix_replies
ADD CONSTRAINT fk_click_fix_reply_inbox
FOREIGN KEY (inbox_message_id)
REFERENCES inbox_messages(id) ON DELETE SET NULL;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_click_fix_device_id ON click_fix(device_id);
CREATE INDEX IF NOT EXISTS idx_click_fix_municipality ON click_fix(municipality);
CREATE INDEX IF NOT EXISTS idx_click_fix_status ON click_fix(status);
CREATE INDEX IF NOT EXISTS idx_click_fix_created_at ON click_fix(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_click_fix_photos_click_fix_id ON click_fix_photos(click_fix_id);
CREATE INDEX IF NOT EXISTS idx_click_fix_replies_click_fix_id ON click_fix_replies(click_fix_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_click_fix_id ON inbox_messages(click_fix_id) WHERE click_fix_id IS NOT NULL;

-- Update trigger for click_fix.updated_at
CREATE TRIGGER update_click_fix_updated_at
  BEFORE UPDATE ON click_fix
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE click_fix IS 'Click & Fix issue submissions (anonymous, device-based)';
COMMENT ON COLUMN click_fix.device_id IS 'Anonymous device identifier for rate limiting and reply delivery';
COMMENT ON COLUMN click_fix.language IS 'Language of submission (admin replies must be in same language)';
COMMENT ON COLUMN click_fix.location_lat IS 'Latitude of reported issue location (required)';
COMMENT ON COLUMN click_fix.location_lng IS 'Longitude of reported issue location (required)';
COMMENT ON COLUMN click_fix.status IS 'Current status: zaprimljeno, u_razmatranju, prihvaceno, odbijeno';
COMMENT ON COLUMN click_fix.sent_inbox_message_id IS 'Link to the Sent inbox message created on submission';
COMMENT ON TABLE click_fix_photos IS 'Photos attached to Click & Fix submissions (0-3 per submission)';
COMMENT ON COLUMN click_fix_photos.file_path IS 'Path relative to uploads folder';
COMMENT ON COLUMN click_fix_photos.display_order IS 'Display order (0, 1, 2)';
COMMENT ON TABLE click_fix_replies IS 'Admin replies to Click & Fix submissions (thread)';
COMMENT ON COLUMN click_fix_replies.admin_actor IS 'Admin identifier for audit purposes';
COMMENT ON COLUMN click_fix_replies.inbox_message_id IS 'Link to inbox message delivered to user device';
COMMENT ON TABLE click_fix_rate_limits IS 'Rate limiting: 3 submissions per device per day (Europe/Zagreb)';
