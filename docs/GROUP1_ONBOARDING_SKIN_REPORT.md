# GROUP 1: Onboarding Screens Migration Report

**Date:** 2026-01-11
**Branch:** `chore/skin-onboarding-group1`
**Status:** COMPLETE

---

## Summary

Migrated all 3 onboarding screens to be 100% skin-first compatible:
- `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx`
- `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx`
- `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx`

All screens now use only skin tokens and the Icon primitive. Zero hardcoded hex colors, zero emoji/text glyphs.

---

## Files Changed

| File | Change Type |
|------|-------------|
| `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx` | Full skin-first migration |
| `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx` | Full skin-first migration |
| `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx` | Full skin-first migration |

---

## LanguageSelectionScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container background | color |
| `#000000` | logo text, button background | color |
| `#666666` | subtitle text | color |
| `24` | content padding, button paddingHorizontal | spacing |
| `48` | logo marginBottom, subtitle marginBottom | spacing |
| `8` | title marginBottom | spacing |
| `16` | buttonContainer gap, button paddingVertical | spacing |
| `36` | logo fontSize | typography |
| `24` | title fontSize | typography |
| `16` | subtitle fontSize | typography |
| `18` | button fontSize | typography |
| `8` | button borderRadius | radius |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` (text) | `skin.colors.textPrimary` |
| `#000000` (button bg) | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `padding: 24` | `skin.spacing.xxl` |
| `marginBottom: 48` | `skin.spacing.xxxl` |
| `marginBottom: 8` | `skin.spacing.sm` |
| `gap: 16` | `skin.spacing.lg` |
| `paddingVertical: 16` | `skin.spacing.lg` |
| `paddingHorizontal: 24` | `skin.spacing.xxl` |
| `borderRadius: 8` | `skin.borders.radiusCard` |
| `fontSize: 36` | `skin.typography.fontSize.xxxl` (28) |
| `fontSize: 24` | `skin.typography.fontSize.xxl` |
| `fontSize: 16` | `skin.typography.fontSize.lg` |
| `fontSize: 18` | `skin.typography.fontSize.xl` |
| `fontWeight: 'bold'` | `skin.typography.fontWeight.bold` |
| `fontWeight: '600'` | `skin.typography.fontWeight.semiBold` |

---

## UserModeSelectionScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container background | color |
| `#000000` | title, optionTitle text | color |
| `#666666` | subtitle, optionDescription text | color |
| `#F5F5F5` | optionCard background | color |
| `#E0E0E0` | optionCard border | color |
| `#999999` | optionDescriptionEn, hint text | color |
| `#BBBBBB` | hintEn text | color |
| `🧳` | visitor icon | emoji |
| `🏠` | local icon | emoji |
| `24` | content padding | spacing |
| `48` | content paddingTop | spacing |
| `4` | title marginBottom | spacing |
| `32` | subtitle marginBottom, hint marginTop | spacing |
| `16` | optionsContainer gap | spacing |
| `20` | optionCard padding | spacing |
| `12` | optionIcon marginBottom, optionCard borderRadius | spacing/radius |
| `8` | optionTitle marginBottom | spacing |
| `24` | title fontSize | typography |
| `16` | subtitle fontSize | typography |
| `32` | optionIcon fontSize | typography |
| `18` | optionTitle fontSize | typography |
| `14` | optionDescription fontSize | typography |
| `2` | optionCard borderWidth | border |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `#F5F5F5` | `skin.colors.backgroundSecondary` |
| `#E0E0E0` | `skin.colors.borderLight` |
| `#999999` | `skin.colors.textDisabled` |
| `#BBBBBB` | `skin.colors.textDisabled` |
| `🧳` emoji | `<Icon name="globe" size="lg" colorToken="textPrimary" />` |
| `🏠` emoji | `<Icon name="home" size="lg" colorToken="textPrimary" />` |
| `padding: 24` | `skin.spacing.xxl` |
| `paddingTop: 48` | `skin.spacing.xxxl` |
| `marginBottom: 4` | `skin.spacing.xs` |
| `marginBottom: 32` | `skin.spacing.xxxl` |
| `gap: 16` | `skin.spacing.lg` |
| `padding: 20` | `skin.spacing.xl` |
| `marginBottom: 12` | `skin.spacing.md` |
| `marginBottom: 8` | `skin.spacing.sm` |
| `borderRadius: 12` | `skin.borders.radiusCard` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `fontSize: 24` | `skin.typography.fontSize.xxl` |
| `fontSize: 16` | `skin.typography.fontSize.lg` |
| `fontSize: 18` | `skin.typography.fontSize.xl` |
| `fontSize: 14` | `skin.typography.fontSize.md` |

---

## MunicipalitySelectionScreen.tsx Migration

### Hardcoded Values Removed

