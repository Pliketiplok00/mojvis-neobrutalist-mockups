# Implementation Plan: Transport Headers + Tabs Refactor

> MOJ VIS Mobile App - Strict Mode Refactor
> Generated: 2026-02-12
> Status: AWAITING CONFIRMATION

---

## Table of Contents

- [A) Current State Breakdown](#a-current-state-breakdown)
- [B) Difference Matrix](#b-difference-matrix)
- [C) Risk Analysis (Detailed)](#c-risk-analysis-detailed)
- [D) Proposed Architecture](#d-proposed-architecture)
- [E) Migration Strategy (Safe Mode)](#e-migration-strategy-safe-mode)
- [F) What We Need From You](#f-what-we-need-from-you)

---

## A) Current State Breakdown

### A.1 RoadTransportScreen

**File**: `mobile/src/screens/transport/RoadTransportScreen.tsx`
**Header JSX**: Lines 170-186
**Header Styles**: Lines 337-367

#### Exact JSX Structure
```jsx
<View style={styles.headerSlab}>                     // Line 171
  <View style={styles.headerContent}>                // Line 172
    <View style={styles.headerIconBox}>              // Line 173
      <Icon name="bus" size="lg" colorToken="textPrimary" />  // Line 174
    </View>
    <View style={styles.headerTextContainer}>        // Line 176
      <H1 style={styles.headerTitle}>{t('transport.road.title')}</H1>  // Line 177
      {dayType && (                                  // Line 178 - CONDITIONAL
        <Meta style={styles.headerMeta}>
          {DAY_TYPE_LABELS[dayType]}
          {isHoliday && ` (${t('transport.holiday')})`}
        </Meta>
      )}
    </View>
  </View>
</View>
```

#### Token Groups Used
```typescript
const overviewHeader = components.transport.overviewHeader;
```

| Style Property | Token Path | Value |
|----------------|-----------|-------|
| `headerSlab.backgroundColor` | `overviewHeader.backgroundRoad` | `palette.secondary` (green) |
| `headerSlab.padding` | `overviewHeader.padding` | `spacing.lg` (16px) |
| `headerSlab.borderBottomWidth` | `overviewHeader.borderBottomWidth` | `borders.widthHeavy` (4px) |
| `headerSlab.borderBottomColor` | `overviewHeader.borderBottomColor` | `colors.border` |
| `headerIconBox.width/height` | `overviewHeader.iconBoxSize` | 48 |
| `headerIconBox.backgroundColor` | `overviewHeader.iconBoxBackground` | `colors.background` |
| `headerIconBox.borderWidth` | `overviewHeader.iconBoxBorderWidth` | `borders.widthThin` (2px) |
| `headerIconBox.borderColor` | `overviewHeader.iconBoxBorderColor` | `colors.border` |
| `headerIconBox.marginRight` | `overviewHeader.iconBoxGap` | `spacing.md` (12px) |
| `headerTitle.color` | `overviewHeader.titleColor` | `colors.primaryText` |
| `headerMeta.color` | `overviewHeader.subtitleColor` | `rgba(255,255,255,0.85)` |

#### Hardcoded Values
| Location | Value | Token Used? |
|----------|-------|-------------|
| Line 366 | `marginTop: spacing.xs` | Yes (`spacing.xs` = 4px) |

#### Conditional Logic
- **Line 178**: `{dayType && (...)}` - Meta only renders if `dayType` is truthy
- **Line 181**: `{isHoliday && ...}` - Holiday suffix only renders if `isHoliday` is true

#### Shared Token Dependencies
- `overviewHeader.*` tokens are ONLY used by:
  - `RoadTransportScreen.tsx`
  - `SeaTransportScreen.tsx`
  - **NO OTHER COMPONENTS** (safe to modify)

---

### A.2 SeaTransportScreen

**File**: `mobile/src/screens/transport/SeaTransportScreen.tsx`
**Header JSX**: Lines 194-208
**Header Styles**: Lines 372-402

#### Exact JSX Structure
```jsx
<View style={styles.headerSlab}>                     // Line 195
  <View style={styles.headerContent}>                // Line 196
    <View style={styles.headerIconBox}>              // Line 197
      <Icon name="ship" size="lg" colorToken="textPrimary" />  // Line 198
    </View>
    <View style={styles.headerTextContainer}>        // Line 200
      <H1 style={styles.headerTitle}>{t('transport.sea.title')}</H1>  // Line 201
      <Meta style={styles.headerMeta}>               // Line 202 - NO CONDITIONAL
        {formatDayWithDate(new Date(), language)}
        {isHoliday && ` (${t('transport.holiday')})`}
      </Meta>
    </View>
  </View>
</View>
```

#### Token Groups Used
```typescript
const overviewHeader = components.transport.overviewHeader;
```

| Style Property | Token Path | Value |
|----------------|-----------|-------|
| `headerSlab.backgroundColor` | `overviewHeader.backgroundSea` | `palette.primary` (blue) |
| (All other tokens identical to RoadTransportScreen) | | |

#### Hardcoded Values
| Location | Value | Token Used? |
|----------|-------|-------------|
| Line 401 | `marginTop: spacing.xs` | Yes (`spacing.xs` = 4px) |

#### Conditional Logic Differences from Road
- **Line 202**: Meta renders unconditionally (no `dayType &&` wrapper)
- Uses `formatDayWithDate(new Date(), language)` instead of `DAY_TYPE_LABELS[dayType]`

#### Shared Token Dependencies
- Same as RoadTransportScreen

---

### A.3 LineDetailScreen

**File**: `mobile/src/screens/transport/LineDetailScreen.tsx`
**Header JSX**: Lines 262-292
**Header Styles**: Lines 592-625
**Tab JSX**: Lines 325-362
**Tab Styles**: Lines 665-710

#### Header Exact JSX Structure
```jsx
<View style={[styles.headerSlab, { backgroundColor: headerBackground }]}>  // Line 263 - DYNAMIC BG
  <View style={styles.headerContent}>                // Line 264
    <View style={styles.headerIconBox}>              // Line 265
      <Icon
        name={transportType === 'sea' ? 'ship' : 'bus'}  // Line 267 - DYNAMIC ICON
        size="lg"
        colorToken="textPrimary"
      />
    </View>
    <View style={styles.headerTextContainer}>        // Line 272
      <H1 style={styles.headerTitle}>
        {formatLineTitle(lineDetailData.line_number, dir0Route?.origin ?? '', dir0Route?.destination ?? '')}
      </H1>
      <View style={styles.headerMetaRow}>            // Line 280 - ROW CONTAINER
        {lineDetailData.subtype && (                 // Line 281 - CONDITIONAL
          <Meta style={styles.headerMeta}>{lineDetailData.subtype}</Meta>
        )}
        {currentRoute?.typical_duration_minutes && ( // Line 284 - CONDITIONAL
          <Meta style={styles.headerMeta}>
            {formatDuration(currentRoute.typical_duration_minutes)}
          </Meta>
        )}
      </View>
    </View>
  </View>
</View>
```

#### Header Token Groups Used
```typescript
const lineDetail = components.transport.lineDetail;
```

| Style Property | Token Path | Value |
|----------------|-----------|-------|
| `headerSlab.padding` | `lineDetail.headerPadding` | `spacing.lg` (16px) |
| `headerSlab.borderBottomWidth` | `lineDetail.headerBorderWidth` | `borders.widthCard` (3px) |
| `headerSlab.borderBottomColor` | `lineDetail.headerBorderColor` | `colors.border` |
| `headerIconBox.width/height` | `lineDetail.headerIconBoxSize` | **52** (DIFFERENT!) |
| `headerIconBox.backgroundColor` | `lineDetail.headerIconBoxBackground` | `colors.background` |
| `headerIconBox.borderWidth` | `lineDetail.headerIconBoxBorderWidth` | `borders.widthThin` (2px) |
| `headerIconBox.borderColor` | `lineDetail.headerIconBoxBorderColor` | `colors.border` |
| `headerTitle.color` | `lineDetail.headerTitleColor` | `colors.primaryText` |
| `headerMeta.color` | `lineDetail.headerMetaColor` | `rgba(255,255,255,0.85)` |

#### Header Hardcoded Values
| Location | Value | Token Used? |
|----------|-------|-------------|
| Line 610 | `marginRight: spacing.md` | Yes (12px) - **NOT using token** |
| Line 620 | `gap: spacing.md` | Yes - **NOT tokenized** (should be `headerMetaRowGap`) |
| Line 621 | `marginTop: spacing.xs` | Yes (4px) |

#### Tabs Exact JSX Structure
```jsx
{routes.length > 1 && (                              // Line 326 - CONDITIONAL RENDER
  <View style={styles.directionContainer}>           // Line 327
    <Label style={styles.sectionLabel}>{t('transport.lineDetail.direction')}</Label>  // Line 328 - SECTION LABEL
    <View style={styles.directionTabsWrapper}>       // Line 329
      <View style={styles.directionTabsShadow} />    // Line 330 - SHADOW LAYER
      <View style={styles.directionTabs}>            // Line 331
        {routes.map((route) => {
          const isActive = selectedDirection === route.direction;
          return (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.directionTab,
                isActive && [
                  styles.directionTabActive,
                  { backgroundColor: headerBackground },  // Line 341 - DYNAMIC COLOR
                ],
                route.direction === 1 && styles.directionTabRight,  // Line 343 - DIVIDER
              ]}
              onPress={() => setSelectedDirection(route.direction)}
            >
              <Label
                style={[
                  styles.directionTabText,
                  isActive && styles.directionTabTextActive,
                ]}
                numberOfLines={1}
              >
                {route.direction_label}
              </Label>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  </View>
)}
```

#### Tabs Token Groups Used
```typescript
const lineDetail = components.transport.lineDetail;
```

| Style Property | Token Path | Value |
|----------------|-----------|-------|
| `directionTabsShadow.top` | `lineDetail.shadowOffsetY` | 4 |
| `directionTabsShadow.left` | `lineDetail.shadowOffsetX` | 4 |
| `directionTabsShadow.backgroundColor` | `lineDetail.shadowColor` | `colors.border` |
| `directionTabs.borderWidth` | `lineDetail.directionTabBorderWidth` | `borders.widthCard` (3px) |
| `directionTabs.borderColor` | `lineDetail.directionTabBorderColor` | `colors.border` |
| `directionTabs.borderRadius` | `lineDetail.directionTabRadius` | `borders.radiusSharp` (0) |
| `directionTab.paddingVertical` | `lineDetail.directionTabPadding` | `spacing.md` (12px) |
| `directionTab.backgroundColor` | `lineDetail.directionTabInactiveBackground` | `colors.background` |
| `directionTabRight.borderLeftWidth` | `lineDetail.directionTabBorderWidth` | 3px |
| `directionTabText.color` | `lineDetail.directionTabInactiveText` | `colors.textPrimary` |
| `directionTabTextActive.color` | `lineDetail.directionTabActiveText` | `colors.primaryText` |

#### Tabs Hardcoded Values
| Location | Value | Token Used? |
|----------|-------|-------------|
| Line 652-653 | `width: 36, height: 36` | **NO** - dateArrow size hardcoded |
| Line 672 | `marginTop: spacing.sm` | Yes (8px) |
| Line 692 | `paddingHorizontal: spacing.sm` | Yes (8px) |

#### Shared Token Dependencies (CRITICAL)

**`lineDetail.*` tokens are used by:**
- `LineDetailScreen.tsx` (header + tabs)
- `DepartureItem.tsx` (25+ token references!)

**DepartureItem.tsx uses these lineDetail tokens:**
```
lineDetail.shadowOffsetY (line 201)
lineDetail.shadowOffsetX (line 202, 203)
lineDetail.shadowColor (line 205)
lineDetail.departureRowBackground (line 208)
lineDetail.departureRowBorderWidth (line 209)
lineDetail.departureRowBorderColor (line 210)
lineDetail.departureRowRadius (line 211)
lineDetail.timeBlockWidth (line 222)
lineDetail.timeBlockPadding (line 223, 224)
lineDetail.timeBlockBorderWidth (line 227)
lineDetail.timeBlockBorderColor (line 228)
lineDetail.timeBlockTextColor (line 231)
lineDetail.timeBlockBackgroundSea (line 95)
lineDetail.timeBlockBackgroundRoad (line 96)
lineDetail.departureRowPadding (line 236)
lineDetail.timelineDotSize (line 275, 276, 277)
lineDetail.timelineDotColor (line 278)
lineDetail.timelineDotSizeEndpoint (line 281, 282, 283)
lineDetail.timelineDotEndpointColor (line 284)
lineDetail.timelineLineWidth (line 287)
lineDetail.timelineLineColor (line 289)
lineDetail.timelineStopTimeWidth (line 299)
```

**CRITICAL**: Do NOT rename or remove any `lineDetail.*` token that DepartureItem uses.

---

### A.4 InboxListScreen

**File**: `mobile/src/screens/inbox/InboxListScreen.tsx`
**Tabs JSX**: Lines 429-467
**Tabs Styles**: Lines 569-598

#### Tabs Exact JSX Structure
```jsx
<View style={styles.tabBar}>                         // Line 430
  <Pressable
    style={[styles.tab, activeTab === 'received' && styles.tabActive]}  // Line 432
    onPress={() => handleTabChange('received')}
  >
    <Icon
      name="inbox"
      size="sm"
      colorToken={activeTab === 'received' ? 'primaryText' : 'textPrimary'}  // Line 438 - DYNAMIC
    />
    <Label
      style={[
        styles.tabText,
        activeTab === 'received' && styles.tabTextActive,
      ]}
    >
      {t('inbox.tabs.received')}
    </Label>
  </Pressable>
  <Pressable
    style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
    onPress={() => handleTabChange('sent')}
  >
    <Icon
      name="send"
      size="sm"
      colorToken={activeTab === 'sent' ? 'primaryText' : 'textPrimary'}
    />
    <Label
      style={[
        styles.tabText,
        activeTab === 'sent' && styles.tabTextActive,
      ]}
    >
      {t('inbox.tabs.sent')}
    </Label>
  </Pressable>
</View>
```

#### Tabs Token Groups Used
```typescript
const inboxTokens = components.inbox;
```

| Style Property | Token Path | Value |
|----------------|-----------|-------|
| `tabBar.borderBottomWidth` | `inboxTokens.tabs.borderBottomWidth` | `borders.widthExtraHeavy` (8px) |
| `tabBar.borderBottomColor` | `inboxTokens.tabs.borderBottomColor` | `colors.border` |
| `tab.gap` | `inboxTokens.tabs.iconGap` | `spacing.sm` (8px) |
| `tab.paddingVertical` | `inboxTokens.tabs.tabPadding` | `spacing.md` (12px) |
| `tab.backgroundColor` | `inboxTokens.tabs.inactiveBackground` | `colors.background` |
| `tab.borderWidth` | `inboxTokens.tabs.inactiveBorderWidth` | `borders.widthCard` (3px) |
| `tab.borderColor` | `inboxTokens.tabs.inactiveBorderColor` | `colors.border` |
| `tabActive.backgroundColor` | `inboxTokens.tabs.activeBackground` | `palette.primary` |
| `tabActive.borderWidth` | `inboxTokens.tabs.activeBorderWidth` | `borders.widthCard` (3px) |
| `tabActive.borderColor` | `inboxTokens.tabs.activeBorderColor` | `colors.border` |
| `tabText.color` | `inboxTokens.tabs.inactiveTextColor` | `colors.textPrimary` |
| `tabTextActive.color` | `inboxTokens.tabs.activeTextColor` | `colors.primaryText` |

#### Tabs Hardcoded Values
| Location | Value | Token Used? |
|----------|-------|-------------|
| Line 584 | `borderBottomWidth: 0` | **HARDCODED** - Intentional override |
| Line 590 | `borderBottomWidth: 0` | **HARDCODED** - Intentional override |

#### Shared Token Dependencies
- `inbox.tabs.*` tokens are ONLY used by `InboxListScreen.tsx`
- **SAFE** to modify without affecting other components

---

## B) Difference Matrix

### B.1 Header Slabs Comparison

| Aspect | Overview (Road/Sea) | LineDetail | Impact |
|--------|---------------------|------------|--------|
| **Token Group** | `overviewHeader` | `lineDetail` | Different namespaces |
| **Icon Box Size** | 48px | 52px | **4px difference** |
| **Border Bottom Width** | 4px (`widthHeavy`) | 3px (`widthCard`) | **1px difference** |
| **Border Bottom Color** | `colors.border` | `colors.border` | Same |
| **Padding** | `spacing.lg` (16px) | `spacing.lg` (16px) | Same |
| **Icon Box Gap** | `overviewHeader.iconBoxGap` (12px) | `spacing.md` (12px) inline | Same value, different source |
| **Title Color** | `colors.primaryText` | `colors.primaryText` | Same |
| **Subtitle Color** | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.85)` | Same |
| **Background Logic** | Fixed per-screen (`backgroundRoad`/`backgroundSea`) | Dynamic via prop (`headerBackground`) | Different pattern |
| **Subtitle Structure** | Single `<Meta>` | `<View>` row with multiple `<Meta>` | **Structural difference** |
| **Subtitle Conditional** | Road: `{dayType && (...)}`, Sea: always | Each meta has own conditional | Different |
| **Shadow** | None | None | Same |
| **Typography Level** | H1 title, Meta subtitle | H1 title, Meta in row | Same levels |

### B.2 Tabs Comparison

| Aspect | Inbox Tabs | LineDetail Tabs | Impact |
|--------|-----------|-----------------|--------|
| **Token Group** | `inbox.tabs` | `lineDetail.directionTab*` | Different namespaces |
| **Container Structure** | Single View with bottom border | Wrapper + Shadow + Inner | **Structural difference** |
| **Container Border** | 8px bottom only | 3px all sides | **Different** |
| **Shadow** | None | 4px neobrut offset | **Different** |
| **Border Radius** | Sharp (0) | Sharp (0) | Same |
| **Icons** | Yes (inbox, send) | No | **Different** |
| **Icon Color Logic** | Conditional colorToken | N/A | Inbox-specific |
| **Section Label** | No | Yes ("SMJER") | **Different** |
| **Active Color** | Fixed (`palette.primary`) | Dynamic (`headerBackground`) | **Different** |
| **Tab Divider** | None (gap) | Left border on 2nd tab | **Different** |
| **Text Transform** | Uppercase | None (Label default) | **Different** |
| **Tab Padding** | `spacing.md` (12px) | `spacing.md` (12px) | Same |
| **Tab Border Width** | 3px | 3px | Same |
| **Interaction Model** | `activeTab === 'received'` | `selectedDirection === route.direction` | Different state |

---

## C) Risk Analysis (Detailed)

### C.1 Risk: DepartureItem Token Breakage

**Severity**: HIGH
**Likelihood**: HIGH (if we rename tokens)
**Impact**: Departure rows would break visually on LineDetailScreen

**Affected Component**: `DepartureItem.tsx`

**Token Dependencies**:
- `lineDetail.shadowOffsetX/Y` (shadow positioning)
- `lineDetail.shadowColor` (shadow color)
- `lineDetail.departureRow*` (row styling)
- `lineDetail.timeBlock*` (time block styling)
- `lineDetail.timeline*` (expanded timeline)

**Mitigation Strategy**:
1. Do NOT rename ANY `lineDetail.*` token
2. Create NEW tokens with new names if consolidation needed
3. Keep old tokens as aliases pointing to new values
4. Verify DepartureItem renders correctly after any token changes

### C.2 Risk: Icon Box Size Mismatch

**Severity**: MEDIUM
**Likelihood**: HIGH (known difference)
**Impact**: Visual regression if wrong size used

**Current State**:
- Overview screens: 48px icon box
- LineDetail: 52px icon box

**Mitigation Strategy**:
1. Keep two separate components (`TransportOverviewHeaderSlab`, `TransportLineDetailHeader`)
2. Do NOT parameterize icon box size - each component uses its own fixed token
3. This is why we're NOT creating a single unified header component

### C.3 Risk: Border Width Visual Change

**Severity**: LOW
**Likelihood**: MEDIUM
**Impact**: Subtle visual difference (4px vs 3px)

**Current State**:
- Overview screens: 4px (`widthHeavy`)
- LineDetail: 3px (`widthCard`)

**Mitigation Strategy**:
1. Keep separate border widths in each component
2. Do NOT unify border widths
3. Screenshot comparison before/after

### C.4 Risk: Tab Shadow Layer Positioning

**Severity**: MEDIUM
**Likelihood**: MEDIUM
**Impact**: Shadow could shift or disappear

**Current State**:
- LineDetail tabs have shadow layer using absolute positioning
- Inbox tabs have no shadow

**Mitigation Strategy**:
1. `SegmentedTabs` component has `variant` prop
2. `variant='boxed'` includes shadow layer
3. `variant='banner'` has no shadow
4. Shadow positioning uses existing `lineDetail.shadowOffset*` tokens (NOT renamed)

### C.5 Risk: Dynamic Active Color Breaking

**Severity**: MEDIUM
**Likelihood**: MEDIUM
**Impact**: Tabs could have wrong active color

**Current State**:
- Inbox: Fixed `palette.primary` (blue)
- LineDetail: Dynamic `headerBackground` (blue for sea, green for road, teal for catamaran)

**Mitigation Strategy**:
1. `SegmentedTabs` has `activeColor` prop
2. Default: `palette.primary`
3. LineDetailScreen passes `headerBackground` as `activeColor`
4. Test with all transport types: sea ferry (blue), catamaran (teal), road (green)

### C.6 Risk: Inbox Tab Icon Rendering

**Severity**: LOW
**Likelihood**: LOW
**Impact**: Icons might not render or have wrong color

**Current State**:
- Inbox tabs have icons with conditional `colorToken`
- LineDetail tabs have no icons

**Mitigation Strategy**:
1. `SegmentedTabs` supports optional `icon` in tab definition
2. Icon color follows active/inactive state automatically
3. Test both Inbox (with icons) and LineDetail (without icons)

### C.7 Risk: Layout Shift from Subtitle Structure Change

**Severity**: MEDIUM
**Likelihood**: LOW (if we keep separate components)
**Impact**: Header height could change

**Current State**:
- Overview: Single `<Meta>` with optional conditional
- LineDetail: `<View>` row with multiple conditional `<Meta>`

**Mitigation Strategy**:
1. Keep separate components
2. `TransportOverviewHeaderSlab` uses `subtitle: string` prop
3. `TransportLineDetailHeader` uses `metaItems: string[]` prop
4. No structural change to existing layout

### C.8 Risk: Date Selector and Ticket Box Affected

**Severity**: LOW
**Likelihood**: LOW
**Impact**: Adjacent components could shift

**Assessment**:
- Date selector is BELOW header slab (not inside)
- Ticket box is in a separate section
- Header component extraction should not affect these

**Mitigation Strategy**:
1. Verify date selector position after header migration
2. Verify ticket box position after header migration
3. Screenshot comparison

### C.9 Risk: BannerList Layout Interaction

**Severity**: LOW
**Likelihood**: LOW
**Impact**: Banners could overlap or shift

**Assessment**:
- BannerList is ABOVE header slab
- No layout interaction expected

**Mitigation Strategy**:
1. Test with banners visible
2. Test with no banners
3. Verify spacing is unchanged

---

## D) Proposed Architecture

### D.1 `<TransportOverviewHeaderSlab />`

**Location**: `mobile/src/components/transport/TransportOverviewHeaderSlab.tsx`

**Purpose**: Header slab for RoadTransportScreen and SeaTransportScreen

#### Prop Contract (TypeScript Interface)

```typescript
interface TransportOverviewHeaderSlabProps {
  /**
   * Transport type determines background color and icon
   * - 'sea': Blue background, ship icon
   * - 'road': Green background, bus icon
   */
  transportType: 'sea' | 'road';

