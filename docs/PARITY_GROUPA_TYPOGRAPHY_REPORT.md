# PARITY GROUP A - Typography Migration Report

## Summary

**Branch:** `chore/parity-typography-groupA`
**Scope:** Typography primitives only (no buttons, inputs, cards, layout changes)
**Status:** Complete

## Migration Results

### Files Migrated (7/7)

| File | Raw RN Text | Manual fontSize/fontWeight | Status |
|------|-------------|---------------------------|--------|
| `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx` | Removed | Removed | PASS |
| `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx` | Removed | Removed | PASS |
| `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx` | Removed | Removed | PASS |
| `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` | Removed | Removed* | PASS |
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | Removed | Removed* | PASS |
| `mobile/src/screens/feedback/FeedbackDetailScreen.tsx` | Removed | Removed | PASS |
| `mobile/src/screens/transport/LineDetailScreen.tsx` | N/A (already used primitives) | Removed | PASS |

### Primitive Mappings Applied

| Original Style | Primitive Used |
|----------------|----------------|
| Title (xxxl, bold) | `H1` |
| Section title (xl/lg, semiBold) | `H2` |
| Body text (md/lg) | `Body` |
| Field labels (lg, semiBold) | `H2` |
| Option titles (semiBold) | `ButtonText` |
| Button text | `ButtonText` |
| Descriptions (regular) | `Label` |
| Metadata/hints (sm, muted) | `Meta` |
| Error text (sm) | `Label` with color override |
| Character counts | `Meta` |

## Documented Exceptions

The following patterns were intentionally preserved:

### 1. TextInput fontSize
- **Location:** `ClickFixFormScreen.tsx:432` - `input` style
- **Reason:** `TextInput` components require explicit font sizing (not a Text primitive)
- **Value:** `fontSize: skin.typography.fontSize.lg`

### 2. Monospace fontFamily for Coordinates
- **Locations:**
  - `ClickFixFormScreen.tsx:482` - `locationText` style
  - `ClickFixDetailScreen.tsx:306` - `locationText` style
- **Reason:** Intentional use of monospace font for lat/lng coordinate display
- **Value:** `fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'`

## Verification Results

### Typecheck
```
pnpm -r typecheck
Scope: all 4 projects
Done
```

### Design Guard
```
pnpm design:guard
Design guard passed.
```

### Policy Checks
- **Raw RN Text imports:** 0 in migrated files
- **Manual typography (non-exception):** 0 in migrated files

## Changes Summary

### Imports Changed
All 7 files now import from `../../ui/Text` instead of (or in addition to) `react-native`:

```typescript
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
```

### StyleSheet Cleanup
Removed from all applicable styles:
- `fontSize: skin.typography.fontSize.*`
- `fontWeight: skin.typography.fontWeight.*`
- `fontFamily: typography.fontFamily.body.*` (except monospace exceptions)
- `color: skin.colors.textPrimary` (when primitive provides default)

Preserved:
- Color overrides (muted, error, warning, success colors)
- Layout properties (margin, padding, flex)
- Text alignment and other non-typography properties

## Files Not Modified (Out of Scope)

Per the audit, these files still have typography issues but are NOT in Group A scope:
- `StaticPageScreen.tsx` - uses primitives, has lineHeight override
- `HomeScreen.tsx` - uses raw Text with manual typography
- `TransportScreen.tsx` - uses raw Text
- Various other screens identified in `GLOBAL_VISUAL_PARITY_AUDIT.md`

---
Generated: 2026-01-11
