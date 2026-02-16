# Phase 1: Raw Grep Inventory

**Audit Date:** 2026-02-12
**Scope:** `mobile/src/**/*`
**Type:** READ-ONLY forensic scan

---

## 1. HEX COLORS

### Unique Values Found

| Value | Occurrences | Location(s) |
|-------|-------------|-------------|
| `#3A5AFF` | 2 | design-mirror/fixtures/info.ts:66,189; design-mirror/fixtures/home.ts:59 |
| `#FFD93D` | 3 | design-mirror/fixtures/info.ts:76,199; design-mirror/fixtures/home.ts:75 |
| `#1A1A1A` | 2 | design-mirror/fixtures/info.ts:77,200; design-mirror/fixtures/home.ts:76 |
| `#2E8B57` | 2 | design-mirror/fixtures/info.ts:86; design-mirror/fixtures/home.ts:67 |
| `#E63946` | 2 | design-mirror/fixtures/info.ts:96; design-mirror/fixtures/home.ts:83 |
| `#FF231F7C` | 1 | contexts/PushContext.tsx:181 |
| `#2788C9` | 0 (comment) | ui/skin.neobrut2.ts:36 |
| `#15AF50` | 0 (comment) | ui/skin.neobrut2.ts:38 |
| `#FDC010` | 0 (comment) | ui/skin.neobrut2.ts:40 |
| `#D64E2D` | 0 (comment) | ui/skin.neobrut2.ts:42 |
| `#B796C6` | 0 (comment) | ui/skin.neobrut2.ts:45 |
| `#F8961D` | 0 (comment) | ui/skin.neobrut2.ts:46,47 |
| `#eeab4b` | 0 (comment) | ui/skin.neobrut2.ts:222 |

**Total unique hex values:** 13
**Hardcoded in production code (non-comment):** 6
**Hardcoded in design-mirror fixtures only:** 6

---

## 2. RGBA / RGB COLORS

| Value | Occurrences | Location(s) |
|-------|-------------|-------------|
| `rgba(255, 255, 255, 0.85)` | 2 | ui/skin.neobrut2.ts:660,762 |

**Total:** 2 (both in skin token file - acceptable)

---

## 3. INLINE STYLE OBJECTS

### `style={{ ... }}` Pattern

| File | Line | Snippet |
|------|------|---------|
| FloraSpeciesCard.tsx | 205 | `style={{ width: galleryImageWidth, height: GALLERY_HEIGHT }}` |
| FloraScreen.tsx | 146 | `style={{ width: SENSITIVE_IMAGE_WIDTH, height: SENSITIVE_IMAGE_HEIGHT }}` |
| LanguageSelectionScreen.tsx | 52 | `style={{ width: logoSize, height: logoSize }}` |
| FaunaSpeciesCard.tsx | 205 | `style={{ width: galleryImageWidth, height: GALLERY_HEIGHT }}` |
| FaunaScreen.tsx | 146 | `style={{ width: SENSITIVE_IMAGE_WIDTH, height: SENSITIVE_IMAGE_HEIGHT }}` |
| MirrorContactsListScreen.tsx | 175 | `style={{ ... }}` |
| MirrorMunicipalitySelectionScreen.tsx | 82 | `style={{ ... }}` |

**Total `style={{}}` occurrences:** 7

### `style={[ ... ]}` Pattern (Array Composition)

**Total `style={[]}` occurrences:** 127+ (common pattern for conditional styling)

---

## 4. HARD NUMERIC VALUES IN STYLE CONTEXT

### Padding Values (Hardcoded)

| Value | Occurrences | Context |
|-------|-------------|---------|
| `0` | 11 | paddingHorizontal, paddingTop, paddingBottom, paddingLeft, paddingRight |
| `2` | 7 | paddingVertical, paddingTop |
| `6` | 1 | paddingVertical (Screen.tsx:109) |
| `8` | 1 | paddingHorizontal (Screen.tsx:108) |
| `14` | 1 | paddingVertical (skin.neobrut2.ts:460) - tab token |

### Margin Values (Hardcoded)

| Value | Occurrences | Context |
|-------|-------------|---------|
| `2` | 3 | margin, marginTop |
| `4` | 2 | marginTop |
| `6` | 3 | marginTop |

### Border Radius Values (Hardcoded)

| Value | Occurrences | File |
|-------|-------------|------|
| `4` | 2 | Icon.tsx:280, Screen.tsx:107 |
| `12` | 4 | PhotoSlotTile.tsx:122, MirrorMunicipalitySelectionScreen.tsx:175, MirrorUserModeSelectionScreen.tsx:154, MirrorClickFixFormScreen.tsx:378 |
| `20` | 1 | ClickFixDetailScreen.tsx:332 |
| `32` | 1 | MirrorContactDetailScreen.tsx:382 |
| `40` | 3 | ClickFixConfirmationScreen.tsx:88, FeedbackConfirmationScreen.tsx:88, MirrorFeedbackConfirmationScreen.tsx:111, MirrorClickFixConfirmationScreen.tsx:111 |

