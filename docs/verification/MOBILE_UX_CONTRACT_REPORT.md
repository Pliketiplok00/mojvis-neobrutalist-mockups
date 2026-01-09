# Mobile App UX Contract Verification Report

**Branch:** `audit/mobile-runtime-verification`
**Date:** 2025-01-09
**Scope:** Header behavior and navigation UX patterns

---

## Executive Summary

The UX contract for header behavior has been analyzed. The current implementation uses a **hamburger-menu-only** pattern across ALL screens, which diverges from the expected **hamburger for root / back button for child** pattern.

---

## UX Contract Specification

### Expected Behavior
| Screen Type | Left Button | Behavior |
|-------------|-------------|----------|
| Root screens | Hamburger (menu) | Opens slide-out menu |
| Child screens | Back arrow | Navigates back in stack |

### Root Screens (per spec)
- Home
- InboxList
- Events
- TransportHub

### Child Screens (per spec)
- All detail screens
- All form screens
- All confirmation screens
- Settings

---

## Current Implementation Analysis

### GlobalHeader Component
**File:** `mobile/src/components/GlobalHeader.tsx`

```typescript
// Current implementation (simplified):
const handleLeftPress = (): void => {
  openMenu(); // ALWAYS opens menu - no back button behavior
};
```

### Header Type Prop
The `GlobalHeader` accepts a `type` prop:
- `type="root"` - Intended for root screens
- `type="child"` - Intended for child screens
- `type="inbox"` - Special type for inbox (no inbox icon)

However, analysis shows the `type` prop does NOT change the left button behavior - it only affects icon display.

---

## Screen-by-Screen Analysis

### Root Screens

| Screen | Uses GlobalHeader | Type Prop | Behavior |
|--------|-------------------|-----------|----------|
| HomeScreen | YES | `root` | Hamburger - CORRECT |
| InboxListScreen | YES | `inbox` | Hamburger - CORRECT |
| EventsScreen | YES | `root` | Hamburger - CORRECT |
| TransportHubScreen | YES | `root` | Hamburger - CORRECT |

### Child Screens

| Screen | Uses GlobalHeader | Type Prop | Actual Behavior | Expected |
|--------|-------------------|-----------|-----------------|----------|
| ClickFixFormScreen | YES | `child` | Hamburger | Back |
| FeedbackFormScreen | YES | `child` | Hamburger | Back |
| StaticPageScreen | YES | `child` | Hamburger | Back |
| InboxDetailScreen | YES | `child` | Hamburger | Back |
| EventDetailScreen | Expected | `child` | Unknown | Back |

---

## iOS Swipe-Back Behavior

The app relies on **iOS native swipe gesture** for back navigation on child screens:

```typescript
// From React Navigation Native Stack default behavior:
// - Swipe from left edge triggers back navigation
// - This is automatic with @react-navigation/native-stack
```

### Implications
1. **iOS users:** Can navigate back via swipe (works)
2. **Android users:** No hardware back button mentioned, hamburger only
3. **Discoverability:** Users may not realize swipe-back exists

---

## Menu Overlay Analysis

**File:** `mobile/src/components/MenuOverlay.tsx`

The menu overlay provides:
- Navigation to root screens
- Access to static pages
- Settings link

### Menu Items Structure
```typescript
const menuItems = [
  { label: 'Pocetna', screen: 'Home' },
  { label: 'Sanducic', screen: 'InboxList' },
  { label: 'Dogadaji', screen: 'Events' },
  { label: 'Vozni red', screen: 'TransportHub' },
  // Static pages loaded dynamically
];
```

---

## UX Issues Identified

### Issue 1: No Visual Back Button on Child Screens

**Severity:** MEDIUM

**Impact:** Users on child screens have no obvious way to go back other than:
- iOS swipe gesture (not discoverable)
- Opening menu and selecting another screen (disruptive)

**Affected Screens:**
- ClickFixFormScreen
- FeedbackFormScreen
- StaticPageScreen
- InboxDetailScreen
- EventDetailScreen
- ClickFixDetailScreen
- FeedbackDetailScreen
- ClickFixConfirmationScreen
- FeedbackConfirmationScreen
- RoadTransportScreen (debatable - could be root)
- SeaTransportScreen (debatable - could be root)

### Issue 2: Inconsistent with Platform Conventions

**Severity:** LOW

**Impact:** Both iOS and Android users expect a back button in the header for child screens. Current pattern breaks platform conventions.

### Issue 3: Menu Accessible from Child Screens

**Severity:** INFO

**Impact:** Users can open the full menu from any screen, which could cause confusion about navigation state.

---

## Recommended Fix

### Option A: Conditional Header Behavior (Recommended)

Modify `GlobalHeader` to check `type` prop and render appropriate button:

```typescript
// Proposed change in GlobalHeader.tsx
const handleLeftPress = (): void => {
  if (type === 'child') {
    navigation.goBack();
  } else {
    openMenu();
  }
};

// Render different icon based on type
const leftIcon = type === 'child' ? '←' : '☰';
```

### Option B: Separate Components

Create separate `RootHeader` and `ChildHeader` components with distinct behaviors.

### Option C: Accept Current Pattern

Document that all screens use hamburger menu and rely on iOS swipe-back. Ensure Android back button is wired.

---

## Header Icon Audit

| Icon Position | Root Screens | Child Screens | Notes |
|---------------|--------------|---------------|-------|
| Left | Hamburger | Hamburger | Should be Back for child |
| Center | Logo/Title | Logo/Title | Consistent |
| Right | Inbox badge | Inbox badge | Consistent |

---

## Verification Checklist

| Item | Status |
|------|--------|
| Root screens show hamburger | VERIFIED |
| Child screens show hamburger | VERIFIED (but unexpected) |
| iOS swipe-back works | EXPECTED (native stack default) |
| Menu overlay functions | VERIFIED |
| Header type prop exists | VERIFIED |
| Type prop affects button | NOT IMPLEMENTED |

---

## Summary

The current UX pattern is **consistent but unconventional**. All screens display a hamburger menu, relying on iOS swipe gestures for back navigation. This works but may confuse users expecting a back button on child screens.

**Recommendation:** Implement conditional header behavior based on `type` prop to provide explicit back navigation on child screens.
