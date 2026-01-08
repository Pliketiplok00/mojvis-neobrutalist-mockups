-- Push Notifications Schema
-- Phase 7: Emergency push notifications for hitno inbox messages
--
-- Rules (per spec):
-- - Push is ONLY for Inbox messages tagged `hitno`
-- - Push is backend-triggered ONLY (on admin save)
-- - Once pushed, message becomes LOCKED (no edits allowed)
-- - Deletion must be soft delete only (deleted_at)
-- - Push uses user's onboarding language (no fallback)

-- Platform enum for device tokens
CREATE TYPE device_platform AS ENUM ('ios', 'android');

-- Locale enum for push language
CREATE TYPE device_locale AS ENUM ('hr', 'en');

-- Device push tokens table
-- Stores Expo push tokens for each device
CREATE TABLE IF NOT EXISTS device_push_tokens (
  device_id VARCHAR(255) PRIMARY KEY,
  expo_push_token VARCHAR(255) NOT NULL UNIQUE,
  platform device_platform NOT NULL,
  locale device_locale NOT NULL DEFAULT 'hr',
  push_opt_in BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding opted-in devices by locale
CREATE INDEX idx_device_push_tokens_opt_in_locale
  ON device_push_tokens(locale, push_opt_in)
  WHERE push_opt_in = true;

-- Push notifications log table
-- Audit trail for every push send attempt
CREATE TABLE IF NOT EXISTS push_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_message_id UUID NOT NULL REFERENCES inbox_messages(id),
  admin_id VARCHAR(255),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  provider VARCHAR(50) NOT NULL DEFAULT 'expo',
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding push logs by message
CREATE INDEX idx_push_notifications_log_inbox_message_id
  ON push_notifications_log(inbox_message_id);

-- Index for finding push logs by date
CREATE INDEX idx_push_notifications_log_sent_at
  ON push_notifications_log(sent_at DESC);

-- Add push-related columns to inbox_messages
ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS pushed_at TIMESTAMPTZ NULL;

ALTER TABLE inbox_messages
  ADD COLUMN IF NOT EXISTS pushed_by VARCHAR(255) NULL;

-- Index for finding locked messages
CREATE INDEX IF NOT EXISTS idx_inbox_messages_is_locked
  ON inbox_messages(is_locked)
  WHERE is_locked = true;

-- Update trigger for device_push_tokens updated_at
CREATE TRIGGER update_device_push_tokens_updated_at
  BEFORE UPDATE ON device_push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE device_push_tokens IS 'Expo push tokens for each device, with opt-in status and locale preference';
COMMENT ON COLUMN device_push_tokens.expo_push_token IS 'Expo push token in format ExponentPushToken[xxx]';
COMMENT ON COLUMN device_push_tokens.locale IS 'User language from onboarding, used to select push content language';
COMMENT ON COLUMN device_push_tokens.push_opt_in IS 'User preference for emergency push notifications (Settings toggle)';

COMMENT ON TABLE push_notifications_log IS 'Audit log for every push notification send attempt';
COMMENT ON COLUMN push_notifications_log.target_count IS 'Number of devices targeted for this push';
COMMENT ON COLUMN push_notifications_log.success_count IS 'Number of successful deliveries reported by provider';
COMMENT ON COLUMN push_notifications_log.failure_count IS 'Number of failed deliveries reported by provider';
COMMENT ON COLUMN push_notifications_log.provider_response IS 'Truncated/summarized response from push provider';

COMMENT ON COLUMN inbox_messages.is_locked IS 'TRUE if message has been pushed and cannot be edited';
COMMENT ON COLUMN inbox_messages.pushed_at IS 'Timestamp when push was sent (NULL if never pushed)';
COMMENT ON COLUMN inbox_messages.pushed_by IS 'Admin ID who triggered the push';
