# Design Debt and Refactor Plan

> MOJ VIS Mobile App - Design System Documentation
> Generated: 2026-02-12

---

## Table of Contents

1. [Overview](#overview)
2. [Duplicated Patterns](#duplicated-patterns)
3. [Design Stability Risks](#design-stability-risks)
4. [Prioritized Cleanup Checklist](#prioritized-cleanup-checklist)

---

## Overview

This document identifies design system debt and provides a prioritized plan for consolidation. The MOJ VIS mobile app has strong token coverage (~95%) but contains several duplicated patterns that could benefit from extraction into shared components.

**Debt Categories:**
- Duplicated UI patterns (same code in multiple files)
- Hardcoded values that bypass skin tokens
- Conditional rendering complexity
- Platform-specific divergences

---

## Duplicated Patterns

### 1. Transport Header Slabs

**What is duplicated:**
Colored header slab with icon box, title, and subtitle used across transport screens.

**Where:**
| File | Implementation |
|------|----------------|
| `screens/transport/TransportHubScreen.tsx` | Inline slab with tiles |
| `screens/transport/RoadTransportScreen.tsx` | Inline green header slab |
| `screens/transport/SeaTransportScreen.tsx` | Inline blue header slab |
| `screens/transport/LineDetailScreen.tsx` | Inline colored header slab |

**Risk/Impact:** **Medium**
- Inconsistency risk if one screen's slab is updated without others
- Similar but not identical implementations
- All use same token groups but with inline styles

**Minimal Consolidation Path:**
1. Extract `TransportHeaderSlab` component to `components/transport/`
2. Props: `title`, `subtitle`, `icon`, `transportType` ('sea' | 'road')
3. Component selects background color based on transportType
4. Migrate each screen to use shared component

---

### 2. Line Cards (2-Part: Header + Body)

**What is duplicated:**
Two-part card with colored header (line info) and white body (today's departures) used in transport overview screens.

**Where:**
| File | Implementation |
|------|----------------|
| `screens/transport/RoadTransportScreen.tsx` | Green header cards |
| `screens/transport/SeaTransportScreen.tsx` | Blue header cards (with 659 yellow variant) |

**Risk/Impact:** **Low**
- Well-tokenized, consistent structure
- Only color differs between road/sea
- Line 659 special case adds complexity

**Minimal Consolidation Path:**
1. Extract `LineCard` component to `components/transport/`
2. Props: `line`, `transportType`, `onPress`
3. Handle 659 yellow highlight internally
4. Migrate both screens to use shared component

---

### 3. Event Cards

**What is duplicated:**
Event card with date badge, title, time, and location used in home and events screens.

**Where:**
| File | Implementation |
|------|----------------|
| `screens/home/HomeScreen.tsx` | Upcoming events section |
| `screens/events/EventsScreen.tsx` | Selected day events list |

**Risk/Impact:** **Low**
- Slight structural differences (home has highlight for first event)
- Both use similar token groups
- Different data shapes may complicate extraction

**Minimal Consolidation Path:**
1. Extract `EventCard` component to `components/events/`
2. Props: `event`, `highlighted`, `onPress`
3. Handle first-event highlight via `highlighted` prop
4. Migrate both screens to use shared component

---

### 4. Tab Navigation

**What is duplicated:**
Horizontal tab bar with active/inactive states used for binary navigation.

**Where:**
| File | Usage |
|------|-------|
| `screens/transport/LineDetailScreen.tsx` | Direction tabs (0/1) |
| `screens/inbox/InboxListScreen.tsx` | Received/Sent tabs |

**Risk/Impact:** **Low**
- Both use `components.tab.*` tokens
- Different contexts (direction vs. message type)
- Inline implementations are simple

**Minimal Consolidation Path:**
1. Extract `TabBar` component to `ui/`
2. Props: `tabs: Array<{key, label}>`, `activeKey`, `onTabPress`
3. Component handles active/inactive styling
4. Migrate both screens to use shared component

---

### 5. Confirmation Screens

**What is duplicated:**
Success confirmation screen with centered icon, title, message, and action buttons.

**Where:**
| File | Implementation |
|------|----------------|
| `screens/feedback/FeedbackConfirmationScreen.tsx` | Feedback success |
| `screens/click-fix/ClickFixConfirmationScreen.tsx` | Report success |

**Risk/Impact:** **High**
- Nearly identical code (~90% same)
- Any bug fix must be applied to both
- Both have same hardcoded icon size (80x80)

**Minimal Consolidation Path:**
1. Extract `ConfirmationScreen` component to `components/common/`
2. Props: `icon`, `title`, `message`, `primaryAction`, `secondaryAction`
3. Add token for icon container size
4. Replace both screens with thin wrappers around shared component

---

### 6. Hardcoded Icon Box Sizes

**What is duplicated:**
44x44 icon box dimensions used in multiple components.

**Where:**
| File | Usage |
|------|-------|
| `components/GlobalHeader.tsx` | Menu and inbox icon boxes |
| `components/Banner.tsx` | Banner icon box |
| `components/services/ServiceAccordionCard.tsx` | Service icon box |

**Risk/Impact:** **Medium**
- Consistent size but hardcoded
- If touch target requirements change, must update multiple files

**Minimal Consolidation Path:**
1. Add `touchTargetSize` token to skin (value: 44)
2. Update all components to use token
3. Consider extracting `TouchableIconBox` primitive

---

## Design Stability Risks

### Conditional Rendering Areas

| Screen | Condition | Variants | Risk |
|--------|-----------|----------|------|
| SeaTransportScreen | Line 659 check | Yellow highlight vs. normal | **Low** - well-defined |
| HomeScreen | First event index | warningAccent vs. normal | **Low** - clear logic |
| EventsScreen | Calendar day state | 3-way priority (selected > today > hasEvents) | **Medium** - priority logic |
| InboxListScreen | Tag filter by municipality | Show/hide municipal tags | **Low** - feature flag |
| LineDetailScreen | Carrier ticket box | 4 variants (Jadrolinija/Krilo/boarding-only/fallback) | **Medium** - multiple branches |

### Dynamic Rendering Areas

#### StaticPageScreen Block Renderer

**Risk:** **High**

The StaticPageScreen renders 8 different block types dynamically from CMS content:

| Block Type | Rendering |
|------------|-----------|
| `text` | Body text with optional title |
| `highlight` | Colored card with shadow |
| `card_list` | Grid of cards (2 = side-by-side) |
| `media` | Image with caption |
| `map` | Map embed placeholder |
| `contact` | Contact info card |
| `link_list` | List of clickable links |
| `notice` | Notice banner (different from system banners) |

**Stability Concerns:**
- New block types require renderer updates
- Block type styling must remain consistent
- Highlight block parses bullet points (fragile parsing)
- Tile detection (exactly 2 cards) is implicit

**Mitigation:**
- Consider extracting each block type to separate component
- Add prop validation for block data
- Document expected CMS structure

### Platform-Specific Divergences

| Area | Risk | Mitigation |
|------|------|------------|
| DateTimePicker | **Medium** - Different UX on iOS/Android | Document expected behavior |
| Shadow rendering | **Low** - Handled by platformShadow() | None needed |
| Coordinate font | **Low** - Cosmetic difference | None needed |
| LayoutAnimation | **Low** - Handled at component level | None needed |

---

## Prioritized Cleanup Checklist

### P0 - Critical (Do First)

These items have the highest impact or risk.

- [ ] **Extract ConfirmationScreen component**
  - Files: `FeedbackConfirmationScreen.tsx`, `ClickFixConfirmationScreen.tsx`
  - Reason: ~90% duplicate code, bug fix must be applied twice
  - Effort: Small
  - Impact: High

- [ ] **Add touchTargetSize token**
  - Files: `skin.neobrut2.ts`, `GlobalHeader.tsx`, `Banner.tsx`, `ServiceAccordionCard.tsx`
  - Reason: Hardcoded 44x44 in multiple files
  - Effort: Small
  - Impact: Medium

### P1 - Important (Do Soon)

These items improve maintainability and consistency.

- [ ] **Extract TransportHeaderSlab component**
  - Files: 4 transport screens
  - Reason: Similar inline implementations, inconsistency risk
  - Effort: Medium
  - Impact: Medium

- [ ] **Extract LineCard component**
  - Files: `RoadTransportScreen.tsx`, `SeaTransportScreen.tsx`
  - Reason: Duplicated card structure
  - Effort: Medium
  - Impact: Medium

- [ ] **Add timeline dimension tokens**
  - Files: `skin.neobrut2.ts`, `DepartureItem.tsx`
  - Reason: Hardcoded 24px, 40px in timeline
  - Effort: Small
  - Impact: Low

- [ ] **Add confirmation icon size token**
  - Files: `skin.neobrut2.ts`, confirmation screens
  - Reason: Hardcoded 80x80
  - Effort: Small
  - Impact: Low

### P2 - Nice to Have (Do Later)

These items are lower priority improvements.

- [ ] **Extract EventCard component**
  - Files: `HomeScreen.tsx`, `EventsScreen.tsx`
  - Reason: Similar structures, slight differences
  - Effort: Medium
  - Impact: Low

- [ ] **Extract TabBar component**
  - Files: `LineDetailScreen.tsx`, `InboxListScreen.tsx`
  - Reason: Similar tab implementations
  - Effort: Small
  - Impact: Low

- [ ] **Add hero aspect ratio token**
  - Files: `skin.neobrut2.ts`, `HeroMediaHeader.tsx`
  - Reason: Hardcoded 16/10
  - Effort: Small
  - Impact: Low

- [ ] **Add pagination dot size token**
  - Files: `skin.neobrut2.ts`, `HeroMediaHeader.tsx`
  - Reason: Hardcoded 10x10
  - Effort: Small
  - Impact: Low

- [ ] **Standardize modal close button position**
  - Files: `ClickFixDetailScreen.tsx`
  - Reason: Hardcoded top/right values
  - Effort: Small
  - Impact: Low

- [ ] **Extract StaticPageScreen block renderers**
  - Files: `StaticPageScreen.tsx`
  - Reason: 8 block types in single switch
  - Effort: Large
  - Impact: Medium

### P3 - Future Consideration

These items are not urgent but worth tracking.

- [ ] **Review unused tokens**
  - Tokens: `colors.pink`, `borders.radiusMedium/Large`, `lineHeight.relaxed`
  - Action: Either use or remove for clarity

- [ ] **Document platform-specific behavior**
  - Areas: DateTimePicker, shadows, fonts
  - Action: Add inline comments or separate doc

- [ ] **Consider theme variant support**
  - Current: Single neobrutalist theme
  - Future: Could support light/dark or accessibility modes

---

## Summary

| Priority | Items | Effort | Impact |
|----------|-------|--------|--------|
| P0 | 2 | Small | High |
| P1 | 4 | Medium | Medium |
| P2 | 6 | Small-Medium | Low |
| P3 | 3 | Varies | Future |

**Recommended Starting Point:**
1. Extract ConfirmationScreen (P0) - highest code duplication
2. Add touchTargetSize token (P0) - quick win, improves consistency
3. Extract TransportHeaderSlab (P1) - consolidates transport screens

---

*End of Design Debt and Refactor Plan*
