# Transport Staging Repair Runbook

## Issue Summary

Sea lines (602, 612, 9602) return 0 departures for dates outside January-February 2026.

**Root Cause**: All 84 sea departures were incorrectly linked to bus line-01's narrow OFF season (2026-01-01 to 2026-02-22) instead of each line's own full-year seasons.

**Evidence**:
```sql
-- Run on staging to confirm: all sea departures linked to wrong season
SELECT td.line_id, ts.id as season_id, ts.date_from, ts.date_to, COUNT(*)
FROM transport_departures td
JOIN transport_seasons ts ON td.season_id = ts.id
WHERE td.line_id IN (
  SELECT id FROM transport_lines WHERE line_number IN ('602', '612', '9602')
)
GROUP BY td.line_id, ts.id, ts.date_from, ts.date_to;
```

Expected: Multiple seasons per line covering full year.
Actual (before fix): All departures link to `3410dfe6-...` with date_from=2026-01-01, date_to=2026-02-22.

---

## Part A: Pre-Repair Inspection Queries

Run these BEFORE applying the fix to document the broken state.

### A1. Count departures per season for sea lines
```sql
SELECT
  tl.line_number,
  ts.season_type,
  ts.date_from,
  ts.date_to,
  COUNT(td.id) as departure_count
FROM transport_lines tl
JOIN transport_departures td ON td.line_id = tl.id
JOIN transport_seasons ts ON td.season_id = ts.id
WHERE tl.line_number IN ('602', '612', '9602')
GROUP BY tl.line_number, ts.season_type, ts.date_from, ts.date_to
ORDER BY tl.line_number, ts.date_from;
```

### A2. Verify no departures return for October 2026
```sql
SELECT
  tl.line_number,
  td.departure_time,
  ts.date_from,
  ts.date_to
FROM transport_lines tl
JOIN transport_departures td ON td.line_id = tl.id
JOIN transport_seasons ts ON td.season_id = ts.id
WHERE tl.line_number = '612'
  AND '2026-10-01' BETWEEN ts.date_from AND ts.date_to;
-- Expected: 0 rows (broken state)
```

### A3. List all seasons currently in DB
```sql
SELECT
  ts.id,
  ts.season_type,
  ts.year,
  ts.date_from,
  ts.date_to,
  ts.label_hr
FROM transport_seasons ts
ORDER BY ts.year, ts.date_from;
```

---

## Part B: Repair Procedure

### Prerequisites
- Migration 020 applied (allows multiple seasons per type/year)
- Fixed import script deployed (ON CONFLICT by id, date-aware linking)
- Fixed line-612.json committed (valid JSON, no JS comments)

### B1. Apply migration (if not already)
```bash
# From backend directory
cd backend
npx ts-node scripts/run-migrations.ts
# Or via your migration runner
```

### B2. Re-import all affected lines

**Option 1: Full reimport (recommended)**
```bash
cd backend
npx ts-node scripts/transport-import.ts src/data/lines/line-01.json
npx ts-node scripts/transport-import.ts src/data/lines/line-602.json
npx ts-node scripts/transport-import.ts src/data/lines/line-612.json
npx ts-node scripts/transport-import.ts src/data/lines/line-9602.json
```

**Option 2: Targeted reimport (sea lines only)**
```bash
cd backend
npx ts-node scripts/transport-import.ts src/data/lines/line-602.json
npx ts-node scripts/transport-import.ts src/data/lines/line-612.json
npx ts-node scripts/transport-import.ts src/data/lines/line-9602.json
```

### B3. Rollback plan (if needed)

If something goes wrong:
```sql
-- Delete seasons and departures for affected lines, then reimport
DELETE FROM transport_departures
WHERE line_id IN (SELECT id FROM transport_lines WHERE line_number IN ('602', '612', '9602'));

DELETE FROM transport_seasons
WHERE id IN (
  -- Get season IDs that were inserted for these lines
  -- Note: Seasons are line-specific via JSON, so this is safe
);

-- Then reimport from original JSON files (git checkout if needed)
```

---

## Part C: Post-Repair Verification

Run these AFTER the reimport to confirm the fix worked.

### C1. Verify departures now correctly linked to multiple seasons
```sql
SELECT
  tl.line_number,
  ts.season_type,
  ts.date_from,
  ts.date_to,
  COUNT(td.id) as departure_count
FROM transport_lines tl
JOIN transport_departures td ON td.line_id = tl.id
JOIN transport_seasons ts ON td.season_id = ts.id
WHERE tl.line_number IN ('602', '612', '9602')
GROUP BY tl.line_number, ts.season_type, ts.date_from, ts.date_to
ORDER BY tl.line_number, ts.date_from;
-- Expected: Multiple rows per line with seasons covering full year
```

### C2. Verify October 2026 now returns departures
```sql
SELECT
  tl.line_number,
  td.departure_time,
  ts.season_type,
  ts.date_from,
  ts.date_to
FROM transport_lines tl
JOIN transport_departures td ON td.line_id = tl.id
JOIN transport_seasons ts ON td.season_id = ts.id
WHERE tl.line_number = '612'
  AND '2026-10-01' BETWEEN ts.date_from AND ts.date_to
LIMIT 10;
-- Expected: Multiple departures with OFF-b season (Sep-Dec)
```

### C3. API verification (from client or curl)
```bash
# Should return departures for October
curl "https://staging.example.com/api/transport/lines/612/departures?date=2026-10-01"

# Should return departures for each sea line
curl "https://staging.example.com/api/transport/lines/602/departures?date=2026-10-01"
curl "https://staging.example.com/api/transport/lines/9602/departures?date=2026-10-01"
```

---

## Fix Summary

| Component | Before | After |
|-----------|--------|-------|
| Season upsert | `ON CONFLICT (season_type, year)` | `ON CONFLICT (id)` |
| Departure linking | Arbitrary first-match by type+year | Date-aware: find season containing departure.date_from |
| DB constraint | UNIQUE(season_type, year) | No unique constraint (allows OFF-a, OFF-b same year) |
| line-612.json | Invalid (JS comments) | Valid JSON |

**Files changed**:
- `backend/src/db/migrations/020_transport_seasons_multi_per_year.sql`
- `backend/scripts/transport-import.ts`
- `backend/src/data/lines/line-612.json`
