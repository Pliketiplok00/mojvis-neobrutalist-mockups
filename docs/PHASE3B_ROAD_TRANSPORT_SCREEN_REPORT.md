# MOJ VIS — Phase 3B: RoadTransportScreen Skin-Adopted

**Date:** 2026-01-10
**Branch:** `feat/mobile-skin-road-transport-screen-phase3b`
**Status:** Complete

---

## Summary

Phase 3B migrates the Road Transport screen to be 100% skin-adopted:
- Zero hardcoded hex colors in the screen file
- All styling uses skin tokens (colors, spacing, typography)
- Uses UI primitives (Card, Badge, Button, H1, H2, Label, Meta, Icon)
- No raw lucide imports - all icons use the `<Icon />` primitive
- Behavior and layout preserved

---

## Screen File and Navigation

| Screen | File Path |
|--------|-----------|
| RoadTransportScreen | `mobile/src/screens/transport/RoadTransportScreen.tsx` |

**Navigation path:** TransportHub → "Road Transport" → RoadTransportScreen

The screen is registered in navigation and accessed via `navigation.navigate('RoadTransport')`.

---

## Hardcoded Values Removed

### Hardcoded Hex Colors Removed: 17

| Property | Before | After |
|----------|--------|-------|
| Container background | `#FFFFFF` | `colors.background` |
| Loading indicator | `#000000` | `colors.textPrimary` |
| Loading text | `#666666` | Label primitive |
| Title text | `#000000` | H1 primitive |
| Day info text | `#666666` | Meta primitive |
| Section title | `#000000` | H2 primitive |
| Error container bg | `#FFF3CD` | `colors.warningBackground` |
| Error text | `#856404` | `colors.textPrimary` |
| Retry button bg | `#000000` | Button primitive |
| Retry button text | `#FFFFFF` | Button primitive |
| Empty state bg | `#F5F5F5` | `colors.backgroundSecondary` |
| Empty state text | `#666666` | Label primitive |
| Line card bg | `#FFFFFF` | Card primitive |
| Line card border | `#000000` | Card primitive |
| Line name text | `#000000` | `colors.textPrimary` |
| Subtype badge bg | `#E0E0E0` | Badge variant="default" |
| Subtype badge text | `#666666` | Badge variant="default" |
| Line stops text | `#666666` | Meta primitive |
| Line info text | `#888888` | Meta primitive |
| Chevron | Text `>` | `<Icon name="chevron-right" />` |
| Departure card bg | `#F5F5F5` | `colors.backgroundSecondary` |
| Departure time | `#000000` | `colors.textPrimary` |
| Departure line | `#000000` | `colors.textPrimary` |
| Departure direction | `#666666` | Meta primitive |

### Hardcoded Spacing Values Replaced: ~22

All numeric spacing values (4, 8, 12, 16, 24, 32) replaced with skin spacing tokens (xs, sm, md, lg, xxl, xxxl).

---

## UI Primitives Now Used

| Primitive | Usage |
|-----------|-------|
| `Card` | Line cards with onPress |
| `Badge` | Line subtype badge (variant="default") |
| `Button` | Retry button in error state |
| `H1` | Screen title |
| `H2` | Section titles |
| `Label` | Line name, departure time, error text, empty state text |
| `Meta` | Day info, stops summary, line info, departure direction |
| `Icon` | Chevron indicator on line cards |

---

## New/Modified Semantic Skin Tokens

**None required.** All needed tokens already exist in `skin.neobrut2.ts`.

---

## Verification Results

### 1) TypeScript Check
```bash
cd mobile && npx tsc --noEmit
```
**Result:** ✅ Pass (no output = no errors)

### 2) ESLint
```bash
npx eslint src/screens/transport/RoadTransportScreen.tsx --ext .ts,.tsx
```
**Result:** ✅ 1 warning (pre-existing react-hooks/exhaustive-deps)
```
src/screens/transport/RoadTransportScreen.tsx
  95:6  warning  React Hook useCallback has a missing dependency: 't'
```
This is a pre-existing pattern, not a new issue.

### 3) Hex Scan on RoadTransportScreen
```bash
rg -n --hidden --glob '!**/node_modules/**' '#[0-9a-fA-F]{3,8}\b' \
  mobile/src/screens/transport/RoadTransportScreen.tsx
```
**Result:** ✅ No hex colors found

### 4) Raw Lucide Import Check
```bash
rg -n --hidden --glob '!**/node_modules/**' 'from "lucide' mobile/src/screens/
```
**Result:** ✅ No raw lucide imports in screens

### 5) Expo iOS Build
```bash
npx expo export --platform ios --dev
```
**Result:** ✅ Success
```
Exported: dist
```

---

## Files Changed

| File | Changes |
|------|---------|
| `mobile/src/screens/transport/RoadTransportScreen.tsx` | Migrated to skin primitives |

---

## Skin-Adopted Transport Screens Status

| Screen | Status |
|--------|--------|
| SeaTransportScreen | ✅ 100% skin-adopted (Phase 3A) |
| RoadTransportScreen | ✅ 100% skin-adopted (Phase 3B) |
| TransportHubScreen | Pending |
| LineDetailScreen | Pending |

---

## Remaining Known Violations (Outside Scope)

| Location | Issue | Status |
|----------|-------|--------|
| TransportHubScreen | Hardcoded colors | Future phase |
| LineDetailScreen | Hardcoded colors | Future phase |
| Other screens (20+) | Hardcoded colors | Future phases |

---

## Commit Information

```
feat(mobile): migrate RoadTransportScreen to skin primitives (phase3b)

- Replace all hardcoded hex colors with skin tokens
- Use skin spacing and typography tokens throughout
- Migrate to UI primitives (Card, Badge, Button, H1, H2, Label, Meta, Icon)
- RoadTransportScreen is now 100% skin-adopted

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
