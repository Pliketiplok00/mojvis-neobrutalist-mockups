# Municipal Notice Scope - Implementation Report

## Overview

Implementation of municipality-scoped admin permissions for municipal notices (inbox messages with 'vis' or 'komiza' tags).

**Branch:** `feat/auth-backend-phase1b`

## Features Implemented

### 1. Database Schema (Migration 012)

- Added `notice_municipality_scope` column to `admin_users` table
- Type: `municipality_enum` (NULL | 'vis' | 'komiza')
- NULL = cannot edit ANY municipal notices (but CAN edit all other inbox messages)
- 'vis' = can edit 'vis' municipal notices only
- 'komiza' = can edit 'komiza' municipal notices only

### 2. Backend Authorization

**Files modified:**
- `src/repositories/admin.ts` - Added `notice_municipality_scope` to all admin types and queries
- `src/services/auth.ts` - Added `noticeMunicipalityScope` and `isBreakglass` to `SessionData`
- `src/middleware/auth.ts` - Added authorization guards

**Authorization functions:**
- `checkMunicipalNoticeAuth(adminScope, messageTags, isBreakglass)` - Core authorization logic
- `checkMunicipalNoticeAuthFromRequest(request, messageTags)` - Convenience wrapper

**Authorization rules:**
1. If admin is breakglass (`is_breakglass = true`), ALWAYS ALLOW
2. If message is NOT municipal (no 'vis' or 'komiza' tag), ALLOW
3. If message IS municipal:
   - Admin with NULL scope → DENY (code: `NO_MUNICIPAL_NOTICE_SCOPE`)
   - Admin scope doesn't match message municipality → DENY (code: `MUNICIPALITY_SCOPE_MISMATCH`)
   - Admin scope matches → ALLOW

### 3. Tag Validation

**New validation:**
- `validateDualMunicipalTags(tags)` - Rejects messages with BOTH 'vis' and 'komiza' tags
- Error code: `DUAL_MUNICIPAL_TAGS`
- Error message: "Poruka ne smije imati obje općinske oznake (vis i komiza)."

**Applied to:**
- POST `/admin/inbox` (on `tags`)
- PATCH `/admin/inbox/:id` (on merged tags)

### 4. Admin Inbox Routes (`src/routes/admin-inbox.ts`)

**Authorization applied to:**
- `POST /admin/inbox` - Checks if admin can create notice with given tags
- `PATCH /admin/inbox/:id` - Checks BOTH existing tags (can edit?) AND merged tags (can set new municipality?)
- `DELETE /admin/inbox/:id` - Checks if admin can delete the message

**Removed:**
- `/admin/inbox/:id/restore` endpoint - Restore is backend-internal only (not exposed via admin API)

### 5. Auth Endpoints

- `/admin/auth/me` now returns `notice_municipality_scope` in admin info

### 6. Admin UI (Frontend)

**Files modified:**
- `admin/src/services/api.ts` - Added `notice_municipality_scope` to `AdminUser` interface
- `admin/src/types/inbox.ts` - Added helpers: `MUNICIPAL_TAGS`, `isMunicipalTag()`, `getMunicipalityFromTags()`, `isMunicipalNotice()`
- `admin/src/pages/inbox/InboxEditPage.tsx`:
  - Checks authorization when loading existing message
  - Shows forbidden banner with Croatian message when unauthorized
  - Disables municipal tag checkboxes admin can't use (with lock icon)
  - Disables entire form when viewing forbidden message

## Test Coverage

**New test file:** `src/__tests__/municipal-notice-auth.test.ts`

24 tests covering:
- `validateDualMunicipalTags` - 7 tests
- `checkMunicipalNoticeAuth` for non-municipal messages - 3 tests
- `checkMunicipalNoticeAuth` for vis notices - 4 tests
- `checkMunicipalNoticeAuth` for komiza notices - 3 tests
- Breakglass bypass - 5 tests
- Error messages - 2 tests

**Updated test files:**
- `static-pages.test.ts` - Added `noticeMunicipalityScope` and `isBreakglass` to mock sessions
- `feedback.test.ts` - Added `noticeMunicipalityScope` and `isBreakglass` to mock sessions
- `click-fix.test.ts` - Added `noticeMunicipalityScope` and `isBreakglass` to mock sessions

## Security Notes

1. **Identity from session ONLY** - Admin scope is NEVER read from headers, only from validated session cookie
2. **True breakglass bypass** - `is_breakglass = true` bypasses ALL municipal restrictions
3. **Soft delete only** - Restore endpoint removed from admin API (backend-internal only)
4. **Dual tag prevention** - Cannot create message with both 'vis' and 'komiza' tags

## Verification Results

```
TypeScript: PASS (no errors)
Tests: 302 passed (including 24 new municipal notice auth tests)
Lint: No new errors (pre-existing lint warnings in other files)
```

## API Response Codes

| Scenario | HTTP Status | Error Code |
|----------|-------------|------------|
| Admin has no municipal scope | 403 | `NO_MUNICIPAL_NOTICE_SCOPE` |
| Admin scope doesn't match | 403 | `MUNICIPALITY_SCOPE_MISMATCH` |
| Both vis + komiza tags | 400 | `DUAL_MUNICIPAL_TAGS` |

## Croatian Error Messages

- No scope: "Nemate ovlasti za uređivanje općinskih obavijesti."
- Scope mismatch: "Nemate ovlasti za uređivanje obavijesti za općinu {Vis|Komiža}."
- Dual tags: "Poruka ne smije imati obje općinske oznake (vis i komiza)."
