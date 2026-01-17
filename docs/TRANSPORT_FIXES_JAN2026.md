# Transport Fixes Report - January 2026

## Problem A: Road Transport Bus Line Shows No Departures

### Root Cause
The bus line seed file (`bus-vis-komiza-line01.json`) defined its own season:
- `season-bus-off-2026-01-01_02-22` covering Jan 1 - Feb 22

However, the `getSeasonForDate` function returns seasons by date range, and there were multiple OFF seasons in the database:
1. Bus-specific: Jan 1 - Feb 22 (ID: `3410dfe6...`)
2. Sea line: Jan 1 - May 28 (ID: `824309f0...`)

The API found the sea line's season but bus departures were linked to the bus-specific season, causing a mismatch.

### Fix Applied
1. Removed the `seasons` array from `bus-vis-komiza-line01.json`
2. Re-imported the bus line - now uses shared seasons from DB
3. Departures are correctly linked to the OFF season that `getSeasonForDate` returns

### SQL Evidence
```sql
-- Before fix: bus departures linked to wrong season
SELECT s.id, s.date_from, s.date_to, COUNT(d.id)
FROM transport_departures d
JOIN transport_seasons s ON d.season_id = s.id
WHERE route_id IN (SELECT id FROM transport_routes WHERE line_id = '3568be0b-dea3-5764-abaa-338eb4edbe58')
GROUP BY s.id, s.date_from, s.date_to;

-- Result was: Sep 28 - Dec 31 season (wrong!)

-- After fix: linked to Jan 1 - May 28 season (correct)
```

---

## Problem B: "Polasci Danas" Shows Both Directions

### Root Cause
The `getTodaysDepartures` function returned ALL departures matching the transport type, season, and day type - including arrivals TO the island.

### Fix Applied
Modified `backend/src/repositories/transport.ts`:

```sql
-- Added filter to only include island-origin departures
JOIN transport_stops origin ON r.origin_stop_id = origin.id
WHERE ...
  AND origin.name_hr = 'Vis'
```

### How Filtering Works
- The query joins the `origin` stop via `transport_routes.origin_stop_id`
- Filters to only include departures where `origin.name_hr = 'Vis'`
- This applies to both sea and road transport
- Uses stop ID/name (not line name string matching)

### API Evidence
```bash
# Sea today - ONLY Vis-origin
curl "http://localhost:3000/transport/sea/today?date=2026-01-17"
# Returns: ["Vis → Hvar → Milna → Split"]

# Road today - ONLY Vis-origin
curl "http://localhost:3000/transport/road/today?date=2026-01-17"
# Returns: ["Vis → Komiža"]
```

---

## Database Cleanup

Deleted 3 orphaned duplicate seasons that had no departures linked:
- PRE season `97e9431c...` (duplicate of `11d9ba8a...`)
- HIGH season `cab118b6...` (duplicate of `fd09a077...`)
- POST season `803a9c4c...` (duplicate of `6947a225...`)

```sql
DELETE FROM transport_seasons
WHERE id NOT IN (SELECT DISTINCT season_id FROM transport_departures);
-- Deleted 3 rows
```

---

## Verification Results

| Test | Result |
|------|--------|
| Sea today shows ONLY Vis-origin | ✅ `["Vis → Hvar → Milna → Split"]` |
| Road today shows ONLY Vis-origin | ✅ `["Vis → Komiža"]` |
| Road departures for Jan 17 (SAT) | ✅ 6 departures |
| Sea 9602 OFF season (Jan 17) | ✅ 1 departure |
| Sea 9602 PRE season (June 1) | ✅ 1 departure |
| Sea 9602 HIGH season (Aug 1) | ✅ 1 departure |
| Sea 9602 POST season (Sep 22) | ✅ 1 departure |
| Sea 9602 OFF-B season (Oct 1) | ✅ 1 departure |

---

## Files Changed

1. `backend/src/data/lines/bus-vis-komiza-line01.json`
   - Removed `seasons` array (now empty)
   - Bus line uses shared seasons from DB

2. `backend/src/repositories/transport.ts`
   - Added `JOIN transport_stops origin ON r.origin_stop_id = origin.id`
   - Added `AND origin.name_hr = 'Vis'` filter

---

## Commit
`a6c08b2` - fix(transport): road seasons + island-origin today filter
