# Seasonal Helper - Audit and Implementation Plan

## Overview

This document proposes centralizing seasonal line detection to eliminate repeated `line_number === '659'` checks across files.

---

## 1) Inventory: Every Seasonal Logic Occurrence

### Production Code (excluding design-mirror)

| # | File | Line | Snippet | Purpose | Risk if Changed |
|---|------|------|---------|---------|-----------------|
| 1 | `SeaTransportScreen.tsx` | 248 | `line.line_number === '659'` | Show 659 subtitle text | Low - UI only |
| 2 | `SeaTransportScreen.tsx` | 255 | `line.subtype \|\| line.line_number === '659'` | Condition to render badge stack | Medium - affects badge visibility |
| 3 | `SeaTransportScreen.tsx` | 262 | `line.line_number === '659'` | Render seasonal badge | Low - UI only |
| 4 | `LineDetailScreen.tsx` | 84 | `'659': { name: 'Jadrolinija', ... }` | Carrier mapping (NOT seasonal check) | N/A - keep as-is |
| 5 | `LineDetailScreen.tsx` | 295 | `lineDetailData.subtype \|\| lineDetailData.line_number === '659'` | Condition to render badge stack | Medium - affects badge visibility |
| 6 | `LineDetailScreen.tsx` | 302 | `lineDetailData.line_number === '659'` | Render seasonal badge | Low - UI only |

### Translation Keys

| Key | File | Purpose |
|-----|------|---------|
| `transport.seasonal` | `hr.json:180`, `en.json:180` | Badge label ("SEZONSKA"/"SEASONAL") |
| `transport.line659Seasonal` | `hr.json:179`, `en.json:179` | Subtitle text ("Samo sezonski / ljeto 2026") |

### Token References

| Token | File | Line | Purpose |
|-------|------|------|---------|
| `lineCardHeaderBackgroundHighlight` | `skin.neobrut2.ts` | 693 | Yellow background for seasonal badge |
| Usage in SeaTransportScreen | | 266 | `backgroundColor={listTokens.lineCardHeaderBackgroundHighlight}` |
| Usage in LineDetailScreen | | 306 | `backgroundColor={listTokens.lineCardHeaderBackgroundHighlight}` |

---

## 2) Proposed API

### File Location

`mobile/src/utils/transportFormat.ts` (existing file)

**Rationale:**
- Already contains transport-related utilities
- Already imported by both SeaTransportScreen and LineDetailScreen
- No new file/import paths needed
- Follows existing pattern

### Proposed Additions

```typescript
/**
 * Seasonal Sea Line Detection
 *
 * Sea lines that operate seasonally and require special UI treatment:
 * - Seasonal badge displayed
 * - Subtitle text indicating seasonal period
 */

/** List of seasonal sea line numbers */
export const SEASONAL_SEA_LINES = ['659'] as const;

/** Type for seasonal line numbers */
export type SeasonalSeaLine = typeof SEASONAL_SEA_LINES[number];

/**
 * Check if a line number is a seasonal sea line
 * @param lineNumber - Public line number to check
 * @returns true if the line operates seasonally
 */
export function isSeasonalLine(lineNumber: string | null): boolean {
  if (!lineNumber) return false;
  return (SEASONAL_SEA_LINES as readonly string[]).includes(lineNumber);
}
```

### Future-Proofing

- Adding new seasonal lines: just add to `SEASONAL_SEA_LINES` array
- Type safety via `SeasonalSeaLine` type
- Central location for any seasonal-specific logic expansion

### Circular Dependency Analysis

- `transportFormat.ts` has NO imports from screens
- Screens import from utils (one-way dependency)
- **No circular dependency risk**

---

## 3) Migration Plan

### Files to Update

| File | Changes |
|------|---------|
| `transportFormat.ts` | Add `SEASONAL_SEA_LINES` constant and `isSeasonalLine()` function |
| `SeaTransportScreen.tsx` | Import `isSeasonalLine`, replace 3 occurrences |
| `LineDetailScreen.tsx` | Import `isSeasonalLine`, replace 2 occurrences |

### Detailed Changes

#### SeaTransportScreen.tsx

**Line 248:**
```diff
- {line.line_number === '659' && (
+ {isSeasonalLine(line.line_number) && (
```

**Line 255:**
```diff
- {(line.subtype || line.line_number === '659') && (
+ {(line.subtype || isSeasonalLine(line.line_number)) && (
```

**Line 262:**
```diff
- {line.line_number === '659' && (
+ {isSeasonalLine(line.line_number) && (
```

#### LineDetailScreen.tsx

**Line 295:**
```diff
- {transportType === 'sea' && (lineDetailData.subtype || lineDetailData.line_number === '659') && (
+ {transportType === 'sea' && (lineDetailData.subtype || isSeasonalLine(lineDetailData.line_number)) && (
```

**Line 302:**
```diff
- {lineDetailData.line_number === '659' && (
+ {isSeasonalLine(lineDetailData.line_number) && (
```

### What We Keep As-Is

| Item | Reason |
|------|--------|
| `SEA_LINE_CARRIERS['659']` mapping in LineDetailScreen | Not seasonal detection - carrier/ticket info |
| `transport.line659Seasonal` i18n key | Specific to 659 subtitle, not generic seasonal |
| `lineCardHeaderBackgroundHighlight` token | Reusable token, not seasonal-specific |

---

## 4) Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missed reference | Low | Medium | Exhaustive grep in audit; run typecheck |
| UI regression | Low | High | Smoke test checklist; visual verification |
| i18n key mismatch | None | N/A | No i18n changes in this PR |
| Import cycle | None | N/A | One-way dependency verified |
| TypeScript error | Low | Low | Typecheck required before merge |

---

## 5) Verification Checklist

After implementation, verify:

- [ ] `npm run typecheck` passes
- [ ] Sea list 659: KATAMARAN + SEZONSKA badges still stacked
- [ ] Sea list 659: Subtitle "Samo sezonski / ljeto 2026" still visible
- [ ] LineDetail 659: Badge stack still right-aligned
- [ ] Sea list 602/612/9602: NO seasonal badge (unchanged)
- [ ] Road lines: No changes (unchanged)
- [ ] No other screens affected

---

## 6) Commit Plan

**Branch:** `feat/seasonal-line-helper`

**Commits:**
1. `feat(transport): add isSeasonalLine helper to transportFormat.ts`
2. `refactor(sea-transport): use isSeasonalLine helper`
3. `refactor(line-detail): use isSeasonalLine helper`

Or single commit:
- `feat(transport): centralize seasonal line detection with isSeasonalLine helper`

---

## Approval Gate

**Ready to implement after approval.**

No clarifying questions - the audit is complete and the plan is straightforward.
