# Boxed Icon Wrappers - Pattern-Based Inventory

**Date**: 2026-02-14
**Scope**: `mobile/src/**` (real app only, excluding design-mirror and screens/dev)

## Allowed Boxed Contexts (Policy)

Only these 5 contexts are allowed to have boxed icons:

1. **GlobalHeader** - hamburger + inbox icons
2. **PhotoSlotTile removeButton** - red X button
3. **PhotoSlotTile emptyContainer** - dashed add-photo affordance
4. **InboxListScreen iconSlab** - semantic category indicator
5. **TransportHubScreen tileIconSlab** - semantic transport type

Everything else must be unboxed.

---

## Inventory Table

| File:Line | Component | Icon | Wrapper Style | Box-Causing Properties | Allowed? | Action |
|-----------|-----------|------|---------------|------------------------|----------|--------|
| SeaTransportScreen.tsx:189 | Overview header | ship | headerIconBox | bg: overviewHeader.iconBoxBackground, border: iconBoxBorderWidth | NO | Remove bg/border |
| SeaTransportScreen.tsx:237 | Line card header | ship | lineCardHeaderIconBox | bg: lineCardHeaderIconBoxBackground, border: lineCardHeaderIconBoxBorderWidth | NO | Remove bg/border |
| RoadTransportScreen.tsx:173 | Overview header | bus | headerIconBox | bg: overviewHeader.iconBoxBackground, border: iconBoxBorderWidth | NO | Remove bg/border |
| RoadTransportScreen.tsx:220 | Line card header | bus | lineCardHeaderIconBox | bg: lineCardHeaderIconBoxBackground, border: lineCardHeaderIconBoxBorderWidth | NO | Remove bg/border |
| LineDetailScreen.tsx:267 | Poster header | ship/bus | headerIconBox | bg: lineDetail.headerIconBoxBackground, border: lineDetail.headerIconBoxBorderWidth | NO | Remove bg/border |
| EventDetailScreen.tsx:162,181,192 | Info tiles | clock,map-pin,user | infoTileIconBox | bg: infoTileIconBoxBackground, border: infoTileIconBoxBorderWidth | NO | Remove bg/border |
| EventsScreen.tsx:154,160 | Calendar nav | chevron-left/right | calendarNavButton | bg: colors.background, border: widthThin (implied) | NO | Remove bg/border |
| HomeScreen.tsx:202 | Category tile | category icons | categoryIconBox (via IconBox) | IconBox component applies bg/border | NO | Remove IconBox usage |
| HomeScreen.tsx:294 | CTA panel | message-circle | ctaIconBox | bg: iconBoxOverlayBg, border: widthThin | NO | Remove bg/border |
| OnboardingRoleCard.tsx:91 | Role card | role icons | iconBox | bg: tokens.iconBox.background, border: tokens.iconBox.borderWidth | NO | Remove bg/border |
| MunicipalitySelectionScreen.tsx:69,85 | Selection card | file-text | iconBox | bg: t.iconBox.backgroundColor, border: t.iconBox.borderWidth | NO | Remove bg/border |
| FloraScreen.tsx:103 | Warning card | alert-triangle | warningIconBox | bg: implicit, size: 44x44 | NO | Remove size constraints |
| FaunaScreen.tsx:103 | Warning card | alert-triangle | warningIconBox | bg: implicit, size: 44x44 | NO | Remove size constraints |
| HeroMediaHeader.tsx:128,141 | Carousel chevrons | chevron-left/right | chevronButton | bg: colors.border, size: 48x48 | NO | Remove bg, keep hitSlop |
| FloraSpeciesCard.tsx:150 | Thumbnail | leaf | thumbnailPlaceholder | bg: colors.backgroundMuted, size: thumbnail dims | NO | Remove bg |
| FloraSpeciesCard.tsx:222,229 | Gallery chevrons | chevron-left/right | galleryChevron | bg: colors.border, size: 32x32 | NO | Remove bg |
| FaunaSpeciesCard.tsx:150 | Thumbnail | leaf | thumbnailPlaceholder | bg: colors.backgroundMuted, size: thumbnail dims | NO | Remove bg |
| FaunaSpeciesCard.tsx:222,229 | Gallery chevrons | chevron-left/right | galleryChevron | bg: colors.border, size: 32x32 | NO | Remove bg |
| FeedbackConfirmationScreen.tsx:49 | Success icon | check | iconContainer | bg: skin.colors.textPrimary, size: 80x80 | NO | Remove bg/border |
| ClickFixConfirmationScreen.tsx:49 | Success icon | check | iconContainer | bg: skin.colors.textPrimary, size: 80x80 | NO | Remove bg/border |
| Banner.tsx:68 | Alert icon | shield-alert | iconBox | bg: skin.colors.urgent, border: widthThin | NO | Remove bg/border |
| ServiceAccordionCard.tsx:95 | Header icon | service icons | iconBox | bg: iconBackgroundColor, border: widthThin | NO | Remove bg/border |
| InboxListScreen.tsx:316,397 | Chevron box | chevron-right | chevronBox | bg: chevronBoxBackground, border: chevronBoxBorderWidth | NO | Remove bg/border |
| InboxListScreen.tsx:281,361 | Category slab | category icons | iconSlab | bg: category color, border: widthThin | **YES** | Keep (semantic) |
| TransportHubScreen.tsx:103,132 | Transport tile | bus/ship | tileIconSlab | bg: tile color, size: token-based | **YES** | Keep (semantic) |
| GlobalHeader.tsx:85 | Menu icon | menu | menuIconBox | bg: warningAccent, border: widthCard | **YES** | Keep (allowed) |
| GlobalHeader.tsx:103 | Inbox icon | inbox | inboxIconBox | bg: primary, border: widthCard | **YES** | Keep (allowed) |
| PhotoSlotTile.tsx:45 | Remove button | close | removeButton | bg: errorText, size: 24x24 | **YES** | Keep (allowed) |
| PhotoSlotTile.tsx:52-72 | Empty container | camera | emptyContainer | border: dashed, size: tile dims | **YES** | Keep (allowed) |

