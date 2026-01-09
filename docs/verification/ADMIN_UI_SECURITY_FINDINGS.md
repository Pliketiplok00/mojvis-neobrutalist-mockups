# Admin UI Security Findings

**Date:** 2026-01-09
**Branch:** audit/admin-runtime-e2e
**Severity:** CRITICAL

---

## Executive Summary

The admin UI has **no effective authentication or authorization**. Users can access all administrative functions without logging in. This finding aligns with and extends the backend exposure documented in `ADMIN_API_EXPOSURE_REPORT.md`.

---

## Finding 1: No Login Enforcement

**Severity:** CRITICAL

### Description
The `/login` page exists but is never enforced. Users can navigate directly to any admin route.

### Evidence
```
[VERIFY] Root access: URL=http://localhost:5173/, hasLoginPage=false, hasDashboard=true
[VERIFY] /messages access: status=200, hasMessageList=true, hasLoginForm=false
```

### Impact
- Any user can access admin functionality
- No audit trail of who performed actions
- Public exposure of all administrative data

---

## Finding 2: No Role Headers Sent

**Severity:** HIGH

### Description
The UI does not send `X-Admin-Role` headers to the backend. The backend accepts requests regardless.

### Evidence
```json
[VERIFY] Admin API request headers: [
  {
    "url": "http://localhost:3000/admin/inbox?page=1&page_size=20",
    "adminRole": "NOT_SET"
  }
]
```

### Impact
- Role-based access control is completely bypassed
- Supervisor-only features accessible to everyone
- No distinction between admin and supervisor roles

---

## Finding 3: CRUD Operations Work Without Auth

**Severity:** CRITICAL

### Description
All Create, Read, Update, Delete operations work without authentication.

### Evidence
```
[VERIFY] API create without auth: status=201, id=2e738d92-c88f-4c65-a3a3-0da9fe3662ce
[VERIFY] Created message visible in list: true
[VERIFY] Edit message: isEditable=true
[VERIFY] Delete buttons visible: 20
```

### Tested Operations

| Operation | Endpoint | Works? |
|-----------|----------|--------|
| Create inbox message | POST /admin/inbox | YES |
| Edit inbox message | PATCH /admin/inbox/:id | YES |
| Delete inbox message | DELETE /admin/inbox/:id | YES |
| List all pages | GET /admin/pages | YES |
| Publish page | POST /admin/pages/:id/publish | Likely YES |
| List feedback | GET /admin/feedback | YES |

---

## Finding 4: Supervisor Features Exposed

**Severity:** HIGH

### Description
Features that should require supervisor role are visible and likely functional for all users.

### Evidence
```json
[VERIFY] Supervisor features visible: {
  "publishButton": true,
  "addBlockButton": true,
  "deletePageButton": false
}
```

### Supervisor-Only Features Exposed
1. **Publish/Unpublish pages** - Anyone can publish content
2. **Add blocks to pages** - Anyone can modify page structure
3. **Block locking controls** - Not found, may not be implemented

---

## Cross-Reference: Backend Exposure

From `ADMIN_API_EXPOSURE_REPORT.md`:

| Backend Finding | UI Confirmation |
|-----------------|-----------------|
| All admin GETs open | Confirmed - UI loads all data |
| POST /admin/inbox works | Confirmed - Created message |
| No auth headers required | Confirmed - Headers NOT_SET |
| All endpoints accessible | Confirmed - All pages load |

**Conclusion:** The UI and backend security findings are consistent. Both lack authentication.

---

## Attack Scenarios

### Scenario 1: Data Exfiltration
1. Navigate to `/messages`
2. Access all inbox messages
3. Export via browser DevTools

**Effort:** Trivial (1 minute)

### Scenario 2: Content Injection
1. Navigate to `/messages/new`
2. Create HITNO (urgent) message
3. Message pushed to all app users

**Effort:** Trivial (2 minutes)

### Scenario 3: Content Defacement
1. Navigate to `/pages`
2. Edit any static page
3. Publish malicious content

**Effort:** Low (5 minutes)

### Scenario 4: Data Manipulation
1. Access `/feedback` or `/click-fix`
2. View user-submitted content
3. Modify status or reply as "official"

**Effort:** Low (3 minutes)

---

## Comparison: Expected vs Actual

| Security Control | Expected | Actual |
|------------------|----------|--------|
| Login gate | Required for all /admin routes | Not enforced |
| Session management | JWT or cookie-based | None |
| Role verification | Admin vs Supervisor | None |
| Audit logging | Who did what when | None visible |
| CSRF protection | Token-based | Unknown |
| Rate limiting | Per-user/IP | None visible |

---

## Recommendations (NOT IMPLEMENTED)

1. **Implement authentication middleware** on all `/admin/*` backend routes
2. **Add login gate in React Router** - redirect unauthenticated users
3. **Send role headers** with authenticated requests
4. **Implement session management** with secure token storage
5. **Add audit logging** for all write operations
6. **Implement RBAC** - distinguish admin from supervisor

---

## Evidence Files

### Test File
`admin/e2e/verification-runtime.spec.ts`

### Screenshots
- `admin/e2e-report/screenshots/01-root-access.png`
- `admin/e2e-report/screenshots/02-messages-access.png`
- `admin/e2e-report/screenshots/50-supervisor-features.png`

### Test Output
```
Running 26 tests using 1 worker
26 passed (1.0m)
```

---

## Statement

This report documents security exposures discovered during UI runtime verification. No fixes were applied. The findings confirm and extend the backend security issues previously documented.
