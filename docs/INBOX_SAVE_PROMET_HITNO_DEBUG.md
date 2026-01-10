# Debug Report: Admin Inbox Save Fails for Tags [promet, hitno]

**Date**: 2026-01-09
**Status**: ROOT CAUSE IDENTIFIED

---

## Steps to Reproduce

1. Start backend + admin locally
2. Navigate to Admin → Poruke → Nova poruka
3. Fill in:
   - Title HR: "Test promet hitno"
   - Title EN: "Test promet hitno EN"
   - Body HR: "Test body"
   - Body EN: "Test body EN"
   - Tags: Select "Promet" + "Hitno (urgentno)"
   - Active From: 2026-01-09 10:00
   - Active To: 2026-01-10 10:00
4. Click Save
5. **Result**: Internal server error (500)

---

## Request Payload

```json
{
  "title_hr": "Test promet hitno",
  "title_en": "Test promet hitno EN",
  "body_hr": "Test body HR",
  "body_en": "Test body EN",
  "tags": ["promet", "hitno"],
  "active_from": "2026-01-09T10:00:00Z",
  "active_to": "2026-01-10T10:00:00Z"
}
```

---

## Response

**HTTP Status**: 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Backend Error Log

```
[Admin] Error creating message: error: invalid input value for enum inbox_tag: "promet"
    at pg-pool/index.js:45:11
    at async query (backend/src/lib/database.ts:125:20)
    at async createInboxMessage (backend/src/repositories/inbox.ts:140:18)
    at async Object.<anonymous> (backend/src/routes/admin-inbox.ts:291:23) {
  severity: 'ERROR',
  code: '22P02',
  file: 'enum.c',
  line: '128',
  routine: 'enum_in'
}
```

---

## Root Cause

**The `'promet'` tag does not exist in the PostgreSQL `inbox_tag` enum.**

### Evidence

**Database enum definition** (`backend/src/db/migrations/001_inbox_messages.sql:12-20`):
```sql
CREATE TYPE inbox_tag AS ENUM (
  'cestovni_promet',
  'pomorski_promet',
  'kultura',
  'opcenito',
  'hitno',
  'komiza',
  'vis'
);
```

**Missing**: `'promet'` is NOT in this list.

**TypeScript types** (`admin/src/types/inbox.ts:17-26` and `backend/src/types/inbox.ts:30-39`):
```typescript
export const INBOX_TAGS = [
  'cestovni_promet', // DEPRECATED
  'pomorski_promet', // DEPRECATED
  'promet',          // <-- DEFINED HERE
  'kultura',
  'opcenito',
  'hitno',
  'komiza',
  'vis',
] as const;
```

**Mismatch**: TypeScript defines `'promet'`, but database enum does not include it.

---

## Which Layer Blocks It?

| Layer | Blocks? | Evidence |
|-------|---------|----------|
| Client-side validation | NO | Admin UI allows selecting "Promet" tag |
| Server-side validation | NO | `validateTags()` accepts 'promet' (it's in TypeScript enum) |
| **Database constraint** | **YES** | PostgreSQL `inbox_tag` enum rejects 'promet' with error code 22P02 |

**The block occurs at the database layer** when PostgreSQL tries to insert the tag value into the `inbox_tag[]` column.

---

## Why `vis+hitno` Works But `promet+hitno` Fails

| Tags | In DB Enum? | Result |
|------|-------------|--------|
| `['vis', 'hitno']` | YES, YES | Success (created message) |
| `['promet', 'hitno']` | **NO**, YES | Fail (enum error) |
| `['kultura', 'hitno']` | YES, YES | Success |
| `['opcenito', 'hitno']` | YES, YES | Success |

`'vis'` is in the database enum; `'promet'` is not.

---

## Verification Tests

### Test 1: `promet+hitno` (FAILS)
```bash
curl -s -X POST http://localhost:3000/admin/inbox \
  -H "Content-Type: application/json" \
  -d '{"title_hr":"Test","title_en":"Test","body_hr":"Body","body_en":"Body","tags":["promet","hitno"],"active_from":"2026-01-09T10:00:00Z","active_to":"2026-01-10T10:00:00Z"}'

# Response: {"error":"Internal server error"}
```

### Test 2: `vis+hitno` (SUCCEEDS)
```bash
curl -s -X POST http://localhost:3000/admin/inbox \
  -H "Content-Type: application/json" \
  -d '{"title_hr":"Test","title_en":"Test","body_hr":"Body","body_en":"Body","tags":["vis","hitno"],"active_from":"2026-01-09T10:00:00Z","active_to":"2026-01-10T10:00:00Z"}'

# Response: {"id":"935714d3-c9ef-4f04-916b-b11dd69af5f0",...}
```

---

## Code Locations Checked

| File | Line | What |
|------|------|------|
| `backend/src/db/migrations/001_inbox_messages.sql` | 12-20 | DB enum definition (missing 'promet') |
| `backend/src/types/inbox.ts` | 30-39 | TypeScript INBOX_TAGS (includes 'promet') |
| `admin/src/types/inbox.ts` | 17-26 | Admin TypeScript INBOX_TAGS (includes 'promet') |
| `admin/src/types/inbox.ts` | 34-41 | ACTIVE_INBOX_TAGS for UI (includes 'promet') |
| `backend/src/repositories/inbox.ts` | 140 | createInboxMessage() where insert fails |
| `backend/src/routes/admin-inbox.ts` | 291 | Route handler catching error |

---

## Date Field Parsing Check

**Not the cause.** Dates are correctly parsed:
- Payload: `"active_from": "2026-01-09T10:00:00Z", "active_to": "2026-01-10T10:00:00Z"`
- Both are valid ISO 8601 strings
- `active_to > active_from` (valid window)
- Error occurs before date validation (at tag insertion)

---

## Root Cause Conclusion

**Root Cause (one sentence):**
The PostgreSQL `inbox_tag` enum in migration `001_inbox_messages.sql` was never updated to include `'promet'` when the tag was added to TypeScript types.

**Where it occurs:**
- `backend/src/db/migrations/001_inbox_messages.sql:12-20` (enum definition)
- Error surfaces at `backend/src/repositories/inbox.ts:140` during INSERT

---

## Minimal Fix Options

### Option A: Add 'promet' to database enum (Recommended)

Create a new migration to add the missing enum value:

```sql
-- Migration: XXX_add_promet_to_inbox_tag.sql
ALTER TYPE inbox_tag ADD VALUE 'promet';
```

**Pros**: Clean, minimal change
**Cons**: None

### Option B: Normalize 'promet' to 'cestovni_promet' before DB insert

Modify the repository to map `'promet'` → `'cestovni_promet'` before inserting.

**Pros**: No DB migration needed
**Cons**: Semantic mismatch (promet represents unified transport, not just road)

---

## Recommendation

**Use Option A**: Add a migration to include `'promet'` in the database enum. This is the correct fix because:
1. TypeScript types already define 'promet' as the canonical unified transport tag
2. 'cestovni_promet' and 'pomorski_promet' are documented as DEPRECATED
3. Admin UI shows 'Promet' as the active tag for new messages

---

## Git Status

```bash
$ git status --short docs/INBOX_SAVE_PROMET_HITNO_DEBUG.md
?? docs/INBOX_SAVE_PROMET_HITNO_DEBUG.md

$ git diff --name-only
# (no changes to existing files - this is a new file only)
```
