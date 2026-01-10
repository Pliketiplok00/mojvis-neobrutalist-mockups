# MOJ VIS — Phase 3C + 3D: TransportHubScreen & LineDetailScreen Skin-Adopted

**Date:** 2026-01-10
**Branch:** `feat/mobile-skin-transport-hub-and-line-detail-phase3cd`
**Status:** Complete

---

## Summary

Phase 3C + 3D migrates both TransportHubScreen and LineDetailScreen to be 100% skin-adopted:
- Zero hardcoded hex colors in either screen file
- All styling uses skin tokens (colors, spacing, typography, borders)
- Uses UI primitives (Card, Badge, Button, H1, H2, Label, Meta, Icon)
- No raw lucide imports - all icons use the `<Icon />` primitive
- No emoji icons - replaced with Lucide icons
- Behavior and layout preserved

---

## Screen Files and Navigation

| Screen | File Path |
|--------|-----------|
| TransportHubScreen | `mobile/src/screens/transport/TransportHubScreen.tsx` |
| LineDetailScreen | `mobile/src/screens/transport/LineDetailScreen.tsx` |

**Navigation paths:**
- TransportHubScreen: Root screen → Menu → "Transport"
- LineDetailScreen: TransportHub → Road/Sea → Select line → LineDetailScreen

---

## Hardcoded Values Removed

### TransportHubScreen (Phase 3C)

#### Hardcoded Hex Colors Removed: 6

| Property | Before | After |
|----------|--------|-------|
| Container background | `#FFFFFF` | `colors.background` |
| Title text | `#000000` | H1 primitive |
| Option card bg | `#FFFFFF` | Card primitive |
| Option card border | `#000000` | Card primitive |
| Option title | `#000000` | Label primitive |
| Option subtitle | `#666666` | Meta primitive |
| Chevron | `#000000` | Icon primitive |

#### Other Changes:
- Emoji icons `🚌` and `⛴️` → `<Icon name="bus" />` and `<Icon name="ship" />`
- Text `>` chevron → `<Icon name="chevron-right" />`
- Hardcoded spacing (16, 12, 28, etc.) → skin spacing tokens

### LineDetailScreen (Phase 3D)

#### Hardcoded Hex Colors Removed: 22

| Property | Before | After |
|----------|--------|-------|
| Container background | `#FFFFFF` | `colors.background` |
| Loading indicator | `#000000` | `colors.textPrimary` |
| Loading text | `#666666` | Label primitive |
| Error text | `#856404` | `colors.textPrimary` |
| Retry button bg | `#000000` | Button primitive |
| Retry button text | `#FFFFFF` | Button primitive |
| Line name | `#000000` | H1 primitive |
| Subtype badge bg | `#E0E0E0` | Badge primitive |
| Subtype badge text | `#666666` | Badge primitive |
| Date section bg | `#F5F5F5` | `colors.backgroundSecondary` |
| Date arrows | `#000000` | Icon primitive |
| Date text | `#000000` | Label primitive |
| Day type text | `#666666` | Meta primitive |
| Direction button bg | `#F5F5F5` | `colors.backgroundSecondary` |
| Direction button active bg | `#000000` | `colors.textPrimary` |
| Direction text | `#666666` | Label primitive |
| Direction text active | `#FFFFFF` | `colors.primaryText` |
| Route label | `#333333` | `colors.textPrimary` |
| Route duration | `#666666` | Meta primitive |
| Section title | `#000000` | H2 primitive |
| Empty state bg | `#F5F5F5` | `colors.backgroundSecondary` |
| Empty state text | `#666666` | Label primitive |
| Contact card | `#FFFFFF` / `#000000` | Card primitive |
| Contact operator | `#000000` | Label primitive |
| Contact label | `#666666` | Icon primitive |
| Contact link | `#0066CC` | `colors.link` |

#### Other Changes:
- Text `<` and `>` arrows → `<Icon name="chevron-left" />` and `<Icon name="chevron-right" />`
- Text labels "Tel:", "Email:", "Web:" → Icons (phone, mail, globe)
- Hardcoded spacing → skin spacing tokens

---

## UI Primitives Used

