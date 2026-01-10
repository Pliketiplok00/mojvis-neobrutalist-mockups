# Inbox Tags API Fix Report

**Date:** 2026-01-09
**Issue:** API contract violation - `tags` field returned as PostgreSQL string instead of JSON array

---

## Root Cause Summary

The `/inbox` API endpoint was returning the `tags` field in PostgreSQL array string format (`"{promet,hitno}"`) instead of the required JSON array format (`["promet", "hitno"]`).

This occurred because the `node-postgres` (pg) library does not automatically parse PostgreSQL enum arrays into JavaScript arrays. The `tags` column is defined as `inbox_tag[]` (an array of custom enum type), and without explicit casting, the driver returns the raw PostgreSQL text representation of the array.

---

## Exact Fix Applied

**Approach:** SQL-level fix using `tags::text[] AS tags` cast in all SELECT and RETURNING clauses.

This ensures the PostgreSQL driver receives a standard text array type, which it correctly parses into a JavaScript array. No string parsing logic is needed in application code.

---

## SQL Before / After

### Before
```sql
SELECT id, title_hr, title_en, body_hr, body_en, tags,
       active_from, active_to, created_at, updated_at, created_by, deleted_at,
       is_locked, pushed_at, pushed_by
FROM inbox_messages
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $1 OFFSET $2
```

### After
```sql
SELECT id, title_hr, title_en, body_hr, body_en, tags::text[] AS tags,
       active_from, active_to, created_at, updated_at, created_by, deleted_at,
       is_locked, pushed_at, pushed_by
FROM inbox_messages
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT $1 OFFSET $2
```

---

## Files Changed

| File | Change |
|------|--------|
| `backend/src/repositories/inbox.ts` | Added `::text[]` cast to `tags` column in 10 SQL queries |
| `backend/src/__tests__/inbox.test.ts` | Added regression test for tags array type |

**No other files or features were modified.**

---

## Test Evidence

### Backend Test Command + Result

```
$ cd backend && npm test

 RUN  v1.6.1 /Volumes/plix/PLIX/RADNO/APPS/MOJVIS/mojvis-neobrutalist-mockups/backend

 ✓ src/__tests__/hitno-validation.test.ts  (14 tests) 10ms
 ✓ src/__tests__/menu-extras.test.ts  (19 tests) 15ms
 ✓ src/__tests__/transport-validation.test.ts  (20 tests) 46ms
 ✓ src/__tests__/eligibility.test.ts  (61 tests) 32ms
 ✓ src/__tests__/reminder-generation.test.ts  (7 tests) 73ms
 ✓ src/__tests__/push.test.ts  (45 tests) 34ms
 ✓ src/__tests__/inbox.test.ts  (11 tests) 58ms
 ✓ src/__tests__/events.test.ts  (16 tests) 58ms
 ✓ src/__tests__/static-pages.test.ts  (32 tests) 64ms
 ✓ src/__tests__/health.test.ts  (3 tests) 35ms
 ✓ src/__tests__/click-fix.test.ts  (41 tests) 54ms
 ✓ src/__tests__/feedback.test.ts  (24 tests) 57ms

 Test Files  12 passed (12)
      Tests  293 passed (293)
   Start at  19:36:20
   Duration  1.21s
```

### Curl Output (Raw + jq)

**Command:**
```bash
curl -s "http://localhost:3000/inbox?page=1&page_size=5" \
  -H "X-Device-ID: test-device" \
  -H "X-User-Mode: visitor" \
  -H "Accept-Language: hr" | jq '.messages[0].tags, (.messages[0].tags | type)'
```

**Output:**
```json
[
  "promet",
  "hitno"
]
"array"
```

**Full API Response (first message):**
```json
{
  "messages": [
    {
      "id": "058f8cb8-7306-48de-b1aa-0a5b7fc5050b",
      "title": "Test promet hitno",
      "body": "Test body HR",
      "tags": [
        "promet",
        "hitno"
      ],
      "active_from": "2026-01-09T10:00:00.000Z",
      "active_to": "2026-01-10T10:00:00.000Z",
      "created_at": "2026-01-09T17:42:33.346Z",
      "is_urgent": true
    }
  ],
  "total": 331,
  "page": 1,
  "page_size": 3,
  "has_more": true
}
```

**Type verification across multiple messages:**
```json
[
  {
    "id": "058f8cb8",
    "tags": ["promet", "hitno"],
    "tags_type": "array"
  },
  {
    "id": "14c0e128",
    "tags": [],
    "tags_type": "array"
  },
  {
    "id": "59874532",
    "tags": [],
    "tags_type": "array"
  }
]
```

---

## Regression Test Added

A new test was added to `backend/src/__tests__/inbox.test.ts`:

```typescript
/**
 * REGRESSION TEST: Tags must always be a JSON array, never a string.
 *
 * This test guards against the PostgreSQL enum array serialization bug
 * where tags were returned as "{promet,hitno}" instead of ["promet","hitno"].
 *
 * Fix: SQL queries now use `tags::text[] AS tags` to ensure proper array format.
 */
it('should return tags as a proper array, not a string (regression)', async () => {
  // ... test implementation

  // Tags MUST be an array, never a string like "{promet,hitno}"
  expect(Array.isArray(body.messages[0].tags)).toBe(true);
  expect(typeof body.messages[0].tags).not.toBe('string');
  expect(body.messages[0].tags).toEqual(['promet', 'hitno']);

  // Empty tags should be an empty array, not null or undefined
  expect(Array.isArray(body.messages[1].tags)).toBe(true);
  expect(body.messages[1].tags).toEqual([]);
});
```

This test will **FAIL** if:
- `tags` is not an array
- `tags` is a string (like the old `"{promet,hitno}"` format)
- `tags` is null instead of `[]`

---

## Verification Checklist

- [x] API contract satisfied: `tags` is now `string[]` (JSON array)
- [x] Mobile compatibility guaranteed: No mobile code changes required
- [x] All 293 backend tests pass
- [x] Regression test added to prevent future regressions
- [x] SQL-level fix applied (Option C as mandated)

---

## Statement

**No other files or features were modified.**

The fix was strictly limited to:
1. Casting `tags` column to `text[]` in SQL queries in `backend/src/repositories/inbox.ts`
2. Adding a regression test in `backend/src/__tests__/inbox.test.ts`
