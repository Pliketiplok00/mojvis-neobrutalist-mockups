# Boxed Icon Instances - Real App Audit

**Audit Date:** 2026-02-13
**Scope:** `mobile/src/**` (excluding `design-mirror/**` and `screens/dev/**`)

## Definition (Locked)

A **BOXED ICON** is any icon render where the icon is visually framed by a wrapper that has ANY of:
- `backgroundColor` not transparent
- `borderWidth > 0` (or outline)
- Fixed square `width + height` intended to frame the icon (e.g., 44x44)

This includes wrappers called "tile", "placeholder", "container", "slab", etc.

---

## Category 1: GlobalHeader (ALLOWED)

| File | Lines | Icon | Wrapper | Box Properties | Screen | Notes |
|------|-------|------|---------|----------------|--------|-------|
| `GlobalHeader.tsx` | 85-87 | `menu` | `menuIconBox` | `width/height: iconBoxSize`, `backgroundColor: warningAccent`, `borderWidth: widthCard`, `borderColor: border` | All screens (header) | **ALLOWED** - Yellow hamburger button |
| `GlobalHeader.tsx` | 103-104 | `inbox` | `inboxIconBox` | `width/height: iconBoxSize`, `backgroundColor: primary`, `borderWidth: widthCard`, `borderColor: border` | All screens (header) | **ALLOWED** - Blue inbox button |

---

## Category 2: Transport Header/Card Icon Boxes (NOT ALLOWED)

| File | Lines | Icon | Wrapper | Box Properties | Screen | Suggested Fix |
|------|-------|------|---------|----------------|--------|---------------|
| `SeaTransportScreen.tsx` | 189-191 | `ship` | `headerIconBox` | `width/height: iconBoxSize (48)`, `backgroundColor: iconBoxBackground`, `borderWidth: iconBoxBorderWidth`, `borderColor: iconBoxBorderColor` | Sea Transport list | Remove background/border, keep sizing for layout |
| `RoadTransportScreen.tsx` | 173-175 | `bus` | `headerIconBox` | Same as above | Road Transport list | Same |
| `LineDetailScreen.tsx` | 267-269 | `ship`/`bus` | `headerIconBox` | `width/height: headerIconBoxSize (52)`, `backgroundColor`, `borderWidth`, `borderColor` | Line Detail | Same |
| `SeaTransportScreen.tsx` | 237-240 | (dynamic) | `lineCardHeaderIconBox` | `width/height: lineCardHeaderIconBoxSize (40)`, `backgroundColor`, `borderWidth`, `borderColor` | Sea Transport (line cards) | Same |
| `RoadTransportScreen.tsx` | 220-224 | (dynamic) | `lineCardHeaderIconBox` | Same as above | Road Transport (line cards) | Same |
| `TransportHubScreen.tsx` | 103-105, 131-133 | `bus`, `ship` | `tileIconSlab` | `width: tileIconSlabWidth`, `padding: tileIconSlabPadding` (inherits tile bg) | Transport Hub | Icon is within colored tile; box not visible but padding creates framing |

---

## Category 3: Gallery/Calendar Navigation Chevrons (NOT ALLOWED)

| File | Lines | Icon | Wrapper | Box Properties | Screen | Suggested Fix |
|------|-------|------|---------|----------------|--------|---------------|
| `HeroMediaHeader.tsx` | 127-138 | `chevron-left/right` | `chevronButton` | `width: 48`, `height: 48`, `backgroundColor: colors.border` | Flora/Fauna/Info hero | Remove backgroundColor, use transparent overlay or hitSlop |
| `FloraSpeciesCard.tsx` | 221-236 | `chevron-left/right` | `galleryChevron` | `width: 32`, `height: 32`, `backgroundColor: colors.border` | Flora species (expanded) | Same |
| `FaunaSpeciesCard.tsx` | 221-236 | `chevron-left/right` | `galleryChevron` | Same as above | Fauna species (expanded) | Same |
| `EventsScreen.tsx` | 154-156, 160-162 | `chevron-left/right` | `calendarNavButton` | `width: 44`, `height: 44`, `borderWidth: widthThin`, `borderColor: border`, `backgroundColor: background` | Events calendar | Remove border and explicit background |

