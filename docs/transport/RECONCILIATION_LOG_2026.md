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

### [PENDING] STEP 1: Line 9602 Corrections

_Manifest to be produced before any edits._

### [PENDING] STEP 2: Line 659 Creation

_VIS-only routes with summer date bounds._

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
