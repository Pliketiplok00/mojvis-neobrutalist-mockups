# Deep Audit Report: Transport Header Slabs + Tab Bars

> MOJ VIS Mobile App - Unification Analysis
> Generated: 2026-02-12
> Status: DELIVERABLE 1 - Awaiting Confirmation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Part A: Transport Header Slabs](#part-a-transport-header-slabs)
3. [Part B: Tab Bars](#part-b-tab-bars)
4. [Part C: Badge vs Tag Chips](#part-c-badge-vs-tag-chips)
5. [Hidden Dependencies](#hidden-dependencies)
6. [Risk Analysis](#risk-analysis)

---

## Executive Summary

### Scope Confirmed

| Pattern | Production Screens | Design-Mirror Screens | Total |
|---------|-------------------|----------------------|-------|
| Transport Header Slabs | 3 | 3 | 6 |
| Tab Bars | 2 | 2 | 4 |
| Badge Component | 5 | 3 | 8 |
| Tag Filter Chips | 1 | 1 | 2 |

### Key Findings

1. **Transport Header Slabs use TWO separate token groups** with subtle differences
2. **Tab Bars use TWO separate token groups** with structural differences
3. **Badge and Tag Chips serve different purposes** - recommend keeping separate
4. **Design-mirror screens duplicate production patterns** - must be migrated in parallel

---

## Part A: Transport Header Slabs

### A.1 Screen Inventory

| Screen | File | Token Group | Pattern Type |
|--------|------|-------------|--------------|
| RoadTransportScreen | `screens/transport/RoadTransportScreen.tsx:170-186` | `components.transport.overviewHeader` | Overview slab |
| SeaTransportScreen | `screens/transport/SeaTransportScreen.tsx:194-208` | `components.transport.overviewHeader` | Overview slab |
| LineDetailScreen | `screens/transport/LineDetailScreen.tsx:262-292` | `components.transport.lineDetail` | Detail slab |
| MirrorTransportRoadScreen | `design-mirror/screens/MirrorTransportRoadScreen.tsx` | `components.transport.overviewHeader` | Overview slab |
| MirrorTransportSeaScreen | `design-mirror/screens/MirrorTransportSeaScreen.tsx:104-117` | `components.transport.overviewHeader` | Overview slab |
| MirrorLineDetailScreen | `design-mirror/screens/MirrorLineDetailScreen.tsx:299-319` | `components.transport.lineDetail` | Detail slab |

**Excluded**: TransportHubScreen (uses navigation tiles, not header slabs)

### A.2 JSX Structure Comparison

#### RoadTransportScreen / SeaTransportScreen (Overview Pattern)
```
<View style={styles.headerSlab}>                    // green/blue bg, padding, 4px bottom border
  <View style={styles.headerContent}>               // row, alignItems: center
    <View style={styles.headerIconBox}>             // 48x48, white bg, 2px border
      <Icon name="bus|ship" size="lg" />
    </View>
    <View style={styles.headerTextContainer}>       // flex: 1
      <H1 style={styles.headerTitle}>...</H1>       // white text
      <Meta style={styles.headerMeta}>              // white 85%, marginTop: spacing.xs
        {dayType} {holiday}
      </Meta>
    </View>
  </View>
</View>
```

#### LineDetailScreen (Detail Pattern)
```
<View style={[styles.headerSlab, { backgroundColor: headerBackground }]}>  // dynamic bg, 3px bottom border
  <View style={styles.headerContent}>               // row, alignItems: center
    <View style={styles.headerIconBox}>             // 52x52, white bg, 2px border
      <Icon name="ship|bus" size="lg" />
    </View>
    <View style={styles.headerTextContainer}>       // flex: 1
      <H1 style={styles.headerTitle}>...</H1>       // white text
      <View style={styles.headerMetaRow}>           // row, gap: spacing.md, marginTop: spacing.xs
        <Meta style={styles.headerMeta}>{subtype}</Meta>
        <Meta style={styles.headerMeta}>{duration}</Meta>
      </View>
    </View>
  </View>
</View>
```

### A.3 Token Usage Comparison

#### Token Group: `components.transport.overviewHeader`

| Token | Value | Used By |
|-------|-------|---------|
| `backgroundRoad` | `palette.secondary` (green) | RoadTransportScreen, MirrorTransportRoadScreen |
| `backgroundSea` | `palette.primary` (blue) | SeaTransportScreen, MirrorTransportSeaScreen |
| `padding` | `spacing.lg` (16px) | All overview screens |
| `borderBottomWidth` | `borders.widthHeavy` (4px) | All overview screens |
| `borderBottomColor` | `colors.border` | All overview screens |
| `iconBoxSize` | 48 | All overview screens |
| `iconBoxBackground` | `colors.background` | All overview screens |
| `iconBoxBorderWidth` | `borders.widthThin` (2px) | All overview screens |
| `iconBoxBorderColor` | `colors.border` | All overview screens |
| `iconBoxGap` | `spacing.md` (12px) | All overview screens |
| `titleColor` | `colors.primaryText` (white) | All overview screens |
| `subtitleColor` | `rgba(255,255,255,0.85)` | All overview screens |

#### Token Group: `components.transport.lineDetail`

| Token | Value | Used By |
|-------|-------|---------|
| `headerBackgroundRoad` | `palette.secondary` (green) | LineDetailScreen (road) |
| `headerBackgroundSea` | `palette.primary` (blue) | LineDetailScreen (sea) |
| `headerPadding` | `spacing.lg` (16px) | LineDetailScreen, MirrorLineDetailScreen |
| `headerBorderWidth` | `borders.widthCard` (3px) | LineDetailScreen, MirrorLineDetailScreen |
| `headerBorderColor` | `colors.border` | LineDetailScreen, MirrorLineDetailScreen |
| `headerIconBoxSize` | 52 | LineDetailScreen, MirrorLineDetailScreen |
| `headerIconBoxBackground` | `colors.background` | LineDetailScreen, MirrorLineDetailScreen |
| `headerIconBoxBorderWidth` | `borders.widthThin` (2px) | LineDetailScreen, MirrorLineDetailScreen |
| `headerIconBoxBorderColor` | `colors.border` | LineDetailScreen, MirrorLineDetailScreen |
| `headerTitleColor` | `colors.primaryText` (white) | LineDetailScreen, MirrorLineDetailScreen |
| `headerMetaColor` | `rgba(255,255,255,0.85)` | LineDetailScreen, MirrorLineDetailScreen |

### A.4 Concrete Differences

| Aspect | Overview Screens | LineDetail | Impact |
|--------|-----------------|------------|--------|
| **Icon box size** | 48px | 52px | **DIFFERENT** - must parameterize |
| **Border bottom width** | 4px (heavy) | 3px (card) | **DIFFERENT** - must parameterize |
| **Subtitle structure** | Single `<Meta>` | `<View>` row with multiple `<Meta>` | **DIFFERENT** - must parameterize |
| **Meta row gap** | N/A | `spacing.md` | **NEW** - only in LineDetail |
| **Icon box marginRight** | `overviewHeader.iconBoxGap` (token) | `spacing.md` (inline) | **INCONSISTENT** - should use token |
| **Background color source** | Fixed per-screen prop | Dynamic from `transportType` prop | **SAME LOGIC** - can unify |
| **Padding** | Same | Same | No change |
| **Title/subtitle colors** | Same | Same | No change |

### A.5 Hardcoded Values in Header Slab Scope

| File | Line | Value | Should Tokenize? |
|------|------|-------|------------------|
| LineDetailScreen.tsx | 610 | `marginRight: spacing.md` | No - uses spacing token |
| LineDetailScreen.tsx | 620 | `gap: spacing.md` | **Yes** - add `headerMetaRowGap` token |
| RoadTransportScreen.tsx | 366 | `marginTop: spacing.xs` | No - uses spacing token |
| SeaTransportScreen.tsx | 401 | `marginTop: spacing.xs` | No - uses spacing token |
| MirrorLineDetailScreen.tsx | 547 | `marginRight: spacing.md` | No - uses spacing token |
| MirrorLineDetailScreen.tsx | 554-558 | `gap: spacing.md, marginTop: spacing.xs` | **Yes** - same as production |

---

## Part B: Tab Bars

### B.1 Screen Inventory

| Screen | File | Token Group | Pattern Type |
|--------|------|-------------|--------------|
| InboxListScreen | `screens/inbox/InboxListScreen.tsx:429-467` | `components.inbox.tabs` | Banner tabs |
| LineDetailScreen | `screens/transport/LineDetailScreen.tsx:325-362` | `components.transport.lineDetail.directionTab*` | Boxed tabs |
| MirrorInboxListScreen | `design-mirror/screens/MirrorInboxListScreen.tsx` | `components.inbox.tabs` | Banner tabs |
| MirrorLineDetailScreen | `design-mirror/screens/MirrorLineDetailScreen.tsx:348-386` | `components.transport.lineDetail.directionTab*` | Boxed tabs |

### B.2 JSX Structure Comparison

#### InboxListScreen (Banner Pattern)
```
<View style={styles.tabBar}>                        // row, 8px bottom border
  <TouchableOpacity style={[
    styles.tab,
    activeTab === 'received' && styles.tabActive    // primary fill
  ]}>
    <Icon name="inbox" size="sm" />                 // Has icon
    <Label style={styles.tabText}>Primljeno</Label>
  </TouchableOpacity>
  <TouchableOpacity style={[
    styles.tab,
    activeTab === 'sent' && styles.tabActive
  ]}>
    <Icon name="send" size="sm" />                  // Has icon
    <Label style={styles.tabText}>Poslano</Label>
  </TouchableOpacity>
</View>
```

#### LineDetailScreen (Boxed Pattern)
```
<View style={styles.directionContainer}>
  <Label style={styles.sectionLabel}>SMJER</Label>   // Has section label above
  <View style={styles.directionTabsWrapper}>
    <View style={styles.directionTabsShadow} />      // Has neobrut shadow
    <View style={styles.directionTabs}>              // row, 3px border all sides
      {routes.map((route) => (
        <TouchableOpacity style={[
          styles.directionTab,
          isActive && { backgroundColor: headerBackground },  // Dynamic color
          route.direction === 1 && styles.directionTabRight   // Left border divider
        ]}>
          <Label style={styles.directionTabText}>            // No icon
            {route.direction_label}
          </Label>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</View>
```

### B.3 Token Usage Comparison

#### Inbox Tabs Tokens (from skin.neobrut2.ts)

| Token | Value | Purpose |
|-------|-------|---------|
| `tabs.padding` | `spacing.md` (12px) | Tab padding |
| `tabs.activeBackground` | `palette.primary` | Active tab fill |
| `tabs.activeText` | `colors.primaryText` | Active text color |
| `tabs.inactiveBackground` | `colors.background` | Inactive tab fill |
| `tabs.inactiveText` | `colors.textPrimary` | Inactive text color |
| `tabs.borderWidth` | `borders.widthCard` (3px) | Tab border |
| `tabs.containerBorderWidth` | `borders.widthExtraHeavy` (8px) | Bottom border |

#### LineDetail Direction Tab Tokens (from skin.neobrut2.ts)

| Token | Value | Purpose |
|-------|-------|---------|
| `directionTabPadding` | `spacing.md` (12px) | Tab padding |
| `directionTabBorderWidth` | `borders.widthCard` (3px) | Border width |
| `directionTabBorderColor` | `colors.border` | Border color |
| `directionTabRadius` | `borders.radiusSharp` (0) | Border radius |
| `directionTabActiveText` | `colors.primaryText` | Active text color |
| `directionTabInactiveText` | `colors.textPrimary` | Inactive text color |
| `directionTabInactiveBackground` | `colors.background` | Inactive fill |
| `shadowOffsetX` | 4 | Shadow X offset |
| `shadowOffsetY` | 4 | Shadow Y offset |
| `shadowColor` | `colors.border` | Shadow color |

### B.4 Concrete Differences

| Aspect | Inbox Tabs | LineDetail Tabs | Impact |
|--------|-----------|-----------------|--------|
| **Container styling** | 8px bottom border only | 3px all sides + shadow | **DIFFERENT** - variant param |
| **Shadow** | None | 4px neobrut offset | **DIFFERENT** - variant param |
| **Icons** | Yes (inbox, send) | No | **DIFFERENT** - optional prop |
| **Section label** | No | Yes ("SMJER") | **DIFFERENT** - optional prop |
| **Active color** | Fixed (`palette.primary`) | Dynamic (transport color) | **DIFFERENT** - optional prop |
| **Tab divider** | None (gap between) | Left border on 2nd tab | **DIFFERENT** - variant behavior |
| **Tab count** | Fixed 2 | Dynamic (from routes) | **SAME** - both support N tabs |
| **Tab padding** | Same (`spacing.md`) | Same (`spacing.md`) | No change |
| **Text colors** | Same | Same | No change |

### B.5 Hardcoded Values in Tab Bar Scope

| File | Line | Value | Should Tokenize? |
|------|------|-------|------------------|
| LineDetailScreen.tsx | 652-653 | `width: 36, height: 36` | **Yes** - dateArrow size (not tab-related but in same scope) |
| LineDetailScreen.tsx | 692 | `paddingHorizontal: spacing.sm` | No - uses spacing token |
| InboxListScreen.tsx | 584 | `borderBottomWidth: 0` | No - intentional override to remove bottom from individual tabs |

---

## Part C: Badge vs Tag Chips

### C.1 Badge Component Usage

**File**: `mobile/src/ui/Badge.tsx`

| Variant | Used In | Purpose |
|---------|---------|---------|
| `urgent` | InboxDetailScreen, MirrorInboxDetailScreen | Urgent message indicator |
| `info` | ServiceAccordionCard | Service category badge |
| `success` | (UiInventoryScreen only) | Demo |
| `warning` | (UiInventoryScreen only) | Demo |
| `pending` | (UiInventoryScreen only) | Demo |
| `type` | InboxListScreen, MirrorInboxListScreen | Message type badge |
| `transport` | RoadTransportScreen, SeaTransportScreen, MirrorTransport* | Line subtype badge |
| `default` | (UiInventoryScreen only) | Demo |

**Badge characteristics**:
- Display-only (not interactive)
- Preset color variants
- 3 sizes: default, compact, large
- 2px border
- Uppercase text

### C.2 Tag Filter Chips Usage

**File**: `mobile/src/screens/inbox/InboxListScreen.tsx:470-505`

**Current inline implementation**:
```typescript
// Per-tag background colors from tokens
chipBackgrounds: {
  opcenito: colors.infoBackground,
  promet: colors.warningBackground,
  kultura: colors.successBackground,
  hitno: colors.urgentBackground,
  vis: palette.primary,
  komiza: palette.secondary,
}

// Per-tag text colors from tokens
chipTextColors: {
  opcenito: colors.infoText,
  promet: colors.warningText,
  kultura: colors.successText,
  hitno: colors.urgentText,
  vis: colors.primaryText,
  komiza: colors.primaryText,
}
```

**Tag chip characteristics**:
- Interactive (toggleable selection)
- Per-tag color lookup (not preset variants)
- Selection state with shadow layer
- 2px border default, 3px when selected
- Uppercase text

### C.3 Recommendation

**Keep Badge and Tag Chips separate.**

| Criterion | Badge | Tag Chips | Verdict |
|-----------|-------|-----------|---------|
| Interactive | No | Yes | Different |
| Color source | Preset variants | Per-tag lookup | Different |
| Selection state | N/A | Shadow + border change | Different |
| Risk of merging | N/A | High - complex state | Avoid |
| Benefit of merging | N/A | Minimal code reduction | Not worth it |

**Alternative**: If desired later, extract `<FilterChip>` as a NEW component (not merging with Badge).

---

## Hidden Dependencies

### H.1 Data Shape Dependencies

| Screen | Data Shape | Field Used In Header |
|--------|-----------|---------------------|
| RoadTransportScreen | `DayType`, `isHoliday` | Subtitle |
| SeaTransportScreen | `Date`, `isHoliday` | Subtitle (uses `formatDayWithDate()`) |
| LineDetailScreen | `lineDetailData.subtype`, `currentRoute.typical_duration_minutes` | Meta row |

**Implication**: Component must support flexible subtitle content (string, ReactNode, or structured data).

### H.2 i18n Key Dependencies

| Screen | i18n Keys Used |
|--------|----------------|
| RoadTransportScreen | `transport.road.title`, `transport.dayTypes.*`, `transport.holiday` |
| SeaTransportScreen | `transport.sea.title`, `transport.holiday` |
| LineDetailScreen | N/A (title from data) |
| InboxListScreen | `inbox.tabs.received`, `inbox.tabs.sent` |
| LineDetailScreen | `transport.lineDetail.direction` |

**Implication**: Component should receive translated strings as props, not i18n keys.

### H.3 Conditional Rendering Dependencies

| Screen | Condition | Effect |
|--------|-----------|--------|
| SeaTransportScreen | Line 659 check | Yellow highlight background |
| LineDetailScreen | `routes.length > 1` | Show/hide direction tabs |
| LineDetailScreen | `transportType === 'sea'` | Blue vs green colors |

**Implication**: These conditions live OUTSIDE the component - component just receives props.

### H.4 Design-Mirror Screen Parity

| Production Screen | Mirror Screen | Parity Status |
|------------------|---------------|---------------|
| RoadTransportScreen | MirrorTransportRoadScreen | **Identical structure** |
| SeaTransportScreen | MirrorTransportSeaScreen | **Identical structure** |
| LineDetailScreen | MirrorLineDetailScreen | **Identical structure** |
| InboxListScreen | MirrorInboxListScreen | **Identical structure** |

**Implication**: Mirror screens MUST be updated in parallel with production screens.

---

## Risk Analysis

### R1: Visual Regression Risk

**Likelihood**: Medium
**Impact**: High

**Specific concerns**:
- Icon box size change (48 vs 52) could break layout
- Border width change (4px vs 3px) could be visually noticeable
- Shadow layer positioning could shift

**Mitigation**:
- Screenshot comparison before/after each screen
- Parameterize differences rather than forcing uniformity
- Test with long titles to ensure no overflow

### R2: Token Group Conflict Risk

**Likelihood**: Low
**Impact**: Medium

**Specific concerns**:
- Both `overviewHeader` and `lineDetail` token groups may be referenced elsewhere
- Removing tokens could break other components

**Token reference check**:
```
overviewHeader: Used in 4 files (2 prod, 2 mirror)
lineDetail: Used in 4 files (2 prod, 2 mirror) + DepartureItem.tsx
```

**Mitigation**:
- Keep old tokens during migration
- Only remove after verification
- `lineDetail` is heavily used by DepartureItem - do NOT remove those tokens

### R3: Tab Color Dynamics Risk

**Likelihood**: Medium
**Impact**: Low

**Specific concerns**:
- LineDetail tabs use dynamic color (`headerBackground`)
- Inbox tabs use fixed color (`palette.primary`)
- Catamaran lines use teal color

**Mitigation**:
- Add `activeColor` prop with sensible default
- Test all transport types (sea ferry, sea catamaran, road)

### R4: Design-Mirror Sync Risk

**Likelihood**: High
**Impact**: Medium

**Specific concerns**:
- Forgetting to update mirror screens in parallel
- Mirror screens diverging from production

**Mitigation**:
- Update mirror screens in same commit as production
- Add mirror screens to verification checklist

### R5: Tab Interaction Behavior Risk

**Likelihood**: Low
**Impact**: Low

**Specific concerns**:
- Inbox tabs: switch between data sets
- Direction tabs: change API query parameter
- Different `onPress` behaviors

**Mitigation**:
- Component only handles rendering, not business logic
- `onTabPress` callback receives tab key, screen handles the rest

---

## Summary: Items Requiring Parameterization

### For TransportHeaderSlab Component

| Aspect | Options | Default |
|--------|---------|---------|
| `transportType` | `'sea' \| 'road'` | Required |
| `title` | string | Required |
| `icon` | IconName | Required |
| `subtitle` | string \| undefined | Optional |
| `metaItems` | string[] \| undefined | Optional |
| `iconBoxSize` | `'default' \| 'large'` | `'default'` (48px) |
| `borderWeight` | `'card' \| 'heavy'` | `'heavy'` (4px) |

### For SegmentedTabs Component

| Aspect | Options | Default |
|--------|---------|---------|
| `tabs` | `Array<{key, label, icon?}>` | Required |
| `activeKey` | string | Required |
| `onTabPress` | `(key: string) => void` | Required |
| `variant` | `'banner' \| 'boxed'` | `'banner'` |
| `activeColor` | string \| undefined | `palette.primary` |
| `label` | string \| undefined | Optional (section label) |

---

## Confirmation Required

Please confirm:

1. **Scope is correct**: 3 production screens + 3 mirror screens for headers, 2+2 for tabs
2. **Exclusions are correct**: TransportHubScreen excluded, Badge/Tag chips kept separate
3. **Parameterization approach is acceptable**: Using variant props rather than forcing uniformity
4. **Mirror screens will be migrated in parallel**

Upon confirmation, I will proceed to **Deliverable 2: Implementation Plan**.

---

*End of Deep Audit Report*