---

## Category 4: Empty/Error/Placeholder Tiles (NOT ALLOWED)

| File | Lines | Icon | Wrapper | Box Properties | Screen | Suggested Fix |
|------|-------|------|---------|----------------|--------|---------------|
| `FloraSpeciesCard.tsx` | 150-152 | `leaf` | `thumbnailPlaceholder` | `width: 72`, `height: 72`, `backgroundColor: backgroundSecondary`, `borderWidth`, `borderColor` | Flora species (no image) | Remove visible frame; icon floats on neutral bg |
| `FaunaSpeciesCard.tsx` | 150-152 | `leaf` | `thumbnailPlaceholder` | Same as above | Fauna species (no image) | Same |
| `PhotoSlotTile.tsx` | 73-74 | `camera` | `emptyContainer` | `borderWidth: widthThin`, `borderColor: border`, `borderStyle: dashed`, `backgroundColor: background` | ClickFix form (empty photo slot) | Remove dashed border framing icon; keep slot frame but icon unboxed |
| `LineDetailScreen.tsx` | 422-427 | `calendar` | `emptyState` | `backgroundColor: backgroundSecondary`, `borderWidth: widthThin`, `borderColor: borderMuted`, `borderStyle: dashed` | Line Detail (no departures) | Remove border/bg framing; use EmptyState primitive |
| `FloraSpeciesCard.tsx` | 255-261 | `camera` | `galleryPlaceholder` | `backgroundColor: backgroundSecondary` | Flora species (no gallery) | Remove visible background |
| `FaunaSpeciesCard.tsx` | 255-261 | `camera` | `galleryPlaceholder` | Same as above | Fauna species (no gallery) | Same |

---

## Category 5: List Item Icon Slabs / Chevron Boxes (NOT ALLOWED)

| File | Lines | Icon | Wrapper | Box Properties | Screen | Suggested Fix |
|------|-------|------|---------|----------------|--------|---------------|
| `InboxListScreen.tsx` | 281-283 | `(category icon)` | `iconSlab` | `width/height: iconSlabSize (44)`, `borderWidth: iconSlabBorderWidth`, `borderColor: iconSlabBorderColor`, dynamic `backgroundColor` | Inbox list (received) | Remove border, allow bg for category coding but no frame |
| `InboxListScreen.tsx` | 361-363 | `(sent icon)` | `iconSlab` | Same as above | Inbox list (sent) | Same |
| `InboxListScreen.tsx` | 316-317 | `chevron-right` | `chevronBox` | `width/height: chevronBoxSize (32)`, `backgroundColor: chevronBoxBackground`, `borderWidth`, `borderColor` | Inbox list (received) | Remove all box properties |
| `InboxListScreen.tsx` | 397-399 | `chevron-right` | `chevronBox` | Same as above | Inbox list (sent) | Same |

---

## Category 6: Other Boxed Icons (NOT ALLOWED)

