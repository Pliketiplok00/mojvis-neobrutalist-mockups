# Icon Usage Inventory - Real App Only

Generated: 2026-02-13 (CORRECTED)

## Scope

**Included:** `mobile/src/**`

**Excluded:**
- `mobile/src/design-mirror/**`
- `mobile/src/screens/dev/**`

---

## Summary Counts

| Metric | Count |
|--------|-------|
| Total `<Icon />` instances | 90 |
| Boxed icon containers | 25 |
| Unboxed icons | 65 |
| Unique boxed container sizes | 7 |

### Unique Boxed Icon Sizes (sorted)

| Size | Occurrences | Context |
|------|-------------|---------|
| 32px | 4 | Contact links (LineDetail), MicroPrimitives `md` |
| 40px | 2 | Transport line card headers |
| 44px | 13 | Navigation header, Events info tiles, Service accordion, Banner, Warning boxes |
| 48px | 4 | Transport overview headers, HomeScreen CTA, OnboardingRoleCard |
| 52px | 1 | LineDetail header hero |
| 64px | 2 | Municipality selection cards |

---

## Token Definitions (skin.neobrut2.ts)

| Token Path | Value |
|------------|-------|
| `components.header.iconBoxSize` | 44 |
| `components.events.detail.infoTileIconBoxSize` | 44 |
| `components.transport.overviewHeader.iconBoxSize` | 48 |
| `components.transport.list.lineCardHeaderIconBoxSize` | 40 |
| `components.transport.lineDetail.headerIconBoxSize` | 52 |
| `components.onboarding.roleCard.iconBox.size` | 48 |
| `components.onboarding.municipalitySelection.iconBox.size` | 64 |

### MicroPrimitives IconBox Sizes

| Size Prop | Pixels |
|-----------|--------|
| `sm` | 24 |
| `md` | 32 |
| `lg` | 44 |

---

## Detailed Inventory

### 1. Navigation Icons (Header/Top Nav)

#### GlobalHeader.tsx - BOXED (44x44)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 86 | `menu` | menuIconBox | `skin.components.header.iconBoxSize` (44) |
| 104 | `inbox` | inboxIconBox | `skin.components.header.iconBoxSize` (44) |

**Container styles (both boxes):**
- width/height: 44px (via token)
- backgroundColor: warningAccent (yellow) for menu, primary (blue) for inbox
- borderWidth: widthCard (3px)
- borderColor: colors.border

---

### 2. Hero/Detail Icons (Screen Headers)

#### LineDetailScreen.tsx - BOXED (52x52)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 268 | `bus`/`ship` (dynamic) | headerIconBox | `lineDetail.headerIconBoxSize` (52) |

**Container style:**
- width/height: 52px (via token)
- backgroundColor: background (white)
- borderWidth: widthThin (1px)
- borderColor: colors.border

#### RoadTransportScreen.tsx - BOXED (48x48)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 174 | `bus` | headerIconBox | `overviewHeader.iconBoxSize` (48) |

**Container style:**
- width/height: 48px (via token)
- backgroundColor: background (white)
- borderWidth: widthThin
- borderColor: colors.border

#### SeaTransportScreen.tsx - BOXED (48x48)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 190 | `ship` | headerIconBox | `overviewHeader.iconBoxSize` (48) |

**Container style:** Same as RoadTransportScreen

#### EventDetailScreen.tsx - BOXED (44x44)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 163 | `clock` | infoTileIconBox | `events.detail.infoTileIconBoxSize` (44) |
| 182 | `map-pin` | infoTileIconBox | `events.detail.infoTileIconBoxSize` (44) |
| 193 | `user` | infoTileIconBox | `events.detail.infoTileIconBoxSize` (44) |

**Container style:**
- width/height: 44px (via token)
- backgroundColor: background
- borderWidth: widthThin
- borderColor: border

#### HomeScreen.tsx - BOXED (48x48 CTA, 44 category)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 295 | `message-circle` | ctaIconBox | Hardcoded 48x48 |
| 202 | (varies) | IconBox `lg` | MicroPrimitives lg = 44 |
| 203 | (category icon) | IconBox `lg` | MicroPrimitives lg = 44 |

**ctaIconBox style:**
- width/height: 48px (hardcoded)
- backgroundColor: iconBoxOverlayBg (white 20%)
- borderWidth: widthThin
- borderColor: iconBoxOverlayBorder

**IconBox lg style:**
- width/height: 44px (MicroPrimitives)
- No border, no background (just centering)

#### FaunaScreen.tsx / FloraScreen.tsx - BOXED (44x44)

| File | Line | Icon | Container | Size Source |
|------|------|------|-----------|-------------|
| FaunaScreen.tsx | 104 | `alert-triangle` | warningIconBox | Hardcoded 44x44 |
| FloraScreen.tsx | 104 | `alert-triangle` | warningIconBox | Hardcoded 44x44 |

