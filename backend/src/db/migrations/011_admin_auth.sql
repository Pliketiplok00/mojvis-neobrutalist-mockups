-- Admin Authentication tables for Phase 1b
-- Migration number: 011 (follows 010_menu_extras.sql)
--
-- Implements cookie-session auth per AUTH_ARCHITECTURE_DECISIONS.md

-- Municipality type (if not already exists)
DO $$ BEGIN
    CREATE TYPE municipality_enum AS ENUM ('vis', 'komiza');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Admin Users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    municipality municipality_enum NOT NULL,
    is_breakglass BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Admin Sessions table
-- NOTE: session_token_hash stores SHA-256 hash of the actual token
-- The raw token is sent to client in cookie, never stored in DB
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_sessions_token_hash ON admin_sessions(session_token_hash);
CREATE INDEX idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Auto-update updated_at trigger for admin_users
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_users_updated_at();

-- Comments
COMMENT ON TABLE admin_users IS 'Admin panel user accounts with municipality binding';
COMMENT ON TABLE admin_sessions IS 'Server-side session storage for cookie-based auth';
COMMENT ON COLUMN admin_users.username IS 'Unique login identifier';
COMMENT ON COLUMN admin_users.municipality IS 'Each admin belongs to exactly one municipality';
COMMENT ON COLUMN admin_users.is_breakglass IS 'True if created via break-glass env vars';
COMMENT ON COLUMN admin_sessions.session_token_hash IS 'SHA-256 hash of session token (raw token in cookie)';
COMMENT ON COLUMN admin_sessions.revoked_at IS 'Set when session is explicitly logged out';
COMMENT ON COLUMN admin_sessions.last_seen_at IS 'Updated periodically for session activity tracking';
