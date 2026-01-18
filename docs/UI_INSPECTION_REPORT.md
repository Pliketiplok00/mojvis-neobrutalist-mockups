# UI Inspection Report

**Generated:** 2026-01-18
**Branch:** `audit/ui-inspection-only`
**Scope:** `mobile/src/` + `design-mirror/`

---

## 1. Button & CTA Inventory

### 1.1 Dedicated Button Components

| File | Component | Variants | Styling Source | Screens Impacted |
|------|-----------|----------|----------------|------------------|
| `mobile/src/ui/Button.tsx` | `Button` | primary, secondary, danger | `skin.components.button.*` tokens | LanguageSelectionScreen, StaticPageScreen, SettingsScreen, FeedbackFormScreen, ClickFixConfirmationScreen, FeedbackConfirmationScreen, SeaTransportScreen, RoadTransportScreen, UiInventoryScreen |
| `mobile/src/ui/PosterButton.tsx` | `PosterButton` | primary, secondary | `skin.colors.*`, `skin.borders.*`, `skin.spacing.*` + `ButtonText` primitive | ClickFixFormScreen, EventDetailScreen |

### 1.2 Typography Issue: Button vs PosterButton

**Issue:** `Button.tsx` uses raw `<Text>` with inline font styling:
```tsx
// Button.tsx:88
<Text style={getTextStyle()}>{children}</Text>

// Inline styles (lines 118-131):
primaryText: {
  fontSize: components.button.fontSize,
  fontWeight: components.button.fontWeight,  // ❌ Uses fontWeight, not fontFamily
  color: components.button.primary.textColor,
}
```

**Correct pattern in PosterButton.tsx:**
```tsx
// PosterButton.tsx:78-83
<ButtonText
  color={isPrimary ? colors.primaryText : colors.textPrimary}
  style={styles.text}
>
  {children}
</ButtonText>
```

**Impact:** `Button` text may not use correct font family (Space Mono Bold) - falls back to system font weight "600".

### 1.3 TouchableOpacity/Pressable Used as Buttons

| File | Lines | Purpose | Has Proper Text Primitive |
|------|-------|---------|---------------------------|
| `mobile/src/components/GlobalHeader.tsx` | 80-88, 96-114 | Menu icon, Inbox icon | No (uses `Icon` only) |
| `mobile/src/components/Banner.tsx` | 60-92 | Banner tap CTA | No (uses custom `Text` styles) |
| `mobile/src/components/MenuOverlay.tsx` | 184-200 | Menu item rows | No (uses `Label` primitive) |
| `mobile/src/ui/Card.tsx` | 63-72 | Card press wrapper | N/A (wraps children) |
| `mobile/src/ui/ListRow.tsx` | 53-59 | List row press wrapper | N/A (wraps children) |
| `mobile/src/components/DepartureItem.tsx` | 110-204 | Departure row expand | No (uses inline styles) |
| `mobile/src/screens/home/HomeScreen.tsx` | 187-214, 228-255, 260-279, 284-309 | Quick action tiles, Event cards, Feedback CTA | Mixed (some use `Label`/`H2`, some inline) |
| `mobile/src/screens/events/EventsScreen.tsx` | 120-142, 154-162 | Today button, Calendar nav | Partial (`H2`, `Icon`) |
| `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx` | 53-56 | Back button | No (uses `Icon` only) |
| `mobile/src/screens/pages/StaticPageScreen.tsx` | 263-277, 334-336, 358-365, 394-402 | Various CTAs | Mixed |
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | 146-156, 196-201 | Photo view, Call CTA | Partial |

### 1.4 Custom Dual-Layer Shadow CTAs

Found in multiple places with duplicated shadow pattern:

| File | Lines | Element | Shadow Implementation |
|------|-------|---------|----------------------|
| `mobile/src/ui/PosterButton.tsx` | 97-103 | Button shadow | `SHADOW_OFFSET = 4` constant |
| `mobile/src/screens/home/HomeScreen.tsx` | 188-195 | Quick action tiles | Inline via `position: absolute, top: 4, left: 4` |
| `mobile/src/screens/events/EventsScreen.tsx` | N/A | Event cards | Uses `skin.components.events.card.shadowOffset*` |
| `mobile/src/screens/transport/*.tsx` | Multiple | Line cards, time blocks | Uses `skin.components.transport.list.*Shadow*` |

---

## 2. Tag/Label/Badge Inventory

### 2.1 Badge Component

