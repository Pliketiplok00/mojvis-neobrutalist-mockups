# Security Model Report - MOJ VIS

**Date:** 2025-01-09
**Branch:** `audit/security-model`
**Audit Type:** VERIFY & DOCUMENT ONLY

---

## Executive Summary

This audit documents the current security posture of the MOJ VIS application across Admin UI, Backend API, and Mobile App. The primary finding is that **no authentication or authorization enforcement exists** despite the codebase containing role-based logic.

---

## 1. Canonical Role Model

### Defined Actors

| Actor | Description | Identification |
|-------|-------------|----------------|
| **Anonymous** | Unauthenticated public user | None |
| **User** | Mobile app user (Local or Visitor) | Device ID header |
| **Admin** | Admin panel authenticated user | Session token (not implemented) |

### Rejected Concepts

- **Supervisor role**: The codebase references "supervisor" but this is NOT a canonical role. Per specification, all authenticated admins have equal privileges.

---

## 2. Current Implementation Status

### Authentication

| Component | Status | Evidence |
|-----------|--------|----------|
| Admin login form | EXISTS but non-functional | `LoginPage.tsx` line 29: just navigates |
| Admin session management | NOT IMPLEMENTED | `api.ts` line 65: commented out |
| Admin auth middleware | NOT IMPLEMENTED | `backend/src/index.ts`: no middleware |
| Mobile device auth | NOT IMPLEMENTED | Device ID accepted without verification |

### Authorization

| Component | Status | Evidence |
|-----------|--------|----------|
| Admin route protection | NOT IMPLEMENTED | All `/admin/*` endpoints open |
| Role-based checks | EXISTS but bypassable | `isSupervisor()` trusts header |
| Municipality scoping | EXISTS but unverified | `X-Admin-Municipality` trusted |
| Block content locking | EXISTS but unenforced | Lock flags exist but no backend check |

---

## 3. UI vs Backend Gap Analysis

### Admin UI (React)

| Feature | Implementation | Security Impact |
|---------|----------------|-----------------|
| Login form | Accepts any email+password | No real authentication |
| Route guards | TODO comment, none exist | All routes accessible |
| Supervisor state | Hardcoded `true` | `PageEditPage.tsx` line 55 |
| Role header | Sent to backend | Backend trusts it blindly |
| Municipality header | Sent to backend | Backend trusts it blindly |

### Backend API (Fastify)

| Feature | Implementation | Security Impact |
|---------|----------------|-----------------|
| Auth middleware | Not implemented | All endpoints accessible |
| Session validation | Not implemented | No token verification |
| Role checking | Header-based only | Anyone can claim any role |
| Municipality scoping | Header-based only | Anyone can claim any municipality |

### Gap Summary

| Aspect | UI Assumption | Backend Reality | Gap |
|--------|---------------|-----------------|-----|
| Authentication | Form exists | No validation | BOTH UNIMPLEMENTED |
| Route protection | TODO exists | No middleware | BOTH UNIMPLEMENTED |
| Session tokens | Commented out | Not implemented | BOTH UNIMPLEMENTED |
| Admin role | Hardcoded true | Trusts header | UI BYPASSES |
| Supervisor role | Hardcoded true | Trusts header | UI BYPASSES |
| Municipality | Sends header | Trusts header | NO VERIFICATION |

---

## 4. Code Evidence

### LoginPage.tsx (Admin)

```typescript
// Line 29-35
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  // TODO: Implement actual authentication
  console.info('Login attempt:', { email });
  // Phase 0: Just navigate to dashboard
  if (email && password) {
    setError(null);
    navigate('/dashboard');
  }
};
```

### PageEditPage.tsx (Admin)

```typescript
// Line 55
const [isSupervisor] = useState(true); // TODO: Get from auth context
```

### api.ts (Admin)

```typescript
// Line 62-67
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  // 'Authorization': `Bearer ${getToken()}`,
  ...options.headers as Record<string, string>,
};
```

### App.tsx (Admin)

```typescript
// Line 35
{/* Protected routes (TODO: Add auth guard) */}
```

### admin-static-pages.ts (Backend)

```typescript
// isSupervisor function
function isSupervisor(request: FastifyRequest): boolean {
  const role = request.headers['x-admin-role'] as string | undefined;
  return role === 'supervisor';
}
```

### index.ts (Backend)

```typescript
// Route registration - no auth middleware
app.register(adminInboxRoutes);
app.register(adminEventRoutes);
app.register(adminStaticPageRoutes);
// ... etc
```

---

## 5. Runtime Verification Results

### Test 1: Anonymous Admin Access

**Command:**
```bash
curl http://localhost:3000/admin/inbox
```

**Result:** 200 OK with full inbox list

**Expected:** 401 Unauthorized

### Test 2: Anonymous Data Creation

**Command:**
```bash
curl -X POST http://localhost:3000/admin/inbox \
  -H "Content-Type: application/json" \
  -d '{"title_hr":"Test","title_en":"Test","body_hr":"Body","body_en":"Body"}'
```

**Result:** 201 Created - message inserted into database

**Expected:** 401 Unauthorized

### Test 3: Supervisor Header Bypass

**Command:**
```bash
curl -X POST http://localhost:3000/admin/pages/test/publish \
  -H "X-Admin-Role: supervisor"
```

**Result:** 200 OK (or 404 if page doesn't exist)

**Expected:** 401 Unauthorized (not authenticated), then 403 if not authorized

---

## 6. Risk Assessment

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|--------|
| Unauthorized data modification | CRITICAL | HIGH | Complete data integrity loss |
| Unauthorized data deletion | CRITICAL | HIGH | Data loss, service disruption |
| Unauthorized data read | HIGH | HIGH | Privacy violation |
| Impersonation attacks | HIGH | MEDIUM | Accountability loss |
| Municipality scope bypass | MEDIUM | HIGH | Cross-municipality data access |

---

## 7. Known Limitations Documentation

From `docs/KNOWN_LIMITATIONS.md`:

> "No authentication flow exists yet. The admin panel expects authentication to be added in production."

> "Admin UI tests skip login because no real auth is implemented."

> "No role-based access control testing is possible until auth is implemented."

---

## 8. Compliance with Spec

### Spec Requirements (04-MOJVIS-ADMIN-SUPERVISOR-WEBEDITOR-BRIEF.md)

| Requirement | Status |
|-------------|--------|
| Web login required for admin access | NOT IMPLEMENTED |
| Admin can edit draft content | Logic exists, not protected |
| Publish is admin operation | Logic exists, not protected |
| Municipality-scoped admin | Header-based, not verified |
| Audit trail | NOT IMPLEMENTED |

---

## 9. Conclusion

The MOJ VIS system currently operates in a "development mode" where security controls are documented as TODOs but not implemented. This is acknowledged in `KNOWN_LIMITATIONS.md`. Before any production deployment, authentication and authorization must be implemented as a prerequisite.

See:
- `PERMISSION_MATRIX.md` for detailed access control requirements
- `ENDPOINT_EXPOSURE_REPORT.md` for runtime test results
- `SECURITY_WORK_ITEMS.md` for remediation plan