| Original Value | Location | Type |
|----------------|----------|------|
| `#FFFFFF` | container background | color |
| `#000000` | title, municipalityName text | color |
| `#666666` | backButtonText, subtitle, description text | color |
| `#F5F5F5` | municipalityCard background | color |
| `#E0E0E0` | municipalityCard border | color |
| `#999999` | hint text | color |
| `#BBBBBB` | hintEn text | color |
| `←` | back arrow | text glyph |
| `24` | content padding, backButton marginBottom, card padding | spacing |
| `4` | title marginBottom | spacing |
| `32` | subtitle marginBottom, hint marginTop | spacing |
| `16` | optionsContainer gap, subtitle/backButtonText fontSize | spacing/typography |
| `8` | municipalityName marginBottom | spacing |
| `24` | title fontSize, municipalityName fontSize | typography |
| `14` | description fontSize | typography |
| `12` | card borderRadius | radius |
| `2` | card borderWidth | border |

### Skin Token Mapping

| Hardcoded | Skin Token |
|-----------|------------|
| `#FFFFFF` | `skin.colors.background` |
| `#000000` | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `#F5F5F5` | `skin.colors.backgroundSecondary` |
| `#E0E0E0` | `skin.colors.borderLight` |
| `#999999` | `skin.colors.textDisabled` |
| `#BBBBBB` | `skin.colors.textDisabled` |
| `←` text glyph | `<Icon name="chevron-left" size="sm" colorToken="textMuted" />` |
| `padding: 24` | `skin.spacing.xxl` |
| `marginBottom: 24` | `skin.spacing.xxl` |
| `marginBottom: 4` | `skin.spacing.xs` |
| `marginBottom: 32` | `skin.spacing.xxxl` |
| `gap: 16` | `skin.spacing.lg` |
| `marginBottom: 8` | `skin.spacing.sm` |
| `borderRadius: 12` | `skin.borders.radiusCard` |
| `borderWidth: 2` | `skin.borders.widthThin` |
| `fontSize: 24` | `skin.typography.fontSize.xxl` |
| `fontSize: 16` | `skin.typography.fontSize.lg` |
| `fontSize: 14` | `skin.typography.fontSize.md` |

---

## Icon Replacements Summary

| Screen | Original | Replacement |
|--------|----------|-------------|
| UserModeSelectionScreen | `🧳` emoji | `<Icon name="globe" size="lg" colorToken="textPrimary" />` |
| UserModeSelectionScreen | `🏠` emoji | `<Icon name="home" size="lg" colorToken="textPrimary" />` |
| MunicipalitySelectionScreen | `←` text | `<Icon name="chevron-left" size="sm" colorToken="textMuted" />` |

---

## Value Adjustments

Some original hardcoded values were adjusted to the nearest available skin token:

| Original | Nearest Token | Note |
|----------|---------------|------|
| `48` (spacing) | `skin.spacing.xxxl` (32) | Consistent with design system |
| `36` (fontSize) | `skin.typography.fontSize.xxxl` (28) | Largest available |
| `12` (borderRadius) | `skin.borders.radiusCard` (8) | Standard card radius |

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
    mobile/src/screens/onboarding/LanguageSelectionScreen.tsx \
    mobile/src/screens/onboarding/UserModeSelectionScreen.tsx \
    mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx

(no output)
```

**Result:** PASS (0 matches)

### 4. Emoji/Glyph Scan

```bash
$ rg -n --hidden --glob '!**/node_modules/**' '🧳|🏠|←|→|›|‹|\+|−' \
    mobile/src/screens/onboarding/*.tsx

# Only matches in comments (docblock text), not UI code
```

**Result:** PASS (0 UI violations)

---

## Remaining Known Design Violations (Outside Scope)

| Screen/Component | Violation Count | Status |
|------------------|-----------------|--------|
| Events screens (2) | ~40 hardcoded values | Pending (GROUP 2) |
| Feedback screens (3) | ~45 hardcoded values | Pending (GROUP 3) |
| ClickFix screens (3) | ~50 hardcoded values | Pending (GROUP 4) |
| SettingsScreen | ~25 hardcoded values | Pending (GROUP 5) |
| StaticPageScreen | ~60 hardcoded values | Pending (GROUP 6) |

These are tracked in `docs/SKIN_FIRST_COMPATIBILITY_AUDIT.md`.

---

## Commit

```
chore(mobile): make onboarding screens skin-first (group1)

- LanguageSelectionScreen: Replace all hardcoded hex colors with skin tokens
- UserModeSelectionScreen: Replace emoji icons (🧳, 🏠) with Icon primitives
- UserModeSelectionScreen: Replace all hardcoded hex colors with skin tokens
- MunicipalitySelectionScreen: Replace text glyph (←) with Icon chevron-left
- MunicipalitySelectionScreen: Replace all hardcoded hex colors with skin tokens

All 3 onboarding screens are now 100% skin-first compatible.
Zero hardcoded hex colors. Zero emoji icons. Zero text glyphs.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