**Container style:**
- width/height: 44px (hardcoded)
- backgroundColor: urgent (red)
- No border

#### ServicePageHeader.tsx - UNBOXED

| Line | Icon | Container | Notes |
|------|------|-----------|-------|
| 46 | (varies) | iconContainer | Just spacing, no box styling |

---

### 3. Banner Icons

#### Banner.tsx - MIXED (BOXED + UNBOXED)

| Line | Icon | Box Status | Size | Notes |
|------|------|------------|------|-------|
| 69 | `shield-alert` | BOXED (44x44) | md | Red icon box accent |
| 86 | `chevron-right` | UNBOXED | md | Arrow indicator |

**iconBox style (line 69):**
- width/height: 44px (hardcoded)
- backgroundColor: urgent (red)
- borderWidth: widthThin
- borderColor: border

---

### 4. List Icons (Rows/Meta) - Mostly UNBOXED

#### Transport Line Cards - BOXED (40x40)

| File | Line | Icon | Container | Size Source |
|------|------|------|-----------|-------------|
| RoadTransportScreen.tsx | 221 | `bus` | lineCardHeaderIconBox | `listTokens.lineCardHeaderIconBoxSize` (40) |
| SeaTransportScreen.tsx | 238 | `ship`/`anchor` | lineCardHeaderIconBox | `listTokens.lineCardHeaderIconBoxSize` (40) |

**Container style:**
- width/height: 40px (via token)
- backgroundColor: background
- borderWidth: widthThin
- borderColor: border

#### LineDetailScreen.tsx Contact Links - BOXED (32x32)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 501 | `phone` | contactIconBox | Hardcoded 32x32 |
| 512 | `mail` | contactIconBox | Hardcoded 32x32 |
| 523 | `globe` | contactIconBox | Hardcoded 32x32 |

**Container style:**
- width/height: 32px (hardcoded)
- backgroundColor: backgroundSecondary
- borderWidth: widthThin
- borderColor: border

#### ServiceAccordionCard.tsx - MIXED

| Line | Icon | Box Status | Size | Notes |
|------|------|------------|------|-------|
| 96 | (varies) | BOXED (44x44) | md | Header icon box |
| 114 | `chevron-up`/`chevron-down` | UNBOXED | sm | Expand indicator |

**iconBox style (line 96):**
- width/height: 44px (via constant ICON_BOX_SIZE)
- backgroundColor: (prop-driven)
- borderWidth: widthThin
- borderColor: border

#### DepartureItem.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 142 | `chevron-up`/`chevron-down` | md | Expand toggle |

#### ListRow.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 45 | `chevron-right` | md | List row affordance, no box |

#### Chevrons (various screens) - UNBOXED

| File | Line | Icon | Size |
|------|------|------|------|
| HomeScreen.tsx | 252, 276, 306 | `chevron-right` | md |
| SettingsScreen.tsx | 178 | `chevron-right` | md |
| InboxListScreen.tsx | 317, 398 | `chevron-right` | sm |
| TransportHubScreen.tsx | 115, 143 | `chevron-right` | md |
| RoadTransportScreen.tsx | 250 | `chevron-right` | sm |
| SeaTransportScreen.tsx | 289 | `chevron-right` | sm |
| EventsScreen.tsx | 155, 161, 218 | chevron-left/right | md, sm |
| LineDetailScreen.tsx | 326, 343 | chevron-left/right | md |
| StaticPageScreen.tsx | 464, 501 | `chevron-right` | sm |

#### Meta Row Icons - UNBOXED

| File | Line | Icon | Size | Notes |
|------|------|------|------|-------|
| EventsScreen.tsx | 203 | `clock` | xs | Event time |
| EventsScreen.tsx | 211 | `map-pin` | xs | Event location |
| LineDetailScreen.tsx | 391 | `map-pin` | sm | Route info |
| LineDetailScreen.tsx | 423 | `calendar` | lg | Empty state |
| LineDetailScreen.tsx | 469 | `globe` | sm | Operator link |
| InboxListScreen.tsx | 282 | (varies) | md | Message item icon |
| InboxListScreen.tsx | 362 | (varies) | md | Message type icon |
| InboxListScreen.tsx | 435 | (varies) | md | Empty state icon |
| InboxListScreen.tsx | 453 | (varies) | md | Empty state icon (sent) |
| JavneUslugeScreen.tsx | 97, 99 | (varies), `globe` | sm | Service links |
| FormSectionHeader.tsx | 42 | (varies) | sm | Section icon |
| InfoRow.tsx | 36 | (varies) | sm | Info icon |

#### Species Cards (Flora/Fauna) - UNBOXED

