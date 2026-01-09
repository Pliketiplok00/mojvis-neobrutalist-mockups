# Security Work Items - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/security-model`
**Purpose:** Canonical enforcement plan for implementing security controls

---

## Overview

This document specifies the work items required to implement authentication and authorization in MOJ VIS. Items are ordered by priority and dependency.

---

## Phase 1: Authentication Foundation

### WI-001: Backend Authentication Middleware

**Priority:** CRITICAL
**Effort:** Medium

**Description:**
Create Fastify authentication middleware that validates session tokens for all `/admin/*` routes.

**Files to modify:**
- `backend/src/middleware/auth.ts` (new)
- `backend/src/index.ts`

**Acceptance criteria:**
- [ ] All `/admin/*` routes require valid session token
- [ ] Invalid/missing token returns 401 Unauthorized
- [ ] Token extracted from `Authorization: Bearer <token>` header
- [ ] Token validation against session store

**Dependencies:** None

---

### WI-002: Admin Session Management

**Priority:** CRITICAL
**Effort:** Medium

**Description:**
Implement session creation and validation for admin users.

**Files to modify:**
- `backend/src/services/auth.ts` (new)
- `backend/src/routes/auth.ts` (new)
- Database migration for sessions table

**Acceptance criteria:**
- [ ] POST `/auth/login` validates credentials, returns token
- [ ] POST `/auth/logout` invalidates session
- [ ] Sessions stored in database with expiry
- [ ] Session cleanup job for expired sessions

**Dependencies:** WI-001

---

### WI-003: Admin User Store

**Priority:** CRITICAL
**Effort:** Small

**Description:**
Create database table and repository for admin users.

**Files to modify:**
- `backend/src/db/migrations/XXX_admin_users.sql` (new)
- `backend/src/repositories/admin-users.ts` (new)
- `backend/src/types/admin.ts` (new)

**Acceptance criteria:**
- [ ] Admin users table with email, password_hash, municipality
- [ ] Password hashing with bcrypt
- [ ] Repository methods: findByEmail, validatePassword

**Dependencies:** None

---

### WI-004: Admin UI Login Integration

**Priority:** CRITICAL
**Effort:** Small

**Description:**
Connect LoginPage to backend authentication API.

**Files to modify:**
- `admin/src/pages/LoginPage.tsx`
- `admin/src/services/api.ts`
- `admin/src/context/auth.tsx` (new)

**Acceptance criteria:**
- [ ] Login form calls `/auth/login` endpoint
- [ ] Token stored in localStorage/sessionStorage
- [ ] Auth context provides current user and token
- [ ] Logout clears token and redirects to login

**Dependencies:** WI-002

---

### WI-005: Admin UI Route Guards

**Priority:** CRITICAL
**Effort:** Small

**Description:**
Implement route protection in React Router.

**Files to modify:**
- `admin/src/App.tsx`
- `admin/src/components/ProtectedRoute.tsx` (new)

**Acceptance criteria:**
- [ ] Unauthenticated users redirected to /login
- [ ] Protected routes check auth context
- [ ] Token included in all API requests

**Dependencies:** WI-004

---

## Phase 2: Authorization

### WI-006: Municipality-Based Access Control

**Priority:** HIGH
**Effort:** Small

**Description:**
Enforce municipality scoping based on authenticated admin's municipality.

**Files to modify:**
- `backend/src/middleware/auth.ts`
- `backend/src/routes/admin-feedback.ts`
- `backend/src/routes/admin-click-fix.ts`

**Acceptance criteria:**
- [ ] Admin municipality from session, not header
- [ ] Feedback/ClickFix queries filtered by admin's municipality
- [ ] Cross-municipality access returns 403

**Dependencies:** WI-001, WI-003

---

### WI-007: Remove Supervisor Role References

**Priority:** MEDIUM
**Effort:** Small

**Description:**
Remove supervisor role concept from codebase - all admins have equal access.

