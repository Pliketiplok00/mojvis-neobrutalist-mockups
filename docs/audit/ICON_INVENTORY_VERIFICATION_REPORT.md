# Icon Inventory Verification Report

Generated: 2026-02-13

## Scope

**Included:** `mobile/src/**`

**Excluded:**
- `mobile/src/design-mirror/**`
- `mobile/src/screens/dev/**`
- `mobile/src/ui/Icon.tsx` (implementation, not usage)
- Test files, fixtures, mocks

---

## Phase 1: Raw Discovery Counts

### Direct `<Icon` Component Usages

| Metric | Count |
|--------|-------|
| Total `<Icon` JSX instances | **90** |
| Unique files containing `<Icon` | **36** |

### Files with Icon Usages (Complete List)

```
mobile/src/components/Banner.tsx (2)
mobile/src/components/DepartureItem.tsx (1)
mobile/src/components/GlobalHeader.tsx (2)
mobile/src/components/MenuOverlay.tsx (1)
mobile/src/components/common/FormSectionHeader.tsx (1)
mobile/src/components/common/InfoRow.tsx (1)
mobile/src/components/common/PhotoSlotTile.tsx (2)
mobile/src/components/services/EmergencyTile.tsx (1)
mobile/src/components/services/ServiceAccordionCard.tsx (2)
mobile/src/components/services/ServicePageHeader.tsx (1)
mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx (1)
mobile/src/screens/click-fix/ClickFixDetailScreen.tsx (1)
mobile/src/screens/click-fix/ClickFixFormScreen.tsx (2)
mobile/src/screens/events/EventDetailScreen.tsx (3)
mobile/src/screens/events/EventsScreen.tsx (5)
mobile/src/screens/fauna/FaunaScreen.tsx (1)
mobile/src/screens/fauna/components/FaunaSpeciesCard.tsx (7)
mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx (1)
mobile/src/screens/flora/FloraScreen.tsx (1)
mobile/src/screens/flora/components/FloraSpeciesCard.tsx (7)
mobile/src/screens/home/HomeScreen.tsx (5)
mobile/src/screens/inbox/InboxDetailScreen.tsx (1)
mobile/src/screens/inbox/InboxListScreen.tsx (6)
mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx (3)
mobile/src/screens/onboarding/components/OnboardingRoleCard.tsx (1)
mobile/src/screens/pages/StaticPageScreen.tsx (3)
mobile/src/screens/services/JavneUslugeScreen.tsx (2)
mobile/src/screens/settings/SettingsScreen.tsx (1)
mobile/src/screens/transport/LineDetailScreen.tsx (10)
mobile/src/screens/transport/RoadTransportScreen.tsx (3)
mobile/src/screens/transport/SeaTransportScreen.tsx (3)
mobile/src/screens/transport/TransportHubScreen.tsx (4)
mobile/src/ui/HeroMediaHeader.tsx (3)
mobile/src/ui/ListRow.tsx (1)
mobile/src/ui/States.tsx (2)
```

### Wrapper Component Usages

| Component | Usages |
|-----------|--------|
| `<IconBox>` (MicroPrimitives) | 1 (HomeScreen.tsx:202) |

---

## Phase 2: Count Reconciliation

### Comparison with Existing Inventory

| Source | Total Icons | Unique Files |
|--------|-------------|--------------|
| **Raw Discovery (this report)** | 90 | 36 |
| **ICON_INVENTORY_REAL_APP.md** | 77 | 34 |
| **Discrepancy** | +13 | +2 |

### Match Status: **INCOMPLETE**

---

## Missing Entries

The following icon usages are NOT present in the existing inventory:

### 1. Banner.tsx - 2 icons MISSING

| Line | Icon | Context |
|------|------|---------|
| 69 | `shield-alert` | Banner icon box |
| 86 | `chevron-right` | Banner arrow indicator |

**Note:** These are BOXED icons (44x44 iconBox style)

### 2. DepartureItem.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 142 | `chevron-up`/`chevron-down` | Expand toggle |

**Note:** UNBOXED

### 3. HeroMediaHeader.tsx - 2 icons MISSING

| Line | Icon | Context |
|------|------|---------|
| 133 | `chevron-left` | Gallery previous button |
| 146 | `chevron-right` | Gallery next button |

**Note:** UNBOXED (inventory only lists line 174)

### 4. InboxListScreen.tsx - 3 icons MISSING

| Line | Icon | Context |
|------|------|---------|
| 282 | (varies) | Message item icon |
| 435 | (varies) | Empty state icon |
| 453 | (varies) | Empty state icon (sent tab) |

**Note:** Need to verify - some may be covered by dynamic iconName references

### 5. HomeScreen.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 203 | (varies by category) | Category icon in IconBox |

**Note:** BOXED (uses IconBox component)

### 6. FaunaSpeciesCard.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 172 | `chevron-up`/`chevron-down` | Expand indicator |

**Note:** UNBOXED

### 7. FloraSpeciesCard.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 172 | `chevron-up`/`chevron-down` | Expand indicator |

