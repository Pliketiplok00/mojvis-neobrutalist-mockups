# Transport Departure Markers - Verification Report

**Date**: 2026-01-17
**Branch**: `feat/transport-departure-markers`
**Verified by**: Claude Code (automated verification)

---

## Overview

This feature adds support for per-departure markers (e.g., "*") with route-level explanation notes in the transport timetables.

---

## Step A: Branch & Hygiene

```bash
$ git checkout main && git pull --ff-only
Already on 'main'
Already up to date.

$ git checkout -b feat/transport-departure-markers
Switched to a new branch 'feat/transport-departure-markers'
```

**Status**: PASSED

---

## Step B: Schema Change Verification

### Before Migration

```bash
$ docker exec mojvis-postgres psql -U postgres -d mojvis -c "\d transport_departures"
# Output confirmed NO marker column present

$ docker exec mojvis-postgres psql -U postgres -d mojvis -c "\d transport_routes"
# Output confirmed NO marker_note_hr/en columns present
```

### Migration Applied

```bash
$ docker exec -i mojvis-postgres psql -U postgres -d mojvis < backend/src/db/migrations/016_transport_departure_markers.sql
ALTER TABLE
ALTER TABLE
COMMENT
COMMENT
COMMENT
```

### After Migration

```bash
$ docker exec mojvis-postgres psql -U postgres -d mojvis -c \
  "SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'transport_departures' AND column_name = 'marker'"
 column_name | data_type
-------------+-----------
 marker      | text
(1 row)

$ docker exec mojvis-postgres psql -U postgres -d mojvis -c \
  "SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'transport_routes' AND column_name LIKE 'marker_note%'"
  column_name   | data_type
----------------+-----------
 marker_note_en | text
 marker_note_hr | text
(2 rows)
```

**Status**: PASSED - All marker columns present

---

## Step C: Import CLI Compatibility

### Backward Compatibility (no markers)

```bash
$ pnpm --dir backend transport:import --lineId line-test-b \
    --file src/data/test-lines/line-test-b.json --dry-run

Processing: line-test-b (Test Linija B)
Validating... Validation passed
Summary for line-test-b:
  Action: CREATE
  Routes: 1
  Departures: 1
DRY-RUN complete. No changes made.
```

### With Markers

```bash
$ pnpm --dir backend transport:import --lineId line-test-a \
    --file src/data/test-lines/line-test-a.json --dry-run

Processing: line-test-a (Test Linija A)
Validating... Validation passed
Summary for line-test-a:
  Action: REPLACE
  Routes: 2
  Departures: 3
DRY-RUN complete. No changes made.
```

**Status**: PASSED - Both formats work correctly

---

## Step D: API Output Verification

### Line Detail Response (marker_note on routes)

```bash
$ curl -s "http://localhost:3000/transport/sea/lines/af7bb3f6-0d12-5cc7-aa86-f7f4aa123ef3"
```

```json
{
  "routes": [{
    "direction_label": "A1 → A2",
    "marker_note": "* samo radnim danom"
  }]
}
```

### Departures Response (marker on departures)

```bash
$ curl -s "http://localhost:3000/transport/sea/lines/af7bb3f6-0d12-5cc7-aa86-f7f4aa123ef3/departures?date=2026-01-19&direction=0"
```

```json
{
  "marker_note": "* samo radnim danom",
  "departures": [{
    "departure_time": "08:00:00",
    "marker": "*"
  }]
}
```

**Status**: PASSED - API includes marker fields

---

## Step E: Mobile Styling Compliance

### DepartureItem.tsx
- Uses `H2` text primitive (not raw Text)
- Marker appended as text: `{departure.marker ? ` ${departure.marker}` : ''}`
- Compliant with skin/token rules

### LineDetailScreen.tsx
- Uses `Meta` text primitive for marker note
- Styles use tokens: `colors.textSecondary`, `spacing.md`, `spacing.sm`
- Uses `StyleSheet.create` (not inline styles)
- `fontStyle: 'italic'` is established pattern (used in 6 other screens)

**Status**: PASSED - No styling violations

---

## Step F: Tests & Build

### Backend Typecheck
```bash
$ pnpm --dir backend typecheck
> tsc --noEmit
(no errors)
```

### Backend Tests
```bash
$ pnpm --dir backend test
Test Files  16 passed (16)
     Tests  349 passed (349)
```

### Backend Lint
```bash
$ pnpm --dir backend lint
(no errors)
```

**Status**: PASSED - All checks pass

---

## Files Changed

| File | Change |
|------|--------|
| `backend/src/db/migrations/016_transport_departure_markers.sql` | New migration |
| `backend/src/types/transport.ts` | Added marker fields to types |
| `backend/src/repositories/transport.ts` | Updated queries and row types |
| `backend/src/routes/transport.ts` | API responses include markers |
| `backend/scripts/transport-import.ts` | CLI handles marker import |
| `mobile/src/types/transport.ts` | Mobile type definitions |
| `mobile/src/components/DepartureItem.tsx` | Displays marker after time |
| `mobile/src/screens/transport/LineDetailScreen.tsx` | Shows marker note below departures |
| `backend/src/data/test-lines/line-test-a.json` | Test fixture with markers |

---

## Summary

| Step | Description | Result |
|------|-------------|--------|
| A | Branch & hygiene | ✅ PASSED |
| B | Schema change | ✅ PASSED |
| C | Import CLI compatibility | ✅ PASSED |
| D | API output verification | ✅ PASSED |
| E | Mobile styling compliance | ✅ PASSED |
| F | Tests & build | ✅ PASSED |

**MERGE READY**: Yes

---

*Report generated with actual command outputs.*
