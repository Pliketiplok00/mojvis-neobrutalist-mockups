# Line 9602 Correction Manifest

## Overview

This manifest documents every data correction required for Line 9602 (Krilo katamaran) to match canonical source.

**Stop order reference:**
- Route 0 (VIS → SPLIT): `[VIS, HVAR, MILNA, SPLIT]` (indices 0,1,2,3)
- Route 1 (SPLIT → VIS): `[SPLIT, MILNA, HVAR, VIS]` (indices 0,1,2,3)

**Canonical column mapping:**
- Canonical always shows columns as `[VIS, HVAR, MILNA (Brač), SPLIT]`
- For VIS→SPLIT: columns are departure order
- For SPLIT→VIS: columns are arrival order (SPLIT=departure, VIS=final arrival)

---

## Route 0: VIS → SPLIT

### OFF Season (IZVANSEZONA)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | VIS=07:00, HVAR=—, MILNA=—, SPLIT=08:10 | `["07:00", "07:40", null, "08:10"]` | `["07:00", null, null, "08:10"]` | idx[1]: "07:40"→null |
| THU | same | `["07:00", "07:40", null, "08:10"]` | `["07:00", null, null, "08:10"]` | idx[1]: "07:40"→null |
| FRI | same | `["07:00", "07:40", null, "08:10"]` | `["07:00", null, null, "08:10"]` | idx[1]: "07:40"→null |
| SAT | same | `["07:00", "07:40", null, "08:10"]` | `["07:00", null, null, "08:10"]` | idx[1]: "07:40"→null |
| TUE | VIS=07:00, HVAR=07:45, MILNA=08:00, SPLIT=08:35 | `["07:00", "07:40", null, "08:35"]` | `["07:00", "07:45", "08:00", "08:35"]` | idx[1]: "07:40"→"07:45", idx[2]: null→"08:00" |
| WED | VIS=07:00, HVAR=—, MILNA=08:00, SPLIT=08:30 | `["07:00", "07:55", null, "08:30"]` | `["07:00", null, "08:00", "08:30"]` | idx[1]: "07:55"→null, idx[2]: null→"08:00" |
| SUN | VIS=18:00, HVAR=—, MILNA=—, SPLIT=19:10 | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |
| PRAZNIK | same | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |

**OFF Season Route 0 Summary: 6 departures need correction**

### PRE Season (NISKA - first period)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | VIS=07:00, HVAR=—, MILNA=—, SPLIT=08:10 | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| THU | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| FRI | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| SAT | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| TUE | VIS=07:05, HVAR=07:55, MILNA=08:00, SPLIT=08:45 | `["07:05", "07:45", null, "08:45"]` | `["07:05", "07:55", "08:00", "08:45"]` | idx[1]: "07:45"→"07:55", idx[2]: null→"08:00" |
| WED | VIS=07:00, HVAR=—, MILNA=08:00, SPLIT=08:30 | `["07:00", "07:55", null, "08:30"]` | `["07:00", null, "08:00", "08:30"]` | idx[1]: "07:55"→null, idx[2]: null→"08:00" |
| SUN | VIS=19:00, HVAR=—, MILNA=—, SPLIT=20:10 | `["19:00", null, null, "20:10"]` | `["19:00", null, null, "20:10"]` | ✓ CORRECT |
| PRAZNIK | same | `["19:00", null, null, "20:10"]` | `["19:00", null, null, "20:10"]` | ✓ CORRECT |

**PRE Season Route 0 Summary: 2 departures need correction**

### HIGH Season (VISOKA)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | VIS=07:00, HVAR=—, MILNA=—, SPLIT=08:10 | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| THU | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| FRI | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| SAT | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| SUN | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| TUE | VIS=07:05, HVAR=07:55, MILNA=08:00, SPLIT=08:45 | `["07:05", "07:45", null, "08:45"]` | `["07:05", "07:55", "08:00", "08:45"]` | idx[1]: "07:45"→"07:55", idx[2]: null→"08:00" |
| WED | VIS=07:00, HVAR=—, MILNA=08:00, SPLIT=08:30 | `["07:00", "07:55", null, "08:30"]` | `["07:00", null, "08:00", "08:30"]` | idx[1]: "07:55"→null, idx[2]: null→"08:00" |

