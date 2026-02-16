# Transport Query Root Cause Report: Missing Departures

## Thesis Verdict

**CONFIRMED** - The API query logic is incorrect. Multiple issues cause departures to be missing.

---

## Executive Summary

The transport API returns 0 departures for multiple dates when the canonical schedule indicates service should exist. The root cause is a **season linking bug in the import script** combined with the API's date-based season filtering.

---

## Evidence Pack (6+ Problematic Dates)

### Line 602 (Trajekt Vis-Split) - Expected to operate EVERY DAY

| Date | Day | API Result | Canonical Expected | Status |
|------|-----|------------|-------------------|--------|
| 2026-05-15 | FRI | 3+3 deps | 3+3 | PASS |
| **2026-06-15** | **MON** | **0+0** | **2+2** (PRE season) | **FAIL** |
| 2026-07-15 | WED | 3+3 deps | 3+3 | PASS |
| **2026-08-15** | **PRAZNIK** | 3+3 deps | 3+3 | PASS |
| 2026-09-15 | TUE | 2+2 deps | 2+2 | PASS |
| **2026-10-15** | **THU** | **0+0** | **2+2** (OFF season) | **FAIL** |
| 2026-11-15 | SUN | 1+1 deps | 1+1 | PASS |
| **2026-12-15** | **TUE** | **0+0** | **2+2** (OFF season) | **FAIL** |

### Line 9602 (Katamaran Krilo) - Similar Pattern

| Date | Day | API Result | Canonical Expected | Status |
|------|-----|------------|-------------------|--------|
| 2026-10-15 | THU | 0+0 | 1+1 (OFF-B season) | FAIL |
| 2026-12-15 | TUE | 0+0 | 1+1 (OFF-B season) | FAIL |

---

## Root Cause Analysis

### Issue 1: LIMIT 1 Season Linking in Import Script

**Location:** `backend/scripts/transport-import.ts:906-920`

```typescript
// Line doesn't provide seasons - must exist in DB from another line
const seasonResult = await client.query(
  `SELECT id, date_from, date_to FROM transport_seasons
   WHERE season_type = $1 AND year = $2
   ORDER BY date_from
   LIMIT 1`,  // <-- BUG: Only gets FIRST season!
  [dep.season_type, year]
);
seasonUuid = seasonResult.rows[0].id;
```

**Impact:**
- Canonical defines DISJOINT OFF season: `01.01–28.05 & 28.09–31.12` (two periods)
- Line 9602 correctly defines two OFF seasons:
  - `season-9602-2026-off-a`: 2026-01-01 to 2026-05-28
  - `season-9602-2026-off-b`: 2026-09-28 to 2026-12-31
- Line 602 has NO seasons array, relies on DB seasons
- Import script uses `LIMIT 1` → always links to first OFF season (Jan-May)
- Result: October-December OFF departures linked to Jan-May season

### Issue 2: API Date Filtering

**Location:** `backend/src/repositories/transport.ts:341-344`

```typescript
FROM transport_departures d
JOIN transport_seasons s ON d.season_id = s.id
WHERE d.route_id = $1
  AND d.day_type = $2
  AND $3::DATE BETWEEN s.date_from AND s.date_to  // <-- Filtering
```

**Impact:**
- For October 15, the query checks: Is `2026-10-15` BETWEEN `2026-01-01` AND `2026-05-28`?
- Answer: NO
- Result: 0 departures returned despite data existing

### Issue 3: Missing POST Season Handling for Line 602

Line 602's JSON has no POST season departures, but canonical shows PRE operates `29.05–02.07 & 21.09–27.09` (disjoint). Similar LIMIT 1 issue applies.

---

## Canonical vs Database Season Structure

### Canonical (vis_raspored_2026.json)

```
Line 602: IZVANSEZONA  01.01.–28.05. & 28.09.–31.12.  ← TWO PERIODS
Line 9602: IZVANSEZONA  01.01.–28.05. & 28.09.–31.12. ← TWO PERIODS
```

### Database (line-9602.json seasons)