| File | Component | Variants | Token Source |
|------|-----------|----------|--------------|
| `mobile/src/ui/Badge.tsx` | `Badge` | urgent, info, success, warning, pending, type, default | `skin.components.badge.*`, `skin.colors.*` |

**Import locations:**
- `mobile/src/screens/dev/UiInventoryScreen.tsx` (line 22)

**Note:** Badge component exists but is barely used outside UiInventoryScreen. Transport screens use custom inline tag implementations.

### 2.2 Inline Tag/Label Implementations

| File | Element | Implementation | Uses Tokens |
|------|---------|----------------|-------------|
| `mobile/src/screens/transport/SeaTransportScreen.tsx` | Line type badges | Inline View + Text with hardcoded styles | Partial (fontSize: 10, fontWeight: '600') |
| `mobile/src/screens/transport/RoadTransportScreen.tsx` | Line type badges | Inline View + Text with hardcoded styles | Partial (fontSize: 10, fontWeight: '600') |
| `mobile/src/screens/inbox/InboxListScreen.tsx` | NEW badge, type labels | Inline styles | Partial (uses `skin.typography.fontSize.xs`) |
| `mobile/src/components/GlobalHeader.tsx` | Inbox unread count badge | Custom implementation | Yes (`skin.components.header.inboxBadge.*`) |
| `mobile/src/components/Banner.tsx` | Banner type indicator | Inline | Partial (fontWeight: '700') |

### 2.3 Flex Layout Issues

**Transport screens (Sea/Road):** Both have identical inline badge patterns:
```tsx
// Lines 477-478 (RoadTransportScreen), 498-499 (SeaTransportScreen)
fontSize: 10,
fontWeight: '600',
```
These should use `Badge` component or at minimum `skin.components.badge.*` tokens.

---

## 3. Typography Consistency Check

### 3.1 Hardcoded Font Values (Non-Token)

| File | Line(s) | Pattern | Should Use |
|------|---------|---------|------------|
| `mobile/src/ui/Screen.tsx` | 113-114 | `fontSize: 10, fontWeight: '700'` | `typography.fontSize.xs`, `typography.fontWeight.bold` |
| `mobile/src/ui/Icon.tsx` | 207, 258 | `fontSize: size * 0.4`, `fontWeight: '600'` | Fallback text - acceptable |
| `mobile/src/components/Banner.tsx` | 168 | `fontWeight: '700'` | `typography.fontWeight.bold` |
| `mobile/src/screens/home/HomeScreen.tsx` | 393, 441-442, 448, 456, 503 | `fontWeight: '700'`, `fontSize: skin.typography.fontSize.xl/xs` | Mixed - some use tokens, some hardcode |
| `mobile/src/screens/transport/RoadTransportScreen.tsx` | 477-478, 566, 581 | `fontSize: 10/11`, `fontWeight: '600'` | `typography.fontSize.*`, `typography.fontWeight.*` |
| `mobile/src/screens/transport/SeaTransportScreen.tsx` | 498-499, 587, 602 | `fontSize: 10/11`, `fontWeight: '600'` | `typography.fontSize.*`, `typography.fontWeight.*` |
| `mobile/src/screens/events/EventsScreen.tsx` | 470, 535 | Uses `skin.components.calendar.weekdayFontWeight` | Correct (tokenized) |
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | 266 | `fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'` | Intentional (code display) |
| `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` | 477 | `fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'` | Intentional (coordinates display) |

### 3.2 Text Primitives Usage

**Correct primitive usage found in:**
- Text.tsx exports: `H1`, `H2`, `Label`, `Body`, `Meta`, `ButtonText`
- All use `skin.typography.*` tokens properly

**Missing primitive usage:**
- `Button.tsx` uses raw `<Text>` instead of `ButtonText`
- Many screen-level styles use inline `fontWeight`/`fontSize` instead of primitives

---

## 4. Zombie / Legacy Content Inventory

### 4.1 TODO Comments (Active Development Markers)

| File | Line | Content | Status |
|------|------|---------|--------|
| `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx` | 28 | `// TODO: Apply language to app UI` | Active - needs implementation |
| `mobile/src/services/api.ts` | 55, 78 | `// TODO: Move to config/environment`, `// TODO: Store persistently` | Active - infrastructure |
| `mobile/src/screens/pages/StaticPageScreen.tsx` | 12 | `- Local caching (TODO)` | Active - feature |
| `mobile/src/contexts/UnreadContext.tsx` | 9, 67-68 | `// TODO: Load/Save from AsyncStorage` | Active - persistence |

### 4.2 Placeholder Content

