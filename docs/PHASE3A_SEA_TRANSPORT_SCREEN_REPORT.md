# MOJ VIS — Phase 3A: SeaTransportScreen Skin-Adopted

**Date:** 2026-01-10
**Branch:** `feat/mobile-skin-sea-transport-screen-phase3a`
**Status:** Complete

---

## Summary

Phase 3A migrates the Sea Transport screen to be 100% skin-adopted:
- Zero hardcoded hex colors in the screen file
- All styling uses skin tokens (colors, spacing, typography, borders)
- Uses UI primitives (Card, Badge, Button, H1, H2, Label, Meta, Icon)
- No raw lucide imports - all icons use the `<Icon />` primitive
- Behavior and layout preserved

---

## Screen File and Navigation

| Screen | File Path |
|--------|-----------|
| SeaTransportScreen | `mobile/src/screens/transport/SeaTransportScreen.tsx` |

**Navigation path:** TransportHub → "Sea Transport" → SeaTransportScreen

The screen is registered in navigation and accessed via `navigation.navigate('SeaTransport')`.

---

## Hardcoded Values Removed

### Before: 17 Hardcoded Hex Colors

| Property | Before | After |
|----------|--------|-------|
| Container background | `#FFFFFF` | `colors.background` |
| Loading indicator | `#000000` | `colors.textPrimary` |
| Loading text | `#666666` | Label primitive (colors.textSecondary) |
| Title text | `#000000` | H1 primitive (colors.textPrimary) |
| Day info text | `#666666` | Meta primitive (colors.textDisabled) |
| Section title | `#000000` | H2 primitive (colors.textPrimary) |
| Error container bg | `#FFF3CD` | `colors.warningBackground` |
| Error text | `#856404` | `colors.textPrimary` |
| Retry button bg | `#000000` | Button primitive (colors.primary) |
| Retry button text | `#FFFFFF` | Button primitive (colors.primaryText) |
| Empty state bg | `#F5F5F5` | `colors.backgroundSecondary` |
| Empty state text | `#666666` | Label primitive |
| Line card bg | `#FFFFFF` | Card primitive (colors.backgroundTertiary) |
| Line card border | `#000000` | Card primitive (colors.border) |
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

### Before: Hardcoded Spacing Numbers

| Property | Before | After |
|----------|--------|-------|
| Content paddingBottom | `32` | `spacing.xxxl` |
| Loading text marginTop | `12` | `spacing.md` |
| Banner/title padding | `16` | `spacing.lg` |
| Title paddingBottom | `8` | `spacing.sm` |
| Day info marginTop | `4` | `spacing.xs` |
| Section padding | `16` | `spacing.lg` |
| Section title marginBottom | `12` | `spacing.md` |
| Error container margin | `16` | `spacing.lg` |
| Error container borderRadius | `8` | `spacing.sm` |
| Retry button marginTop | `12` | `spacing.md` |
| Empty state padding | `24` | `spacing.xxl` |
| Empty state borderRadius | `8` | `spacing.sm` |
| Line card borderRadius | `12` | Card primitive |
| Line card padding | `16` | Card primitive |
| Line card marginBottom | `12` | `spacing.md` |
| Line header marginBottom | `8` | `spacing.sm` |
| Line name marginRight | `8` | `spacing.sm` |
| Line stops marginBottom | `8` | `spacing.sm` |
| Departure card borderRadius | `8` | `spacing.sm` |
| Departure card padding | `12` | `spacing.md` |
| Departure card marginBottom | `8` | `spacing.sm` |
| Departure info marginLeft | `12` | `spacing.md` |

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

## ListRow Primitive Enhancement

Updated `mobile/src/ui/ListRow.tsx` to use Icon instead of text chevron:

```diff
- {rightAccessory ?? (showChevron && <Text style={styles.chevron}>{'>'}</Text>)}
+ {rightAccessory ?? (showChevron && (
+   <View style={styles.chevronContainer}>
+     <Icon name="chevron-right" size="md" stroke="regular" colorToken="chevron" />
+   </View>
+ ))}
```

**Rationale:** Consistent icon rendering across all list rows. The text `>` was inconsistent with the Icon primitive used elsewhere.

---

## New/Modified Semantic Skin Tokens

**None required.** All needed tokens already exist in `skin.neobrut2.ts`:
- `colors.background`, `colors.backgroundSecondary`, `colors.backgroundTertiary`
- `colors.textPrimary`, `colors.textSecondary`, `colors.textDisabled`
- `colors.warningBackground`
- `colors.chevron`
- `spacing.*`, `typography.*`, `borders.*`

---

## Verification Results

### 1) TypeScript Check
```bash
cd mobile && npx tsc --noEmit
```
**Result:** ✅ Pass (no output = no errors)

### 2) ESLint
```bash
npx eslint src/screens/transport/SeaTransportScreen.tsx src/ui/ListRow.tsx --ext .ts,.tsx
```
**Result:** ✅ 1 warning (pre-existing react-hooks/exhaustive-deps for useCallback)
```
src/screens/transport/SeaTransportScreen.tsx
  95:6  warning  React Hook useCallback has a missing dependency: 't'
```
This is a pre-existing pattern, not a new issue.

### 3) Hex Scan on SeaTransportScreen
```bash
rg -n --hidden --glob '!**/node_modules/**' '#[0-9a-fA-F]{3,8}\b' \
  mobile/src/screens/transport/SeaTransportScreen.tsx
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
| `mobile/src/screens/transport/SeaTransportScreen.tsx` | Migrated to skin primitives |
| `mobile/src/ui/ListRow.tsx` | Updated chevron to use Icon component |

---

## Remaining Known Violations (Outside Scope)

| Location | Issue | Status |
|----------|-------|--------|
| Other transport screens | Hardcoded colors | Future phases |
| Other screens (20+) | Hardcoded colors | Future phases |
| SeaLineDetailScreen | Uses shared LineDetailScreen | Check in future phase |
| skin.neobrut2.ts | HSL/HSLA functions | By design |

---

## Commit Information

```
feat(mobile): migrate SeaTransportScreen to skin primitives (phase3a)

- Replace all hardcoded hex colors with skin tokens
- Use skin spacing and typography tokens throughout
- Migrate to UI primitives (Card, Badge, Button, H1, H2, Label, Meta, Icon)
- Update ListRow chevron to use Icon component
- SeaTransportScreen is now 100% skin-adopted

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
