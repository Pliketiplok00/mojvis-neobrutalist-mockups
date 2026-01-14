# GROUP 5: Events Screens Migration Report

**Date:** 2026-01-11
**Branch:** `chore/skin-events-group5`
**Status:** COMPLETE

---

## Summary

Migrated all 2 Events screens to be 100% skin-first compatible AND font-safe:
- `mobile/src/screens/events/EventsScreen.tsx`
- `mobile/src/screens/events/EventDetailScreen.tsx`

All screens now use:
- Skin tokens only (no hardcoded hex colors)
- App Text primitives (H1, H2, Label, Body, Meta, ButtonText) for font safety
- Icon primitive for navigation arrows (no text glyphs)

Zero hardcoded hex colors. Zero text glyphs. Zero font drift risk.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `mobile/src/screens/events/EventsScreen.tsx` | Full skin-first + font-safe migration |
| `mobile/src/screens/events/EventDetailScreen.tsx` | Full skin-first + font-safe migration |

---

## EventsScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, eventItem background | color |
| `#000000` | text, border, calendar selected day bg, ActivityIndicator | color |
| `#666666` | sectionSubtitle, calendarDayName, eventLocation | color |
| `#F5F5F5` | calendar, emptyState background | color |
| `#E0E0E0` | calendarDayToday background | color |
| `#FF0000` | eventDot, errorText | color |
| `<` | calendar prev navigation | text glyph |
| `>` | calendar next navigation, eventArrow | text glyph |
| `16`, `24`, `4`, `8`, `12` | spacing | spacing |
| `24`, `16`, `18`, `14`, `12`, `20` | font sizes | typography |
| `2`, `12`, `8`, `20` | border width, radius | border |

### Text Primitives Used

| Location | Primitive | Rationale |
|----------|-----------|-----------|
| Section title | `H1` | Hero title (28px bold) |
| Calendar month/year | `H2` | Section title (18px semiBold) |
| Calendar day names | `Meta` | Small muted text (12px) |
| Calendar day numbers | `Label` | Medium text (14px) |
| Selected date title | `ButtonText` | Semibold UI text (16px) |
| Event time | `Label` | With bold override |
| Event title | `ButtonText` | Semibold UI text |
| Event location | `Meta` | Small muted text |
| Error text | `Label` | With error color override |
| Empty state text | `Label` | With muted color override |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` (text) | `skin.colors.textPrimary` |
| `#000000` (selected bg) | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `#F5F5F5` | `skin.colors.backgroundSecondary` |
| `#E0E0E0` | `skin.colors.borderLight` |
| `#FF0000` (dot) | `skin.colors.urgent` |
| `#FF0000` (error) | `skin.colors.errorText` |
| `<` text glyph | `<Icon name="chevron-left" />` |
| `>` text glyph (nav) | `<Icon name="chevron-right" />` |
| `>` text glyph (arrow) | `<Icon name="chevron-right" colorToken="chevron" />` |
| `ActivityIndicator color="#000000"` | `skin.colors.textPrimary` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `borderRadius: 12` | `skin.borders.radiusCard` |
| `borderRadius: 20` | `skin.borders.radiusPill` |
| `padding: 16` | `skin.spacing.lg` |
| `marginBottom: 16` | `skin.spacing.lg` |

---

## EventDetailScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, Switch thumbColor | color |
| `#000000` | title, border, reminderLabel, shareButton bg, Switch trackColor true, ActivityIndicator | color |
| `#666666` | infoLabel, reminderHint | color |
| `#333333` | infoValueSecondary, description | color |
| `#F5F5F5` | reminderSection background | color |
| `#E0E0E0` | infoSection border, Switch trackColor false | color |
| `#FF0000` | errorText | color |
| `16`, `24`, `4`, `2` | spacing | spacing |
| `24`, `16`, `15`, `14`, `12` | font sizes | typography |
| `2`, `8`, `1` | border width, radius | border |

### Text Primitives Used

| Location | Primitive | Rationale |
|----------|-----------|-----------|
| Event title | `H1` | Hero title (28px bold) |
| Info labels | `Meta` | Small uppercase labels (12px) |
| Info values | `Body` | Body text (16px) |
| Time secondary | `Label` | Medium text (14px) |
| Description | `Body` | Body text with lineHeight |
| Reminder label | `ButtonText` | Semibold UI text |
| Reminder hint | `Meta` | Small muted text |
| Share button | `ButtonText` | Button text (16px semibold) |
| Error text | `Label` | With error color override |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` (text/border) | `skin.colors.textPrimary` / `skin.colors.border` |
| `#666666` | Uses Meta primitive (inherits textDisabled) |
| `#333333` | `skin.colors.textSecondary` |
| `#F5F5F5` | `skin.colors.backgroundSecondary` |
| `#E0E0E0` | `skin.colors.borderLight` |
| `#FF0000` | `skin.colors.errorText` |
| `Switch trackColor false` | `skin.colors.borderLight` |
| `Switch trackColor true` | `skin.colors.textPrimary` |
| `Switch thumbColor` | `skin.colors.background` |
| `ActivityIndicator color="#000000"` | `skin.colors.textPrimary` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `borderRadius: 8` | `skin.borders.radiusCard` |
| `padding: 16` | `skin.spacing.lg` |