---

## Summary

| Status | Count |
|--------|-------|
| NOT ALLOWED (must unbox) | 24 |
| ALLOWED (keep as-is) | 7 |

### Files Requiring Changes (NOT ALLOWED)

1. `SeaTransportScreen.tsx` - headerIconBox, lineCardHeaderIconBox
2. `RoadTransportScreen.tsx` - headerIconBox, lineCardHeaderIconBox
3. `LineDetailScreen.tsx` - headerIconBox
4. `EventDetailScreen.tsx` - infoTileIconBox (3 instances)
5. `EventsScreen.tsx` - calendarNavButton (2 instances)
6. `HomeScreen.tsx` - categoryIconBox, ctaIconBox
7. `OnboardingRoleCard.tsx` - iconBox
8. `MunicipalitySelectionScreen.tsx` - iconBox (2 instances)
9. `FloraScreen.tsx` - warningIconBox
10. `FaunaScreen.tsx` - warningIconBox
11. `HeroMediaHeader.tsx` - chevronButton (2 instances)
12. `FloraSpeciesCard.tsx` - thumbnailPlaceholder, galleryChevron (2 instances)
13. `FaunaSpeciesCard.tsx` - thumbnailPlaceholder, galleryChevron (2 instances)
14. `FeedbackConfirmationScreen.tsx` - iconContainer
15. `ClickFixConfirmationScreen.tsx` - iconContainer
16. `Banner.tsx` - iconBox
17. `ServiceAccordionCard.tsx` - iconBox
18. `InboxListScreen.tsx` - chevronBox (2 instances, iconSlab stays)

### Files Staying Boxed (ALLOWED)

1. `GlobalHeader.tsx` - menuIconBox, inboxIconBox
2. `PhotoSlotTile.tsx` - removeButton, emptyContainer
3. `InboxListScreen.tsx` - iconSlab (semantic)
4. `TransportHubScreen.tsx` - tileIconSlab (semantic)

---

## Unboxing Action per Style

For each NOT ALLOWED wrapper:
- Remove `backgroundColor` property
- Remove `borderWidth` and `borderColor` properties
- Keep `width`, `height`, `alignItems`, `justifyContent` for tap target
- Alternative: use `padding` or `hitSlop` for tap area