| File | Line | Icon | Size | Notes |
|------|------|------|------|-------|
| FloraSpeciesCard.tsx | 151 | `leaf` | md | Placeholder thumbnail |
| FloraSpeciesCard.tsx | 172 | `chevron-up`/`chevron-down` | md | Expand indicator |
| FloraSpeciesCard.tsx | 226, 233 | chevron-left/right | sm | Gallery nav |
| FloraSpeciesCard.tsx | 257 | `camera` | xl | Empty gallery |
| FloraSpeciesCard.tsx | 274 | `info` | sm | Section icon |
| FloraSpeciesCard.tsx | 287 | `map-pin` | sm | Habitat |
| FaunaSpeciesCard.tsx | 151 | `leaf` | md | Placeholder thumbnail |
| FaunaSpeciesCard.tsx | 172 | `chevron-up`/`chevron-down` | md | Expand indicator |
| FaunaSpeciesCard.tsx | 226, 233 | chevron-left/right | sm | Gallery nav |
| FaunaSpeciesCard.tsx | 257 | `camera` | xl | Empty gallery |
| FaunaSpeciesCard.tsx | 274 | `info` | sm | Section icon |
| FaunaSpeciesCard.tsx | 287 | `map-pin` | sm | Habitat |

---

### 5. Gallery/Carousel Icons - UNBOXED

#### HeroMediaHeader.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 133 | `chevron-left` | md | Gallery previous button |
| 146 | `chevron-right` | md | Gallery next button |
| 174 | `leaf` | xl | Placeholder |

---

### 6. Onboarding Icons - BOXED

#### OnboardingRoleCard.tsx - BOXED (48x48)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 92 | (varies) | iconBox | `tokens.iconBox.size` (48) |

**Container style:**
- width/height: 48px (via token)
- backgroundColor: background
- borderWidth: widthThin
- borderColor: border

#### MunicipalitySelectionScreen.tsx - BOXED (64x64)

| Line | Icon | Container | Size Source |
|------|------|-----------|-------------|
| 70 | `file-text` | iconBox | `t.iconBox.size` (64) |
| 86 | `file-text` | iconBox | `t.iconBox.size` (64) |

**Container style:**
- width/height: 64px (via token)
- backgroundColor: backgroundSecondary
- borderWidth: widthCard (3px)
- borderColor: border
- borderRadius: radiusCard (0)

---

### 7. Other Icons

#### Confirmation Screens - BOXED (icon inside 80x80 container)

| File | Line | Icon | Notes |
|------|------|------|-------|
| ClickFixConfirmationScreen.tsx | 50 | `check` | 80x80 container |
| FeedbackConfirmationScreen.tsx | 50 | `check` | 80x80 container |

Note: Container is 80x80 but icon is `xl` size. Sharp corners (neobrutalist style).

#### ClickFixDetailScreen.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 200 | `close` | md | Modal close button |

#### ClickFixFormScreen.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 212 | `check` | sm | Validation success |
| 222 | `close` | sm | Validation error |

#### PhotoSlotTile.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 56 | `close` | sm | Remove photo button |
| 73 | `camera` | lg | Empty state |

#### EmergencyTile.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 57 | (varies) | md | Emergency service icon |

#### States.tsx (Empty/Error) - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 70 | (varies) | xl | Empty state |
| 109 | `alert-triangle` | xl | Error state |

#### InboxDetailScreen.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 101 | `alert-triangle` | xl | Error state |

#### MenuOverlay.tsx - UNBOXED

| Line | Icon | Size | Notes |
|------|------|------|-------|
| 192 | (varies) | md | Menu item icons |

---

## Size Distribution Summary

### Boxed Icons by Size

| Size | Count | Files |
|------|-------|-------|
| 32px | 3 | LineDetailScreen (contact) |
| 40px | 2 | RoadTransportScreen, SeaTransportScreen (line cards) |
| 44px | 13 | GlobalHeader (2), EventDetailScreen (3), ServiceAccordionCard, Banner, FaunaScreen, FloraScreen, HomeScreen category (2) |
| 48px | 4 | RoadTransportScreen, SeaTransportScreen, HomeScreen CTA, OnboardingRoleCard |
| 52px | 1 | LineDetailScreen header |
| 64px | 2 | MunicipalitySelectionScreen |
| 80px | 2 | Confirmation screens (special case) |

### Unboxed Icons by Size

| Size | Count | Usage |
|------|-------|-------|
| xs | 2 | EventsScreen meta |
| sm | ~30 | Chevrons, meta icons, form icons, gallery nav |
| md | ~20 | Menu icons, list icons, close buttons, expand indicators |
| lg | ~8 | Header icons, empty states |
| xl | ~6 | Large empty states, confirmation icons |

---

## Complete File Index