---

## Typography Enforcement

### App Text Primitives Used Everywhere

All text nodes in both screens now use the app Text primitives from `mobile/src/ui/Text.tsx`:
- `H1` - Hero titles
- `H2` - Section titles
- `Label` - Medium text (14px)
- `Body` - Body text (16px)
- `Meta` - Small muted text (12px)
- `ButtonText` - Button/UI text (16px semibold)

### Justified Exceptions

**None** - All text nodes use app Text primitives. No RNText with inline fontFamily needed.

### Font Family Overrides via skin.typography

Where primitives needed style adjustments, explicit `fontFamily` from skin was used:
- `calendarDayName`: Added `fontFamily: skin.typography.fontFamily.body.bold`
- `calendarDayTextSelected`: Added `fontFamily: skin.typography.fontFamily.body.bold`
- `eventTimeText`: Added `fontFamily: skin.typography.fontFamily.body.bold`
- `infoLabel`: Added `fontFamily: skin.typography.fontFamily.body.bold`

This ensures NO hardcoded font names and prevents font drift.

---

## New Semantic Skin Tokens Added

**NONE** - All required tokens already existed in skin.neobrut2.ts:
- `background`, `backgroundSecondary` (surfaces)
- `textPrimary`, `textSecondary`, `textMuted` (text)
- `border`, `borderLight` (borders)
- `errorText`, `urgent` (status colors)
- `chevron` (navigation indicator color)

---

## Icon.tsx Additions

**NONE** - All required icons already existed:
- `chevron-left` - Calendar previous month navigation
- `chevron-right` - Calendar next month, event list arrow

---

## Verification Results

### 1. TypeScript Check

```bash
$ pnpm -r typecheck
Scope: all 4 projects
. typecheck$ pnpm --dir backend typecheck && pnpm --dir admin exec tsc -b --noEmit && pnpm --dir mobile exec tsc --noEmit
backend typecheck: Done
. typecheck: Done
```

**Result:** PASS

### 2. Design Guardrails

```bash
$ pnpm design:guard
Design guard passed.
```

**Result:** PASS

### 3. Hex Color Scan

```bash
$ rg -n --hidden --glob '!**/node_modules/**' '#[0-9a-fA-F]{3,8}\b' \
    mobile/src/screens/events/EventsScreen.tsx \
    mobile/src/screens/events/EventDetailScreen.tsx

(no output)
```

**Result:** PASS (0 matches)

### 4. Manual iOS Smoke Test

```
Instructions for manual verification:
- Open Events screen
- Verify calendar renders with correct fonts (Space Grotesk for titles, Space Mono for body)
- Navigate months with chevron icons (< >)
- Select a date and verify event list loads
- Open an Event detail
- Verify all text uses correct fonts
- Toggle reminder switch
- Press share button
- Back navigation works
- No redbox, no console errors
- Visual spot-check: fonts match known-correct screens (e.g. Settings)
```

---

## Remaining Known Design Violations (Outside Scope)

| Screen/Component | Violation Count | Status |
|------------------|-----------------|--------|
| `pages/*` | ~38 hex colors | Pending (GROUP 6) |

These are tracked in the design-guard baseline.

---

## Commit

```
chore(mobile): make Events screens skin-first (group5)

- EventsScreen: Replace all hardcoded hex colors with skin tokens
- EventsScreen: Replace text glyphs (<, >) with Icon chevron-left/right
- EventsScreen: Use app Text primitives (H1, H2, Label, Body, Meta, ButtonText)
- EventsScreen: ActivityIndicator color uses skin.colors.textPrimary
- EventDetailScreen: Replace all hardcoded hex colors with skin tokens
- EventDetailScreen: Use app Text primitives for all text nodes
- EventDetailScreen: Switch trackColor/thumbColor use skin tokens
- EventDetailScreen: ActivityIndicator color uses skin.colors.textPrimary

All 2 Events screens are now 100% skin-first compatible.
Zero hardcoded hex colors. Zero text glyphs. Font-safe typography.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
