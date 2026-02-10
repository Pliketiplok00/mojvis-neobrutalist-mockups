# Transport Seasons Permanent Fix 2026

## Status: READY FOR DEPLOYMENT

Branch: `fix/transport-seasons-permanent`

---

## Executive Summary

This fix permanently eliminates the class of bugs where departures return 0 or duplicates for certain dates due to season linkage issues.

**Root Cause**: Runtime queries filtered departures by season dates, but the import script linked departures to only one season period (LIMIT 1). For disjoint seasons (OFF: Jan-May AND Sep-Dec), this caused Oct-Dec departures to fail date checks.

**Solution**: Make departure-level `date_from`/`date_to` the sole source of truth for date filtering. Remove season-date filtering from runtime queries entirely.

---

## Schema Truth

### transport_departures columns:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `route_id` | UUID | FK to transport_routes |
| `season_id` | UUID | FK to transport_seasons (metadata only, NOT used for date filtering) |
| `day_type` | ENUM | MON, TUE, WED, THU, FRI, SAT, SUN, PRAZNIK |
| `departure_time` | TIME | Departure time |
| `date_from` | DATE | **Start of validity period** (nullable) |
| `date_to` | DATE | **End of validity period** (nullable) |
| `include_dates` | JSONB | Specific dates when departure runs |
| `exclude_dates` | JSONB | Specific dates when departure doesn't run |

### Key Insight:

The `season_id` column remains for metadata/grouping purposes but **DOES NOT** affect date filtering at runtime. Date filtering is done exclusively via `date_from`, `date_to`, `include_dates`, and `exclude_dates`.

---

## Root Cause Analysis

### Problem Chain:

1. **Import Script (LIMIT 1)**: When linking departures to seasons, the importer used `LIMIT 1 ORDER BY date_from`, always selecting the first season period.

2. **Disjoint Seasons**: OFF season is defined as Jan-May AND Sep-Dec (two separate periods). A departure linked to OFF-A (Jan-May) would fail date checks for October dates.

3. **Runtime Season Filter**: The query `$date BETWEEN s.date_from AND s.date_to` would return 0 rows for Oct 15 when the departure was linked to a Jan-May season.

### Evidence:

```
Date: 2026-10-15 (Thursday)
Line 602, direction 0
Expected: 2 departures (05:30, 15:30)
Before fix: 0 departures (season filter failed)
After EXISTS fix: 4 departures (duplicates from PRE season match)
```

---

## Fix Implementation

### 1. Runtime Query Changes (`transport.ts`)

**Before:**
```sql
FROM transport_departures d
JOIN transport_seasons s ON d.season_id = s.id
WHERE d.route_id = $1
  AND d.day_type = $2
  AND $3::DATE BETWEEN s.date_from AND s.date_to  -- REMOVED
```

**After:**
```sql
FROM transport_departures d
WHERE d.route_id = $1
  AND d.day_type = $2
  AND (
    -- Departures with explicit date range
    (d.date_from IS NOT NULL AND d.date_to IS NOT NULL
     AND $3::DATE >= d.date_from AND $3::DATE <= d.date_to)
    OR
    -- Departures with only date_from
    (d.date_from IS NOT NULL AND d.date_to IS NULL AND $3::DATE >= d.date_from)
    OR
    -- Departures with only date_to
    (d.date_from IS NULL AND d.date_to IS NOT NULL AND $3::DATE <= d.date_to)
    OR
    -- Departures with include_dates (filtered in app layer)
    (d.include_dates IS NOT NULL AND d.include_dates != '[]'::jsonb)
    OR
    -- Departures with no date constraints (backward compat)
    (d.date_from IS NULL AND d.date_to IS NULL
     AND (d.include_dates IS NULL OR d.include_dates = '[]'::jsonb))
  )
```

### 2. Importer Changes (`transport-import.ts`)

**Before:**
- Departures without `date_from`/`date_to` linked to first season (`LIMIT 1`)
- Single row inserted per departure

**After:**
- Departures without explicit dates are duplicated for EACH season period
- Each row gets `date_from`/`date_to` populated from the linked season
- Example: OFF departure becomes 2 rows (Jan-May, Sep-Dec)

---

## Files Modified

| File | Changes |
|------|---------|
| `backend/src/repositories/transport.ts` | Removed season-date filtering, use departure dates only |
| `backend/scripts/transport-import.ts` | Duplicate departures for disjoint seasons, populate dates |
| `backend/src/__tests__/transport-date-coverage.test.ts` | New automated verification tests |

---

## Verification Matrix

### Line 602 (Trajekt Vis-Split)

