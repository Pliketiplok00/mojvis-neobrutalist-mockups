# Admin Archive & Restore - Final Report

## Status: LOCKED AND FINAL

Archive + Restore behavior is now locked and final.

---

## Final Semantics

### Terminology
- **Active message**: `deleted_at IS NULL`
- **Archived message**: `deleted_at IS NOT NULL`
- **Soft delete = Archive**: Sets `deleted_at = NOW()`
- **Restore**: Sets `deleted_at = NULL`
- **Hard delete**: NOT ALLOWED (never implemented)

### User Flows
1. **Archive a message**: Admin clicks "Arhiviraj" button → message moves to Archive tab
2. **View archived messages**: Admin clicks "Arhivirane" tab → sees only archived messages
3. **Restore a message**: Admin clicks "Vrati" button on archived message → message moves back to Active tab

---

## Endpoint List

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| GET | `/admin/inbox?archived=false` | List active messages (default) | Session required |
| GET | `/admin/inbox?archived=true` | List archived messages | Session required |
| GET | `/admin/inbox/:id` | Get single message (any status) | Session required |
| POST | `/admin/inbox` | Create message | Session + municipal scope check |
| PATCH | `/admin/inbox/:id` | Update message | Session + municipal scope check |
| DELETE | `/admin/inbox/:id` | Archive message (soft delete) | Session + municipal scope check |
| POST | `/admin/inbox/:id/restore` | Restore archived message | Session + municipal scope check |

---

## Authorization Rules

### Municipal Scope Authorization

The same `checkMunicipalNoticeAuth()` function is used for ALL operations:
- POST (create)
- PATCH (update)
- DELETE (archive)
- POST restore

**Rules:**

| Admin Scope | Message Tags | Allowed? |
|-------------|-------------|----------|
| Any | No municipal tags (`vis`/`komiza`) | YES |
| `vis` | Contains `vis` | YES |
| `vis` | Contains `komiza` | NO |
| `komiza` | Contains `komiza` | YES |
| `komiza` | Contains `vis` | NO |
| `null` | Contains any municipal tag | NO |
| Breakglass (`is_breakglass = true`) | Any | YES |

**Error Codes:**
- `NO_MUNICIPAL_NOTICE_SCOPE`: Admin has null scope, cannot edit municipal notices
- `MUNICIPALITY_SCOPE_MISMATCH`: Admin scope doesn't match message municipality

### Tag Validation

**Dual Municipal Tags Rejected:**
- A message CANNOT have both `vis` AND `komiza` tags
- Returns 400 with code `DUAL_MUNICIPAL_TAGS`
- Enforced on POST (create) and PATCH (update)

---

## Admin UI Behavior

### Inbox List Page

**Tabs:**
- "Aktivne" (default): Shows active messages
- "Arhivirane": Shows archived messages

**Active View:**
- "Uredi" button: Opens edit page
- "Arhiviraj" button: Archives message (if authorized)
- "Nova poruka" button: Creates new message

**Archive View:**
- "Vrati" button: Restores message (if authorized)
- No "Nova poruka" button (cannot create in archive view)
- Messages shown with "ARHIV" badge
- Messages have greyed-out appearance

**Authorization in UI:**
- Buttons are disabled (with tooltip) if admin lacks permission
- Messages are still visible but actions are restricted

---

## Test Coverage

**Test File:** `src/__tests__/municipal-notice-auth.test.ts`

**Test Count:** 33 tests (9 new for archive/restore)

**Coverage:**
1. `validateDualMunicipalTags`: 7 tests
2. Non-municipal message authorization: 3 tests
3. Vis municipal notice authorization: 4 tests
4. Komiza municipal notice authorization: 3 tests
5. Breakglass bypass: 5 tests
6. Error messages: 2 tests
7. **Archive operation authorization: 4 tests** (NEW)
8. **Restore operation authorization: 5 tests** (NEW)

---

## Verification Results

```
TypeScript (backend): PASS
TypeScript (admin): PASS
Tests: 311 passed (13 test files)
```

---

## Known Non-Goals

The following are explicitly NOT implemented:

1. **Hard delete**: Messages are NEVER permanently deleted from database
2. **Bulk archive/restore**: Operations are single-message only
3. **Archive expiration**: Archived messages remain indefinitely
4. **Archive reason/comment**: No metadata captured on archive
5. **Archive by non-owner**: Authorization is scope-based, not owner-based
6. **Public access to archived**: Archived messages are admin-only

---

## Files Modified

### Backend
- `src/routes/admin-inbox.ts` - Added archived filter and restore endpoint
- `src/repositories/inbox.ts` - Added archived parameter to getInboxMessagesAdmin

### Admin Frontend
- `src/services/api.ts` - Added archived parameter and restoreMessage function
- `src/pages/inbox/InboxListPage.tsx` - Added tabs, archive view, restore button

### Tests
- `src/__tests__/municipal-notice-auth.test.ts` - Added archive/restore tests

---

## Confirmation

**Archive + Restore behavior is now locked and final.**

Date: 2026-01-10