**Note:** UNBOXED

### 8. LineDetailScreen.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 268 | `bus`/`ship` | Header icon (dynamic) |

**Note:** BOXED (headerIconBox, 52x52)

### 9. RoadTransportScreen.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 221 | `bus` | Line card header icon |

**Note:** BOXED (lineCardHeaderIconBox, 40x40)

### 10. SeaTransportScreen.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 238 | `ship`/`anchor` | Line card header icon |

**Note:** BOXED (lineCardHeaderIconBox, 40x40)

### 11. ServiceAccordionCard.tsx - 1 icon MISSING

| Line | Icon | Context |
|------|------|---------|
| 114 | `chevron-up`/`chevron-down` | Expand indicator |

**Note:** UNBOXED

---

## Phase 3: Box Detection Verification

### Boxed Icon Containers Found

| File | Style Name | Size | Status in Inventory |
|------|------------|------|---------------------|
| GlobalHeader.tsx | menuIconBox | 44x44 | Present |
| GlobalHeader.tsx | inboxIconBox | 44x44 | Present |
| Banner.tsx | iconBox | 44x44 | **MISSING** |
| HomeScreen.tsx | ctaIconBox | 48x48 | Present |
| HomeScreen.tsx | IconBox (component) | 44 (lg) | Present |
| RoadTransportScreen.tsx | headerIconBox | 48x48 | Present |
| RoadTransportScreen.tsx | lineCardHeaderIconBox | 40x40 | **Partially** (icon usage missing) |
| SeaTransportScreen.tsx | headerIconBox | 48x48 | Present |
| SeaTransportScreen.tsx | lineCardHeaderIconBox | 40x40 | **Partially** (icon usage missing) |
| LineDetailScreen.tsx | headerIconBox | 52x52 | **Partially** (icon usage missing) |
| LineDetailScreen.tsx | contactIconBox | 32x32 | Present |
| EventDetailScreen.tsx | infoTileIconBox | 44x44 | Present |
| FaunaScreen.tsx | warningIconBox | 44x44 | Present |
| FloraScreen.tsx | warningIconBox | 44x44 | Present |
| ServiceAccordionCard.tsx | iconBox | 44x44 | Present |
| OnboardingRoleCard.tsx | iconBox | 48x48 | Present |
| MunicipalitySelectionScreen.tsx | iconBox | 64x64 | Present |

### Box Detection Summary

- Total boxed container styles: 17
- Fully documented: 14
- Missing icon references: 3 (Banner, line card headers)

---

## Summary

### Inventory Status: **INCOMPLETE**

| Category | Count |
|----------|-------|
| Total missing icon instances | 13 |
| Missing files | 2 (Banner.tsx, DepartureItem.tsx) |
| Missing boxed icon entries | 4 (Banner + 3 line card header icons) |
| Missing unboxed icon entries | 9 |

### Files Missing Entirely

1. `mobile/src/components/Banner.tsx` - 2 icons (BOXED)
2. `mobile/src/components/DepartureItem.tsx` - 1 icon (UNBOXED)

### Partially Documented Files

1. `mobile/src/ui/HeroMediaHeader.tsx` - Missing 2 of 3 icons
2. `mobile/src/screens/inbox/InboxListScreen.tsx` - Missing 3 of 6 icons
3. `mobile/src/screens/home/HomeScreen.tsx` - Missing 1 of 5 icons
4. `mobile/src/screens/fauna/components/FaunaSpeciesCard.tsx` - Missing 1 of 7 icons
5. `mobile/src/screens/flora/components/FloraSpeciesCard.tsx` - Missing 1 of 7 icons
6. `mobile/src/screens/transport/LineDetailScreen.tsx` - Missing 1 of 10 icons
7. `mobile/src/screens/transport/RoadTransportScreen.tsx` - Missing 1 of 3 icons
8. `mobile/src/screens/transport/SeaTransportScreen.tsx` - Missing 1 of 3 icons
9. `mobile/src/components/services/ServiceAccordionCard.tsx` - Missing 1 of 2 icons

---

## Ambiguous Cases Requiring Manual Classification

1. **InboxListScreen.tsx lines 282, 435, 453** - Dynamic icon names via props; need to verify if these are distinct from the already-documented dynamic iconName pattern

2. **HomeScreen.tsx line 203** - Uses IconBox component wrapper; need to clarify if this counts as separate from the icon inside

3. **Species card expand icons (Fauna/Flora line 172)** - Chevron up/down toggle state; currently classified as single usage but renders conditionally

---

## Recommendation

The existing inventory requires an update to include:

1. Add Banner.tsx icons (2 entries, BOXED)
2. Add DepartureItem.tsx icon (1 entry, UNBOXED)
3. Add missing expand/chevron icons in HeroMediaHeader, FaunaSpeciesCard, FloraSpeciesCard, ServiceAccordionCard
4. Add missing line card header icons (RoadTransport, SeaTransport, LineDetail)
5. Clarify InboxListScreen dynamic icon handling

**Do NOT update yet** - this report is for verification purposes only.
