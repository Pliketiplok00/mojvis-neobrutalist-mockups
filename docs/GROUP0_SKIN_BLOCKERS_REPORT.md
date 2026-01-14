# GROUP 0: Skin Blockers Migration Report

**Date:** 2026-01-11
**Branch:** `chore/skin-blockers-banner-departure`
**Status:** COMPLETE

---

## Summary

Migrated the two blocking shared components to be 100% skin-first compatible:
- `mobile/src/components/Banner.tsx`
- `mobile/src/components/DepartureItem.tsx`

Both components now use only skin tokens and the Icon primitive. Zero hardcoded hex colors, zero emoji/text glyphs.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `mobile/src/ui/skin.neobrut2.ts` | Added 3 new semantic tokens |
| `mobile/src/components/Banner.tsx` | Full skin-first migration |
| `mobile/src/components/DepartureItem.tsx` | Full skin-first migration |

---

## Banner.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFF3CD` | container background | color |
| `#FFC107` | border left color | color |
| `#F8D7DA` | urgent container background | color |
| `#DC3545` | urgent border, badge background | color |
| `#FFFFFF` | urgent badge text | color |
| `#856404` | title text (warning) | color |
| `#721C24` | title text (urgent) | color |
| `#666666` | preview text | color |
| `#999999` | arrow color | color |
| `›` | arrow indicator | text glyph |
| `8` | gap, margin, padding | spacing |
| `12` | padding | spacing |
| `6` | badge padding horizontal | spacing |
| `16` | margin bottom | spacing |
| `4` | border radius, badge radius | radius |
| `8` | container border radius | radius |
| `10`, `12`, `14`, `20` | font sizes | typography |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFF3CD` | `skin.colors.warningBackground` |
| `#FFC107` | `skin.colors.warningAccent` |
| `#F8D7DA` | `skin.colors.errorBackground` |
| `#DC3545` | `skin.colors.urgent` |
| `#FFFFFF` | `skin.colors.urgentText` |
| `#856404` | `skin.colors.textPrimary` |
| `#721C24` | `skin.colors.errorText` |
| `#666666` | `skin.colors.textMuted` |
| `›` glyph | `<Icon name="chevron-right" colorToken="chevron" />` |
| `gap: 8` | `skin.spacing.sm` |
| `marginBottom: 16` | `skin.spacing.lg` |
| `padding: 12` | `skin.spacing.md` |
| `borderRadius: 8` | `skin.borders.radiusCard` |
| `borderRadius: 4` | `skin.borders.radiusSmall` |
| `borderLeftWidth: 4` | `skin.borders.widthHeavy` |
| `fontSize: 10` | `skin.typography.fontSize.xs` |
| `fontSize: 12` | `skin.typography.fontSize.sm` |
| `fontSize: 14` | `skin.typography.fontSize.md` |

---

## DepartureItem.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container background | color |
| `#000000` | border, text, dots | color |
| `#666666` | duration, dots | color |
| `#856404` | notes text | color |
| `#FFF3CD` | notes background | color |
| `#333333` | stop name | color |
| `#CCCCCC` | timeline line | color |
| `−` | collapse icon | text glyph |
| `+` | expand icon | text glyph |
| `2` | border width, line width | border |
| `8` | border radius, spacing | mixed |
| `12` | padding, spacing | spacing |
| `16` | margin top | spacing |
| `4` | margin top (line) | spacing |
| `20`, `14`, `12`, `24` | font sizes | typography |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.backgroundTertiary` |
| `#000000` (text) | `skin.colors.textPrimary` |
| `#000000` (border) | `skin.colors.border` |
| `#666666` | `skin.colors.textMuted` |
| `#856404` | `skin.colors.textPrimary` |
| `#FFF3CD` | `skin.colors.warningBackground` |
| `#333333` | `skin.colors.textSecondary` |
| `#CCCCCC` | `skin.colors.borderMuted` |
| `−` / `+` glyphs | `<Icon name="chevron-up/down" colorToken="textPrimary" />` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `borderRadius: 8` | `skin.borders.radiusCard` |
| `padding: 12` | `skin.spacing.md` |
| `marginBottom: 8` | `skin.spacing.sm` |
| `marginTop: 16` | `skin.spacing.lg` |
| `marginTop: 4` | `skin.spacing.xs` |
| `fontSize: 20` | `skin.typography.fontSize.xl` |
| `fontSize: 14` | `skin.typography.fontSize.md` |
| `fontSize: 12` | `skin.typography.fontSize.sm` |

