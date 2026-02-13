# Boxed Icon Audit Summary

**Audit Date:** 2026-02-13
**Rule:** ALL icons are UNBOXED everywhere in real app EXCEPT GlobalHeader.

---

## Counts by Category

| Category | Count | Files Affected | Status |
|----------|-------|----------------|--------|
| 1. GlobalHeader (hamburger + inbox) | 2 | 1 | **ALLOWED** |
| 2. Transport header/card icon boxes | 6 | 4 | NOT ALLOWED |
| 3. Gallery/calendar chevron boxes | 8 | 4 | NOT ALLOWED |
| 4. Empty/placeholder tiles | 6 | 4 | NOT ALLOWED |
| 5. Inbox list icon slabs/chevron boxes | 4 | 1 | NOT ALLOWED |
| 6. Other boxed icons | 13 | 10 | NOT ALLOWED |
| **TOTAL** | **39** | ~18 unique files | 2 allowed, 37 to fix |

---

## Top 10 Most Impactful to Fix

These are prioritized by visibility (user-facing screens) and frequency of use:

| Rank | Component | Location | Impact | Effort |
|------|-----------|----------|--------|--------|
| 1 | `InboxListScreen.tsx` - iconSlab + chevronBox | Inbox (primary screen) | HIGH - seen on every inbox visit | Medium - 2 patterns |
| 2 | `SeaTransportScreen.tsx` - headerIconBox | Transport (primary) | HIGH - visible on entry | Low - 1 pattern |
| 3 | `RoadTransportScreen.tsx` - headerIconBox | Transport (primary) | HIGH - visible on entry | Low - 1 pattern |
| 4 | `HomeScreen.tsx` - ctaIconBox | Home (primary) | HIGH - always visible | Low - 1 pattern |
| 5 | `EventsScreen.tsx` - calendarNavButton | Events (calendar nav) | MEDIUM - interacted often | Low - 1 pattern |
| 6 | `Banner.tsx` - iconBox | Urgent notifications | MEDIUM - high visibility | Low - 1 pattern |
| 7 | `FeedbackConfirmationScreen.tsx` - iconContainer | Confirmation | MEDIUM - success state | Low - 1 pattern |
| 8 | `ClickFixConfirmationScreen.tsx` - iconContainer | Confirmation | MEDIUM - success state | Low - 1 pattern |
| 9 | `HeroMediaHeader.tsx` - chevronButton | Multiple screens | MEDIUM - gallery navigation | Low - 1 pattern |
| 10 | `ServiceAccordionCard.tsx` - iconBox | Services | MEDIUM - accordion headers | Low - 1 pattern |

---

## Files Requiring Changes

### High Priority (Primary Screens)

1. **InboxListScreen.tsx** (lines 281-283, 316-317, 361-363, 397-399)
   - `iconSlab` - remove borderWidth/borderColor
   - `chevronBox` - remove all box properties

2. **HomeScreen.tsx** (lines 294-296)
   - `ctaIconBox` - remove backgroundColor/borderWidth/borderColor

3. **SeaTransportScreen.tsx** (lines 189-191, 237-240)
   - `headerIconBox` - remove backgroundColor/borderWidth/borderColor
   - `lineCardHeaderIconBox` - same

4. **RoadTransportScreen.tsx** (lines 173-175, 220-224)
   - `headerIconBox` - same as above
   - `lineCardHeaderIconBox` - same

5. **LineDetailScreen.tsx** (lines 267-269, 422-427)
   - `headerIconBox` - remove visible frame
   - `emptyState` - remove dashed border framing

### Medium Priority (Secondary Screens)

6. **EventsScreen.tsx** (lines 154-156, 160-162)
   - `calendarNavButton` - remove borderWidth/borderColor/backgroundColor

7. **Banner.tsx** (lines 68-75)
   - `iconBox` - remove borderWidth/borderColor

8. **FeedbackConfirmationScreen.tsx** (lines 49-51)
   - `iconContainer` - remove backgroundColor, use larger unboxed icon