| File | Line(s) | Content | Type | Referenced |
|------|---------|---------|------|------------|
| `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx` | 36 | `{/* Logo placeholder */}` | Comment | Yes (visible in UI) |
| `mobile/src/services/api.ts` | 81-82 | `return 'mobile-device-placeholder'` | Code | Yes (device ID fallback) |
| `mobile/src/screens/pages/StaticPageScreen.tsx` | 304-308 | `mapPlaceholder`, `mapPlaceholderText` | UI element | Yes (map not implemented) |
| `mobile/src/screens/home/HomeScreen.tsx` | 259-272 | Events placeholder when empty | UI element | Yes (fallback) |
| `mobile/src/i18n/locales/hr.json` | 50 | `"eventsPlaceholder": "[Ovdje ce se prikazati dogadaji]"` | i18n | Yes (used by HomeScreen) |
| `mobile/src/i18n/locales/en.json` | 50 | `"eventsPlaceholder": "[Events will appear here]"` | i18n | Yes (used by HomeScreen) |

### 4.3 Test/Dev Watermarks

| File | Line | Content | Active |
|------|------|---------|--------|
| `mobile/src/ui/skin.neobrut2.ts` | 851 | `export const SKIN_TEST_MODE = false;` | No (disabled) |
| `mobile/src/ui/skin.neobrut2.ts` | 246-247 | `testWatermarkBg`, `testWatermarkText` colors | Defined but unused |

### 4.4 Debug Logging

| File | Line | Pattern |
|------|------|---------|
| `mobile/src/components/Banner.tsx` | 112-117 | `if (__DEV__) { console.log('[BANNERLIST_RENDER]'...` |
| `mobile/src/i18n/LanguageContext.tsx` | 101 | `if (__DEV__) { ... }` |
| `mobile/src/ui/Icon.tsx` | 188-191 | `if (__DEV__) { console.warn(...` |

**Note:** These are wrapped in `__DEV__` checks and are appropriate for development builds.

---

## 5. Design-Mirror vs RN Divergence Map

### 5.1 Screen Mapping

| Design Mirror Screen | RN Screen | Exists in RN |
|---------------------|-----------|--------------|
| `home.html` | `HomeScreen.tsx` | Yes |
| `menu.html` | `MenuOverlay.tsx` | Yes (component, not screen) |
| `transport-sea.html` | `SeaTransportScreen.tsx` | Yes |
| `transport-road.html` | `RoadTransportScreen.tsx` | Yes |
| `events.html` | `EventsScreen.tsx` | Yes |
| `event-detail.html` | `EventDetailScreen.tsx` | Yes |
| `flora.html` | `StaticPageScreen.tsx` (slug='flora') | Partial (generic screen) |
| `fauna.html` | `StaticPageScreen.tsx` (slug='fauna') | Partial (generic screen) |
| `info.html` | `StaticPageScreen.tsx` (slug='info') | Partial (generic screen) |
| `inbox.html` | `InboxListScreen.tsx` | Yes |
| `feedback.html` | `FeedbackFormScreen.tsx` | Yes |
| `clickfix-form.html` | `ClickFixFormScreen.tsx` | Yes |
| `settings.html` | `SettingsScreen.tsx` | Yes |
| `ui-inventory.html` | `UiInventoryScreen.tsx` | Yes (dev only) |

### 5.2 Key Divergences

#### Home Screen
| Element | Design Mirror | RN | Cause |
|---------|---------------|-----|-------|
| Hero slab | "DOBRODOŠLI" hardcoded | Uses `t('home.welcome')` i18n | Mirror uses static content |
| Quick actions | HTML entities for icons (📅, ⚓) | Lucide icons via `Icon` component | Mirror pre-dates icon system |
| Event cards | Hardcoded dates (20 SIJ, 25 SIJ) | Dynamic from API | Mirror uses fixture data |
| Section labels | "KATEGORIJE", "NADOLAZEĆI DOGAĐAJI" | Uses i18n keys | Mirror uses static Croatian |

#### Transport Screens
| Element | Design Mirror | RN | Cause |
|---------|---------------|-----|-------|
| Line badges | HTML + CSS badge classes | Inline styles (not using Badge component) | Both diverge from canonical Badge |
| Time slabs | CSS component `.list-row__time-slab` | Inline styles per skin tokens | Different approaches |

#### Header
| Element | Design Mirror | RN | Cause |
|---------|---------------|-----|-------|
| Menu icon | HTML entity ☰ | Lucide `menu` icon | Mirror pre-dates icon system |
| Position | Left: title, Right: menu | Left: menu, Right: inbox | Design mirror is outdated |

