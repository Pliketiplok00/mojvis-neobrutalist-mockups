# Admin UI Drift Addendum

**Date:** 2026-01-09
**Branch:** audit/admin-runtime-e2e

This document captures UI-specific drift items discovered during E2E runtime verification. These extend the existing DOCS_DRIFT_REPORT.md.

---

## New Drift Items (UI-Specific)

### DRIFT-UI-1: Login Page Exists But Not Enforced

**Category:** Security / Navigation

**Documentation Says:**
- Admin requires authentication
- Login page at `/login`

**Runtime Reality:**
- Login page exists and renders
- Password field visible
- BUT: No route protection - users can navigate directly to any route
- React Router has no auth guards

**Evidence:**
```
[VERIFY] /login page: status=200, hasLoginForm=true, hasUsernameField=false
[VERIFY] Root access: URL=http://localhost:5173/, hasLoginPage=false, hasDashboard=true
```

**Impact:** Login page is cosmetic only.

---

### DRIFT-UI-2: Supervisor Role Assumed in Pages UI

**Category:** Authorization

**Spec Says:**
- Only supervisors can publish pages
- Only supervisors can add/remove blocks
- Admins can only edit block content

**Runtime Reality:**
- Publish button visible to all
- Add block button visible to all
- No role check in UI
- Backend also doesn't check

**Evidence:**
```json
[VERIFY] Supervisor controls: {
  "hasPublishButton": true,
  "hasUnpublishButton": true,
  "hasAddBlockButton": true
}
```

**Impact:** Role-based restrictions are not implemented.

---

### DRIFT-UI-3: Date Fields Missing from Inbox Create Form

**Category:** Form Implementation

**Expected:**
- `start_date` field visible
- `end_date` field visible
- Date range for message visibility

**Runtime Reality:**
- Date fields found: `false`
- Only title, body, tags visible

**Evidence:**
```json
[VERIFY] Create message form fields: {
  "titleHr": true,
  "bodyHr": true,
  "tags": true,
  "dateFields": false
}
```

**Note:** This may be intentional (dates auto-set) or a form gap.

---

### DRIFT-UI-4: Event Form Field Selectors Mismatch

**Category:** Test Implementation / Form Structure

**Test Expected:**
- `input[name="title_hr"]` or `[data-testid="event-title-hr"]`

**Runtime Reality:**
- Title fields use different selectors
- Form structure doesn't match expected pattern

**Evidence:**
```json
[VERIFY] Event create form: {
  "titleHr": false,
  "titleEn": false,
  "date": true,
  "location": false,
  "submitButton": true
}
```

**Impact:** Tests may need updated selectors. Form works but selectors differ from inbox pattern.

---

### DRIFT-UI-5: Feedback Status Dropdown Not Visible

**Category:** UI Implementation

**Expected:**
- Status dropdown for changing feedback status
- Reply button visible

**Runtime Reality:**
- Status dropdown not found by selector
- Reply button not found
- Reply textarea exists

**Evidence:**
```json
[VERIFY] Feedback detail: {
  "hasStatusDropdown": false,
  "hasReplyButton": false,
  "hasReplyTextarea": true
}
```

**Note:** Status control may use different component (inline buttons, etc.)

---

### DRIFT-UI-6: Menu Extras Page Listed But Routes Missing

**Category:** Route Inventory

**ROUTE_INVENTORY.md Says:**
- `/menu-extras` admin route exists
- GET/POST/PATCH/DELETE endpoints

**Runtime Reality:**
- Backend routes return 404 (per RUNTIME_FINDINGS_ADDENDUM.md)
- UI route may exist but would fail

**Evidence:**
From backend verification:
```
GET /menu/extras -> 404
```

**Impact:** Menu extras feature is completely non-functional.

---

### DRIFT-UI-7: Role Header Not Sent by UI

**Category:** API Integration

**Expected:**
- UI sends `X-Admin-Role: admin` or `X-Admin-Role: supervisor`
- Backend uses this for authorization

**Runtime Reality:**
- Header value: `NOT_SET`
- No role information transmitted

**Evidence:**
```json
[VERIFY] Admin API request headers: [
  {
    "adminRole": "NOT_SET"
  }
]
```

**Impact:** Role-based logic cannot function.

---

## Cross-Reference: Existing DOCS_DRIFT_REPORT Items

| Existing Item | UI Verification |
|---------------|-----------------|
| Admin auth documentation missing | CONFIRMED - No auth implemented |
| Supervisor publish permissions | CONFIRMED - Visible without role check |
| Menu extras routes | CONFIRMED - 404 at runtime |

---

## Summary Table

| Drift ID | Category | Severity | Status |
|----------|----------|----------|--------|
| DRIFT-UI-1 | Security | CRITICAL | New |
| DRIFT-UI-2 | Authorization | HIGH | New |
| DRIFT-UI-3 | Form | LOW | New |
| DRIFT-UI-4 | Testing | LOW | New |
| DRIFT-UI-5 | UI | MEDIUM | New |
| DRIFT-UI-6 | Routes | MEDIUM | Confirms backend |
| DRIFT-UI-7 | API | HIGH | New |

---

## Recommendations for Documentation Update

1. Update ROUTE_INVENTORY.md to mark menu-extras as "NOT WIRED"
2. Update admin documentation to reflect current auth state (none)
3. Create SECURITY_BACKLOG.md with prioritized fixes
4. Update form documentation with actual field selectors

---

## Test File Reference

All findings documented in:
`admin/e2e/verification-runtime.spec.ts`

Test output:
```
Running 26 tests using 1 worker
26 passed (1.0m)
```
