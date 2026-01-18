# Transport Subtype Contract

## Status: ENFORCED

This document defines the **canonical contract** for transport subtype fields.

---

## 1. ROOT CAUSE (Why Subtype Kept Disappearing)

Subtype tags (Trajekt, Katamaran, Brod, Autobus) disappeared **4+ times** after schedule/season changes.

### Exact Failure Mechanism

1. **Subtype is `string | null`** - TypeScript cannot distinguish between "field is null" and "field is missing"

2. **`getTodaysDepartures()` has a ~50-line query** with explicit SELECT list. When developers modify the query for schedule changes, they can forget to include `l.subtype_hr` and `l.subtype_en`

3. **Previous tests checked TYPE existence, not ACTUAL CODE** - Mock objects passed tests even when the actual query omitted subtype

### Architectural Weakness

```
The response type `TodayDepartureItem.subtype` is `string | null`.
TypeScript cannot distinguish between "field is null" and "field is missing".
There were NO tests that verified the actual code includes subtype in queries.
```

---

## 2. CANONICAL FIELDS (Single Source of Truth)

### Database (transport_lines table)
- `subtype_hr: TEXT` - Croatian subtype
- `subtype_en: TEXT` - English subtype

### API Response (localized)
- `subtype: string | null` - Localized based on Accept-Language header

**There is ONE canonical field per language. No aliases. No alternatives.**

---

## 3. ALLOWED VALUES

| HR Value | EN Value | Transport Type |
|----------|----------|----------------|
| Trajekt | Ferry | sea |
| Katamaran | Catamaran | sea |
| Brod | Boat | sea |
| Autobus | Bus | road |

If you need a new subtype, update:
1. `src/__tests__/transport-subtype-contract.test.ts` - Add to `ALLOWED_SUBTYPES_HR/EN`
2. This document
3. Seed data files

---

## 4. WHERE SUBTYPE MUST APPEAR

### Layer 1: Seed Data
- All line JSON files must have `subtype_hr` and `subtype_en`
- Example: `src/data/lines/line-602.json`

### Layer 2: Database
- `transport_lines.subtype_hr`
- `transport_lines.subtype_en`

### Layer 3: Repository
- `getLinesByType()` - Uses `SELECT *`, includes subtype via `rowToLine()`
- `getLineById()` - Uses `SELECT *`, includes subtype via `rowToLine()`
- `getTodaysDepartures()` - **CRITICAL**: Must explicitly SELECT `l.subtype_hr, l.subtype_en`

### Layer 4: Routes
- `/transport/{type}/lines` - Maps `line.subtype_hr/en` to response
- `/transport/{type}/lines/:id` - Maps `line.subtype_hr/en` to response
- `/transport/{type}/today` - Maps `dep.subtype_hr/en` to response

### Layer 5: Types
- `TransportLine.subtype_hr` / `TransportLine.subtype_en`
- `LineListItem.subtype`
- `LineDetailResponse.subtype`
- `TodayDepartureItem.subtype`

---

## 5. CONTRACT ENFORCEMENT

The following tests exist in `src/__tests__/transport-subtype-contract.test.ts`:

### Code Invariant Tests (grep actual source files)
- ✅ `getTodaysDepartures` query MUST include `l.subtype_hr`
- ✅ `getTodaysDepartures` return type MUST include `subtype_hr` and `subtype_en`
- ✅ Transport routes MUST map subtype to response
- ✅ Transport routes MUST include subtype in lines list
- ✅ Transport routes MUST include subtype in line detail

### Type Contract Tests
- ✅ `TodayDepartureItem` MUST include subtype field
- ✅ `LineListItem` MUST include subtype field
- ✅ `LineDetailResponse` MUST include subtype field
- ✅ `TransportLine` MUST include `subtype_hr` and `subtype_en`

### Seed Data Contract Tests
- ✅ Line 602 (Ferry) MUST have `subtype_hr = Trajekt`
- ✅ Line 612 (Boat) MUST have `subtype_hr = Brod`
- ✅ Bus line MUST have `subtype_hr = Autobus`

---

## 6. HOW TO MODIFY TRANSPORT QUERIES

When editing `getTodaysDepartures()` or any transport query:

1. **DO NOT remove existing SELECT fields** without checking tests
2. **Run `npm test` before committing** - Contract tests will fail if subtype is missing
3. **If tests fail**, re-add `l.subtype_hr, l.subtype_en` to the SELECT clause

---

## 7. VERIFICATION

After any transport change, verify subtype is present:

```bash
# Check sea today endpoint
curl -s "http://localhost:3000/transport/sea/today" | jq '.departures[0] | {subtype}'

# Check road today endpoint
curl -s "http://localhost:3000/transport/road/today" | jq '.departures[0] | {subtype}'

# Check lines endpoint
curl -s "http://localhost:3000/transport/sea/lines" | jq '.lines[0] | {subtype}'

# Check line detail endpoint
curl -s "http://localhost:3000/transport/sea/lines/ccf3d0cc-ce3a-5fc8-9d83-4ebef16e37e8" | jq '{subtype}'
```

All must return `"subtype": "Trajekt"` (or appropriate value), NOT `null` for lines that have subtypes.

---

## 8. WHY THIS CANNOT REGRESS AGAIN

1. **Tests grep the actual source code** - Not mock objects
2. **Tests verify subtype appears N times** - Can't be accidentally removed
3. **Tests check seed data** - Source of truth is validated
4. **Tests are part of CI** - Will fail before merge

If someone removes subtype from the query, the test `getTodaysDepartures query MUST include l.subtype_hr` will fail with:

```
expect(repoCode).toContain('l.subtype_hr')
```

This is a **code invariant**, not a runtime check. It cannot be bypassed by mocking.