  /**
   * Title text (translated by caller)
   * Example: "Pomorski prijevoz" or "Autobusni prijevoz"
   */
  title: string;

  /**
   * Optional subtitle text (translated by caller)
   * Example: "Srijeda, 12. veljače" or "Ponedjeljak (Praznik)"
   * If undefined, subtitle row is not rendered
   */
  subtitle?: string;
}
```

#### Token Consumption

| Token Path | Usage |
|-----------|-------|
| `overviewHeader.backgroundSea` | Background when `transportType='sea'` |
| `overviewHeader.backgroundRoad` | Background when `transportType='road'` |
| `overviewHeader.padding` | Container padding |
| `overviewHeader.borderBottomWidth` | Bottom border |
| `overviewHeader.borderBottomColor` | Bottom border color |
| `overviewHeader.iconBoxSize` | Icon box dimensions (48px) |
| `overviewHeader.iconBoxBackground` | Icon box background |
| `overviewHeader.iconBoxBorderWidth` | Icon box border |
| `overviewHeader.iconBoxBorderColor` | Icon box border color |
| `overviewHeader.iconBoxGap` | Gap between icon box and text |
| `overviewHeader.titleColor` | Title text color |
| `overviewHeader.subtitleColor` | Subtitle text color |

#### What Is Configurable
- `transportType` (required): Determines background color and icon
- `title` (required): Main title text
- `subtitle` (optional): Subtitle text

#### What Is Fixed
- Icon box size: 48px (from token)
- Border width: 4px (from token)
- Icon: `ship` for sea, `bus` for road
- Icon size: `lg`
- Typography: H1 for title, Meta for subtitle
- Layout: Row with icon box left, text container right

#### Why Separate from LineDetail
- Different icon box size (48 vs 52)
- Different border width (4px vs 3px)
- Different subtitle structure (single string vs multiple items)
- Simpler prop contract (no need for `metaItems` array)

---

### D.2 `<TransportLineDetailHeader />`

**Location**: `mobile/src/components/transport/TransportLineDetailHeader.tsx`

**Purpose**: Header slab for LineDetailScreen

#### Prop Contract (TypeScript Interface)

```typescript
interface TransportLineDetailHeaderProps {
  /**
   * Transport type determines background color and icon
   * - 'sea': Blue background, ship icon
   * - 'road': Green background, bus icon
   */
  transportType: 'sea' | 'road';

