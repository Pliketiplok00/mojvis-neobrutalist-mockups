# Phase 2: Component Variation Matrix

**Audit Date:** 2026-02-12
**Scope:** UI primitives and their usage variations

---

## 1. BADGE Component

### Source: `ui/Badge.tsx`

### Defined Variants (8)

| Variant | Background | Text Color |
|---------|------------|------------|
| `urgent` | `colors.urgent` | `colors.urgentText` |
| `info` | `colors.infoBackground` | `colors.infoText` |
| `success` | `colors.successBackground` | `colors.successText` |
| `warning` | `colors.warningBackground` | `colors.warningText` |
| `pending` | `colors.pendingBackground` | `colors.pendingText` |
| `type` | `colors.typeBadge` | `colors.urgentText` |
| `transport` | `colors.backgroundSecondary` | `colors.textSecondary` |
| `default` | `colors.backgroundSecondary` | `colors.textMuted` |

### Size Variants (3)

| Size | paddingH | paddingV | fontSize |
|------|----------|----------|----------|
| `default` | 8px | 2px | 10px |
| `compact` | 6px | 1px | 8px |
| `large` | 12px | 4px | 12px |

### Style Properties (Tokenized)

| Property | Token |
|----------|-------|
| borderRadius | `components.badge.borderRadius` (0 - sharp) |
| borderWidth | `components.badge.borderWidth` (2px) |
| borderColor | `components.badge.borderColor` |

### Usage Count: 30+ occurrences

### Variation Drift: **LOW**
- Core Badge component fully tokenized
- Custom overrides via `backgroundColor`/`textColor` props allowed
- Custom overrides found in: InboxListScreen, LineDetailScreen, SeaTransportScreen

---

## 2. BUTTON Component

### Source: `ui/Button.tsx`

### Defined Variants (3)

| Variant | Background | Border | Text |
|---------|------------|--------|------|
| `primary` | `colors.primary` | 2px `colors.border` | white |
| `secondary` | `colors.background` | 3px `colors.border` | `colors.textPrimary` |
| `danger` | `colors.errorBackground` | 2px `colors.urgent` | `colors.errorText` |

### Style Properties (Tokenized)

| Property | Token |
|----------|-------|
| borderRadius | `components.button.borderRadius` (0 - sharp) |
| paddingVertical | `components.button.paddingVertical` (16px) |
| shadowOffset | `components.button.shadowOffset` (4px) |
| disabledOpacity | `components.button.disabledOpacity` (0.5) |

### Usage Count: 35+ occurrences

### Variation Drift: **LOW**
- Component fully tokenized
- Shadow toggle via `shadow` prop
- No hardcoded style overrides found in usage

---

## 3. CARD Component

### Source: `ui/Card.tsx`

### Defined Variants (5)

| Variant | Background | Border | Radius |
|---------|------------|--------|--------|
| `default` | `components.card.backgroundColor` | 3px | 0 |
| `outlined` | `components.card.backgroundColor` | 3px | 0 |
| `filled` | `colors.backgroundSecondary` | 0 | 0 |
| `selection` | `colors.backgroundSecondary` | 2px | 0 |
| `onboardingSelection` | from token | 3px | 0 |

### Style Properties (Tokenized)

| Property | Token |
|----------|-------|
| padding | `components.card.padding` (20px) |
| borderRadius | `components.card.borderRadius` (0) |
| borderWidth | `components.card.borderWidth` (3px) |

### Usage Count: 15+ occurrences

### Variation Drift: **LOW**
- Component fully tokenized
- Press feedback colorToken support
- Minimal inline style overrides

---

## 4. HEADER Components

### 4a. GlobalHeader (Navigation Header)

| Property | Value | Source |
|----------|-------|--------|
| height | 64px | `components.header.height` |
| paddingHorizontal | 16px | `components.header.paddingHorizontal` |
| borderBottomWidth | 4px | `components.header.borderBottomWidth` |
| backgroundColor | cream | `components.header.backgroundColor` |
| iconBoxSize | 44px | **HARDCODED** |

### 4b. Transport Overview Header (Sea/Road)

| Property | Value | Source |
|----------|-------|--------|
| padding | 16px | `overviewHeader.padding` |
| borderBottomWidth | 4px | `overviewHeader.borderBottomWidth` |
| iconBoxSize | 48px | `overviewHeader.iconBoxSize` |
| iconBoxBorderWidth | 2px | `overviewHeader.iconBoxBorderWidth` |

