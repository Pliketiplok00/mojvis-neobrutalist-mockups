# GROUP 4: Click-Fix Screens Migration Report

**Date:** 2026-01-11
**Branch:** `chore/skin-clickfix-group4`
**Status:** COMPLETE

---

## Summary

Migrated all 3 Click-Fix screens to be 100% skin-first compatible:
- `mobile/src/screens/click-fix/ClickFixFormScreen.tsx`
- `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx`
- `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx`

All screens now use only skin tokens and the Icon primitive. Zero hardcoded hex colors, zero text glyphs.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` | Full skin-first migration |
| `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx` | Full skin-first migration |
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | Full skin-first migration |

---

## ClickFixFormScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, input background | color |
| `#000000` | title, label, input border/text, submit button, change location bg | color |
| `#666666` | subtitle | color |
| `#999999` | placeholderTextColor, charCount | color |
| `#FFF3CD` | errorContainer background | color |
| `#856404` | errorText | color |
| `#CC0000` | required, inputError, fieldError, removePhotoButton | color |
| `#F5F5F5` | locationButton background | color |
| `#E8F5E9` | locationDisplay background | color |
| `#2E7D32` | locationText | color |
| `X` | removePhotoText glyph | text glyph |
| `16`, `32`, `24`, `20`, `4`, `8`, `12` | spacing | spacing |
| `28`, `14`, `16`, `12` | font sizes | typography |
| `2`, `8`, `4` | border width, radius | border |

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
| `#F5F5F5` | `skin.colors.backgroundSecondary` |
| `#E8F5E9` | `skin.colors.successBackground` |
| `#2E7D32` | `skin.colors.successText` |
| `placeholderTextColor="#999999"` | `skin.colors.textDisabled` |
| `ActivityIndicator color="#000000"` | `skin.colors.textPrimary` |
| `ActivityIndicator color="#FFFFFF"` | `skin.colors.background` |
| `<Text>X</Text>` (remove photo) | `<Icon name="close" size="sm" colorToken="background" />` |
| `padding: 16` | `skin.spacing.lg` |
| `paddingBottom: 32` | `skin.spacing.xxxl` |
| `marginBottom: 24` | `skin.spacing.xxl` |
| `fontSize: 28` | `skin.typography.fontSize.xxxl` |
| `fontSize: 16` | `skin.typography.fontSize.lg` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `borderRadius: 8` | `skin.borders.radiusCard` |

---

## ClickFixConfirmationScreen.tsx Migration

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

## ClickFixDetailScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container, replyCard background, modalCloseButton background | color |
| `#000000` | ActivityIndicator, subject, sectionTitle, replyLabel, replyCard border, photoThumbnail border | color |
| `#666666` | loadingText, date, emptyText, replyDate, locationLabel | color |
| `#F5F5F5` | messageCard, emptyState background | color |
| `#333333` | description, replyBody | color |
| `#856404` | errorText | color |
| `#E0E0E0` | locationSection borderTopColor | color |
| `#2E7D32` | locationText | color |
| `rgba(0, 0, 0, 0.9)` | modalContainer background | color |
| Status colors (see table below) | status badge | color |
| `X` | modalCloseText glyph | text glyph |
| `16`, `32`, `12`, `24`, `4`, `8`, `20` | spacing | spacing |
| `14`, `16`, `20`, `18`, `12` | font sizes | typography |
| `2`, `12`, `20`, `8`, `1` | border width, radius | border |

### Status Color Mapping

The ClickFixDetailScreen includes a status badge with colors per status. Replaced hardcoded hex values with semantic skin tokens:

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
| `#E0E0E0` | `skin.colors.borderLight` |
| `#2E7D32` | `skin.colors.successText` |
| `rgba(0, 0, 0, 0.9)` | `skin.colors.overlay` |
| `ActivityIndicator color="#000000"` | `skin.colors.textPrimary` |
| `<Text>X</Text>` (modal close) | `<Icon name="close" size="md" colorToken="textPrimary" />` |
| `borderRadius: 20` | `skin.borders.radiusPill` |
| `borderRadius: 12` | `skin.borders.radiusCard` |

---

## New Semantic Skin Tokens Added

**NONE** - All required tokens already existed in skin.neobrut2.ts:
- `infoBackground`, `infoText` (for received/info status)
- `pendingBackground`, `pendingText` (for in-review status)
- `successBackground`, `successText` (for accepted status)
- `errorBackground`, `errorText` (for rejected status)
- `warningBackground`, `warningAccent` (for form errors)
- `overlay` (for modal overlay)
- `borderLight` (for subtle borders)

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
    mobile/src/screens/click-fix/ClickFixFormScreen.tsx \
    mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx \
    mobile/src/screens/click-fix/ClickFixDetailScreen.tsx

(no output)
```

**Result:** PASS (0 matches)

---

## Remaining Known Design Violations (Outside Scope)

| Screen/Component | Violation Count | Status |
|------------------|-----------------|--------|
| `events/*` | ~45 hex colors | Pending (GROUP 5) |
| `pages/*` | ~38 hex colors | Pending (GROUP 6) |

These are tracked in the design-guard baseline.

---

## Commit

```
chore(mobile): make Click-Fix screens skin-first (group4)

- ClickFixFormScreen: Replace all hardcoded hex colors with skin tokens
- ClickFixFormScreen: Replace placeholderTextColor and ActivityIndicator inline colors
- ClickFixFormScreen: Replace text glyph (X) with Icon close
- ClickFixConfirmationScreen: Replace text glyph (✓) with Icon check
- ClickFixConfirmationScreen: Replace all hardcoded hex colors with skin tokens
- ClickFixDetailScreen: Replace status color map with semantic skin tokens
- ClickFixDetailScreen: Replace modal overlay rgba with skin.colors.overlay
- ClickFixDetailScreen: Replace text glyph (X) with Icon close
- ClickFixDetailScreen: Replace all hardcoded hex colors with skin tokens

All 3 Click-Fix screens are now 100% skin-first compatible.
Zero hardcoded hex colors. Zero text glyphs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
