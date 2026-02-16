# Design Tokens Usage Map

> MOJ VIS Mobile App - Design System Documentation
> Generated: 2026-02-12

---

## Table of Contents

1. [Overview](#overview)
2. [Token Categories](#token-categories)
3. [Token Groups to Consumer Map](#token-groups-to-consumer-map)
4. [Hardcoded Values / Skin Bypass](#hardcoded-values--skin-bypass)
5. [Potentially Unused Tokens](#potentially-unused-tokens)
6. [Platform-Specific Divergences](#platform-specific-divergences)

---

## Overview

All design tokens are defined in `mobile/src/ui/skin.neobrut2.ts` and exported via `mobile/src/ui/skin.ts`.

The token system follows a Mediterranean neobrutalist theme characterized by:
- Sharp corners (0 radius default)
- Heavy borders (2-4px)
- Dual-layer offset shadows (4px)
- Warm cream backgrounds
- Bold primary colors (blue, green, yellow, terracotta)

---

## Token Categories

### Colors

**Core Palette:**
| Token | Value | Purpose |
|-------|-------|---------|
| `background` | `hsl(45, 30, 96)` | Warm cream/sand - screen backgrounds |
| `foreground` | `hsl(220, 20, 10)` | Near-black - primary text, borders |
| `surface` | `hsl(45, 25, 98)` | Cards |
| `surfaceAlt` | `hsl(45, 15, 90)` | Muted panels/sections |

**Primary Colors:**
| Token | Value | Purpose |
|-------|-------|---------|
| `primary` | `hsl(201, 68, 47)` | Mediterranean Blue (#2788C9) |
| `secondary` | `hsl(143, 79, 38)` | Olive Green (#15AF50) |
| `accent` | `hsl(45, 98, 53)` | Sun Yellow (#FDC010) |
| `destructive` | `hsl(12, 69, 51)` | Terracotta Red (#D64E2D) |

**Extended Palette:**
| Token | Value | Purpose |
|-------|-------|---------|
| `lavender` | `hsl(281, 31, 68)` | Decorative accents |
| `amber` | `hsl(33, 94, 54)` | Banner backgrounds |
| `orange` | `hsl(33, 94, 54)` | Urgent banner backgrounds |
| `teal` | `hsl(180, 45, 42)` | Catamaran transport, service headers |
| `pink` | `hsl(350, 50, 65)` | Decorative accents |

**Status Colors:**
| Token | Background | Text |
|-------|------------|------|
| `success*` | `hsla(155, 45, 34, 0.15)` | `secondary` |
| `error*` / `urgent*` | `hsla(12, 62, 48, 0.14)` | `destructive` / white |
| `warning*` | `hsl(35, 83, 61)` | `foreground` |
| `info*` | `hsla(210, 85, 40, 0.14)` | `primary` |
| `pending*` | `hsla(25, 85, 55, 0.16)` | `hsl(25, 85, 40)` |

**Text Colors:**
| Token | Purpose |
|-------|---------|
| `textPrimary` | Main text (foreground) |
| `textSecondary` | Secondary text (mutedText) |
| `textMuted` | Muted text (mutedText) |
| `textDisabled` | Disabled text (55% opacity) |
| `primaryText` | White text on colored backgrounds |

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight gaps, badge padding |
| `sm` | 8px | Small gaps, icon margins |
| `md` | 12px | Medium gaps, section padding |
| `lg` | 16px | Standard padding, gaps |
| `xl` | 20px | Large padding |
| `xxl` | 24px | Section margins |
| `xxxl` | 32px | Screen bottom padding |

### Typography

**Font Families:**
| Token | Font | Usage |
|-------|------|-------|
| `display.regular/medium/semiBold/bold` | Space Grotesk | Headlines, titles |
| `body.regular/bold` | Space Mono | Body text, labels |

**Font Sizes:**
| Token | Size | Component |
|-------|------|-----------|
| `xs` | 10px | Badges, meta text |
| `sm` | 12px | Meta component |
| `md` | 14px | Label component |
| `lg` | 16px | Body component |
| `xl` | 18px | H2 component |
| `xxl` | 24px | Large headings |
| `xxxl` | 28px | H1 component |

**Font Weights:**
| Token | Value |
|-------|-------|
| `regular` | 400 |
| `medium` | 500 |
| `semiBold` | 600 |
| `bold` | 700 |

**Line Heights:**
| Token | Value | Usage |
|-------|-------|-------|
| `tight` | 1.2 | Compact text |
| `normal` | 1.4 | Default |
| `relaxed` | 1.6 | Body text |

### Borders

**Widths:**
| Token | Value | Usage |
|-------|-------|-------|
| `widthHairline` | 1px | Subtle dividers |
| `widthThin` | 2px | Default borders |
| `widthCard` | 3px | Card borders |
| `widthHeavy` | 4px | Header borders, emphasis |
| `widthExtraHeavy` | 8px | Strong dividers |

**Radius:**
| Token | Value | Usage |
|-------|-------|-------|
| `radiusSharp` | 0 | Neobrutalist default |
| `radiusSmall` | 4px | Small elements, some badges |
| `radiusMedium` | 0 | (Unused, same as sharp) |
| `radiusLarge` | 0 | (Unused, same as sharp) |
| `radiusCard` | 0 | Card corners |
| `radiusPill` | 9999px | Pill shapes, fully rounded |

### Icons

**Sizes:**
| Token | Value |
|-------|-------|
| `xs` | 14px |
| `sm` | 18px |
| `md` | 24px |
| `lg` | 32px |
| `xl` | 40px |

**Stroke Widths:**
| Token | Value |
|-------|-------|
| `light` | 1.5 |
| `regular` | 2 |
| `strong` | 2.5 |

### Shadows

**Shadow Presets:**
| Token | Description |
|-------|-------------|
| `none` | No shadow |
| `card` | Platform-specific card shadow |
| `soft` | Subtle elevation |
| `menuItemBox.inactive` | Menu item default (6px offset, 0.2 opacity) |
| `menuItemBox.active` | Menu item active (6px offset, primary color) |

---

## Token Groups to Consumer Map

### Header Tokens (`components.header.*`)

| Token | Value | Consumers |
|-------|-------|-----------|
| `height` | 64px | GlobalHeader |
| `borderBottomWidth` | 4px | GlobalHeader |
| `backgroundColor` | background | GlobalHeader |
| `paddingHorizontal` | 16px | GlobalHeader |
| `inboxBadge.*` | Various | GlobalHeader badge |

### Screen Tokens (`components.screen.*`)

| Token | Consumers |
|-------|-----------|
| `backgroundColor` | Screen.tsx |
| `paddingHorizontal` | Screen.tsx |
| `paddingBottom` | Screen.tsx |

### Button Tokens (`components.button.*`)

| Token | Consumers |
|-------|-----------|
| `primary.*` | Button (primary variant) |
| `secondary.*` | Button (secondary variant) |
| `danger.*` | Button (danger variant) |
| `borderRadius`, `paddingVertical`, `shadowOffset` | All Button variants |

### Badge Tokens (`components.badge.*`)

| Token | Consumers |
|-------|-----------|
| `paddingHorizontal/Vertical` | Badge.tsx |
| `borderRadius`, `borderWidth` | Badge.tsx |
| `fontSize`, `fontWeight` | Badge.tsx |
| `*Large` variants | Badge (large size) |

### Input Tokens (`components.input.*`)

| Token | Consumers |
|-------|-----------|
| `backgroundColor`, `borderWidth`, `borderColor` | Input.tsx |
| `borderColorFocus`, `borderColorError` | Input.tsx (states) |
| `paddingHorizontal/Vertical`, `fontSize` | Input.tsx |

### Calendar Tokens (`components.calendar.*`)

| Token | Consumers |
|-------|-----------|
| `dayTileBorderWidth/Color` | EventsScreen calendar |
| `dayTileGap/GapY/Padding` | EventsScreen calendar |
| `selectedShadowOffset*` | EventsScreen selected day |

### Events Tokens (`components.events.*`)

| Token | Consumers |
|-------|-----------|
| `emptyState.*` | EventsScreen empty state |
| `card.*` | EventsScreen event cards |
| `detail.*` | EventDetailScreen |

### Transport Tokens (`components.transport.*`)

| Token Group | Consumers |
|-------------|-----------|
| `tiles.*` | TransportHubScreen tiles |
| `note.*` | TransportHubScreen info note |
| `overviewHeader.*` | RoadTransportScreen, SeaTransportScreen headers |
| `sectionHeader.*` | Transport section headers |
| `list.*` | Transport line lists, today's departures |
| `lineDetail.*` | LineDetailScreen, DepartureItem |

### Inbox Tokens (`components.inbox.*`)

| Token Group | Consumers |
|-------------|-----------|
| `tagFilter.*` | InboxListScreen tag filter bar |
| `tabs.*` | InboxListScreen tabs |
| `listItem.*` | InboxListScreen message items |

### Onboarding Tokens (`components.onboarding.*`)

| Token Group | Consumers |
|-------------|-----------|
| `welcomeScreen.*` | LanguageSelectionScreen |
| `roleCard.*` | OnboardingRoleCard |
| `municipalitySelection.*` | MunicipalitySelectionScreen |

---

## Hardcoded Values / Skin Bypass

| File | Hardcoded Value | Why It Matters | Tokenize? |
|------|-----------------|----------------|-----------|
| `HeroMediaHeader.tsx` | `aspectRatio: 16/10` | Layout dimension not in tokens | **Maybe** - could add `heroAspectRatio` |
| `HeroMediaHeader.tsx` | Chevron button `48x48` | Inconsistent with other touch targets | **Yes** - should use icon token |
| `HeroMediaHeader.tsx` | Dot size `10x10` | Pagination indicator size | **Yes** - should add `paginationDotSize` |
| `MicroPrimitives.tsx` | Dot sizes `sm: 6, md: 10` | Preset sizes not in tokens | **Maybe** - intentional presets |
| `MicroPrimitives.tsx` | IconBox sizes `sm: 24, md: 32, lg: 44` | Preset sizes not in tokens | **Maybe** - intentional presets |
| `GlobalHeader.tsx` | Menu/Inbox box `44x44` | Common touch target size | **Yes** - should add `touchTargetSize` |
| `DepartureItem.tsx` | Timeline indicator width `24px` | Timeline layout dimension | **Yes** - should add to lineDetail tokens |
| `DepartureItem.tsx` | Timeline item minHeight `40` | Timeline layout dimension | **Yes** - should add to lineDetail tokens |
| `Screen.tsx` | Test watermark position `top: 50, right: 8` | Dev-only styling | **No** - dev-only |
| `ClickFixDetailScreen.tsx` | Modal close button `top: 60, right: 20, size: 40x40` | Inconsistent modal close position | **Yes** - should standardize |
| `FeedbackConfirmationScreen.tsx` | Icon container `80x80, borderRadius: 40` | Success icon size | **Yes** - should add `confirmationIconSize` |
| `LanguageSelectionScreen.tsx` | Logo size `40% screen width` | Responsive calculation | **No** - intentional responsive |
| `HomeScreen.tsx` | Month abbreviations (JAN, FEB...) | i18n concern, not design | **No** - i18n data |
| `LineDetailScreen.tsx` | Carrier URLs (Jadrolinija, Krilo) | Data concern, not design | **No** - business data |
| `PhotoSlotTile.tsx` | `SHADOW_OFFSET: 4` | Shadow offset | **No** - already matches `shadowOffset` token |
| `ServiceAccordionCard.tsx` | `ICON_BOX_SIZE: 44`, `SHADOW_OFFSET: 4` | Icon box and shadow | **Yes** (icon box) - shadow already matches |

### Summary

| Category | Count | Priority |
|----------|-------|----------|
| Should tokenize | 8 | Medium |
| Maybe tokenize | 3 | Low |
| No need | 5 | N/A |

---

## Potentially Unused Tokens

| Token | Defined In | Observation |
|-------|------------|-------------|
| `colors.pink` | skin.neobrut2.ts | No direct usage found in screens/components |
| `borders.radiusMedium` | skin.neobrut2.ts | Set to 0, identical to radiusSharp/Large |
| `borders.radiusLarge` | skin.neobrut2.ts | Set to 0, identical to radiusSharp |
| `typography.lineHeight.relaxed` | skin.neobrut2.ts | Rarely used (most use tight/normal) |
| `shadows.soft` | skin.neobrut2.ts | Limited usage |

**Note:** These tokens may be intentionally defined for future use or theme variants.

---

## Platform-Specific Divergences

### Date Picker (LineDetailScreen)

| Platform | Implementation |
|----------|----------------|
| iOS | Modal with spinner DateTimePicker |
| Android | Native DateTimePicker (inline) |

**File:** `mobile/src/screens/transport/LineDetailScreen.tsx`

### Coordinate Font (ClickFixDetailScreen)

| Platform | Font |
|----------|------|
| iOS | `Menlo` |
| Android | `monospace` |

**File:** `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx`

### LayoutAnimation (DepartureItem)

| Platform | Handling |
|----------|----------|
| iOS | Works by default |
| Android | Requires `UIManager.setLayoutAnimationEnabledExperimental(true)` |

**File:** `mobile/src/components/DepartureItem.tsx`

### Shadow Rendering (skin.neobrut2.ts)

| Platform | Implementation |
|----------|----------------|
| iOS | `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` |
| Android | `elevation` (limited), fallback to border |

**File:** `mobile/src/ui/skin.neobrut2.ts` (`platformShadow()` function)

### Safe Area Handling

| Platform | Handling |
|----------|----------|
| iOS | SafeAreaView with insets |
| Android | SafeAreaView with insets |

**File:** `mobile/src/ui/Screen.tsx`

---

*End of Design Tokens Usage Map*