**HIGH Season Route 0 Summary: 2 departures need correction**

### POST Season (NISKA - second period)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | VIS=07:00, HVAR=—, MILNA=—, SPLIT=08:10 | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| THU | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| FRI | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| SAT | same | `["07:00", null, null, "08:10"]` | `["07:00", null, null, "08:10"]` | ✓ CORRECT |
| TUE | VIS=07:05, HVAR=07:55, MILNA=08:00, SPLIT=08:45 | `["07:05", "07:45", null, "08:45"]` | `["07:05", "07:55", "08:00", "08:45"]` | idx[1]: "07:45"→"07:55", idx[2]: null→"08:00" |
| WED | VIS=07:00, HVAR=—, MILNA=08:00, SPLIT=08:30 | `["07:00", "07:55", null, "08:30"]` | `["07:00", null, "08:00", "08:30"]` | idx[1]: "07:55"→null, idx[2]: null→"08:00" |
| SUN | VIS=19:00, HVAR=—, MILNA=—, SPLIT=20:10 | `["19:00", null, null, "20:10"]` | `["19:00", null, null, "20:10"]` | ✓ CORRECT |
| PRAZNIK | same | `["19:00", null, null, "20:10"]` | `["19:00", null, null, "20:10"]` | ✓ CORRECT |

**POST Season Route 0 Summary: 2 departures need correction**

---

## Route 1: SPLIT → VIS

### OFF Season (IZVANSEZONA)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | SPLIT=15:00, MILNA=15:35, HVAR=15:55, VIS=16:10 | `["15:00", "15:35", "15:55", "16:10"]` | `["15:00", "15:35", "15:55", "16:10"]` | ✓ CORRECT |
| THU | same | `["15:00", "15:35", "15:55", "16:10"]` | `["15:00", "15:35", "15:55", "16:10"]` | ✓ CORRECT |
| SAT | same | `["15:00", "15:35", "15:55", "16:10"]` | `["15:00", "15:35", "15:55", "16:10"]` | ✓ CORRECT |
| TUE | SPLIT=15:00, MILNA=—, HVAR=15:55, VIS=16:35 | `["15:00", "15:30", "15:50", "16:35"]` | `["15:00", null, "15:55", "16:35"]` | idx[1]: "15:30"→null, idx[2]: "15:50"→"15:55" |
| WED | SPLIT=15:00, MILNA=15:35, HVAR=—, VIS=16:30 | `["15:00", "15:35", "15:50", "16:30"]` | `["15:00", "15:35", null, "16:30"]` | idx[2]: "15:50"→null |
| FRI | SPLIT=20:30, MILNA=—, HVAR=—, VIS=21:40 | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |
| SUN (winter) | SPLIT=20:30, MILNA=—, HVAR=—, VIS=21:40 | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |
| SUN (spring/fall) | SPLIT=19:30, MILNA=—, HVAR=—, VIS=20:40 | `["19:30", null, null, "20:40"]` | `["19:30", null, null, "20:40"]` | ✓ CORRECT |

**OFF Season Route 1 Summary: 2 departures need correction**

### PRE Season (NISKA - first period)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | SPLIT=16:00, MILNA=16:35, HVAR=16:55, VIS=17:10 | `["16:00", null, null, "17:10"]` | `["16:00", "16:35", "16:55", "17:10"]` | idx[1]: null→"16:35", idx[2]: null→"16:55" |
| THU | same | `["16:00", null, null, "17:10"]` | `["16:00", "16:35", "16:55", "17:10"]` | idx[1]: null→"16:35", idx[2]: null→"16:55" |
| SAT | same | `["16:00", null, null, "17:10"]` | `["16:00", "16:35", "16:55", "17:10"]` | idx[1]: null→"16:35", idx[2]: null→"16:55" |
| TUE | SPLIT=16:00, MILNA=—, HVAR=16:55, VIS=17:35 | `["16:00", null, "16:50", "17:35"]` | `["16:00", null, "16:55", "17:35"]` | idx[2]: "16:50"→"16:55" |
| WED | SPLIT=16:00, MILNA=16:35, HVAR=—, VIS=17:30 | `["16:00", "16:30", null, "17:30"]` | `["16:00", "16:35", null, "17:30"]` | idx[1]: "16:30"→"16:35" |
| FRI | SPLIT=20:30, MILNA=—, HVAR=—, VIS=21:40 | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |
| SUN | SPLIT=20:30, MILNA=—, HVAR=—, VIS=21:40 | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |
| PRAZNIK | same | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |

**PRE Season Route 1 Summary: 5 departures need correction**

### HIGH Season (VISOKA)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | SPLIT=18:00, MILNA=—, HVAR=—, VIS=19:10 | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |
| THU | same | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |
| FRI | same | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |
| SAT | same | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |
| SUN | same | `["18:00", null, null, "19:10"]` | `["18:00", null, null, "19:10"]` | ✓ CORRECT |
| TUE | SPLIT=20:00, MILNA=—, HVAR=21:00, VIS=21:40 | `["20:00", null, "20:50", "21:40"]` | `["20:00", null, "21:00", "21:40"]` | idx[2]: "20:50"→"21:00" |
| WED | SPLIT=18:00, MILNA=18:35, HVAR=—, VIS=19:30 | `["18:00", "18:30", null, "19:30"]` | `["18:00", "18:35", null, "19:30"]` | idx[1]: "18:30"→"18:35" |

**HIGH Season Route 1 Summary: 2 departures need correction**

### POST Season (NISKA - second period)

| Day Type | Canonical | Current stop_times | Correct stop_times | Errors |
|----------|-----------|-------------------|-------------------|--------|
| MON | SPLIT=16:00, MILNA=16:35, HVAR=16:55, VIS=17:10 | `["16:00", null, null, "17:10"]` | `["16:00", "16:35", "16:55", "17:10"]` | idx[1]: null→"16:35", idx[2]: null→"16:55" |
| THU | same | `["16:00", null, null, "17:10"]` | `["16:00", "16:35", "16:55", "17:10"]` | idx[1]: null→"16:35", idx[2]: null→"16:55" |
| SAT | same | `["16:00", null, null, "17:10"]` | `["16:00", "16:35", "16:55", "17:10"]` | idx[1]: null→"16:35", idx[2]: null→"16:55" |
| TUE | SPLIT=16:00, MILNA=—, HVAR=16:55, VIS=17:35 | `["16:00", null, "16:50", "17:35"]` | `["16:00", null, "16:55", "17:35"]` | idx[2]: "16:50"→"16:55" |
| WED | SPLIT=16:00, MILNA=16:35, HVAR=—, VIS=17:30 | `["16:00", "16:30", null, "17:30"]` | `["16:00", "16:35", null, "17:30"]` | idx[1]: "16:30"→"16:35" |
| FRI | SPLIT=20:30, MILNA=—, HVAR=—, VIS=21:40 | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |
| SUN | SPLIT=20:30, MILNA=—, HVAR=—, VIS=21:40 | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |
| PRAZNIK | same | `["20:30", null, null, "21:40"]` | `["20:30", null, null, "21:40"]` | ✓ CORRECT |

**POST Season Route 1 Summary: 5 departures need correction**

---

## Summary

### Total Corrections Required

| Season | Route 0 | Route 1 | Total |
|--------|---------|---------|-------|
| OFF | 6 | 2 | 8 |
| PRE | 2 | 5 | 7 |
| HIGH | 2 | 2 | 4 |
| POST | 2 | 5 | 7 |
| **TOTAL** | **12** | **14** | **26** |

### Error Patterns

1. **HVAR/MILNA swap** - Route 0 TUE/WED have HVAR showing when should be null (or vice versa), and MILNA null when should have time
2. **Time discrepancies** - Several departures have times off by 5-10 minutes
3. **Missing intermediate stops** - Route 1 PRE/POST MON/THU/SAT marked as direct when should show all stops

---

## Verification Command

After applying fixes, verify with:

```bash
jq '.lines[0].routes[0].departures[] | select(.day_type == "TUE" and .season_type == "OFF") | .stop_times' backend/src/data/lines/line-9602.json
# Expected: ["07:00", "07:45", "08:00", "08:35"]
```