### Border Width Values (Hardcoded)

| Value | Occurrences | File |
|-------|-------------|------|
| `0` | 1 | Card.tsx:127 |
| `1` | 1 | Icon.tsx:278 |
| `3` | 1 | Screen.tsx:105 |

### Font Size Values (Hardcoded)

| Value | Occurrences | File |
|-------|-------------|------|
| `8` | 1 | MirrorClickFixFormScreen.tsx:368 |
| `10` | 2 | Screen.tsx:113, MirrorClickFixDetailScreen.tsx:235 |

### Line Height Values (Hardcoded)

| Value | Occurrences | Files |
|-------|-------------|-------|
| `18` | 1 | StaticPageScreen.tsx:664 |
| `20` | 2 | FloraScreen.tsx:330, FaunaScreen.tsx:329 |
| `22` | 15 | StaticPageScreen.tsx, FloraScreen.tsx, FaunaScreen.tsx, ClickFixDetailScreen.tsx, FeedbackDetailScreen.tsx, FloraSpeciesCard.tsx, FaunaSpeciesCard.tsx, MirrorStaticPageScreen.tsx, MirrorClickFixDetailScreen.tsx, MirrorFeedbackDetailScreen.tsx |
| `24` | 9 | StaticPageScreen.tsx, ClickFixConfirmationScreen.tsx, FeedbackConfirmationScreen.tsx, ClickFixDetailScreen.tsx, FeedbackDetailScreen.tsx, MirrorClickFixConfirmationScreen.tsx, MirrorFeedbackConfirmationScreen.tsx, MirrorStaticPageScreen.tsx |

### Letter Spacing Values (Hardcoded)

| Value | Occurrences | File |
|-------|-------------|------|
| `0.5` | 1 | HomeScreen.tsx:396 |
| `1` | 3 | skin.neobrut2.ts:911, Screen.tsx:115, HomeScreen.tsx:358 |

### Gap Values (Hardcoded)

| Value | Occurrences | File |
|-------|-------------|------|
| `0` | 2 | StaticBannerList.tsx:107, Banner.tsx:137 |

### Width Values (Hardcoded)

| Value | Count | Notable Locations |
|-------|-------|-------------------|
| `6` | 2 | FloraSpeciesCard, FaunaSpeciesCard (indicator dot) |
| `8` | 4 | FloraScreen, FaunaScreen (decorative lines) |
| `10` | 1 | HeroMediaHeader.tsx |
| `24` | 6 | StaticPageScreen, PhotoSlotTile, MirrorLineDetailScreen, etc. |
| `32` | 3 | FloraSpeciesCard, FaunaSpeciesCard, LineDetailScreen |
| `36` | 3 | FloraSpeciesCard, FaunaSpeciesCard, LineDetailScreen |
| `40` | 4 | MirrorInfoHubScreen, ClickFixDetailScreen, MirrorContactDetailScreen |
| `44` | 10 | GlobalHeader, Banner, DepartureItem, EventsScreen, MirrorEventsScreen, etc. |
| `48` | 5 | HeroMediaHeader, HomeScreen, UiInventoryScreen |
| `56` | 1 | MirrorHomeCompositeScreen |
| `60` | 2 | UiInventoryScreen |
| `64` | 3 | MirrorContactDetailScreen, UiInventoryScreen |
| `70` | 1 | UiInventoryScreen |
| `72` | 2 | FloraSpeciesCard, FaunaSpeciesCard |
| `80` | 6 | Confirmation screens, ClickFixDetailScreen, MirrorClickFixFormScreen |
| `120` | 2 | ClickFixDetailScreen, MirrorClickFixDetailScreen |

### Height Values (Hardcoded)

