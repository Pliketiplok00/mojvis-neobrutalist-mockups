-- Feedback Schema
-- Phase 5: User feedback with Inbox integration
--
-- Key concepts:
-- - Anonymous feedback (device-based, no contact fields)
-- - Inbox integration: user submissions appear in Sent, admin replies appear as Inbox messages
-- - Rate limit: 3 submissions per device per day (Europe/Zagreb timezone)
-- - Admin municipality scoping
-- - Status tracking: zaprimljeno -> u_razmatranju -> prihvaceno/odbijeno
-- - Reply thread (multiple admin replies allowed)

-- Feedback status enum
CREATE TYPE feedback_status AS ENUM (
  'zaprimljeno',    -- received (set automatically on creation)
  'u_razmatranju',  -- in review (admin can set)
  'prihvaceno',     -- accepted (admin can set)
  'odbijeno'        -- rejected (admin can set)
);

-- Feedback language enum
CREATE TYPE feedback_language AS ENUM ('hr', 'en');

-- User mode enum (if not exists from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_mode') THEN
    CREATE TYPE user_mode AS ENUM ('visitor', 'local');
  END IF;
END$$;

-- Municipality enum (if not exists from previous migrations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'municipality') THEN
    CREATE TYPE municipality AS ENUM ('vis', 'komiza');
  END IF;
END$$;

-- Main feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Device identification (anonymous)
  device_id VARCHAR(255) NOT NULL,

  -- User context (from onboarding)
  user_mode user_mode NOT NULL,
  municipality municipality, -- NULL for visitors

  -- Submission language (HR or EN based on app language at submission time)
  language feedback_language NOT NULL,

  -- Content
  -- TODO: Max length subject 120, body 4000 (per spec - add if not specified)
  subject VARCHAR(120) NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) <= 4000),

  -- Status (default: zaprimljeno)
  status feedback_status NOT NULL DEFAULT 'zaprimljeno',

  -- Link to Sent Inbox message (created on submission)
  sent_inbox_message_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback replies (admin -> user thread)
CREATE TABLE IF NOT EXISTS feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent feedback
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,

  -- Admin actor (for audit)
  admin_actor VARCHAR(255),

  -- Reply body (in the SAME language as original feedback)
  body TEXT NOT NULL,

  -- Link to Inbox message delivered to user's device
  inbox_message_id UUID,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rate limiting table (tracks submissions per device per day in Europe/Zagreb timezone)
CREATE TABLE IF NOT EXISTS feedback_rate_limits (
  device_id VARCHAR(255) NOT NULL,
  submission_date DATE NOT NULL, -- Date in Europe/Zagreb timezone
  submission_count INTEGER NOT NULL DEFAULT 1,

  PRIMARY KEY (device_id, submission_date)
);

-- Add feedback-related columns to inbox_messages
-- These link inbox messages to their source feedback

ALTER TABLE inbox_messages
ADD COLUMN IF NOT EXISTS device_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS feedback_id UUID REFERENCES feedback(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS feedback_reply_id UUID REFERENCES feedback_replies(id) ON DELETE SET NULL;

-- Add foreign key constraints for feedback tables
ALTER TABLE feedback
ADD CONSTRAINT fk_feedback_sent_inbox
FOREIGN KEY (sent_inbox_message_id)
REFERENCES inbox_messages(id) ON DELETE SET NULL;

ALTER TABLE feedback_replies
ADD CONSTRAINT fk_reply_inbox
FOREIGN KEY (inbox_message_id)
REFERENCES inbox_messages(id) ON DELETE SET NULL;

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feedback_device_id ON feedback(device_id);
CREATE INDEX IF NOT EXISTS idx_feedback_municipality ON feedback(municipality);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback_id ON feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_device_id ON inbox_messages(device_id) WHERE device_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inbox_messages_feedback_id ON inbox_messages(feedback_id) WHERE feedback_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inbox_messages_source_type ON inbox_messages(source_type);

-- Update trigger for feedback.updated_at
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE feedback IS 'User feedback submissions (anonymous, device-based)';
COMMENT ON COLUMN feedback.device_id IS 'Anonymous device identifier for rate limiting and reply delivery';
COMMENT ON COLUMN feedback.language IS 'Language of submission (admin replies must be in same language)';
COMMENT ON COLUMN feedback.status IS 'Current status: zaprimljeno, u_razmatranju, prihvaceno, odbijeno';
COMMENT ON COLUMN feedback.sent_inbox_message_id IS 'Link to the Sent inbox message created on submission';
COMMENT ON TABLE feedback_replies IS 'Admin replies to user feedback (thread)';
COMMENT ON COLUMN feedback_replies.admin_actor IS 'Admin identifier for audit purposes';
COMMENT ON COLUMN feedback_replies.inbox_message_id IS 'Link to inbox message delivered to user device';
COMMENT ON TABLE feedback_rate_limits IS 'Rate limiting: 3 submissions per device per day (Europe/Zagreb)';
COMMENT ON COLUMN inbox_messages.source_type IS 'Source of message: admin, feedback_sent, feedback_reply';
COMMENT ON COLUMN inbox_messages.device_id IS 'Target device for feedback-related messages';
