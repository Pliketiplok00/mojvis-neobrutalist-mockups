# Design Baseline Contents

## Overview

This document lists exactly what is included in the canonical design baseline (`integration/design-baseline-final`).

---

## 1. Fonts

**Files:**
- `mobile/src/ui/fonts.ts` - Font loading infrastructure

**Fonts Included:**
- Space Grotesk (Regular, Medium, SemiBold, Bold) - Display/headings
- Space Mono (Regular, Bold) - Body/UI text

**Integration:**
- `App.tsx` calls `useAppFonts()` at root
- Font loading screen during initialization
- Font error screen for failures

---

## 2. Icons

**Files:**
- `mobile/src/ui/Icon.tsx` - Icon primitive component

**System:**
- Uses `lucide-react-native` icons
- Wrapped in skin-controlled `<Icon />` component
- Accepts size, stroke, and color tokens

**Available Icons:**
menu, inbox, home, calendar, bus, ship, leaf, info, wrench, message-circle, phone, mail, mail-open, globe, settings, file-text, chevron-right, chevron-left, chevron-up, chevron-down, close, alert-triangle, send, camera

**Policy:**
- NO raw lucide imports in screens/components
- NO emoji icons in UI
- All icons via `<Icon name="..." />` primitive

---

## 3. Skin System

**Files:**
- `mobile/src/ui/skin.ts` - Re-exports active skin
- `mobile/src/ui/skin.neobrut2.ts` - Mediterranean neobrut theme

**Tokens:**
- `skin.colors.*` - Semantic color tokens
- `skin.spacing.*` - Spacing scale (xs-xxxl)
- `skin.typography.*` - Font families, sizes, weights
- `skin.borders.*` - Border widths and radii
- `skin.shadows.*` - Shadow definitions
- `skin.icons.*` - Icon size and stroke tokens
- `skin.components.*` - Component-level tokens

---

## 4. Header & Menu

**Files:**
- `mobile/src/components/GlobalHeader.tsx`
- `mobile/src/components/MenuOverlay.tsx`

**Status:** Fully migrated
- Uses `<Icon />` primitive (no emoji)
- Uses skin tokens (no hardcoded hex)
- Uses skin typography

---

## 5. Transport Screens

**Files:**
- `mobile/src/screens/transport/SeaTransportScreen.tsx`
- `mobile/src/screens/transport/RoadTransportScreen.tsx`
- `mobile/src/screens/transport/TransportHubScreen.tsx`
- `mobile/src/screens/transport/LineDetailScreen.tsx`

**Status:** Fully migrated
- All use skin color tokens
- All use skin typography
- All use `<Icon />` primitive
- 0 hardcoded hex colors

---

## 6. Inbox Screens

**Files:**
- `mobile/src/screens/inbox/InboxListScreen.tsx`
- `mobile/src/screens/inbox/InboxDetailScreen.tsx`

**Status:** Fully migrated
- Uses skin tokens throughout
- Uses UI primitives (Badge, Card, etc.)
- 0 hardcoded hex colors

---

## 7. UI Primitives

**Files:**
- `mobile/src/ui/Screen.tsx`
- `mobile/src/ui/Header.tsx`
- `mobile/src/ui/Section.tsx`
- `mobile/src/ui/Card.tsx`
- `mobile/src/ui/Button.tsx`
- `mobile/src/ui/Text.tsx` (H1, H2, Label, Body, Meta)
- `mobile/src/ui/ListRow.tsx`
- `mobile/src/ui/Badge.tsx`

**Barrel Export:**
- `mobile/src/ui/index.ts` - Single import point

---

## Screens NOT Yet Migrated

The following screens still have hardcoded hex colors and are **outside this baseline scope**:

- Events screens
- Onboarding screens
- Click-Fix screens
- Feedback screens
- Settings screen
- Static pages screen
- Banner component
- DepartureItem component

These will be migrated in future work, building on this baseline.

---

**Baseline Commit:** `59bc36b`
**Date:** 2026-01-10