| Value | Count | Notable Locations |
|-------|-------|-------------------|
| `6` | 2 | FloraSpeciesCard, FaunaSpeciesCard |
| `8` | 4 | FloraScreen, FaunaScreen |
| `10` | 1 | HeroMediaHeader |
| `20` | 1 | MicroPrimitives |
| `24` | 4 | MirrorUserModeSelectionScreen, MirrorMunicipalitySelectionScreen, PhotoSlotTile, MirrorClickFixFormScreen |
| `32` | 3 | FloraSpeciesCard, FaunaSpeciesCard, LineDetailScreen |
| `36` | 3 | FloraSpeciesCard, FaunaSpeciesCard, LineDetailScreen |
| `40` | 4 | MirrorInfoHubScreen, ClickFixDetailScreen, MirrorContactDetailScreen |
| `44` | 10 | GlobalHeader, Banner, DepartureItem, EventsScreen, etc. |
| `48` | 4 | HeroMediaHeader, HomeScreen, UiInventoryScreen |
| `60` | 2 | UiInventoryScreen |
| `64` | 2 | skin.neobrut2.ts (header token), MirrorContactDetailScreen |
| `72` | 2 | FloraSpeciesCard, FaunaSpeciesCard |
| `80` | 5 | Confirmation screens, UiInventoryScreen, MirrorClickFixFormScreen |
| `100` | 1 | StaticPageScreen |
| `110` | 1 | HomeScreen |
| `120` | 3 | ClickFixDetailScreen, MirrorStaticPageScreen, MirrorClickFixDetailScreen |
| `180` | 2 | StaticPageScreen, MirrorStaticPageScreen |
| `200` | 4 | StaticPageScreen, MirrorStaticPageScreen |
| `216` | 1 | LineDetailScreen |

---

## 5. BORDER WIDTH VALUES SUMMARY

### From skin.neobrut2.ts (Tokenized)

| Token | Value |
|-------|-------|
| `widthHairline` | 1 |
| `widthThin` | 2 |
| `widthCard` | 3 |
| `widthHeavy` | 4 |
| `widthExtraHeavy` | 8 |

### Hardcoded Outside Tokens

| Value | Occurrences |
|-------|-------------|
| `0` | 1 |
| `1` | 1 |
| `3` | 1 |

---

## 6. BORDER RADIUS VALUES SUMMARY

### From skin.neobrut2.ts (Tokenized)

| Token | Value |
|-------|-------|
| `radiusSharp` | 0 |
| `radiusSoft` | 4 |
| `radiusCard` | 0 |
| `radiusPill` | 9999 |

### Hardcoded Outside Tokens

| Value | Occurrences | Context |
|-------|-------------|---------|
| `4` | 2 | Icon fallback, Screen TEST MODE badge |
| `12` | 4 | Photo tiles, selection cards |
| `20` | 1 | Status badge in ClickFix |
| `32` | 1 | Contact detail action |
| `40` | 4 | Confirmation checkmark circles |

---

## 7. FONT SIZE VALUES SUMMARY

### From skin.neobrut2.ts (Tokenized)

| Token | Value |
|-------|-------|
| `xs` | 10 |
| `sm` | 12 |
| `md` | 14 |
| `lg` | 16 |
| `xl` | 18 |
| `xxl` | 24 |
| `xxxl` | 28 |

### Hardcoded Outside Tokens

| Value | Occurrences | Context |
|-------|-------------|---------|
| `8` | 1 | MirrorClickFixFormScreen (helper text) |
| `10` | 2 | Screen TEST MODE, MirrorClickFixDetailScreen |

---

## 8. SHADOW CONFIGURATIONS

### From skin.neobrut2.ts (Tokenized)

| Shadow Type | shadowOffset | shadowRadius | elevation |
|-------------|-------------|--------------|-----------|
| `none` | {0,0} | 0 | 0 |
| `card` | {4,4} | 0 | 6 |
| `soft` | {2,0} | 10 | 10 |
| `menuItemBox.inactive` | {6,6} | 0 | 3 |
| `menuItemBox.active` | {6,6} | 0 | 3 |

### Unique shadowOffset Values

- `{0, 0}` - 3 occurrences (none states)
- `{2, 0}` - 1 occurrence (soft shadow)
- `{4, 4}` - via `hardShadow(4)` function
- `{6, 6}` - 2 occurrences (menu items)

### Unique shadowRadius Values

- `0` - 5 occurrences
- `10` - 1 occurrence

### Unique elevation Values

- `0` - 1 occurrence
- `3` - 2 occurrences
- `10` - 1 occurrence

---

## 9. OPACITY VALUES (Hardcoded)

| Value | Occurrences | Files |
|-------|-------------|-------|
| `0` | 1 | GlobalHeader.tsx:166 (hidden state) |
| `0.6` | 1 | Card.tsx:136 (disabled) |
| `0.7` | 2 | DepartureItem.tsx:215, MirrorLineDetailScreen.tsx:734 |
| `0.8` | 2 | MirrorInfoHubScreen.tsx:310, EmergencyTile.tsx:76 |
| `0.9` | 3 | FloraSpeciesCard.tsx:356, FaunaSpeciesCard.tsx:356, MirrorContactsListScreen.tsx:284 |

---

## 10. TOKEN USAGE STATISTICS

| Category | Token Usages | Hardcoded Usages |
|----------|--------------|------------------|
| Spacing (`spacing.*`) | 974 | ~50 |
| Borders (`borders.*`) | 250 | ~10 |
| Typography fontSize | 32 | ~30 |
| Colors | extensive | 6 hex values |

---

## END OF PHASE 1 INVENTORY