  /**
   * Title text (e.g., "602: Vis-Split")
   */
  title: string;

  /**
   * Optional array of meta items to display in a row
   * Example: ["TRAJEKT", "2h 30min"]
   * Items with falsy values are filtered out
   */
  metaItems?: (string | null | undefined)[];
}
```

#### Token Consumption

| Token Path | Usage |
|-----------|-------|
| `lineDetail.headerBackgroundSea` | Background when `transportType='sea'` |
| `lineDetail.headerBackgroundRoad` | Background when `transportType='road'` |
| `lineDetail.headerPadding` | Container padding |
| `lineDetail.headerBorderWidth` | Bottom border (3px) |
| `lineDetail.headerBorderColor` | Bottom border color |
| `lineDetail.headerIconBoxSize` | Icon box dimensions (52px) |
| `lineDetail.headerIconBoxBackground` | Icon box background |
| `lineDetail.headerIconBoxBorderWidth` | Icon box border |
| `lineDetail.headerIconBoxBorderColor` | Icon box border color |
| `lineDetail.headerTitleColor` | Title text color |
| `lineDetail.headerMetaColor` | Meta text color |
| `spacing.md` | Icon box gap (existing inline usage) |
| `spacing.md` | Meta row gap (existing inline usage) |
| `spacing.xs` | Meta row margin top |

#### What Is Configurable
- `transportType` (required): Determines background color and icon
- `title` (required): Main title text
- `metaItems` (optional): Array of meta strings

#### What Is Fixed
- Icon box size: 52px (from token)
- Border width: 3px (from token)
- Icon: `ship` for sea, `bus` for road
- Icon size: `lg`
- Typography: H1 for title, Meta for each item
- Layout: Row with icon box left, text container right

#### How It Prevents Regression in DepartureItem

1. **Token Isolation**: This component only uses `lineDetail.header*` tokens
2. **No Token Renaming**: We do NOT rename any `lineDetail.*` token
3. **DepartureItem continues using**: `lineDetail.shadowOffset*`, `lineDetail.departureRow*`, `lineDetail.timeBlock*`, `lineDetail.timeline*`
4. **No Cross-Contamination**: Header component does not share styling with departure rows

---

### D.3 `<SegmentedTabs />`

**Location**: `mobile/src/ui/SegmentedTabs.tsx`

**Purpose**: Unified tab component for Inbox and LineDetail

#### Prop Contract (TypeScript Interface)

```typescript
interface SegmentedTab {
  /**
   * Unique identifier for the tab
   */
  key: string;