### 4c. LineDetail Header

| Property | Value | Source |
|----------|-------|--------|
| padding | 16px | `lineDetail.headerPadding` |
| borderWidth | 3px | `lineDetail.headerBorderWidth` |
| iconBoxSize | 52px | `lineDetail.headerIconBoxSize` |

### Header Drift Summary

| Header Type | iconBoxSize | borderWidth | padding |
|-------------|-------------|-------------|---------|
| GlobalHeader | 44px (hardcoded) | 4px | 16px |
| Transport Overview | 48px | 4px | 16px |
| LineDetail | 52px | 3px | 16px |

**Variation Count: 3 header patterns with different icon box sizes**

---

## 5. TAB Components

### 5a. InboxListScreen Tabs

| Property | Active | Inactive |
|----------|--------|----------|
| background | `palette.primary` | `colors.background` |
| textColor | white | `colors.textPrimary` |
| borderWidth | 3px | 3px |

### 5b. LineDetailScreen Direction Tabs

| Property | Active | Inactive |
|----------|--------|----------|
| background | `lineDetail.directionTabActiveBackground` | `colors.background` |
| textColor | white | `colors.textPrimary` |
| borderWidth | 3px | 3px |

### Tab Token Source: `components.inbox.tabs` and `components.transport.lineDetail`

**Variation Count: 2 tab systems (consistent styling)**

---

## 6. DIVIDER / SECTION HEADER

### Transport Section Header

| Property | Value |
|----------|-------|
| marginBottom | 12px |
| paddingBottom | 8px |
| borderBottomWidth | 3px |

### Event/Page Section Divider

| Property | Value |
|----------|-------|
| borderWidth | 2px |
| color | `colors.border` |

**Variation Count: 2 divider patterns**

---

## 7. ICON BOX (Square icon container)

### Variations Found

| Context | Size | Border | Background |
|---------|------|--------|------------|
| GlobalHeader Menu | 44x44 | 3px | Yellow |
| GlobalHeader Inbox | 44x44 | 3px | Blue |
| Transport Overview | 48x48 | 2px | White |
| LineDetail Header | 52x52 | 2px | White |
| Line Card Header | 40x40 | 2px | White |
| Departure Item | 44x44 | 2px | Grey |
| Event Info Tile | 44x44 | 2px | White |
| Banner | 44x44 | 2px | - |

**Variation Count: 4 unique sizes (40, 44, 48, 52)**

---

## 8. CONFIRMATION PANEL (Success checkmark)

### ClickFix/Feedback Confirmation

| Property | Value |
|----------|-------|
| iconSize | 80x80 |
| borderRadius | 40px (circle) |
| backgroundColor | `colors.successAccent` |

**Variation Count: 1 (consistent)**

---

## 9. EMPTY STATE BLOCK

### Source: `components.events` tokens

| Property | Value |
|----------|-------|
| borderWidth | 2px |
| borderStyle | dotted |
| borderColor | `colors.borderMuted` |
| padding | 24px |

**Variation Count: 1 (consistent)**

---

## 10. META ROW (Icon + Text patterns)

### Variations

| Context | iconSize | gap | textStyle |
|---------|----------|-----|-----------|
| Event Detail | 24px | 12px | Meta |
| Contact Detail | 24px | 12px | Body |
| LineDetail | 24px | 8px | Meta |

**Variation Count: 2 gap sizes (8, 12)**

---

## SUMMARY TABLE

| Component | Variants | Token Coverage | Drift Level |
|-----------|----------|----------------|-------------|
| Badge | 8 color + 3 size | Full | LOW |
| Button | 3 | Full | LOW |
| Card | 5 | Full | LOW |
| GlobalHeader | 1 | 95% (44px hardcoded) | LOW |
| Transport Headers | 2 | Full | LOW |
| Tabs | 2 systems | Full | LOW |
| Icon Box | 4 sizes | Partial | MEDIUM |
| Divider | 2 patterns | Partial | LOW |
| Meta Row | 2 gap variations | Partial | LOW |

---

## CRITICAL FINDINGS

1. **Icon Box Size Fragmentation**: 4 different sizes (40, 44, 48, 52) without clear semantic naming
2. **GlobalHeader 44x44**: Only hardcoded size in header - should be tokenized
3. **Line Height Variations**: 18, 20, 22, 24 used inconsistently across screens
4. **Badge Border Radius**: Always 0 (sharp) - consistent with neobrut

---

## END OF PHASE 2 MATRIX
