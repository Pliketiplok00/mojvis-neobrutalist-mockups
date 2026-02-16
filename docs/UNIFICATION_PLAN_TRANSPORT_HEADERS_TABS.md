# Unification Plan: Transport Header Slabs + Tab Bars

> MOJ VIS Mobile App - Design System Consolidation
> Generated: 2026-02-12

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Transport Header Slab Analysis](#transport-header-slab-analysis)
3. [Tab Bar Analysis](#tab-bar-analysis)
4. [Badge/Tag Class Review](#badgetag-class-review)
5. [Hardcoded Values Audit](#hardcoded-values-audit)
6. [Risk Register](#risk-register)
7. [Staged Migration Plan](#staged-migration-plan)
8. [Verification Checklist](#verification-checklist)

---

## Executive Summary

### Scope
This plan addresses consolidation of three duplicated patterns:
1. **Transport Header Slabs** - 4 screens with similar colored header bands
2. **Tab Bars** - 2 screens with segmented tab navigation
3. **Badge/Tag Classes** - Review of Badge component vs inline tag chips

### Recommendation Summary
| Pattern | Current State | Recommended Action |
|---------|---------------|-------------------|
| Transport Header Slabs | 2 token groups, 4 inline implementations | Extract `<TransportHeaderSlab>` component |
| Tab Bars | 2 separate token groups, incompatible structure | Extract `<SegmentedTabs>` component |
| Badge/Tags | 1 Badge component + 1 inline chip implementation | Keep separate (different purposes) |

---

## Transport Header Slab Analysis

### Current Implementations

#### 1. TransportHubScreen (NOT a header slab)
- **File**: `screens/transport/TransportHubScreen.tsx:91-147`
- **Structure**: Two poster TILES (Road/Sea), not a header slab
- **Purpose**: Navigation tiles, not section headers
- **Conclusion**: **EXCLUDE from unification** - different pattern entirely

#### 2. RoadTransportScreen
- **File**: `screens/transport/RoadTransportScreen.tsx:170-186`
- **Token Group**: `components.transport.overviewHeader`
- **Structure**:
```
headerSlab (green bg)
└── headerContent (row)
    ├── headerIconBox (48x48, white bg, icon)
    └── headerTextContainer
        ├── H1 (title, white)
        └── Meta (day type + holiday, white 85%)
```

#### 3. SeaTransportScreen
- **File**: `screens/transport/SeaTransportScreen.tsx:194-208`
- **Token Group**: `components.transport.overviewHeader` (same)
- **Structure**: Identical to RoadTransportScreen
- **Difference**: `overviewHeader.backgroundSea` (blue) vs `backgroundRoad` (green)

#### 4. LineDetailScreen
- **File**: `screens/transport/LineDetailScreen.tsx:262-292`
- **Token Group**: `components.transport.lineDetail` (DIFFERENT group)
- **Structure**:
```
headerSlab (dynamic bg)
└── headerContent (row)
    ├── headerIconBox (52x52, white bg, icon)  <-- DIFFERENT SIZE
    └── headerTextContainer
        ├── H1 (line title, white)
        └── headerMetaRow (row, gap: spacing.md)  <-- ROW not single Meta
            ├── Meta (subtype)
            └── Meta (duration)
```

### Token Group Comparison

| Property | overviewHeader | lineDetail |
|----------|---------------|------------|
| Token path | `components.transport.overviewHeader.*` | `components.transport.lineDetail.*` |
| Padding | `spacing.lg` (16px) | `spacing.lg` (16px) |
| Border bottom | `widthHeavy` (4px) | `widthCard` (3px) |
| Icon box size | 48px | 52px |
| Icon box bg | `background` | `background` |
| Icon box border | `widthThin` | `widthThin` |
| Title color | `primaryText` | `primaryText` |
| Subtitle color | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.85)` |

### Structural Differences

| Aspect | Overview Screens | LineDetail |
|--------|-----------------|------------|
| Subtitle | Single `<Meta>` | `<View>` row with multiple `<Meta>` |
| Icon box size | 48px | 52px |
| Border width | 4px (heavy) | 3px (card) |
| Background source | `overviewHeader.background{Sea,Road}` | `lineDetail.headerBackground{Sea,Road}` |

### Unification Decision

**Recommend: Extract `<TransportHeaderSlab>` component**

Rationale:
- 90% identical structure
- Same visual language (colored slab + icon box + text)
- Differences are minor and can be parameterized

#### Proposed Component API

```typescript
interface TransportHeaderSlabProps {
  // Required
  transportType: 'sea' | 'road';
  title: string;
  icon: IconName;

  // Optional - different subtitle patterns
  subtitle?: string;         // Simple subtitle (overview screens)
  metaItems?: string[];      // Multiple meta items in row (line detail)

  // Optional - customization
  iconBoxSize?: 'default' | 'large';  // 48px vs 52px
  borderWeight?: 'card' | 'heavy';    // 3px vs 4px
}
```

#### Token Consolidation

Create unified token group `components.transport.headerSlab`:

```typescript
headerSlab: {
  padding: spacing.lg,
  borderBottomWidthDefault: bordersToken.widthHeavy,  // 4px for overview
  borderBottomWidthCompact: bordersToken.widthCard,   // 3px for detail
  borderBottomColor: colors.border,

  // Backgrounds
  backgroundSea: palette.primary,
  backgroundRoad: palette.secondary,

  // Icon box
  iconBoxSizeDefault: 48,
  iconBoxSizeLarge: 52,
  iconBoxBackground: colors.background,
  iconBoxBorderWidth: bordersToken.widthThin,
  iconBoxBorderColor: colors.border,
  iconBoxGap: spacing.md,

  // Text
  titleColor: colors.primaryText,
  subtitleColor: "rgba(255, 255, 255, 0.85)",
  metaRowGap: spacing.md,
}
```

---

## Tab Bar Analysis

### Current Implementations

#### 1. InboxListScreen Tabs
- **File**: `screens/inbox/InboxListScreen.tsx:429-467`
- **Token Group**: `components.inbox.tabs`
- **Purpose**: Received/Sent toggle

**Structure**:
```
tabBar (row, 8px bottom border)
├── tab (flex: 1, icon + label, primary fill when active)
└── tab (flex: 1, icon + label, primary fill when active)
```

**Styling**:
- Container: 8px bottom border (`widthExtraHeavy`)
- Active: Primary blue fill, white text, 3px border
- Inactive: White bg, dark text, 3px border
- Icons: Yes (inbox, send)
- Shadow: No

#### 2. LineDetailScreen Direction Tabs
- **File**: `screens/transport/LineDetailScreen.tsx:325-362`
- **Token Group**: `components.transport.lineDetail.directionTab*`
- **Purpose**: Direction 0/1 toggle

**Structure**:
```
directionContainer
├── Label (section label)
└── directionTabsWrapper (relative)
    ├── directionTabsShadow (neobrut shadow layer)
    └── directionTabs (row, 3px border)
        ├── directionTab (flex: 1, transport color when active)
        └── directionTab (flex: 1, with left border divider)
```

**Styling**:
- Container: 3px border + neobrut shadow
- Active: Transport color fill, white text
- Inactive: White bg, dark text
- Icons: No
- Shadow: Yes (4px offset)

### Token Comparison

| Property | inbox.tabs | lineDetail.directionTab |
|----------|-----------|------------------------|
| Container border | 8px bottom | 3px all sides + shadow |
| Border radius | Sharp | Sharp |
| Active bg | `palette.primary` (always blue) | Dynamic (sea/road color) |
| Active text | `primaryText` | `primaryText` |
| Inactive bg | `background` | `background` |
| Inactive text | `textPrimary` | `textPrimary` |
| Tab padding | `spacing.md` | `spacing.md` |
| Icons | Yes | No |
| Shadow | No | Yes (4px offset) |

### Structural Differences

| Aspect | Inbox Tabs | LineDetail Tabs |
|--------|-----------|-----------------|
| Container styling | Heavy bottom border only | Full border + shadow |
| Active color | Fixed (primary) | Dynamic (transport color) |
| Tab divider | None (gaps) | Left border on right tab |
| Icons support | Built-in | Not supported |
| Section label | No | Yes (above tabs) |

### Unification Decision

**Recommend: Extract `<SegmentedTabs>` component**

The patterns are similar enough to unify, but with clear variant support.

#### Proposed Component API

```typescript
interface Tab {
  key: string;
  label: string;
  icon?: IconName;  // Optional icon
}

interface SegmentedTabsProps {
  tabs: Tab[];
  activeKey: string;
  onTabPress: (key: string) => void;

  // Variants
  variant?: 'banner' | 'boxed';  // banner = inbox style, boxed = direction style

  // Color override for boxed variant
  activeColor?: string;  // Dynamic color for transport context

  // Optional section label (for boxed variant)
  label?: string;
}
```

**Variant Differences**:

| Variant | Container | Shadow | Active Color |
|---------|-----------|--------|--------------|
| `banner` | Heavy bottom border | No | Fixed primary |
| `boxed` | Full border | Yes (neobrut) | Configurable |

#### Token Consolidation

Create unified token group `components.tabs`:

```typescript
tabs: {
  // Shared
  tabPadding: spacing.md,
  tabRadius: bordersToken.radiusSharp,
  activeTextColor: colors.primaryText,
  inactiveTextColor: colors.textPrimary,
  inactiveBackground: colors.background,

  // Banner variant (inbox-style)
  banner: {
    containerBorderWidth: bordersToken.widthExtraHeavy,
    containerBorderColor: colors.border,
    tabBorderWidth: bordersToken.widthCard,
    activeBackground: palette.primary,
    iconGap: spacing.sm,
  },

  // Boxed variant (direction-style)
  boxed: {
    containerBorderWidth: bordersToken.widthCard,
    containerBorderColor: colors.border,
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowColor: colors.border,
    // activeBackground is dynamic (passed as prop)
  },
}
```

---

## Badge/Tag Class Review

### Current State

#### 1. Badge Component (`ui/Badge.tsx`)
- **Purpose**: Status indicators, transport subtypes, category labels
- **Variants**: urgent, info, success, warning, pending, type, transport, default
- **Sizes**: default, compact, large
- **Structure**: View + Text with variant-based colors

#### 2. Tag Filter Chips (`InboxListScreen.tsx:470-505`)
- **Purpose**: Filterable category chips with selection state
- **NOT using Badge component**
- **Structure**: Pressable + Label with shadow layer when selected

### Comparison

| Aspect | Badge | Tag Filter Chips |
|--------|-------|------------------|
| Interactive | No | Yes (toggleable) |
| Shadow | No | Yes (when selected) |
| Per-tag colors | Via variant | Via per-tag lookup |
| Border | Always 2px | 2px default, 3px selected |
| Text transform | Uppercase | Uppercase |

### Decision

**Recommend: Keep separate (different purposes)**

Rationale:
1. **Different interaction models**: Badge is display-only, chips are interactive filters
2. **Selection state complexity**: Chips need shadow layer + border width change
3. **Per-item colors**: Chip colors are per-tag via lookup, badges use preset variants
4. **Risk/benefit**: Merging would add complexity to Badge for minimal gain

### Alternative Consideration

If desired in future, could extract `<FilterChip>` component:

```typescript
interface FilterChipProps {
  label: string;
  colorKey: string;  // Lookup key for background/text colors
  selected: boolean;
  onPress: () => void;
}
```

This would NOT replace Badge but would replace the inline chip implementation.

---

## Hardcoded Values Audit

### Transport Header Slab Scope

| File | Location | Value | Current Token | Should Tokenize? |
|------|----------|-------|---------------|------------------|
| LineDetailScreen | line 610 | `marginRight: spacing.md` | N/A (inline) | No - uses spacing token |
| LineDetailScreen | line 621 | `gap: spacing.md` | N/A (inline) | **Yes** - add `metaRowGap` |
| RoadTransportScreen | line 367 | `marginTop: spacing.xs` | N/A (inline) | No - uses spacing token |
| SeaTransportScreen | line 402 | `marginTop: spacing.xs` | N/A (inline) | No - uses spacing token |

### Tab Bar Scope

| File | Location | Value | Current Token | Should Tokenize? |
|------|----------|-------|---------------|------------------|
| InboxListScreen | line 584-585 | `borderBottomWidth: 0` | Hardcoded | **Yes** - tab should not have bottom border (intentional override) |
| LineDetailScreen | line 656 | `width: 36, height: 36` | Hardcoded | **Yes** - add `dateSelectorArrowSize` or use existing `icons.size.lg` |
| LineDetailScreen | line 698-699 | `borderLeftWidth` | Uses token | No - correct usage |

### Summary

| Category | Hardcoded Values | Should Tokenize |
|----------|-----------------|-----------------|
| Header Slab | 0 | 1 (metaRowGap) |
| Tab Bar | 2 | 2 (both) |
| Total | 2 | 3 |

---

## Risk Register

### R1: Visual Regression in Transport Screens
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Screenshot comparison before/after for all 4 screens
  - Keep both token groups during migration, delete old after verification
  - Test on both iOS and Android

### R2: Icon Box Size Mismatch
- **Likelihood**: High (known difference: 48 vs 52)
- **Impact**: Low (4px difference, subtle)
- **Mitigation**:
  - Add `iconBoxSize` prop with 'default' (48) and 'large' (52)
  - Document which screens use which size
  - Consider unifying to single size (48px) in future

### R3: Tab Active Color Breaking
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**:
  - Test with all color variants (primary, secondary, teal for catamaran)
  - Ensure `activeColor` prop overrides default correctly
  - Add snapshot tests for all tab color states

### R4: Inbox Tab Shadow Addition
- **Likelihood**: Low (banner variant has no shadow)
- **Impact**: Low
- **Mitigation**:
  - Ensure `variant='banner'` never renders shadow
  - Visual QA on InboxListScreen

### R5: Direction Tab Divider Styling
- **Likelihood**: Medium
- **Impact**: Low
- **Mitigation**:
  - Test with 2+ tabs to ensure divider renders correctly
  - Special handling for `borderLeftWidth` on non-first tabs

### Risk Summary Matrix

| Risk | Likelihood | Impact | Priority |
|------|-----------|--------|----------|
| R1 Visual Regression | Medium | High | P1 |
| R2 Icon Box Size | High | Low | P2 |
| R3 Tab Active Color | Medium | Medium | P2 |
| R4 Inbox Shadow | Low | Low | P3 |
| R5 Tab Divider | Medium | Low | P3 |

---

## Staged Migration Plan

### Phase 1: Token Consolidation (Non-breaking)

**Goal**: Add unified tokens without removing old ones

1. Add `components.transport.headerSlab` token group to skin
2. Add `components.tabs` unified token group to skin
3. Add missing tokens:
   - `lineDetail.headerMetaRowGap: spacing.md`
4. **No code changes to screens yet**

**Verification**: Typecheck passes, no runtime changes

### Phase 2: Component Extraction (Parallel)

**Goal**: Create new components without touching existing screens

1. Create `components/transport/TransportHeaderSlab.tsx`
   - Props: `transportType`, `title`, `icon`, `subtitle?`, `metaItems?`, `iconBoxSize?`, `borderWeight?`
   - Use new consolidated tokens
   - Export from `components/transport/index.ts`

2. Create `components/ui/SegmentedTabs.tsx`
   - Props: `tabs`, `activeKey`, `onTabPress`, `variant?`, `activeColor?`, `label?`
   - Use new consolidated tokens
   - Export from `ui/index.ts`

**Verification**:
- New components render correctly in UiInventoryScreen
- TypeScript compilation passes

### Phase 3: Migration - Transport Headers (One at a Time)

**Order** (lowest risk first):
1. RoadTransportScreen (simplest, single subtitle)
2. SeaTransportScreen (identical to Road)
3. LineDetailScreen (most complex, multi-meta)

**Per-Screen Steps**:
1. Import `TransportHeaderSlab`
2. Replace inline header JSX with component
3. Remove old styles (headerSlab, headerContent, etc.)
4. Visual comparison test
5. Commit

**Verification per screen**:
- [ ] Visual match (screenshot comparison)
- [ ] All text visible and correct color
- [ ] Icon renders correctly
- [ ] Responsive to different title lengths
- [ ] Works on iOS and Android

### Phase 4: Migration - Tab Bars (One at a Time)

**Order**:
1. LineDetailScreen (boxed variant, more isolated)
2. InboxListScreen (banner variant, more visible)

**Per-Screen Steps**:
1. Import `SegmentedTabs`
2. Replace inline tab JSX with component
3. Remove old styles (tabBar, tab, etc.)
4. Visual comparison test
5. Commit

**Verification per screen**:
- [ ] Tab switching works
- [ ] Active state renders correctly
- [ ] Shadow renders (boxed variant only)
- [ ] Icons render (banner variant only)
- [ ] Works on iOS and Android

### Phase 5: Cleanup

1. Remove old token groups if no longer referenced:
   - `components.transport.overviewHeader` (if fully migrated)
   - `components.inbox.tabs` (keep - may have other uses)
   - `components.transport.lineDetail.directionTab*` (if fully migrated)

2. Update documentation:
   - Update `docs/UI_COMPONENT_INVENTORY.md`
   - Update `docs/DESIGN_TOKENS_USAGE_MAP.md`
   - Update `docs/DESIGN_DEBT_AND_REFACTOR_PLAN.md` (mark items complete)

---

## Verification Checklist

### Pre-Migration Baseline

- [ ] Take screenshots of all affected screens (iOS + Android):
  - [ ] RoadTransportScreen
  - [ ] SeaTransportScreen
  - [ ] LineDetailScreen (sea)
  - [ ] LineDetailScreen (road)
  - [ ] InboxListScreen (received tab active)
  - [ ] InboxListScreen (sent tab active)

### Per-Component Verification

#### TransportHeaderSlab
- [ ] Renders with `transportType='sea'` (blue background)
- [ ] Renders with `transportType='road'` (green background)
- [ ] Title displays correctly (H1, white)
- [ ] Single subtitle displays correctly (Meta, white 85%)
- [ ] Multiple meta items display in row with gap
- [ ] Icon box size 'default' = 48px
- [ ] Icon box size 'large' = 52px
- [ ] Border weight 'heavy' = 4px
- [ ] Border weight 'card' = 3px
- [ ] Icon renders correctly (bus/ship)

#### SegmentedTabs
- [ ] Renders with `variant='banner'` (heavy bottom border, no shadow)
- [ ] Renders with `variant='boxed'` (full border + shadow)
- [ ] Tab switching triggers `onTabPress` callback
- [ ] Active tab shows correct background color
- [ ] Active tab shows white text
- [ ] Inactive tab shows white background
- [ ] Inactive tab shows dark text
- [ ] Icons render in banner variant
- [ ] Label renders above tabs in boxed variant
- [ ] Custom `activeColor` prop works

### Post-Migration Verification

- [ ] Compare all screenshots to baseline - no visual regression
- [ ] Run full app smoke test
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] No console warnings related to migrated components

### Regression Test Scenarios

| Scenario | Screen | Expected |
|----------|--------|----------|
| Open Road Transport | RoadTransportScreen | Green header slab, bus icon, day type subtitle |
| Open Sea Transport | SeaTransportScreen | Blue header slab, ship icon, date subtitle |
| Open Sea Line Detail | LineDetailScreen | Blue header slab, ship icon, subtype + duration meta |
| Open Road Line Detail | LineDetailScreen | Green header slab, bus icon, subtype + duration meta |
| Toggle direction | LineDetailScreen | Tab active state changes, list updates |
| Switch to Sent tab | InboxListScreen | Blue tab background, sent icon highlighted |
| Switch to Received tab | InboxListScreen | Blue tab background, inbox icon highlighted |

---

## Appendix: File References

### Files to Create
- `mobile/src/components/transport/TransportHeaderSlab.tsx`
- `mobile/src/ui/SegmentedTabs.tsx`

### Files to Modify
- `mobile/src/ui/skin.neobrut2.ts` (add consolidated tokens)
- `mobile/src/screens/transport/RoadTransportScreen.tsx`
- `mobile/src/screens/transport/SeaTransportScreen.tsx`
- `mobile/src/screens/transport/LineDetailScreen.tsx`
- `mobile/src/screens/inbox/InboxListScreen.tsx`

### Files to Update (Documentation)
- `docs/UI_COMPONENT_INVENTORY.md`
- `docs/DESIGN_TOKENS_USAGE_MAP.md`
- `docs/DESIGN_DEBT_AND_REFACTOR_PLAN.md`

---

*End of Unification Plan*