| File | Lines | Icon | Wrapper | Box Properties | Screen | Suggested Fix |
|------|-------|------|---------|----------------|--------|---------------|
| `OnboardingRoleCard.tsx` | 91-93 | `(role icon)` | `iconBox` | `width/height: iconBox.size`, `backgroundColor: iconBox.background`, `borderWidth`, `borderColor` | Onboarding role selection | Remove visible frame |
| `MunicipalitySelectionScreen.tsx` | 69-71, 85-87 | `file-text` | `iconBox` | `width/height: iconBox.size`, `backgroundColor`, `borderWidth`, `borderColor`, `borderRadius` | Municipality selection | Same |
| `ServiceAccordionCard.tsx` | 95-97 | `(service icon)` | `iconBox` | `width/height: ICON_BOX_SIZE (44)`, `borderWidth: widthThin`, `borderColor: border`, inline `backgroundColor` | Services accordion | Remove border, keep bg for category coding |
| `Banner.tsx` | 68-75 | `shield-alert` | `iconBox` | `width: 44`, `height: 44`, `borderWidth: widthThin`, `borderColor: border`, `backgroundColor: urgent` | Banner component | Remove border |
| `HomeScreen.tsx` | 294-296 | `message-circle` | `ctaIconBox` | `width: 48`, `height: 48`, `backgroundColor: iconBoxOverlayBg`, `borderWidth: widthThin`, `borderColor: iconBoxOverlayBorder` | Home screen (feedback CTA) | Remove visible frame |
| `FloraScreen.tsx` | 103-105 | `alert-triangle` | `warningIconBox` | `width: 44`, `height: 44`, `backgroundColor: urgent` | Flora intro | Remove visible background |
| `FaunaScreen.tsx` | 103-105 | `alert-triangle` | `warningIconBox` | Same as above | Fauna intro | Same |
| `EventDetailScreen.tsx` | 162, 181, 192 | `clock`, `map-pin`, `user` | `infoTileIconBox` | `width/height: infoTileIconBoxSize (44)`, `backgroundColor`, `borderWidth`, `borderColor` | Event detail | Remove visible frame |
| `FeedbackConfirmationScreen.tsx` | 49-51 | `check` | `iconContainer` | `width: 80`, `height: 80`, `backgroundColor: textPrimary`, `borderRadius: radiusSharp` | Feedback confirmation | Remove visible frame; use larger unboxed icon |
| `ClickFixConfirmationScreen.tsx` | 49-51 | `check` | `iconContainer` | Same as above | ClickFix confirmation | Same |
| `PhotoSlotTile.tsx` | 55-57 | `close` | `removeButton` | `width: 24`, `height: 24`, `borderRadius: radiusSharp`, `backgroundColor: errorText` | ClickFix form (remove photo) | This is a button, not just an icon; may need UX review |

---

## Ambiguous Cases (Require Decision)

| File | Lines | Icon | Wrapper | Issue | Question |
|------|-------|------|---------|-------|----------|
| `TransportHubScreen.tsx` | 103-105, 131-133 | `bus`, `ship` | `tileIconSlab` | The slab has no explicit bg/border but lives inside a colored tile | Is this "boxed" or is the tile the box and icon is just positioned? |
| `PhotoSlotTile.tsx` | 55-57 | `close` | `removeButton` | This is a functional button, not decorative framing | Should action buttons with icons be exempt from unboxing? |
| `InboxListScreen.tsx` | 281-283 | category icons | `iconSlab` | Background color is category-coded (semantic meaning) | Should we keep the bg for semantics but remove border? |

---

## Total Counts

| Category | Count | Status |
|----------|-------|--------|
| 1. GlobalHeader | 2 | ALLOWED |
| 2. Transport header/card icon boxes | 6 | NOT ALLOWED |
| 3. Gallery/calendar chevron boxes | 8 (4 locations x2 icons) | NOT ALLOWED |
| 4. Empty/placeholder tiles | 6 | NOT ALLOWED |
| 5. List item icon slabs/chevron boxes | 4 | NOT ALLOWED |
| 6. Other boxed icons | 13 | NOT ALLOWED |
| **Total boxed instances** | **39** | 2 allowed, 37 to fix |

---

## Skin Token References

The following skin tokens define boxed icon properties and will need review:

- `skin.components.header.iconBoxSize` (44)
- `skin.components.transport.overviewHeader.iconBoxSize/Background/BorderWidth/BorderColor`
- `skin.components.transport.list.lineCardHeaderIconBoxSize/Background/BorderWidth/BorderColor`
- `skin.components.inbox.listItem.iconSlabSize/BorderWidth/BorderColor`
- `skin.components.inbox.listItem.chevronBoxSize/Background/BorderWidth/BorderColor`
- `skin.components.onboarding.roleCard.iconBox.*`
- `skin.components.onboarding.municipalitySelection.iconBox.*`
- `skin.components.events.detail.infoTileIconBoxSize/Background/BorderWidth/BorderColor`
- `skin.colors.iconBoxOverlayBg/iconBoxOverlayBorder`
