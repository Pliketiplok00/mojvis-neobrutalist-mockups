# Typography Unification Report

**Date:** 2026-01-11
**Branch:** `chore/typography-unification-all-text`
**Scope:** Mobile app - global typography unification

## Summary

This report documents the comprehensive typography unification across the MOJ VIS mobile app. All raw React Native `Text` imports and manual typography styles have been replaced with the app's Text primitives from `mobile/src/ui/Text.tsx`.

## Typography Contract

### Available Text Primitives

| Primitive | Base Size | Weight | Use Case |
|-----------|-----------|--------|----------|
| `H1` | 28px (xxxl) | Bold | Page titles, major headings |
| `H2` | 18px (xl) | SemiBold | Section titles, card headers |
| `Label` | 14px (md) | Regular | Form labels, list items, body text |
| `Body` | 16px (lg) | Regular | Paragraphs, descriptions |
| `Meta` | 12px (sm) | Regular | Timestamps, secondary info, muted text |
| `ButtonText` | 16px (lg) | Bold | Button labels, action text |

### Skin Token Mapping

All primitives use tokens from `skin.typography`:
- `fontFamily.display.bold` / `fontFamily.body.*` (Space Grotesk / Space Mono)
- `fontSize.xs` (10) through `fontSize.xxxl` (28)
- `fontWeight.regular`, `.medium`, `.semiBold`, `.bold`

## Files Modified

### Components
- `mobile/src/components/Banner.tsx` - Replaced raw Text with Label/Meta
- `mobile/src/components/GlobalHeader.tsx` - Replaced raw Text with H2/Meta
- `mobile/src/components/DepartureItem.tsx` - Replaced raw Text with H2/Label/Body/Meta
- `mobile/src/components/MenuOverlay.tsx` - Replaced raw Text with H1/Label/Meta

### Screens - Transport
- `mobile/src/screens/transport/RoadTransportScreen.tsx` - Cleaned StyleSheet typography
- `mobile/src/screens/transport/SeaTransportScreen.tsx` - Cleaned StyleSheet typography
- `mobile/src/screens/transport/TransportHubScreen.tsx` - Cleaned StyleSheet typography

### Screens - Click & Fix
- `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx` - Replaced raw Text with primitives

### Screens - Feedback
- `mobile/src/screens/feedback/FeedbackFormScreen.tsx` - Replaced raw Text with primitives
- `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx` - Replaced raw Text with primitives

### Screens - Events
- `mobile/src/screens/events/EventsScreen.tsx` - Removed unused Text import, cleaned styles
- `mobile/src/screens/events/EventDetailScreen.tsx` - Removed unused Text import, cleaned styles

### Screens - Other
- `mobile/src/screens/settings/SettingsScreen.tsx` - Replaced all raw Text with primitives
- `mobile/src/screens/inbox/InboxListScreen.tsx` - Replaced tab Text with Label
- `mobile/src/screens/home/HomeScreen.tsx` - Cleaned StyleSheet typography
- `mobile/src/screens/pages/StaticPageScreen.tsx` - Removed unused Text import, cleaned styles

## Documented Exceptions

The following patterns are **allowed** per the typography contract:

1. **TextInput fontSize** - Form inputs need explicit sizing
   - `ClickFixFormScreen.tsx:432` - TextInput style
   - `FeedbackFormScreen.tsx:222` - TextInput style

2. **Monospace fontFamily for coordinates** (if present)
   - Used for displaying GPS coordinates in location-related features

3. **UI Primitives internal usage**
   - `mobile/src/ui/Text.tsx` - Defines the primitives (uses RN Text internally)
   - `mobile/src/ui/Icon.tsx` - Icon component (may use Text for fallbacks)
   - `mobile/src/ui/Section.tsx` - Section component (uses Text primitives)
   - `mobile/src/ui/Badge.tsx` - Badge component (uses Text primitives)

## Verification Results

- **TypeScript:** `pnpm -r typecheck` - PASSED
- **Design Guard:** `pnpm design:guard` - PASSED
- **Raw Text imports in screens/components:** 0 (all replaced)
- **Manual fontFamily in screens/components:** 0 (all removed)
- **Manual fontSize in screens/components:** 2 (TextInput - allowed)
- **Manual fontWeight in screens/components:** 0 (all removed)

## Migration Pattern Applied

For each file:

1. **Remove raw Text import:**
   ```tsx
   // Before
   import { View, Text, ... } from 'react-native';

   // After
   import { View, ... } from 'react-native';
   import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
   ```

2. **Replace JSX elements:**
   ```tsx
   // Before
   <Text style={styles.title}>{text}</Text>

   // After
   <H1 style={styles.title}>{text}</H1>
   ```

3. **Clean StyleSheet:**
   ```tsx
   // Before
   title: {
     fontSize: skin.typography.fontSize.xxxl,
     fontWeight: skin.typography.fontWeight.bold,
     color: skin.colors.textPrimary,
     marginBottom: skin.spacing.md,
   }

   // After
   title: {
     marginBottom: skin.spacing.md,
   }
   ```

## Conclusion

The mobile app now uses a unified typography system based on the Text primitives. All typography styling is centralized in `mobile/src/ui/Text.tsx` and skin tokens, making future typography changes trivial and consistent across the entire app.
