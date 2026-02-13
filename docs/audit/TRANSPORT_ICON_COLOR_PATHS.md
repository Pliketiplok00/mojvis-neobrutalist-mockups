# Transport Icon Color Paths Audit

**Date**: 2026-02-14
**Issue**: Transport header icons are sometimes not white as required.

---

## Skin Color Tokens Reference

| Token | Value | Use Case |
|-------|-------|----------|
| `textPrimary` | `#141414` (black) | Text/icons on WHITE backgrounds |
| `primaryText` | `white` | Text/icons on COLORED backgrounds |

**Rule**: Icons on colored header slabs MUST use `primaryText` (white), NOT `textPrimary` (black).

---

## 1. Sea Transport Overview Header

**File**: `mobile/src/screens/transport/SeaTransportScreen.tsx`

| Property | Value |
|----------|-------|
| Line | 189-191 |
| Component | `<Icon name="ship" size="lg" colorToken="textPrimary" />` |
| Background | `overviewHeader.background` (teal: `#3AB6A6`) |
| Current color | `textPrimary` (BLACK) |
| Expected color | `primaryText` (WHITE) |
| **Status** | **WRONG** |

```tsx
// Line 189-191
<View style={styles.headerIconBox}>
  <Icon name="ship" size="lg" colorToken="textPrimary" />
</View>
```

---

## 2. Road Transport Overview Header

**File**: `mobile/src/screens/transport/RoadTransportScreen.tsx`

| Property | Value |
|----------|-------|
| Line | 173-175 |
| Component | `<Icon name="bus" size="lg" colorToken="textPrimary" />` |
| Background | `overviewHeader.background` (teal: `#3AB6A6`) |
| Current color | `textPrimary` (BLACK) |
| Expected color | `primaryText` (WHITE) |
| **Status** | **WRONG** |

```tsx
// Line 173-175
<View style={styles.headerIconBox}>
  <Icon name="bus" size="lg" colorToken="textPrimary" />
</View>
```

---

## 3. Sea Line Card Header Icons

**File**: `mobile/src/screens/transport/SeaTransportScreen.tsx`

| Property | Value |
|----------|-------|
| Line | 237-242 |
| Component | `<Icon name={getSeaTypeIcon(line.subtype)} size="md" colorToken="textPrimary" />` |
| Background | `getSeaHeaderBackground()` (teal: `#3AB6A6`) |
| Current color | `textPrimary` (BLACK) |
| Expected color | `primaryText` (WHITE) |
| **Status** | **WRONG** |

```tsx
// Line 237-242
<View style={styles.lineCardHeaderIconBox}>
  <Icon
    name={getSeaTypeIcon(line.subtype)}
    size="md"
    colorToken="textPrimary"
  />
</View>
```

---

## 4. Road Line Card Header Icons

**File**: `mobile/src/screens/transport/RoadTransportScreen.tsx`

| Property | Value |
|----------|-------|
| Line | 220-225 |
| Component | `<Icon name={getRoadTypeIcon(line.subtype)} size="md" colorToken="textPrimary" />` |
| Background | `listTokens.lineCardHeaderBackgroundBus` (green) |
| Current color | `textPrimary` (BLACK) |
| Expected color | `primaryText` (WHITE) |
| **Status** | **WRONG** |

```tsx
// Line 220-225
<View style={styles.lineCardHeaderIconBox}>
  <Icon
    name={getRoadTypeIcon(line.subtype)}
    size="md"
    colorToken="textPrimary"
  />
</View>
```

---

## 5. Line Detail Header Icon

**File**: `mobile/src/screens/transport/LineDetailScreen.tsx`

| Property | Value |
|----------|-------|
| Line | 267-273 |
| Component | `<Icon name={...} size="lg" colorToken="textPrimary" />` |
| Background | `headerBackground` (varies by transport type) |
| Current color | `textPrimary` (BLACK) |
| Expected color | `primaryText` (WHITE) |
| **Status** | **WRONG** |

```tsx
// Line 267-273
<View style={styles.headerIconBox}>
  <Icon
    name={transportType === 'sea' ? 'ship' : 'bus'}
    size="lg"
    colorToken="textPrimary"
  />
</View>
```

---

## Summary

| Location | File | Line | Current | Expected | Status |
|----------|------|------|---------|----------|--------|
| Sea overview header | SeaTransportScreen.tsx | 190 | `textPrimary` | `primaryText` | WRONG |
| Road overview header | RoadTransportScreen.tsx | 174 | `textPrimary` | `primaryText` | WRONG |
| Sea line card header | SeaTransportScreen.tsx | 241 | `textPrimary` | `primaryText` | WRONG |
| Road line card header | RoadTransportScreen.tsx | 224 | `textPrimary` | `primaryText` | WRONG |
| Line detail header | LineDetailScreen.tsx | 271 | `textPrimary` | `primaryText` | WRONG |

**Total: 5 icon render sites using wrong color token.**

---

## Recommended Fix (NOT implemented yet)

Change all 5 occurrences from:
```tsx
colorToken="textPrimary"
```

To:
```tsx
colorToken="primaryText"
```

This will make icons white on colored header backgrounds.

---

## Note on Skin Token Naming

The token names are potentially confusing:
- `textPrimary` = primary text color = BLACK (for white backgrounds)
- `primaryText` = text on primary/colored surfaces = WHITE

Consider renaming in future for clarity:
- `textOnLight` or `textDefault` = black
- `textOnColored` or `textInverse` = white