| Date | Day | Season | Expected (dir 0) | Notes |
|------|-----|--------|------------------|-------|
| 2026-01-15 | THU | OFF-A | 2 | Winter schedule |
| 2026-03-15 | SUN | OFF-A | 1+ | Sunday schedule |
| 2026-05-15 | FRI | OFF-A | 2+ | Friday schedule |
| 2026-06-15 | MON | PRE | 2 | Pre-season |
| 2026-06-28 | SUN | PRE | 3 | Weekend pre-season |
| 2026-07-15 | WED | HIGH | 3 | High season |
| 2026-08-15 | SAT | HIGH | 3 | High season weekend |
| **2026-10-15** | **THU** | **OFF-B** | **2** | **PREVIOUSLY FAILING** |
| 2026-11-15 | SUN | OFF-B | 1+ | Sunday schedule |
| 2026-12-01 | TUE | OFF-B | 2 | Winter schedule |
| **2026-12-15** | **TUE** | **OFF-B** | **2** | **PREVIOUSLY FAILING** |
| 2026-12-25 | THU | OFF-B | 0 | Christmas - no service |

### Line 9602 (Katamaran Krilo)

| Date | Day | Season | Expected (dir 0) | Notes |
|------|-----|--------|------------------|-------|
| **2026-10-15** | **THU** | **OFF-B** | **1** | **PREVIOUSLY FAILING** |
| 2026-11-15 | SUN | OFF-B | 1 | Sunday schedule |
| **2026-12-15** | **TUE** | **OFF-B** | **1** | **PREVIOUSLY FAILING** |

---

## Verification Commands

After deployment, run these checks:

```bash
BASE=https://api.mojvis-test.pliketiplok.com
LINE_602=ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8
LINE_9602=e8fb699d-6ddc-5562-be14-57b6a29494f1

# Line 602 - Previously failing dates
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-10-15&direction=0" | jq '.departures | length'
# Expected: 2

curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-12-15&direction=0" | jq '.departures | length'
# Expected: 2

# Line 602 - Working dates (sanity check)
curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-05-15&direction=0" | jq '.departures | length'
# Expected: 2+

curl -s "$BASE/transport/sea/lines/$LINE_602/departures?date=2026-07-15&direction=0" | jq '.departures | length'
# Expected: 3

# Line 9602 - Previously failing dates
curl -s "$BASE/transport/sea/lines/$LINE_9602/departures?date=2026-10-15&direction=0" | jq '.departures | length'
# Expected: 1
```

---

## Automated Tests

Run the date coverage tests:

```bash
cd backend
npm test -- transport-date-coverage
```

This validates:
- All previously failing dates now return departures
- Every day in October has departures
- Every day in December (except 25) has departures
- Data integrity across all line files

---

## Deployment Steps

1. **Pull the branch:**
   ```bash
   git checkout fix/transport-seasons-permanent
   git pull origin fix/transport-seasons-permanent
   ```

2. **Build and deploy:**
   ```bash
   cd backend
   npm run build
   # Deploy via Docker or your standard process
   ```

3. **Re-import data (REQUIRED):**
   ```bash
   npm run transport-import -- --all --dir=src/data/lines
   ```

   This will:
   - Delete existing transport data
   - Re-import with duplicated departures for disjoint seasons
   - Populate `date_from`/`date_to` on all departures

4. **Verify:**
   ```bash
   npm test -- transport-date-coverage
   # Then run curl commands above
   ```

---

## Why This Fix is Permanent

1. **No season-date filtering at runtime**: The query no longer checks if the date falls within a season's date range. This eliminates the disjoint season problem entirely.

2. **Explicit date bounds on all departures**: The importer ensures every departure has `date_from`/`date_to` populated, either from the source JSON or derived from the linked season.

3. **Duplicated rows for disjoint seasons**: A departure for OFF season becomes two rows in the database (one for Jan-May, one for Sep-Dec). Each row has explicit date bounds, making date filtering trivial.

4. **Automated tests**: The `transport-date-coverage.test.ts` file will catch any future regressions by validating departures for every date scenario.

---

## Related Documents

- [QUERY_ROOT_CAUSE_REPORT_2026.md](./QUERY_ROOT_CAUSE_REPORT_2026.md) - Original root cause analysis
- [DATE_PARITY_CHECKLIST_2026.md](./DATE_PARITY_CHECKLIST_2026.md) - Manual verification checklist
- [DISJOINT_SEASONS_FIX_2026.md](./DISJOINT_SEASONS_FIX_2026.md) - Previous partial fix attempt

---

## Date

2026-02-10

## Author

Permanent fix designed and implemented by Claude Code assistant.