  /**
   * Display label (translated by caller)
   */
  label: string;

  /**
   * Optional icon name (lucide-react-native)
   * Only supported in 'banner' variant
   */
  icon?: IconName;
}

interface SegmentedTabsProps {
  /**
   * Array of tab definitions
   */
  tabs: SegmentedTab[];

  /**
   * Currently active tab key
   */
  activeKey: string;

  /**
   * Callback when tab is pressed
   */
  onTabPress: (key: string) => void;

  /**
   * Visual variant
   * - 'banner': Heavy bottom border, no shadow, supports icons (Inbox style)
   * - 'boxed': Full border with neobrut shadow, no icons (LineDetail style)
   * @default 'banner'
   */
  variant?: 'banner' | 'boxed';

  /**
   * Active tab background color
   * Only applies to 'boxed' variant
   * @default palette.primary
   */
  activeColor?: string;

  /**
   * Optional section label displayed above tabs
   * Only applies to 'boxed' variant
   */
  sectionLabel?: string;
}
```

#### Token Consumption

**Banner Variant** (Inbox):
| Token Path | Usage |
|-----------|-------|
| `inbox.tabs.borderBottomWidth` | Container bottom border (8px) |
| `inbox.tabs.borderBottomColor` | Container bottom border color |
| `inbox.tabs.activeBackground` | Active tab background |
| `inbox.tabs.activeTextColor` | Active tab text color |
| `inbox.tabs.activeBorderWidth` | Active tab border |
| `inbox.tabs.activeBorderColor` | Active tab border color |
| `inbox.tabs.inactiveBackground` | Inactive tab background |
| `inbox.tabs.inactiveTextColor` | Inactive tab text color |
| `inbox.tabs.inactiveBorderWidth` | Inactive tab border |
| `inbox.tabs.inactiveBorderColor` | Inactive tab border color |
| `inbox.tabs.tabPadding` | Tab vertical padding |
| `inbox.tabs.iconGap` | Gap between icon and label |

**Boxed Variant** (LineDetail):
| Token Path | Usage |
|-----------|-------|
| `lineDetail.shadowOffsetX` | Shadow X offset |
| `lineDetail.shadowOffsetY` | Shadow Y offset |
| `lineDetail.shadowColor` | Shadow color |
| `lineDetail.directionTabBorderWidth` | Container and tab border |
| `lineDetail.directionTabBorderColor` | Border color |
| `lineDetail.directionTabRadius` | Border radius |
| `lineDetail.directionTabPadding` | Tab vertical padding |
| `lineDetail.directionTabInactiveBackground` | Inactive tab background |
| `lineDetail.directionTabInactiveText` | Inactive tab text color |
| `lineDetail.directionTabActiveText` | Active tab text color |
| `spacing.sm` | Tab horizontal padding |
| `spacing.sm` | Section label margin bottom |

#### How to Avoid Transport-Specific Leakage into Inbox

1. **Variant System**: Banner variant uses `inbox.tabs.*` tokens, boxed uses `lineDetail.*` tokens
2. **No Token Sharing**: Each variant has its own token set
3. **Active Color Override**: Only boxed variant accepts `activeColor` prop
4. **Icon Support**: Only banner variant renders icons
5. **Section Label**: Only boxed variant supports section label

#### Responsibility Boundaries

**Component Responsibility**:
- Render tab bar with correct styling per variant
- Handle active/inactive state styling
- Call `onTabPress` when tab is pressed
- Render optional icons (banner only)
- Render optional section label (boxed only)

**Screen Responsibility**:
- Manage active tab state
- Provide translated labels
- Provide icons (if needed)
- Handle tab change business logic
- Provide active color (if custom)

---

## E) Migration Strategy (Safe Mode)

### E.1 Phase 1: Token Additions (Non-breaking)

**Branch**: `refactor/transport-headers-tabs-phase1`

**Changes**:
1. Add `headerMetaRowGap` token to `lineDetail` (value: `spacing.md`)
2. No token renaming
3. No component changes

**Files Touched**:
- `mobile/src/ui/skin.neobrut2.ts` (add 1 token)

**Commit**:
```
chore(tokens): add headerMetaRowGap to lineDetail tokens
```

**Verification**:
- [ ] TypeScript compilation passes
- [ ] No runtime errors
- [ ] All screens render unchanged (no visual diff)

**Rollback**: Revert single commit

---

### E.2 Phase 2: Component Creation (Non-breaking)

**Branch**: `refactor/transport-headers-tabs-phase2`

**Changes**:
1. Create `TransportOverviewHeaderSlab.tsx`
2. Create `TransportLineDetailHeader.tsx`
3. Create `SegmentedTabs.tsx`
4. Export from appropriate index files
5. **Do NOT use components yet**

**Files Created**:
- `mobile/src/components/transport/TransportOverviewHeaderSlab.tsx`
- `mobile/src/components/transport/TransportLineDetailHeader.tsx`
- `mobile/src/components/transport/index.ts` (export new components)
- `mobile/src/ui/SegmentedTabs.tsx`
- `mobile/src/ui/index.ts` (export new component)

**Commits**:
```
feat(ui): add TransportOverviewHeaderSlab component
feat(ui): add TransportLineDetailHeader component
feat(ui): add SegmentedTabs component
```

**Verification**:
- [ ] TypeScript compilation passes
- [ ] Components can be imported without errors
- [ ] Existing screens unchanged
- [ ] (Optional) Add to UiInventoryScreen for visual testing

**Rollback**: Revert commits or delete files

---

### E.3 Phase 3: Header Migrations (One at a Time)

**Branch**: `refactor/transport-headers-tabs-phase3`

**Migration Order**:
1. **RoadTransportScreen** (simplest, fixed background)
2. **SeaTransportScreen** (identical structure to Road)
3. **LineDetailScreen** (most complex, different token group)

**Justification for Order**:
- Road is simplest: fixed green background, conditional subtitle
- Sea is nearly identical: fixed blue background, unconditional subtitle
- LineDetail is most complex: dynamic background, meta array
- Migrate least complex first to validate approach

#### 3a: RoadTransportScreen

**Files Modified**:
- `mobile/src/screens/transport/RoadTransportScreen.tsx`

**Changes**:
1. Import `TransportOverviewHeaderSlab`
2. Replace inline header JSX (lines 170-186) with component
3. Remove unused styles: `headerSlab`, `headerContent`, `headerIconBox`, `headerTextContainer`, `headerTitle`, `headerMeta`

**Commit**:
```
refactor(transport): use TransportOverviewHeaderSlab in RoadTransportScreen
```

**Verification**:
- [ ] Visual comparison: no layout shift
- [ ] Title displays correctly
- [ ] Subtitle displays correctly (with day type and holiday)
- [ ] Green background correct
- [ ] Icon box correct size and position
- [ ] Works with and without banners above

#### 3b: SeaTransportScreen

**Files Modified**:
- `mobile/src/screens/transport/SeaTransportScreen.tsx`

**Changes**:
1. Import `TransportOverviewHeaderSlab`
2. Replace inline header JSX (lines 194-208) with component
3. Remove unused styles

**Commit**:
```
refactor(transport): use TransportOverviewHeaderSlab in SeaTransportScreen
```

**Verification**:
- [ ] Visual comparison: no layout shift
- [ ] Title displays correctly
- [ ] Subtitle displays correctly (with formatted date)
- [ ] Blue background correct
- [ ] Icon box correct size and position

#### 3c: LineDetailScreen Header

**Files Modified**:
- `mobile/src/screens/transport/LineDetailScreen.tsx`

**Changes**:
1. Import `TransportLineDetailHeader`
2. Replace inline header JSX (lines 262-292) with component
3. Remove unused styles: `headerSlab`, `headerContent`, `headerIconBox`, `headerTextContainer`, `headerTitle`, `headerMetaRow`, `headerMeta`
4. Keep ALL other `lineDetail.*` styles (date selector, tabs, etc.)

**Commit**:
```
refactor(transport): use TransportLineDetailHeader in LineDetailScreen
```

**Verification**:
- [ ] Visual comparison: no layout shift
- [ ] Title displays correctly (with line number)
- [ ] Meta items display correctly (subtype, duration)
- [ ] Blue/green background correct for sea/road
- [ ] Icon box correct size (52px)
- [ ] Border width correct (3px)
- [ ] DepartureItem still renders correctly
- [ ] Date selector position unchanged
- [ ] Ticket box position unchanged

**Rollback per migration**: Revert single commit

---

### E.4 Phase 4: Tab Migrations (One at a Time)

**Branch**: `refactor/transport-headers-tabs-phase4`

**Migration Order**:
1. **LineDetailScreen** (boxed variant, more isolated)
2. **InboxListScreen** (banner variant, more visible)

**Justification for Order**:
- LineDetail tabs are more isolated (inside a section)
- Inbox tabs are more prominent (top of screen)
- If boxed variant has issues, impact is smaller

#### 4a: LineDetailScreen Tabs

**Files Modified**:
- `mobile/src/screens/transport/LineDetailScreen.tsx`

**Changes**:
1. Import `SegmentedTabs`
2. Replace inline tabs JSX (lines 325-362) with component
3. Pass `variant="boxed"`, `activeColor={headerBackground}`, `sectionLabel={t('transport.lineDetail.direction')}`
4. Transform `routes` to `tabs` format
5. Remove unused styles: `directionContainer`, `directionTabsWrapper`, `directionTabsShadow`, `directionTabs`, `directionTab`, `directionTabRight`, `directionTabActive`, `directionTabText`, `directionTabTextActive`

**Commit**:
```
refactor(transport): use SegmentedTabs in LineDetailScreen
```

**Verification**:
- [ ] Visual comparison: no layout shift
- [ ] Tabs render with shadow
- [ ] Active tab has correct color (blue/green/teal)
- [ ] Tab switching works
- [ ] Section label displays
- [ ] Border and radius correct

#### 4b: InboxListScreen Tabs

**Files Modified**:
- `mobile/src/screens/inbox/InboxListScreen.tsx`

**Changes**:
1. Import `SegmentedTabs`
2. Replace inline tabs JSX (lines 429-467) with component
3. Pass `variant="banner"` (or omit for default)
4. Transform tab definitions to include icons
5. Remove unused styles: `tabBar`, `tab`, `tabActive`, `tabText`, `tabTextActive`

**Commit**:
```
refactor(inbox): use SegmentedTabs in InboxListScreen
```

**Verification**:
- [ ] Visual comparison: no layout shift
- [ ] Tabs render with bottom border (no shadow)
- [ ] Icons display correctly
- [ ] Icon color changes on active/inactive
- [ ] Tab switching works
- [ ] Text is uppercase
- [ ] Tag filter bar still works

**Rollback per migration**: Revert single commit

---

### E.5 Phase 5: Cleanup (Only After Full Verification)

**Branch**: `refactor/transport-headers-tabs-phase5`

**Changes**:
1. Remove any dead styles from screens
2. Verify no unused tokens
3. Update documentation

**Files Modified**:
- Screen files (remove any remaining dead styles)
- `docs/UI_COMPONENT_INVENTORY.md` (add new components)
- `docs/DESIGN_TOKENS_USAGE_MAP.md` (update token consumers)

**Commit**:
```
chore(cleanup): remove dead styles after header/tab migration
docs: update component inventory with new transport components
```

**Verification**:
- [ ] Final visual comparison all screens
- [ ] TypeScript compilation clean
- [ ] No console warnings
- [ ] No unused imports

---

### E.6 Git Hygiene Requirements

**Branch Naming**:
- `refactor/transport-headers-tabs-phase1` (tokens)
- `refactor/transport-headers-tabs-phase2` (components)
- `refactor/transport-headers-tabs-phase3` (header migrations)
- `refactor/transport-headers-tabs-phase4` (tab migrations)
- `refactor/transport-headers-tabs-phase5` (cleanup)

**Commit Granularity**:
- One commit per token addition
- One commit per new component
- One commit per screen migration
- One commit for cleanup

**PR Requirements**:
- Before/after screenshots for each screen
- Checklist of verification items
- Risk confirmation that DepartureItem unchanged

**CI Checkpoints**:
- TypeScript compilation (`pnpm typecheck`)
- ESLint (`pnpm lint`)
- (Future) Visual regression tests

---

## F) What We Need From You

### F.1 Unclear Design Decisions

1. **Subtitle Conditional in RoadTransportScreen**:
   - Currently: `{dayType && (<Meta>...)}`
   - If `dayType` is null, no subtitle renders
   - Should component handle this, or should screen always pass a string?
   - **Proposed**: Screen passes `subtitle` string or `undefined`. Component renders nothing if `undefined`.

2. **SeaTransportScreen Subtitle Format**:
   - Uses `formatDayWithDate(new Date(), language)` - returns formatted date string
   - RoadTransportScreen uses `DAY_TYPE_LABELS[dayType]` - returns day type label
   - **Question**: Are these intentionally different? Or should they be unified?

3. **Tab Text Transform**:
   - Inbox tabs have `textTransform: 'uppercase'` in styles
   - LineDetail tabs do not have explicit transform
   - **Question**: Should `SegmentedTabs` apply uppercase to both variants? Or only banner?

### F.2 Ambiguous Behavior

1. **Tab Divider in Boxed Variant**:
   - Current LineDetail has `borderLeftWidth` on 2nd tab (creates divider)
   - If tabs array has 3+ tabs, should all non-first tabs have left border?
   - **Proposed**: Yes, all tabs except first get left border in boxed variant.

2. **Icon Size in Banner Variant**:
   - Current Inbox uses `size="sm"` for icons
   - Should this be configurable? Or always `sm`?
   - **Proposed**: Fixed at `sm` for now. Can parameterize later if needed.

### F.3 Token Group Inconsistencies

1. **Icon Box Gap**:
   - `overviewHeader.iconBoxGap` exists (value: `spacing.md`)
   - `lineDetail` does NOT have this token (uses `spacing.md` inline)
   - **Proposed**: Keep as-is. LineDetailHeader uses `spacing.md` directly.

2. **Meta Row Gap**:
   - No token exists for meta row gap in `lineDetail`
   - Currently hardcoded as `gap: spacing.md`
   - **Proposed**: Add `lineDetail.headerMetaRowGap` token in Phase 1.

### F.4 Color Mapping Confirmation

Please confirm the following color mappings are correct:

| Context | Transport Type | Background Color |
|---------|---------------|------------------|
| Overview Header (Sea) | sea | `palette.primary` (blue) |
| Overview Header (Road) | road | `palette.secondary` (green) |
| LineDetail Header (Sea Ferry) | sea | `palette.primary` (blue) |
| LineDetail Header (Sea Catamaran) | sea | `palette.primary` (blue)* |
| LineDetail Header (Road) | road | `palette.secondary` (green) |
| LineDetail Tabs Active (Sea) | sea | Same as header |
| LineDetail Tabs Active (Road) | road | Same as header |
| Inbox Tabs Active | N/A | `palette.primary` (blue) |

*Note: Catamaran teal (`palette.teal`) is only used in line CARD headers, not in LineDetailScreen header. LineDetailScreen always uses blue for sea regardless of subtype. Please confirm this is intentional.

---

## Appendix: Screenshot Checklist

Before implementation, capture baseline screenshots for:

**iOS**:
- [ ] RoadTransportScreen (with banner)
- [ ] RoadTransportScreen (without banner)
- [ ] SeaTransportScreen (with banner)
- [ ] SeaTransportScreen (without banner)
- [ ] LineDetailScreen (sea, direction tabs visible)
- [ ] LineDetailScreen (road, direction tabs visible)
- [ ] LineDetailScreen (single route, no tabs)
- [ ] InboxListScreen (received tab active)
- [ ] InboxListScreen (sent tab active)
- [ ] InboxListScreen (with tag filter visible)

After each migration:
- [ ] Compare with baseline
- [ ] Document any intentional changes

---

*End of Implementation Plan*
