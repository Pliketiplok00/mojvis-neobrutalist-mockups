-- Admin Notice Scope for Phase 3 municipality-scoped notice permissions
-- Migration number: 012 (follows 011_admin_auth.sql)
--
-- Adds notice_municipality_scope field to control which municipality's
-- municipal notices an admin can create/edit.
--
-- Semantics:
-- - This restriction applies ONLY to municipal notices (inbox messages
--   tagged with 'vis' or 'komiza'). All other inbox messages remain
--   fully editable by all admins.
-- - NULL: admin CANNOT create/edit municipal notices ('vis' or 'komiza')
-- - 'vis': admin can create/edit 'vis' notices, but NOT 'komiza' notices
-- - 'komiza': admin can create/edit 'komiza' notices, but NOT 'vis' notices

-- Add notice scope column to admin_users
-- Uses existing municipality_enum type from 011
ALTER TABLE admin_users
    ADD COLUMN notice_municipality_scope municipality_enum DEFAULT NULL;

COMMENT ON COLUMN admin_users.notice_municipality_scope IS 'Scope for municipal notices. NULL=none, vis=vis only, komiza=komiza only.';