```json
{
  "id": "season-9602-2026-off-a",
  "season_type": "OFF",
  "date_from": "2026-01-01",
  "date_to": "2026-05-28"
},
{
  "id": "season-9602-2026-off-b",
  "season_type": "OFF",
  "date_from": "2026-09-28",
  "date_to": "2026-12-31"
}
```

**Problem:** Two OFF seasons exist, but departures without explicit `date_from/date_to` get linked only to the first one.

---

## Proposed Minimal Fix

### Option A: Add seasons array to line-602.json (Data Fix)

Add explicit seasons to line-602.json matching the canonical periods:

```json
"seasons": [
  {
    "id": "season-602-2026-off-a",
    "season_type": "OFF",
    "year": 2026,
    "date_from": "2026-01-01",
    "date_to": "2026-05-28",
    "label_hr": "Izvan sezone",
    "label_en": "Off season"
  },
  {
    "id": "season-602-2026-off-b",
    "season_type": "OFF",
    "year": 2026,
    "date_from": "2026-09-28",
    "date_to": "2026-12-31",
    "label_hr": "Izvan sezone",
    "label_en": "Off season"
  }
]
```

**Pros:** No code changes, matches how line-9602 works
**Cons:** Requires re-import, duplicates season definitions

### Option B: Duplicate departures for each season period (Data Fix)

For departures without `date_from/date_to`, create duplicate entries for each season period:

```json
{"day_type":"THU","season_type":"OFF","departure_time":"05:30",...,"date_from":"2026-01-01","date_to":"2026-05-28"},
{"day_type":"THU","season_type":"OFF","departure_time":"05:30",...,"date_from":"2026-09-28","date_to":"2026-12-31"}
```

**Pros:** Explicit, unambiguous
**Cons:** Doubles the departure count, harder to maintain

### Option C: Fix import script to link to ALL matching seasons (Code Fix)

Remove `LIMIT 1` and create multiple departure rows:

```typescript
const seasonResults = await client.query(
  `SELECT id FROM transport_seasons
   WHERE season_type = $1 AND year = $2
   ORDER BY date_from`,
  [dep.season_type, year]
);

for (const seasonRow of seasonResults.rows) {
  await client.query(`INSERT INTO transport_departures...`, [
    routeUuid,
    seasonRow.id,  // Link to each season
    ...
  ]);
}
```

**Pros:** Fixes root cause, no data duplication needed
**Cons:** Requires code change and re-import

### Recommended Fix: Option A (Data Fix)

Add seasons array to line-602.json, then re-import. This is the minimal change that follows the existing pattern (line-9602 already works this way).

---

## Regression Checks

After fix, verify these dates return non-zero departures:

1. `curl ".../transport/sea/lines/{602-id}/departures?date=2026-06-15&direction=0"` → >0 deps
2. `curl ".../transport/sea/lines/{602-id}/departures?date=2026-10-15&direction=0"` → >0 deps
3. `curl ".../transport/sea/lines/{602-id}/departures?date=2026-12-15&direction=0"` → >0 deps
4. `curl ".../transport/sea/today?date=2026-10-15"` → includes line 602 departures
5. `curl ".../transport/sea/today?date=2026-12-15"` → includes line 602 departures

---

## Files Referenced

| File | Purpose |
|------|---------|
| `backend/scripts/transport-import.ts:906-920` | LIMIT 1 season linking bug |
| `backend/src/repositories/transport.ts:341-344` | Date-based season filtering |
| `backend/src/data/lines/line-602.json` | Missing seasons array |
| `backend/src/data/lines/line-9602.json` | Reference for correct season structure |
| `docs/linije - canonical/vis_raspored_2026.json` | Canonical schedule source |

---

## Conclusion

The thesis is **CONFIRMED**. The import script's `LIMIT 1` when linking departures to seasons causes departures without explicit date ranges to only link to the first season of that type. When combined with the API's date-based filtering, this results in 0 departures for dates in the second half of disjoint season periods (October-December for OFF season).

**Recommended action:** Add seasons array to line-602.json and re-import.
