# Promet Enum Fix Report

**Date**: 2026-01-09
**Status**: FIXED

---

## What Was Broken

**Symptom**: Admin inbox save failed with HTTP 500 when creating messages with tags `["promet", "hitno"]`.

**Error**:
```
invalid input value for enum inbox_tag: "promet"
```

**Root Cause**: TypeScript/Database enum mismatch.

| Layer | Includes 'promet'? |
|-------|-------------------|
| TypeScript (`backend/src/types/inbox.ts`) | YES |
| Admin TypeScript (`admin/src/types/inbox.ts`) | YES |
| PostgreSQL enum (`inbox_tag`) | **NO** |

The PostgreSQL `inbox_tag` enum was never updated when `'promet'` was added to TypeScript types as the unified transport tag (replacing deprecated `'cestovni_promet'` and `'pomorski_promet'`).

---

## Migration File

**File**: `backend/src/db/migrations/011_add_promet_tag.sql`

```sql
-- Add 'promet' to inbox_tag enum
--
-- Background:
-- TypeScript types define 'promet' as the canonical unified transport tag,
-- with 'cestovni_promet' and 'pomorski_promet' marked as DEPRECATED.
-- However, the DB enum was never updated to include 'promet', causing
-- INSERT failures when Admin saves messages with tags ["promet", "hitno"].
--
-- This migration adds 'promet' to the enum while keeping deprecated values intact.
-- See: docs/INBOX_SAVE_PROMET_HITNO_DEBUG.md

-- PostgreSQL 10+ supports IF NOT EXISTS for ALTER TYPE ADD VALUE
-- This is safe to run multiple times and does not require transaction guards
ALTER TYPE inbox_tag ADD VALUE IF NOT EXISTS 'promet';

-- Update documentation comment to reflect new tag
COMMENT ON COLUMN inbox_messages.tags IS 'Max 2 tags from fixed taxonomy: promet (unified transport), kultura, opcenito, hitno, komiza, vis. Deprecated: cestovni_promet, pomorski_promet';
```

---

## Tests

### Existing Tests Already Covered This

The existing test in `backend/src/__tests__/hitno-validation.test.ts` already validates `promet` + `hitno`:

```typescript
it('should pass for hitno + promet with valid dates', () => {
  const result = validateHitnoRules(['hitno', 'promet'], now, tomorrow);
  expect(result.valid).toBe(true);
});
```

This test passes because it validates TypeScript logic (not DB insertion). The actual DB failure only occurred during INSERT.

### Test Suite Results

```bash
$ npm test

 Test Files  12 passed (12)
      Tests  292 passed (292)
   Duration  1.97s
```

All 292 tests pass.

---

## Commands Run

### 1. Apply Migration

```bash
$ ./scripts/dev-postgres.sh
[INFO] Running migration: 011_add_promet_tag.sql
ALTER TYPE
COMMENT
[INFO] All migrations completed
```

### 2. Verify Enum Values

```bash
$ docker exec mojvis-postgres psql -U postgres -d mojvis -c "SELECT unnest(enum_range(NULL::inbox_tag));"

     unnest
-----------------
 cestovni_promet
 pomorski_promet
 kultura
 opcenito
 hitno
 komiza
 vis
 promet
(8 rows)
```

`'promet'` is now the 8th value in the enum.

### 3. Create Message with promet+hitno

```bash
$ curl -s -X POST http://localhost:3000/admin/inbox \
  -H "Content-Type: application/json" \
  -d '{"title_hr":"Test promet hitno","title_en":"Test promet hitno EN","body_hr":"Test body HR","body_en":"Test body EN","tags":["promet","hitno"],"active_from":"2026-01-09T10:00:00Z","active_to":"2026-01-10T10:00:00Z"}'

{
  "id": "058f8cb8-7306-48de-b1aa-0a5b7fc5050b",
  "title_hr": "Test promet hitno",
  "title_en": "Test promet hitno EN",
  "body_hr": "Test body HR",
  "body_en": "Test body EN",
  "tags": "{promet,hitno}",
  "active_from": "2026-01-09T10:00:00.000Z",
  "active_to": "2026-01-10T10:00:00.000Z",
  "created_at": "2026-01-09T17:42:33.346Z",
  "is_urgent": true,
  ...
}
```

**Result**: HTTP 200, message created successfully.

### 4. Verify in Inbox List

```bash
$ curl -s "http://localhost:3000/inbox?page=1&pageSize=5" \
  -H "x-device-id: test-device" \
  -H "x-user-mode: visitor" | jq '.messages[0]'

{
  "id": "058f8cb8-7306-48de-b1aa-0a5b7fc5050b",
  "title": "Test promet hitno",
  "body": "Test body HR",
  "tags": "{promet,hitno}",
  "is_urgent": true,
  ...
}
```

**Result**: Message appears in inbox list with correct tags.

---

## Manual Verification Checklist

- [x] Migration applies without errors
- [x] Enum now includes 'promet' (verified via psql)
- [x] POST /admin/inbox with `["promet", "hitno"]` returns 200/201
- [x] Created message appears in GET /inbox
- [x] `is_urgent: true` set correctly (because of hitno tag)
- [x] All backend tests pass (292/292)

---

## git diff --name-only

```
backend/src/db/migrations/011_add_promet_tag.sql
docs/PROMET_ENUM_FIX_REPORT.md
```

---

## Conclusion

The `inbox_tag` PostgreSQL enum now includes `'promet'`. Admin can create messages with tags `["promet", "hitno"]` successfully. Deprecated tags `'cestovni_promet'` and `'pomorski_promet'` remain intact for backward compatibility.
