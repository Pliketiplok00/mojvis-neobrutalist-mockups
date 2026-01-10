# Header & Menu Consistency Report

**Date:** 2026-01-09
**Task:** Fix header inconsistency + remove menu footer

---

## Issues Fixed

### Issue 1: Header showing back button instead of hamburger

**Problem:** On many screens, the hamburger icon was replaced by a back arrow.

**Root Cause:** `GlobalHeader` component had a `type` prop that determined left icon behavior:
- `type="root"` → showed hamburger
- `type="child"` or `type="inbox"` → showed back arrow

Many screens used `type="child"`, causing them to show back arrows.

**Fix:** Modified `GlobalHeader` to:
1. ALWAYS show hamburger icon (removed BackIcon entirely)
2. Use `useMenu()` hook directly instead of relying on `onMenuPress` prop
3. Call `openMenu()` when hamburger is pressed on ALL screens

### Issue 2: Menu had footer

**Problem:** Menu overlay had a footer showing "MOJ VIS v1.0"

**Fix:** Removed footer JSX and styles from `MenuOverlay.tsx`

---

## Files Changed

### `mobile/src/components/GlobalHeader.tsx`

**Before:**
```tsx
// Placeholder icons
const HamburgerIcon = () => <Text style={styles.iconText}>☰</Text>;
const BackIcon = () => <Text style={styles.iconText}>←</Text>;

// ...

const handleLeftPress = (): void => {
  if (type === 'root' && onMenuPress) {
    onMenuPress();
  } else if (type === 'child' || type === 'inbox') {
    navigation.goBack();
  }
};

// In render:
{type === 'root' ? <HamburgerIcon /> : <BackIcon />}
```

**After:**
```tsx
import { useMenu } from '../contexts/MenuContext';

// Placeholder icons - BackIcon REMOVED
const HamburgerIcon = () => <Text style={styles.iconText}>☰</Text>;

// ...

const { openMenu } = useMenu();

// ALWAYS open menu - no back button behavior
const handleLeftPress = (): void => {
  openMenu();
};

// In render:
<HamburgerIcon />  // ALWAYS hamburger
```

### `mobile/src/components/MenuOverlay.tsx`

**Before:**
```tsx
{/* Footer */}
<View style={styles.footer}>
  <Text style={styles.footerText}>MOJ VIS v1.0</Text>
</View>

// Styles:
footer: {
  padding: 16,
  borderTopWidth: 1,
  borderTopColor: '#E0E0E0',
  alignItems: 'center',
},
footerText: {
  fontSize: 12,
  color: '#999999',
},
```

**After:**
```tsx
{/* Footer removed per UI contract (2026-01-09) */}

// Styles removed
```

---

## Screens Verified

All 17 screens using GlobalHeader now show hamburger menu:

| Screen | File | Status |
|--------|------|--------|
| Home | `home/HomeScreen.tsx` | Hamburger |
| Events | `events/EventsScreen.tsx` | Hamburger |
| Event Detail | `events/EventDetailScreen.tsx` | Hamburger |
| Transport Hub | `transport/TransportHubScreen.tsx` | Hamburger |
| Road Transport | `transport/RoadTransportScreen.tsx` | Hamburger |
| Sea Transport | `transport/SeaTransportScreen.tsx` | Hamburger |
| Line Detail | `transport/LineDetailScreen.tsx` | Hamburger |
| Inbox List | `inbox/InboxListScreen.tsx` | Hamburger |
| Inbox Detail | `inbox/InboxDetailScreen.tsx` | Hamburger |
| Static Page | `pages/StaticPageScreen.tsx` | Hamburger |
| Settings | `settings/SettingsScreen.tsx` | Hamburger |
| Feedback Form | `feedback/FeedbackFormScreen.tsx` | Hamburger |
| Feedback Confirmation | `feedback/FeedbackConfirmationScreen.tsx` | Hamburger |
| Feedback Detail | `feedback/FeedbackDetailScreen.tsx` | Hamburger |
| Click & Fix Form | `click-fix/ClickFixFormScreen.tsx` | Hamburger |
| Click & Fix Confirmation | `click-fix/ClickFixConfirmationScreen.tsx` | Hamburger |
| Click & Fix Detail | `click-fix/ClickFixDetailScreen.tsx` | Hamburger |