**Files to modify:**
- `backend/src/routes/admin-static-pages.ts`
- `admin/src/pages/pages/PageEditPage.tsx`
- `admin/src/services/api.ts`

**Acceptance criteria:**
- [ ] Remove `isSupervisor()` function
- [ ] Remove `X-Admin-Role` header handling
- [ ] Remove supervisor checks from UI
- [ ] All authenticated admins can perform all operations

**Dependencies:** WI-001

---

### WI-008: Block Lock Enforcement

**Priority:** MEDIUM
**Effort:** Small

**Description:**
Enforce block content/structure locks in backend.

**Files to modify:**
- `backend/src/routes/admin-static-pages.ts`
- `backend/src/repositories/static-pages.ts`

**Acceptance criteria:**
- [ ] Backend checks `content_locked` before content updates
- [ ] Backend checks `structure_locked` before reorder/delete
- [ ] Locked block modification returns 403

**Dependencies:** WI-001

---

## Phase 3: Mobile Security

### WI-009: Device Registration

**Priority:** MEDIUM
**Effort:** Medium

**Description:**
Implement device registration and validation for mobile users.

**Files to modify:**
- `backend/src/routes/device.ts` (new)
- `backend/src/repositories/devices.ts` (new)
- Database migration for devices table
- `mobile/src/services/api.ts`

**Acceptance criteria:**
- [ ] POST `/devices/register` creates device record
- [ ] Device ID validated against registered devices
- [ ] Unknown device IDs rejected with 401
- [ ] Device includes user_status (local/visitor)

**Dependencies:** None

---

### WI-010: Rate Limiting

**Priority:** LOW
**Effort:** Small

**Description:**
Add rate limiting to protect against abuse.

**Files to modify:**
- `backend/src/middleware/rate-limit.ts` (new)
- `backend/src/index.ts`

**Acceptance criteria:**
- [ ] Public endpoints: 100 req/min per IP
- [ ] Admin endpoints: 60 req/min per session
- [ ] Submission endpoints: 10 req/min per device
- [ ] 429 response when exceeded

**Dependencies:** None

---

## Phase 4: Audit & Compliance

### WI-011: Audit Logging

**Priority:** LOW
**Effort:** Medium

**Description:**
Log all admin operations for accountability.

**Files to modify:**
- `backend/src/services/audit.ts` (new)
- `backend/src/repositories/audit.ts` (new)
- Database migration for audit_log table
- All admin route handlers

**Acceptance criteria:**
- [ ] Log: who, what, when, target entity
- [ ] Include old/new values for updates
- [ ] Audit log queryable by admin
- [ ] Retention policy (90 days suggested)

**Dependencies:** WI-001

---

## Implementation Order

```
Phase 1 (Critical - Must complete before production):
WI-003 → WI-002 → WI-001 → WI-004 → WI-005

Phase 2 (High - Required for proper operation):
WI-006, WI-007, WI-008 (can be parallel)

Phase 3 (Medium - Improves security posture):
WI-009, WI-010 (can be parallel)

Phase 4 (Low - Nice to have):
WI-011
```

---

## Testing Requirements

Each work item must include:

1. **Unit tests** for new services/repositories
2. **Integration tests** for middleware
3. **E2E tests** for authentication flows

Test files:
- `backend/src/__tests__/auth.test.ts`
- `backend/src/__tests__/middleware.test.ts`
- `admin/src/__tests__/auth.test.tsx`

---

## Migration Notes

When deploying authentication:

1. Create admin users before enabling auth middleware
2. Deploy backend changes first
3. Deploy admin UI changes second
4. Seed at least one admin user per municipality
5. Communicate login credentials to admins

---

## Verification Checklist

After implementation, verify:

- [ ] `/admin/*` returns 401 without token
- [ ] `/admin/*` returns 200 with valid token
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Municipality scoping enforced
- [ ] Audit log captures operations
- [ ] Rate limiting works as expected
