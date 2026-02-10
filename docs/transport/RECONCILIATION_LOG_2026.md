# Transport Data Reconciliation Log 2026

## Overview

This document tracks the reconciliation of transport timetable data between:
- **Canonical source:** `docs/linije - canonical/vis_raspored_2026.json`
- **Repo data:** `backend/src/data/lines/line-*.json`

**Goal:** For any `(date, line_id, direction)` in 2026, runtime output must exactly match canonical data.

**Branch:** `transport/canonical-reconciliation-2026`

---

## 1. Initial State

### 1.1 Existing Line Files

| File | Line ID | Status |
|------|---------|--------|
| `line-602.json` | 602 | Exists, seasons OK by design (global) |
| `line-612.json` | 612 | Exists, no confirmed data errors |
| `line-9602.json` | 9602 | Exists, VERIFIED STOP PATTERN ERRORS |
| `line-659.json` | 659 | MISSING (new line, expected) |
| `line-01.json` | 01 | Exists, NOT IN CANONICAL SCOPE |

### 1.2 Known Mismatches (Pre-Reconciliation)

#### Line 9602 - Stop Pattern Errors

Forensic audit identified stop pattern mismatches where:
- Stops show times when canonical indicates skip (`"—"`)
- Stops show `null` when canonical indicates a time

Affected seasons: OFF, PRE/POST, HIGH
Affected directions: Both (VIS→SPLIT and SPLIT→VIS)

#### Line 659 - Does Not Exist

Line 659 (Jadrolinija katamaran, summer-only) has no repo file.
- Canonical shows 6 departure patterns
- Per constraints, only 4 are VIS-relevant (Bol-only routes excluded)

### 1.3 Constraints Applied

| Constraint | Application |
|------------|-------------|
| VIS-relevance only | Line 659 excludes SPLIT↔BOL-only routes |
| Pricing ignored | No pricing data modeled |
| Seasons internal-only | `date_from`/`date_to` is authoritative for runtime |
| Holidays | Using existing `backend/src/lib/holidays.ts` |

---

## 2. Change Log

### [COMPLETED] STEP 1: Line 9602 Corrections

**Date:** 2026-02-10
**Files:** `backend/src/data/lines/line-9602.json`
**Commits:**
- `7cb5f68` - docs(9602): add correction manifest before applying fixes
- `e6841d7` - fix(9602): correct all 26 stop pattern errors

**Canonical rules implemented:**
- VIS → SPLIT (Route 0):
  - PON/ČET/PET/SUB: Direct service (skip HVAR, skip MILNA)
  - UTORAK: All stops (HVAR 07:45, MILNA 08:00)
  - SRIJEDA: Skip HVAR, stop at MILNA (08:00)
- SPLIT → VIS (Route 1):
  - PON/ČET/SUB (OFF): All stops
  - PON/ČET/SUB (PRE/POST): All stops (MILNA 16:35, HVAR 16:55)
  - UTORAK: Skip MILNA, stop at HVAR
  - SRIJEDA: Stop at MILNA, skip HVAR

**Changes made:**
- 12 departures corrected in Route 0
- 14 departures corrected in Route 1
- All corrections documented in `docs/transport/9602_CORRECTION_MANIFEST.md`

**Verification:**
```bash
# Route 0 OFF TUE - Expected: ["07:00", "07:45", "08:00", "08:35"]
jq '.lines[0].routes[0].departures[] | select(.day_type == "TUE" and .season_type == "OFF") | .stop_times' backend/src/data/lines/line-9602.json
# Result: PASS
```

### [COMPLETED] STEP 2: Line 659 Creation

**Date:** 2026-02-10
**Files:** `backend/src/data/lines/line-659.json` (NEW)
**Commits:**
- `efd04db` - feat(659): add VIS-only summer catamaran line

**Canonical rules implemented:**
- Summer-only operation: 2026-06-19 to 2026-09-13
- SPLIT → VIS route with 2 departure patterns
- VIS → SPLIT route with 2 departure patterns

**VIS-relevance constraint applied:**
Excluded Bol-only routes that never touch Vis:
- SPLIT → BOL 13:00→14:00 (terminates at Bol) - EXCLUDED
- BOL → SPLIT 14:15→15:15 (originates at Bol) - EXCLUDED

**Included VIS-relevant departures:**
| Route | Departure | Stop Pattern |
|-------|-----------|--------------|
| SPLIT→VIS | 07:30 (I) | Skip Bol, stop Hvar 08:45, arrive Vis 09:25 |
| SPLIT→VIS | 15:30 (III) | All stops: Bol 16:45, Hvar 17:45, Vis 18:20 |
| VIS→SPLIT | 10:10 (I) | All stops: Hvar 11:10, Bol 12:10, Split 13:10 |
| VIS→SPLIT | 19:35 (III) | Skip Bol, stop Hvar 20:30, arrive Split 21:35 |

**New stop introduced:**
- `stop-bol-port` (Bol) - required for intermediate stop patterns

### [PENDING] STEP 3: Date Exception Encoding

_All special dates from canonical._

### [PENDING] STEP 4: Global Validation

_Representative date testing._

---

## 3. Decisions

### 3.1 Sub-Period Modeling

_To be documented when implemented._

### 3.2 Date Exception Encoding Strategy

| Exception Type | Encoding Method |
|----------------|-----------------|
| Full line blackout | `exclude_dates` on ALL departures for that line |
| Specific departure cancellation | `exclude_dates` on that departure only |
| Replacement schedule | New departure with `include_dates` for that date |

### 3.3 Disjoint Date Ranges

When canonical requires the same departure to operate in multiple disjoint periods:
- Create separate departure records
- Each record has its own `date_from`/`date_to`
- Do NOT invent multi-range fields

---

## 4. Validation Evidence

_To be added after each step._

---

## 5. Appendix: Canonical Reference

### Day Type Mapping

| Canonical | Repo |
|-----------|------|
| PON | MON |
| UTO / UTORAK | TUE |
| SRI / SRIJEDA | WED |
| ČET | THU |
| PET / PETAK | FRI |
| SUB | SAT |
| NED / NEDJELJA | SUN |
| BLAGDAN / BLAG | PRAZNIK |

### Stop ID Reference

_To be verified per line._