---

## New Semantic Skin Tokens Added

### 1. `borders.radiusCard: 8`

**Rationale:** Standard container/card border radius used throughout the codebase. The existing `radiusSmall` (4) and `radiusMedium` (0) did not match the common 8px pattern.

**Location:** `skin.neobrut2.ts` → `borders` object

### 2. `borders.widthHeavy: 4`

**Rationale:** Already existed in internal `borders` object but was not exported to `bordersToken`. Now exposed for banner left accent border.

**Location:** `skin.neobrut2.ts` → `bordersToken` export

### 3. `colors.borderMuted: hsla(220, 10, 50, 0.35)`

**Rationale:** Subtle connector line color for timelines and separators. Lighter than `borderLight` to avoid visual clutter in expanded states.

**Location:** `skin.neobrut2.ts` → `colors` object

---

## Verification Results

### 1. TypeScript Check

```bash
$ pnpm -r typecheck
Scope: all 4 projects
. typecheck$ pnpm --dir backend typecheck && pnpm --dir admin exec tsc -b --noEmit && pnpm --dir mobile exec tsc --noEmit
backend typecheck$ tsc --noEmit
backend typecheck: Done
. typecheck: Done
```

**Result:** PASS

### 2. Design Guardrails

```bash
$ pnpm design:guard
Design guard passed.
```

**Result:** PASS

### 3. Hex Color Scan

```bash
$ rg -n --hidden --glob '!**/node_modules/**' '#[0-9a-fA-F]{3,8}\b' \
    mobile/src/components/Banner.tsx \
    mobile/src/components/DepartureItem.tsx

(no output)
```

**Result:** PASS (0 matches)

### 4. Emoji/Glyph Scan

```bash
$ rg -n --hidden --glob '!**/node_modules/**' '›|\+|−|📅|🚌|🚢|⚠️' \
    mobile/src/components/Banner.tsx \
    mobile/src/components/DepartureItem.tsx

(no output)
```

**Result:** PASS (0 matches)

### 5. Manual Smoke Test (iOS Simulator)

- [x] HomeScreen: Banners render (normal + urgent states)
- [x] Banner tap opens InboxDetail
- [x] LineDetailScreen renders departures correctly
- [x] Expand/collapse works with chevron icons
- [x] No red screen errors
- [x] No console errors related to components

---

## Remaining Known Design Violations (Outside Scope)

| Screen/Component | Violation Count | Status |
|------------------|-----------------|--------|
| Onboarding screens (3) | ~50 hardcoded values | Pending (GROUP 1) |
| Events screens (2) | ~40 hardcoded values | Pending (GROUP 2) |
| Feedback screens (3) | ~45 hardcoded values | Pending (GROUP 3) |
| ClickFix screens (3) | ~50 hardcoded values | Pending (GROUP 4) |
| SettingsScreen | ~25 hardcoded values | Pending (GROUP 5) |
| StaticPageScreen | ~60 hardcoded values | Pending (GROUP 6) |

These are tracked in `docs/SKIN_FIRST_COMPATIBILITY_AUDIT.md`.

---

## Commit

```
chore(mobile): make Banner and DepartureItem skin-first (group0 blockers)

- Banner: Replace all hardcoded hex colors with skin tokens
- Banner: Replace text glyph › with Icon chevron-right
- DepartureItem: Replace all hardcoded hex colors with skin tokens
- DepartureItem: Replace text glyphs −/+ with Icon chevron-up/down
- Add skin.borders.radiusCard (8) for standard container radius
- Add skin.borders.widthHeavy export for accent borders
- Add skin.colors.borderMuted for subtle connector lines

Both components are now 100% skin-first compatible.
Zero hardcoded hex colors. Zero text glyphs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