| File | Total Icons | Boxed | Unboxed |
|------|-------------|-------|---------|
| GlobalHeader.tsx | 2 | 2 | 0 |
| Banner.tsx | 2 | 1 | 1 |
| DepartureItem.tsx | 1 | 0 | 1 |
| HeroMediaHeader.tsx | 3 | 0 | 3 |
| LineDetailScreen.tsx | 10 | 4 | 6 |
| RoadTransportScreen.tsx | 3 | 2 | 1 |
| SeaTransportScreen.tsx | 3 | 2 | 1 |
| EventDetailScreen.tsx | 3 | 3 | 0 |
| EventsScreen.tsx | 5 | 0 | 5 |
| HomeScreen.tsx | 5 | 3 | 2 |
| TransportHubScreen.tsx | 4 | 0 | 4 |
| FaunaScreen.tsx | 1 | 1 | 0 |
| FloraScreen.tsx | 1 | 1 | 0 |
| FaunaSpeciesCard.tsx | 7 | 0 | 7 |
| FloraSpeciesCard.tsx | 7 | 0 | 7 |
| ServiceAccordionCard.tsx | 2 | 1 | 1 |
| ServicePageHeader.tsx | 1 | 0 | 1 |
| InboxListScreen.tsx | 6 | 0 | 6 |
| InboxDetailScreen.tsx | 1 | 0 | 1 |
| OnboardingRoleCard.tsx | 1 | 1 | 0 |
| MunicipalitySelectionScreen.tsx | 2 | 2 | 0 |
| SettingsScreen.tsx | 1 | 0 | 1 |
| JavneUslugeScreen.tsx | 2 | 0 | 2 |
| ClickFixConfirmationScreen.tsx | 1 | 1 | 0 |
| FeedbackConfirmationScreen.tsx | 1 | 1 | 0 |
| ClickFixDetailScreen.tsx | 1 | 0 | 1 |
| ClickFixFormScreen.tsx | 2 | 0 | 2 |
| PhotoSlotTile.tsx | 2 | 0 | 2 |
| EmergencyTile.tsx | 1 | 0 | 1 |
| States.tsx | 2 | 0 | 2 |
| ListRow.tsx | 1 | 0 | 1 |
| StaticPageScreen.tsx | 3 | 0 | 3 |
| FormSectionHeader.tsx | 1 | 0 | 1 |
| InfoRow.tsx | 1 | 0 | 1 |
| MenuOverlay.tsx | 1 | 0 | 1 |

**Total: 90 icons across 36 files**

---

## Hardcoded Values Found (should be tokenized)

| File | Line | Value | Current |
|------|------|-------|---------|
| Banner.tsx | 154-155 | 44x44 | Hardcoded |
| FaunaScreen.tsx | 236-237 | 44x44 | Hardcoded |
| FloraScreen.tsx | 236-237 | 44x44 | Hardcoded |
| HomeScreen.tsx | 491-492 | 48x48 | Hardcoded |
| LineDetailScreen.tsx | 863-864 | 32x32 | Hardcoded |
| ServiceAccordionCard.tsx | 149 | 44 | Local constant |

---

## Notes

1. **44px is the most common boxed size** - used for navigation, events info, services, banners, warnings
2. **48px is used for transport overview headers** and onboarding cards
3. **52px is unique to LineDetail header** (hero icon)
4. **40px is unique to transport line card headers** (list context)
5. **32px is unique to contact links** in LineDetail (small list icons that ARE boxed)
6. **64px is unique to municipality selection** (onboarding emphasis)

### Potential Issues for Migration

1. **LineDetail contact icons (32px) are boxed** but per Decision Charter, list icons should be unboxed
2. **Multiple similar sizes** (44, 48, 52) for hero/detail contexts - may need consolidation
3. **Some hardcoded values** should be moved to skin tokens for consistency

---

## Corrections from Previous Version

This version corrects the following missing entries from the initial inventory:

1. **Banner.tsx** - Added 2 icons (was entirely missing)
2. **DepartureItem.tsx** - Added 1 icon (was entirely missing)
3. **HeroMediaHeader.tsx** - Added 2 gallery chevron icons (was partially documented)
4. **InboxListScreen.tsx** - Added 3 dynamic icon references
5. **HomeScreen.tsx** - Added 1 IconBox category icon
6. **FaunaSpeciesCard.tsx** - Added 1 expand chevron icon
7. **FloraSpeciesCard.tsx** - Added 1 expand chevron icon
8. **LineDetailScreen.tsx** - Added 1 header icon (dynamic bus/ship)
9. **RoadTransportScreen.tsx** - Added 1 line card header icon
10. **SeaTransportScreen.tsx** - Added 1 line card header icon
11. **ServiceAccordionCard.tsx** - Added 1 expand chevron icon

**Previous totals:** 77 icons, 34 files
**Corrected totals:** 90 icons, 36 files