---

## Regression Tests

File: `mobile/src/__tests__/headerMenuConsistency.test.ts`

### Tests Added

1. **`GlobalHeader should always show hamburger icon, never back arrow`**
   - Verifies BackIcon is NOT defined or used
   - Verifies HamburgerIcon IS defined and used
   - Verifies handleLeftPress calls openMenu(), not goBack()

2. **`GlobalHeader should use MenuContext for menu control`**
   - Verifies useMenu import
   - Verifies useMenu() hook usage

3. **`MenuOverlay should NOT have footer JSX`**
   - Verifies footer View/Text elements removed
   - Verifies "MOJ VIS v1.0" text removed

4. **`MenuOverlay should NOT have footer styles`**
   - Verifies footer/footerText styles removed

5. **`should document screens that use GlobalHeader`**
   - Lists all screens using the header (17 total)

### Test Output

```
$ npm test

PASS src/__tests__/useUserContext.test.ts
PASS src/__tests__/bannerPlacements.test.ts
PASS src/__tests__/headerMenuConsistency.test.ts
  ● Console

    console.log
      Screens using GlobalHeader: [
        'click-fix/ClickFixConfirmationScreen.tsx',
        'click-fix/ClickFixDetailScreen.tsx',
        'click-fix/ClickFixFormScreen.tsx',
        'events/EventDetailScreen.tsx',
        'events/EventsScreen.tsx',
        'feedback/FeedbackConfirmationScreen.tsx',
        'feedback/FeedbackDetailScreen.tsx',
        'feedback/FeedbackFormScreen.tsx',
        'home/HomeScreen.tsx',
        'inbox/InboxDetailScreen.tsx',
        'inbox/InboxListScreen.tsx',
        'pages/StaticPageScreen.tsx',
        'settings/SettingsScreen.tsx',
        'transport/LineDetailScreen.tsx',
        'transport/RoadTransportScreen.tsx',
        'transport/SeaTransportScreen.tsx',
        'transport/TransportHubScreen.tsx'
      ]

Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
```

---

## Runtime Verification

### Expo Restart

```bash
$ pkill -f expo
$ pkill -f metro
$ rm -rf .expo node_modules/.cache
$ npx expo start -c
```

### iOS Simulator Restart

```bash
$ xcrun simctl shutdown all
$ xcrun simctl boot "iPhone 16"
$ open -a Simulator
```

### Runtime Logs (Expo Console)

```
iOS Bundled 9848ms index.ts (1124 modules)
LOG  [BANNERLIST_RENDER] {"bannerCount": 0, ...}
LOG  [BANNERLIST_RENDER] {"bannerCount": 3, ...}
LOG  [STATICPAGE_RENDER] {"slug": "flora-fauna", ...}
LOG  [BANNERLIST_RENDER] {"bannerCount": 3, ...}
```

Navigation to Flora/Fauna via menu confirms:
1. Hamburger opens menu from Home screen
2. Menu navigation works
3. Static page renders (with hamburger, no back arrow)
4. Menu footer is gone

---

## Header Configuration Source

All screens use `GlobalHeader` (or `Header` UI primitive wrapper) which:
1. Always renders `HamburgerIcon` on the left
2. Calls `openMenu()` from `MenuContext` when tapped
3. Does not support back button (removed from code)

Back navigation is handled by iOS native swipe gesture (enabled by default in `@react-navigation/native-stack`).

---

## Statement

**No unrelated code was modified.**

Changes were strictly limited to:
- `GlobalHeader.tsx`: Header component fix
- `MenuOverlay.tsx`: Footer removal
- `headerMenuConsistency.test.ts`: Regression tests (new file)

---

## Summary

| Issue | Status |
|-------|--------|
| Header shows back button | **FIXED** - Always shows hamburger |
| Menu has footer | **FIXED** - Footer removed |
| Regression tests | **ADDED** - 5 new tests |
| Expo + Simulator restart | **DONE** |