9. **ClickFixConfirmationScreen.tsx** (lines 49-51)
   - Same as above

10. **HeroMediaHeader.tsx** (lines 127-138)
    - `chevronButton` - remove backgroundColor

### Lower Priority (Onboarding/Detail Screens)

11. **OnboardingRoleCard.tsx** (lines 91-93)
12. **MunicipalitySelectionScreen.tsx** (lines 69-71, 85-87)
13. **ServiceAccordionCard.tsx** (lines 95-97)
14. **EventDetailScreen.tsx** (lines 162, 181, 192)
15. **FloraScreen.tsx** (lines 103-105)
16. **FaunaScreen.tsx** (lines 103-105)
17. **FloraSpeciesCard.tsx** (lines 150-152, 221-236)
18. **FaunaSpeciesCard.tsx** (lines 150-152, 221-236)
19. **PhotoSlotTile.tsx** (lines 55-57, 73-74)

---

## Ambiguous Instances Requiring Decision

### 1. TransportHubScreen.tsx - tileIconSlab

**Issue:** The icon lives inside a colored tile with no explicit icon box, but the tile itself acts as visual framing.

**Options:**
- A) Leave as-is (tile is the card, not an icon box)
- B) Adjust icon positioning to not be centered in a "slab" area

**Recommendation:** Leave as-is - the tile is a card component, not an icon frame.

### 2. PhotoSlotTile.tsx - removeButton

**Issue:** This is an action button (trash/remove), not decorative framing. The background makes the button visible.

**Options:**
- A) Exempt action buttons from unboxing rule
- B) Use an icon-only button with hover/press states but no visible box

**Recommendation:** Needs UX review - action buttons may need visual affordance.

### 3. InboxListScreen.tsx - iconSlab with semantic background

**Issue:** The background color indicates message category (urgent=red, transport=blue, etc.). Removing it loses semantic information.

**Options:**
- A) Keep background for semantics, remove border only
- B) Move semantic coloring elsewhere (badge, text, etc.)
- C) Use a subtle tint without a boxed appearance

**Recommendation:** Option A - keep semantic background, remove border frame.

---

## Skin Token Cleanup Required

After fixing, these skin tokens should be reviewed/removed:

```
// In skin.neobrut2.ts - to review
skin.components.header.iconBoxSize (keep for GlobalHeader)
skin.components.transport.overviewHeader.iconBoxSize/Background/BorderWidth/BorderColor (remove)
skin.components.transport.list.lineCardHeaderIconBoxSize/Background/BorderWidth/BorderColor (remove)
skin.components.inbox.listItem.iconSlabBorderWidth/BorderColor (remove, keep size)
skin.components.inbox.listItem.chevronBoxSize/Background/BorderWidth/BorderColor (remove all)
skin.components.onboarding.roleCard.iconBox.borderWidth/borderColor (remove)
skin.components.onboarding.municipalitySelection.iconBox.borderWidth/borderColor (remove)
skin.components.events.detail.infoTileIconBoxBorderWidth/BorderColor (remove)
skin.colors.iconBoxOverlayBg/iconBoxOverlayBorder (remove)
```

---

## Verification Checklist (for Phase 2)

After fixing, verify:

- [ ] GlobalHeader hamburger button has yellow bg, black border, black icon
- [ ] GlobalHeader inbox button has blue bg, black border, white icon
- [ ] NO other icons have visible boxes (bg + border) around them
- [ ] Tap targets preserved using padding/minHeight/hitSlop
- [ ] Semantic coloring preserved where needed (inbox categories)
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes

---

## Notes

1. The `IconBox` component in `ui/MicroPrimitives.tsx` has NO background/border - it's just a centering wrapper. This is fine.

2. HomeScreen uses `<IconBox size="lg">` for category tiles - this is acceptable as IconBox only provides sizing.

3. Many boxed patterns use skin tokens, making the fix straightforward: update token values or remove references.