| Primitive | TransportHubScreen | LineDetailScreen |
|-----------|-------------------|------------------|
| `Card` | Option cards | Contact cards |
| `Badge` | - | Line subtype badge |
| `Button` | - | Retry button |
| `H1` | Screen title | Line name |
| `H2` | - | Section titles |
| `Label` | Option title | Date, direction, contact text |
| `Meta` | Option subtitle | Day type, route duration |
| `Icon` | bus, ship, chevron-right | chevron-left, chevron-right, phone, mail, globe |

---

## New/Modified Semantic Skin Tokens

### New Token: `colors.link`

**Rationale:** LineDetailScreen had hardcoded `#0066CC` for clickable contact links (phone, email, website). Added a semantic `link` color token that uses the same hue as `primary` for consistency.

```typescript
// In palette:
link: hsl(210, 85, 40), // same as primary

// In colors:
link: palette.link,
```

---

## Verification Results

### 1) TypeScript Check
```bash
cd mobile && npx tsc --noEmit
```
**Result:** ✅ Pass (no output = no errors)

### 2) ESLint
```bash
npx eslint src/screens/transport/TransportHubScreen.tsx src/screens/transport/LineDetailScreen.tsx
```
**Result:** ✅ 1 warning (pre-existing react-hooks/exhaustive-deps)
```
LineDetailScreen.tsx
  92:6  warning  React Hook useCallback has a missing dependency: 't'
```
This is a pre-existing pattern, not a new issue.

### 3) Hex Scan on TransportHubScreen
```bash
rg -n '#[0-9a-fA-F]{3,8}\b' mobile/src/screens/transport/TransportHubScreen.tsx
```
**Result:** ✅ No hex colors found

### 4) Hex Scan on LineDetailScreen
```bash
rg -n '#[0-9a-fA-F]{3,8}\b' mobile/src/screens/transport/LineDetailScreen.tsx
```
**Result:** ✅ No hex colors found

### 5) Raw Lucide Import Check
```bash
rg -n 'from "lucide' mobile/src/screens/
```
**Result:** ✅ No raw lucide imports in screens

### 6) Expo iOS Build
```bash
npx expo export --platform ios --dev
```
**Result:** ✅ Success
```
iOS Bundled 2523ms index.ts (2937 modules)
Exported: dist
```

---

## Files Changed

| File | Changes |
|------|---------|
| `mobile/src/ui/fonts.ts` | Created - font loading infrastructure |
| `mobile/src/ui/skin.neobrut2.ts` | Created - full skin token system |
| `mobile/src/ui/Icon.tsx` | Created - Icon primitive with lucide integration |
| `mobile/src/ui/Text.tsx` | Created - Typography primitives (H1, H2, Label, Meta, etc.) |
| `mobile/src/ui/ListRow.tsx` | Created - ListRow primitive with Icon chevron |
| `mobile/src/ui/index.ts` | Updated - added Icon export |
| `mobile/src/screens/transport/TransportHubScreen.tsx` | Migrated to skin primitives |
| `mobile/src/screens/transport/LineDetailScreen.tsx` | Migrated to skin primitives |

---

## Skin-Adopted Transport Screens Status

| Screen | Status |
|--------|--------|
| TransportHubScreen | ✅ 100% skin-adopted (Phase 3C) |
| LineDetailScreen | ✅ 100% skin-adopted (Phase 3D) |
| SeaTransportScreen | ❌ Pending (outside scope) |
| RoadTransportScreen | ❌ Pending (outside scope) |

---

## Remaining Known Violations (Outside Scope)

| Location | Issue | Status |
|----------|-------|--------|
| SeaTransportScreen | Hardcoded colors | Future phase |
| RoadTransportScreen | Hardcoded colors | Future phase |
| Other screens (20+) | Hardcoded colors | Future phases |

---

## Commit Information

```
feat(mobile): migrate TransportHubScreen and LineDetailScreen to skin primitives (phase3cd)

- Create fonts.ts, skin.neobrut2.ts for design token infrastructure
- Create Icon.tsx, Text.tsx, ListRow.tsx UI primitives
- Replace all hardcoded hex colors with skin tokens in both screens
- Replace emoji icons with Lucide Icon primitive (bus, ship)
- Replace text arrows with Icon chevrons
- Use Card, Badge, Button, H1, H2, Label, Meta primitives
- Add colors.link semantic token for contact links
- TransportHubScreen and LineDetailScreen are now 100% skin-adopted

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
