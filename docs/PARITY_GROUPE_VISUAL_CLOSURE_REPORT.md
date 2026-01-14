# Group E: Visual Definition Closure Report

**Date:** 2026-01-11
**Branch:** `chore/parity-visual-closure-groupE`
**Scope:** Close remaining visual styling drift in mobile/src via skin tokens and primitives

## Pre-flight Evidence

```
=== Main HEAD (after Group D merge) ===
1cd2046 Merge chore/parity-cards-rows-groupD: Cards/rows parity pass using Card primitive (Group D)

=== Local main = origin/main ===
1cd2046 (HEAD -> main, origin/main, origin/HEAD)
```

## Discovery Scan Summaries

### Scan 1: Borders/radius/shadows numeric usage
```bash
rg -n 'borderRadius\s*:\s*\d+|borderWidth\s*:\s*\d+|elevation\s*:\s*\d+|shadowOpacity\s*:\s*[\d\.]+|shadowRadius\s*:\s*[\d\.]+' mobile/src
```
**Result:** 0 matches in screens/components. All border/radius/shadow values properly tokenized.

### Scan 2: Visual colors bypassing tokens
```bash
rg -n 'rgba\(|hsla\(|opacity\s*:\s*0\.[0-9]+' mobile/src
```
**Result:**
- `Button.tsx:133: opacity: 0.5` - hardcoded opacity (FIXED)
- All other hsla/rgba matches in `skin.neobrut2.ts` (source of truth - OK)

### Scan 3: ActivityIndicator/RefreshControl/Switch/placeholder
```bash
rg -n '\bActivityIndicator\b|RefreshControl|trackColor|thumbColor|placeholderTextColor' mobile/src
```
**Result:**
- `AppNavigator.tsx:137: color="#000000"` - hardcoded hex (FIXED)
- `AppNavigator.tsx:161: backgroundColor: '#FFFFFF'` - hardcoded hex (FIXED)
- All other ActivityIndicator uses properly reference `skin.colors.textPrimary`
- Switch trackColor/thumbColor properly use skin tokens
- Input placeholderTextColor uses `components.input.placeholderColor`

### Scan 4: Divider patterns
```bash
rg -n 'height\s*:\s*1\b|StyleSheet\.hairlineWidth|borderBottomWidth\s*:\s*1\b' mobile/src
```
**Result:**
- `StaticPageScreen.tsx` - 3 occurrences of `borderBottomWidth: 1` (FIXED)
- `EventDetailScreen.tsx` - 1 occurrence of `borderBottomWidth: 1` (FIXED)
- `SettingsScreen.tsx` - 1 occurrence of `height: 1` separator (FIXED)

### Scan 5: Icon sizing/stroke bypass
```bash
rg -n 'iconSize|strokeWidth|size\s*:\s*\d+' mobile/src
```
**Result:** 0 matches in screens/components. All icon sizing routed through Icon primitive.

## Changes Made

### Category A: Hardcoded borders/radius/shadows
No issues found. Already clean.

### Category B: Visual colors/opacity bypass
| File | Before | After |
|------|--------|-------|
| `Button.tsx:133` | `opacity: 0.5` | `opacity: components.button.disabledOpacity` |

### Category C: ActivityIndicator hardcoded colors
| File | Before | After |
|------|--------|-------|
| `AppNavigator.tsx:137` | `color="#000000"` | `color={skin.colors.textPrimary}` |
| `AppNavigator.tsx:161` | `backgroundColor: '#FFFFFF'` | `backgroundColor: skin.colors.background` |

### Category D: Divider patterns (borderBottomWidth: 1, height: 1)
| File | Before | After |
|------|--------|-------|
| `StaticPageScreen.tsx:454` | `borderBottomWidth: 1` | `borderBottomWidth: skin.borders.widthHairline` |
| `StaticPageScreen.tsx:600` | `borderBottomWidth: 1` | `borderBottomWidth: skin.borders.widthHairline` |
| `StaticPageScreen.tsx:618` | `borderBottomWidth: 1` | `borderBottomWidth: skin.borders.widthHairline` |
| `EventDetailScreen.tsx:263` | `borderBottomWidth: 1` | `borderBottomWidth: skin.borders.widthHairline` |
| `SettingsScreen.tsx:219` | `height: 1` | `height: skin.borders.widthHairline` |

### Category E: Icon sizing/stroke
No issues found. Already clean via Icon primitive.

### Category F: Touch target inconsistencies
No widespread patterns found. Existing touch targets are acceptable.

## New Semantic Tokens Added

### `skin.neobrut2.ts`

```typescript
// borders object
widthHairline: 1,  // For 1px hairline separators and dividers

// bordersToken export
widthHairline: borders.widthHairline,

// components.button
disabledOpacity: 0.5,  // Disabled button opacity
```

**Rationale:**
- `widthHairline`: Needed for 1px separator lines. The existing `widthThin: 2` is too thick for hairline dividers.
- `disabledOpacity`: Centralizes the disabled state opacity for buttons (was hardcoded in Button.tsx).

## Files Changed

| File | Change |
|------|--------|
| `mobile/src/ui/skin.neobrut2.ts` | Added `widthHairline` token and `disabledOpacity` to button component |
| `mobile/src/ui/Button.tsx` | Changed hardcoded opacity to use token |
| `mobile/src/navigation/AppNavigator.tsx` | Added skin import, changed hardcoded hex colors to tokens |
| `mobile/src/screens/pages/StaticPageScreen.tsx` | Changed 3x `borderBottomWidth: 1` to `skin.borders.widthHairline` |
| `mobile/src/screens/events/EventDetailScreen.tsx` | Changed `borderBottomWidth: 1` to `skin.borders.widthHairline` |
| `mobile/src/screens/settings/SettingsScreen.tsx` | Changed separator `height: 1` to `skin.borders.widthHairline` |

## Verification Outputs

### Typecheck
```
Scope: all 4 projects
. typecheck$ pnpm --dir backend typecheck && pnpm --dir admin exec tsc -b --noEmit && pnpm --dir mobile exec tsc --noEmit
backend typecheck: Done
. typecheck: Done
```

### Design Guard
```
> node scripts/design-guard.mjs all
Design guard passed.
```

### Post-fix Scans
```bash
# Hardcoded hex colors (excluding skin file)
rg -n '#[0-9a-fA-F]{6}' mobile/src | grep -v skin.neobrut2
# Only remaining: PushContext.tsx lightColor (Android LED color - acceptable)

# borderBottomWidth: 1
rg -n 'borderBottomWidth\s*:\s*1\b' mobile/src
# Result: NO MATCHES

# height: 1 (separator)
rg -n 'height\s*:\s*1\b' mobile/src
# Result: NO MATCHES

# opacity: 0.5
rg -n 'opacity\s*:\s*0\.5\b' mobile/src
# Result: NO MATCHES
```

## Remaining Known Exceptions

| File | Issue | Justification |
|------|-------|---------------|
| `PushContext.tsx:181` | `lightColor: '#FF231F7C'` | Android notification channel LED color - platform API requirement, not visual UI styling |

## Summary

Group E successfully closes visual definition drift in mobile/src:
- **6 files changed, 12 insertions(+), 8 deletions(-)**
- **2 new tokens added** (widthHairline, disabledOpacity)
- **7 hardcoded values eliminated** (2 hex colors, 1 opacity, 4 hairline widths)
- **1 acceptable exception** (Android notification LED color)

All visual styling in mobile/src now routes through skin tokens or UI primitives.
