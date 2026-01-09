# Endpoint Exposure Report - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/security-model`
**Test Method:** Runtime curl verification against local backend

---

## Executive Summary

**CRITICAL FINDING:** All admin endpoints are accessible without authentication. Any anonymous user can create, modify, and delete data in the system.

---

## Public Endpoints (Expected: Open)

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/health` | GET | 200 | Health check - correct |
| `/inbox` | GET | 200 | Public inbox list - correct |
| `/events` | GET | 200 | Public events list - correct |
| `/pages` | GET | 200 | Public pages list - correct |
| `/menu/extras` | GET | 200 | Public menu extras - correct |

**Assessment:** All public endpoints behave as expected.

---

## Admin Endpoints (Expected: Protected, Actual: Open)

### Inbox Admin

| Endpoint | Method | Status | Expected | Issue |
|----------|--------|--------|----------|-------|
| `/admin/inbox` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/inbox` | POST | 201 | 401/403 | CRITICAL: Creates data anonymously |
| `/admin/inbox/:id` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/inbox/:id` | PATCH | 200/500 | 401/403 | CRITICAL: Modifies data anonymously |
| `/admin/inbox/:id` | DELETE | 200/500 | 401/403 | CRITICAL: Deletes data anonymously |

### Events Admin

| Endpoint | Method | Status | Expected | Issue |
|----------|--------|--------|----------|-------|
| `/admin/events` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/events` | POST | 201 | 401/403 | CRITICAL: Creates data anonymously |
| `/admin/events/:id` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/events/:id` | PATCH | 200/500 | 401/403 | CRITICAL: Modifies data anonymously |
| `/admin/events/:id` | DELETE | 200/500 | 401/403 | CRITICAL: Deletes data anonymously |

### Static Pages Admin

| Endpoint | Method | Status | Expected | Issue |
|----------|--------|--------|----------|-------|
| `/admin/pages` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/pages` | POST | 201 | 401/403 | CRITICAL: Creates pages anonymously |
| `/admin/pages/:id` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/pages/:id/draft` | PATCH | 200/500 | 401/403 | CRITICAL: Modifies draft anonymously |
| `/admin/pages/:id/publish` | POST | 200 | 401/403 | CRITICAL: Publishes anonymously |
| `/admin/pages/:id/unpublish` | POST | 200 | 401/403 | CRITICAL: Unpublishes anonymously |
| `/admin/pages/:id/blocks` | POST | 200 | 401/403 | CRITICAL: Adds blocks anonymously |
| `/admin/pages/:id/blocks/:blockId` | DELETE | 200 | 401/403 | CRITICAL: Removes blocks anonymously |
| `/admin/pages/:id` | DELETE | 200/500 | 401/403 | CRITICAL: Deletes pages anonymously |

### Feedback Admin

| Endpoint | Method | Status | Expected | Issue |
|----------|--------|--------|----------|-------|
| `/admin/feedback` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/feedback/:id` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/feedback/:id/status` | PATCH | 200/500 | 401/403 | CRITICAL: Modifies anonymously |
| `/admin/feedback/:id/reply` | POST | 201/500 | 401/403 | CRITICAL: Adds reply anonymously |

### Click & Fix Admin

| Endpoint | Method | Status | Expected | Issue |
|----------|--------|--------|----------|-------|
| `/admin/click-fix` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/click-fix/:id` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/click-fix/:id/status` | PATCH | 200/500 | 401/403 | CRITICAL: Modifies anonymously |
| `/admin/click-fix/:id/reply` | POST | 201/500 | 401/403 | CRITICAL: Adds reply anonymously |

### Menu Extras Admin

| Endpoint | Method | Status | Expected | Issue |
|----------|--------|--------|----------|-------|
| `/admin/menu/extras` | GET | 200 | 401/403 | CRITICAL: No auth |
| `/admin/menu/extras` | POST | 201 | 401/403 | CRITICAL: Creates anonymously |
| `/admin/menu/extras/:id` | PATCH | 200/500 | 401/403 | CRITICAL: Modifies anonymously |
| `/admin/menu/extras/:id` | DELETE | 200/500 | 401/403 | CRITICAL: Deletes anonymously |

---

## Header-Based Access (Insufficient)

### X-Admin-Role Header

The backend checks `X-Admin-Role` header for some operations but:

1. **No authentication required** - anyone can set this header
2. **No session validation** - header is trusted without verification

**Test Result:**
```bash
# This works without any authentication:
curl -X POST http://localhost:3000/admin/pages/test/publish \
  -H "X-Admin-Role: supervisor"
# Returns 200 - publishes page
```

### X-Admin-Municipality Header

Used for scoping feedback/click-fix data but:

1. **No verification** - any municipality can be claimed
2. **No authentication** - anonymous users can set it

### X-Device-ID Header

Required for mobile user operations:

1. **Required** - backend rejects requests without it
2. **Not authenticated** - any device ID is accepted
3. **No device registration** - IDs are not verified

---

## Code Evidence

### Missing Authentication Middleware

**File:** `backend/src/index.ts`

All admin routes registered without auth middleware:
```typescript
app.register(adminInboxRoutes);
app.register(adminEventRoutes);
app.register(adminStaticPageRoutes);
app.register(adminFeedbackRoutes);
app.register(adminClickFixRoutes);
app.register(adminMenuExtrasRoutes);
```

### TODO Comments Found

```typescript
// backend/src/routes/admin-inbox.ts
// TODO: Add admin authentication middleware here

// backend/src/routes/admin-events.ts
// TODO: Add admin authentication middleware here

// backend/src/routes/admin-static-pages.ts
// TODO: Add admin authentication middleware here

// admin/src/services/api.ts
// TODO: Add supervisor session token when implemented
```

### isSupervisor Function (Insufficient)

**File:** `backend/src/routes/admin-static-pages.ts`

```typescript
function isSupervisor(request: FastifyRequest): boolean {
  const role = request.headers['x-admin-role'] as string | undefined;
  return role === 'supervisor';
}
```

This function only checks if header equals "supervisor" - no authentication.

---

## Risk Assessment

| Category | Risk Level | Impact |
|----------|------------|--------|
| Data Integrity | CRITICAL | Any user can modify/delete all data |
| Data Confidentiality | HIGH | Admin-only data readable by anyone |
| System Availability | HIGH | Malicious deletion possible |
| Compliance | HIGH | No audit trail, no access control |

---

## Recommendations

1. **Immediate:** Add authentication middleware to all `/admin/*` routes
2. **Short-term:** Implement session management with JWT or similar
3. **Medium-term:** Add role-based access control
4. **Long-term:** Add audit logging for all admin operations
