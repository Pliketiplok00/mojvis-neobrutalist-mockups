# Mobile UI Primitives Report

**Date**: 2026-01-09
**Baseline**: Tag `ui-audit-baseline` (commit 1dc1bf3)
**Branch**: reset/map-block-editor

---

## 1. Primitives Created

| Primitive | File | Purpose |
|-----------|------|---------|
| Screen | `src/ui/Screen.tsx` | SafeAreaView + ScrollView wrapper with background and padding |
| Header | `src/ui/Header.tsx` | Thin wrapper around GlobalHeader for consistent usage |
| Section | `src/ui/Section.tsx` | Section title/subtitle wrapper with spacing |
| Card | `src/ui/Card.tsx` | Base card surface (outlined/filled variants) |
| Button | `src/ui/Button.tsx` | Primary/secondary button variants |
| Text (H1, H2, Label, Body, Meta, ButtonText) | `src/ui/Text.tsx` | Typography wrappers |
| ListRow | `src/ui/ListRow.tsx` | Row with optional chevron/right accessory |
| Badge | `src/ui/Badge.tsx` | Small tag/badge for status indicators |

**Barrel Export**: `src/ui/index.ts`

---

## 2. Skin Tokens (src/ui/skin.ts)

### Colors
- `background`, `backgroundSecondary`, `backgroundTertiary`, `backgroundUnread`
- `textPrimary`, `textSecondary`, `textMuted`, `textDisabled`
- `border`, `borderLight`
- `primary`, `primaryText`
- `successBackground`, `successText`, `successAccent`
- `errorBackground`, `errorText`, `urgent`, `urgentText`
- `warningBackground`, `warningText`
- `infoBackground`, `infoText`
- `pendingBackground`, `pendingText`
- `unreadIndicator`, `typeBadge`, `chevron`

### Spacing
- `xs` (4px), `sm` (8px), `md` (12px), `lg` (16px), `xl` (20px), `xxl` (24px), `xxxl` (32px)

### Borders
- `widthThin` (1px), `widthCard` (2px)
- `radiusSmall` (4px), `radiusMedium` (8px), `radiusLarge` (12px)

### Typography
- Font sizes: `xs` (10px), `sm` (12px), `md` (14px), `lg` (16px), `xl` (18px), `xxl` (24px), `xxxl` (28px)
- Font weights: `regular`, `medium`, `semiBold`, `bold`

### Component Tokens
- `screen`, `section`, `card`, `button`, `listRow`, `badge`, `tab`

---

## 3. Files Changed

### New Files Created (10 files)
```
mobile/src/ui/skin.ts
mobile/src/ui/Screen.tsx
mobile/src/ui/Header.tsx
mobile/src/ui/Section.tsx
mobile/src/ui/Card.tsx
mobile/src/ui/Button.tsx
mobile/src/ui/Text.tsx
mobile/src/ui/ListRow.tsx
mobile/src/ui/Badge.tsx
mobile/src/ui/index.ts
```

### Refactored Screens (2 files)

#### HomeScreen.tsx
- **Path**: `mobile/src/screens/home/HomeScreen.tsx`
- **Changes**:
  - Replaced raw `SafeAreaView` styling with skin tokens
  - Replaced `Text` with `H1`, `H2`, `Body`, `Meta` primitives
  - Replaced category card `View` with `Card` primitive
  - Replaced section wrappers with `Section` primitive
  - Replaced `GlobalHeader` import with `Header` primitive
  - All inline style values now reference `skin.*` tokens

#### InboxListScreen.tsx
- **Path**: `mobile/src/screens/inbox/InboxListScreen.tsx`
- **Changes**:
  - Replaced `GlobalHeader` import with `Header` primitive
  - Replaced message row with `ListRow` primitive
  - Replaced urgent/status badges with `Badge` primitive
  - Replaced retry/submit buttons with `Button` primitive
  - Replaced text elements with `H2`, `Body`, `Meta` primitives
  - All inline style values now reference `skin.*` tokens
  - Tab styling now uses `skin.components.tab.*` tokens

---

## 4. Proof Instructions

### Test 1: Change Card Border Width
1. Open `mobile/src/ui/skin.ts`
2. Find line with `widthCard: 2`
3. Change to `widthCard: 4`
4. Observe:
   - **HomeScreen**: Category cards will have thicker borders (via Card primitive)
   - **InboxListScreen**: Buttons will have thicker borders (via Button secondary variant)

### Test 2: Change Background Color
1. Open `mobile/src/ui/skin.ts`
2. Find line with `background: '#FFFFFF'`
3. Change to `background: '#F0F0F0'`
4. Observe:
   - **HomeScreen**: Screen background changes
   - **InboxListScreen**: Screen background and button container background changes

### Test 3: Change Spacing
1. Open `mobile/src/ui/skin.ts`
2. Find line with `lg: 16`
3. Change to `lg: 24`
4. Observe:
   - Both screens will have increased content padding
   - Button container padding increases on InboxListScreen

---

## 5. Confirmation

- **ONLY** `HomeScreen.tsx` and `InboxListScreen.tsx` were refactored
- **NO** functionality changes were made
- **NO** new features were added
- **ALL** styling now flows through `skin.ts` tokens
- Both screens import from `../../ui` and use shared primitives

---

## 6. Remaining Baseline Screens (NOT Changed)

The following screens remain untouched and use original inline styles:
- EventsScreen, EventDetailScreen
- TransportHubScreen, RoadTransportScreen, SeaTransportScreen, LineDetailScreen
- FeedbackFormScreen, FeedbackConfirmationScreen, FeedbackDetailScreen
- ClickFixFormScreen, ClickFixConfirmationScreen, ClickFixDetailScreen
- StaticPageScreen, SettingsScreen
- All onboarding screens