### 5.3 Structural Differences

**Design Mirror has screens that don't exist as dedicated RN screens:**
- `flora.html`, `fauna.html`, `info.html` - These map to `StaticPageScreen` with different slugs
- `menu.html` - This is `MenuOverlay` component, not a screen

**RN has screens not in Design Mirror:**
- `TransportHubScreen.tsx` - Main transport landing
- `LineDetailScreen.tsx` - Individual line/route details
- `InboxDetailScreen.tsx` - Individual message view
- `ClickFixDetailScreen.tsx` - Issue detail view
- `FeedbackDetailScreen.tsx` - Feedback detail view
- `*ConfirmationScreen.tsx` files - Post-submit screens
- Onboarding screens (`LanguageSelectionScreen`, `UserModeSelectionScreen`, `MunicipalitySelectionScreen`)

### 5.4 CSS Token vs RN Skin Token Alignment

| CSS Token (skin.base.css) | RN Token (skin.neobrut2.ts) | Aligned |
|---------------------------|----------------------------|---------|
| `--color-primary: #2563eb` | `palette.primary: hsl(210, 80, 45)` | ~Yes (same blue) |
| `--color-background: #fafaf9` | `palette.background: hsl(45, 30, 96)` | ~Yes (warm cream) |
| `--font-display: 'Space Grotesk'` | `typography.fontFamily.display.*` | Yes |
| `--font-body: 'Space Mono'` | `typography.fontFamily.body.*` | Yes |
| `--border-width-card: 2px` | `borders.widthCard: 3` | **No** (2 vs 3) |
| `--shadow-offset: 4px` | `externalShadowLayer.offset: 4` | Yes |

---

## 6. Repro Commands

### Button Inventory
```bash
# Find all Button imports
rg "import.*Button|from.*Button" mobile/src --glob "*.tsx"

# Find TouchableOpacity/Pressable usage
rg "TouchableOpacity|Pressable" mobile/src --glob "*.tsx" -n

# Find PosterButton usage
rg "PosterButton" mobile/src --glob "*.tsx"
```

### Badge/Tag Inventory
```bash
# Find Badge imports
rg "import.*Badge|from.*Badge" mobile/src --glob "*.tsx"

# Find inline badge patterns
rg "badge|Badge|tag|Tag|label|Label" mobile/src --glob "*.tsx" -i
```

### Typography Issues
```bash
# Find hardcoded font values
rg "fontFamily:|fontSize:|fontWeight:" mobile/src --glob "*.tsx" -n

# Find font family strings (should use tokens)
rg "SpaceMono|SpaceGrotesk|Inter" mobile/src
```

### Zombie Content
```bash
# Find TODO/FIXME/placeholder
rg "CROSS-FLOW|Testni|placeholder|dummy|TODO|FIXME|XXX" mobile/src -i -n

# Find test mode flags
rg "TEST_MODE|testMode|isTest" mobile/src
```

### Design Mirror Analysis
```bash
# List design-mirror screens
ls design-mirror/screens/*.html

# Compare CSS tokens
diff design-mirror/css/skin.base.css mobile/src/ui/skin.neobrut2.ts 2>/dev/null || echo "Files have different formats"
```

---

## Summary of Key Findings

### High Priority Issues

1. **Button typography inconsistency**: `Button.tsx` uses raw `<Text>` with `fontWeight` string instead of `ButtonText` primitive with proper font family. This causes button text to render with system font weight instead of Space Mono Bold.

2. **Badge component underutilized**: Transport screens implement inline tag/badge styles instead of using the canonical `Badge` component.

3. **Hardcoded font values**: Multiple screens have `fontWeight: '600'/'700'` and `fontSize: 10/11` instead of `typography.*` tokens.

4. **Design mirror outdated**: Header layout inverted (menu on wrong side), uses HTML entities instead of Lucide icons, has hardcoded Croatian content instead of i18n placeholders.

### Medium Priority Issues

5. **Shadow implementation scattered**: Dual-layer poster shadow is implemented differently across PosterButton, HomeScreen quick actions, event cards, and transport cards.

6. **Border width mismatch**: CSS `--border-width-card: 2px` vs RN `borders.widthCard: 3`.

### Low Priority (Acceptable)

7. **TODO comments**: All marked TODOs are for legitimate future work.
8. **Debug logging**: Properly wrapped in `__DEV__` checks.
9. **Platform-specific fonts**: Menlo/monospace for code display is intentional.
