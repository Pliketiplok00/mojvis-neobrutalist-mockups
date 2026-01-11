# GROUP 3: Feedback Screens Migration Report

**Date:** 2026-01-11
**Branch:** `chore/skin-feedback-group3`
**Status:** COMPLETE

---

## Summary

Migrated all 3 Feedback screens to be 100% skin-first compatible:
- `mobile/src/screens/feedback/FeedbackFormScreen.tsx`
- `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx`
- `mobile/src/screens/feedback/FeedbackDetailScreen.tsx`

All screens now use only skin tokens and the Icon primitive. Zero hardcoded hex colors, zero text glyphs.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `mobile/src/screens/feedback/FeedbackFormScreen.tsx` | Full skin-first migration |
| `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx` | Full skin-first migration |
| `mobile/src/screens/feedback/FeedbackDetailScreen.tsx` | Full skin-first migration |
| `mobile/src/ui/Icon.tsx` | Added 'check' icon (required dependency) |

---

## FeedbackFormScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, input background | color |
| `#000000` | title, label, input border/text, submit button | color |
| `#666666` | subtitle | color |
| `#999999` | placeholderTextColor, charCount | color |
| `#FFF3CD` | errorContainer background | color |
| `#856404` | errorText | color |
| `#CC0000` | required, inputError, fieldError | color |
| `16`, `32`, `24`, `20`, `4`, `8`, `12` | spacing | spacing |
| `28`, `14`, `16`, `12` | font sizes | typography |
| `2`, `8` | border width, radius | border |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` (text) | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `#999999` | `skin.colors.textDisabled` |
| `#FFF3CD` | `skin.colors.warningBackground` |
| `#856404` | `skin.colors.warningAccent` |
| `#CC0000` | `skin.colors.errorText` |
| `placeholderTextColor="#999999"` | `skin.colors.textDisabled` |
| `ActivityIndicator color="#FFFFFF"` | `skin.colors.background` |
| `padding: 16` | `skin.spacing.lg` |
| `paddingBottom: 32` | `skin.spacing.xxxl` |
| `marginBottom: 24` | `skin.spacing.xxl` |
| `fontSize: 28` | `skin.typography.fontSize.xxxl` |
| `fontSize: 16` | `skin.typography.fontSize.lg` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `borderRadius: 8` | `skin.borders.radiusCard` |

---

## FeedbackConfirmationScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, secondaryButton background | color |
| `#000000` | iconContainer, title, primaryButton, secondaryButton border/text | color |
| `#666666` | message text | color |
| `✓` | success icon | text glyph |
| `32`, `24`, `12`, `16`, `14` | spacing | spacing |
| `40`, `24`, `16` | font sizes | typography |
| `80`, `40` | icon container dimensions | layout |
| `2`, `8` | border width, radius | border |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` (background) | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `✓` text glyph | `<Icon name="check" size="xl" colorToken="background" />` |
| `padding: 32` | `skin.spacing.xxxl` |
| `marginBottom: 24` | `skin.spacing.xxl` |
| `gap: 12` | `skin.spacing.md` |
| `fontSize: 24` | `skin.typography.fontSize.xxl` |
| `fontSize: 16` | `skin.typography.fontSize.lg` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `borderRadius: 8` | `skin.borders.radiusCard` |

---

## FeedbackDetailScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, replyCard background | color |
| `#000000` | ActivityIndicator, subject, sectionTitle, replyLabel, replyCard border | color |
| `#666666` | loadingText, date, emptyText, replyDate | color |
| `#F5F5F5` | messageCard, emptyState background | color |
| `#333333` | body, replyBody | color |
| `#856404` | errorText | color |
| Status colors (see table below) | status badge | color |
| `16`, `32`, `12`, `24`, `4`, `8`, `20` | spacing | spacing |
| `14`, `16`, `20`, `18`, `12` | font sizes | typography |
| `2`, `12`, `20`, `8` | border width, radius | border |

### Status Color Mapping

The FeedbackDetailScreen includes a status badge with colors per status. Replaced hardcoded hex values with semantic skin tokens:

| Status | Original BG | Original Text | Skin BG Token | Skin Text Token |
|--------|-------------|---------------|---------------|-----------------|
| `zaprimljeno` (received) | `#E3F2FD` | `#1565C0` | `skin.colors.infoBackground` | `skin.colors.infoText` |
| `u_razmatranju` (in review) | `#FFF3E0` | `#E65100` | `skin.colors.pendingBackground` | `skin.colors.pendingText` |
| `prihvaceno` (accepted) | `#E8F5E9` | `#2E7D32` | `skin.colors.successBackground` | `skin.colors.successText` |
| `odbijeno` (rejected) | `#FFEBEE` | `#C62828` | `skin.colors.errorBackground` | `skin.colors.errorText` |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `#F5F5F5` | `skin.colors.backgroundSecondary` |
| `#333333` | `skin.colors.textSecondary` |
| `#856404` | `skin.colors.warningAccent` |
| `ActivityIndicator color="#000000"` | `skin.colors.textPrimary` |
| `borderRadius: 20` | `skin.borders.radiusPill` |
| `borderRadius: 12` | `skin.borders.radiusCard` |

---

## Additional File Modified (Outside Primary Scope)

### mobile/src/ui/Icon.tsx

**Reason:** FeedbackConfirmationScreen required a checkmark icon to replace the `✓` text glyph. The 'check' icon was not previously available in the Icon primitive.

**Changes:**
1. Added `Check` import from lucide-react-native
2. Added `'check'` to IconName type union
3. Added `'check': Check` to ICON_MAP

This is a reusable addition that benefits all screens needing a checkmark icon.

---

## New Semantic Skin Tokens Added

**NONE** - All required tokens already existed in skin.neobrut2.ts:
- `infoBackground`, `infoText` (for received/info status)
- `pendingBackground`, `pendingText` (for in-review status)
- `successBackground`, `successText` (for accepted status)
- `errorBackground`, `errorText` (for rejected status)
- `warningBackground`, `warningAccent` (for form errors)

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
    mobile/src/screens/feedback/FeedbackFormScreen.tsx \
    mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx \
    mobile/src/screens/feedback/FeedbackDetailScreen.tsx

(no output)
```

**Result:** PASS (0 matches)

---

## Remaining Known Design Violations (Outside Scope)

| Screen/Component | Violation Count | Status |
|------------------|-----------------|--------|
| `click-fix/*` | ~70 hex colors | Pending (GROUP 4) |
| `events/*` | ~45 hex colors | Pending (GROUP 5) |
| `pages/*` | ~38 hex colors | Pending (GROUP 6) |

These are tracked in the design-guard baseline.

---

## Commit

```
chore(mobile): make Feedback screens skin-first (group3)

- FeedbackFormScreen: Replace all hardcoded hex colors with skin tokens
- FeedbackFormScreen: Replace placeholderTextColor and ActivityIndicator inline colors
- FeedbackConfirmationScreen: Replace text glyph (✓) with Icon check
- FeedbackConfirmationScreen: Replace all hardcoded hex colors with skin tokens
- FeedbackDetailScreen: Replace status color map with semantic skin tokens
- FeedbackDetailScreen: Replace all hardcoded hex colors with skin tokens
- Icon.tsx: Add 'check' icon for confirmation screens

All 3 Feedback screens are now 100% skin-first compatible.
Zero hardcoded hex colors. Zero text glyphs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
