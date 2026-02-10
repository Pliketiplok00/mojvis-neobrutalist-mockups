# Line 602 Seasons Fix Verification

## Status: VERIFIED (Dry-Run)

**Date**: 2026-02-10
**Branch**: `fix/transport-seasons-permanent`

---

## Problem Statement

Line 602 (Trajekt Vis-Split) was missing explicit season definitions in its JSON file. During import, the importer would query the database for seasons by `season_type`, potentially picking up seasons from other lines that had already been imported (due to alphabetical import order).

This caused incorrect `date_from`/`date_to` values to be assigned to departures, resulting in 0 departures returned for Oct-Dec dates (OFF-B season period).

---

## Fix Applied

### Task 1: Add Explicit Seasons to line-602.json

Added seasons array with 5 season periods covering all of 2026:

| Season ID | Season Type | Date From | Date To | Label |
|-----------|-------------|-----------|---------|-------|
| `season-602-2026-off-a` | OFF | 2026-01-01 | 2026-05-28 | Izvan sezone |
| `season-602-2026-pre` | PRE | 2026-05-29 | 2026-07-02 | Predsezona |
| `season-602-2026-high` | HIGH | 2026-07-03 | 2026-09-20 | Sezona |
| `season-602-2026-post` | POST | 2026-09-21 | 2026-09-27 | Posezona |
| `season-602-2026-off-b` | OFF | 2026-09-28 | 2026-12-31 | Izvan sezone |

**Key Insight**: OFF season is now explicitly split into two periods:
- OFF-A: Jan 1 - May 28
- OFF-B: Sep 28 - Dec 31

This ensures departures with `season_type: "OFF"` are correctly duplicated for both periods during import.

---

## Verification Steps

### 1. Dry-Run Import Validation

```bash
cd backend
npm run transport:import -- --lineId 602 --file src/data/lines/line-602.json --dry-run
```

**Result**: PASS

```
Summary for 602:
  Action: REPLACE
  Line: Vis – Split
  Routes: 2
  Departures: 133
  Stops referenced: 2
  Would delete: 2 routes, 133 departures, 0 contacts
```

### 2. Full Data Directory Validation

```bash
npm run transport:import -- --all --dir src/data/lines --dry-run
```

**Result**: PASS

All 5 lines validated successfully:
- line-01: PASS
- line-602: PASS (133 departures)
- line-612: PASS (86 departures)
- line-659: PASS (32 departures)
- line-9602: PASS (68 departures)

### 3. TypeScript Build

```bash
npm run build
```

**Result**: PASS

Build completes without errors after excluding `src/__tests__` from tsconfig.

---

## Deployment Instructions

Since no local database is configured, the actual import must run on staging/production:

```bash
# On staging server
cd /app/backend
npm run transport:import -- --all --dir src/data/lines
```

### Expected Post-Import Verification

After running the import on staging, verify with these curl commands:

```bash
BASE=https://api.mojvis-test.pliketiplok.com
LINE_602=ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8

# October (OFF-B) - PREVIOUSLY FAILING
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-10-15&direction=0" | jq '.departures | length'
# Expected: 2

# December (OFF-B) - PREVIOUSLY FAILING
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-12-15&direction=0" | jq '.departures | length'
# Expected: 2

# January (OFF-A) - Sanity check
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-01-15&direction=0" | jq '.departures | length'
# Expected: 2

# July (HIGH) - Sanity check
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-07-15&direction=0" | jq '.departures | length'
# Expected: 3
```

---

## Files Modified

| File | Change |
|------|--------|
| `backend/src/data/lines/line-602.json` | Added explicit seasons array with 5 periods for 2026 |
| `backend/tsconfig.json` | Excluded `src/__tests__` from build (tests don't need to compile for prod) |
| `backend/src/__tests__/transport-date-coverage.test.ts` | Fixed TypeScript type annotations |

---

## Commits

| Commit | Description |
|--------|-------------|
| `3162ba0` | data(transport): add explicit seasons for line 602 (2026) |
| (pending) | build(tsconfig): exclude tests from production build |

---

## Verdict

**DRY-RUN VERIFICATION: PASS**

The data changes are validated and ready for deployment. The actual database import must be executed on the target environment (staging/production) after merging this branch.

---

## Related Documents

- [SEASONS_PERMANENT_FIX_2026.md](./SEASONS_PERMANENT_FIX_2026.md) - Overall fix design
- [QUERY_ROOT_CAUSE_REPORT_2026.md](./QUERY_ROOT_CAUSE_REPORT_2026.md) - Root cause analysis

---

## Author

Claude Code assistant
