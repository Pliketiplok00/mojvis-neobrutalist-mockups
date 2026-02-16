# Phase 5: Tokenization Gap Map

**Audit Date:** 2026-02-12
**Purpose:** Define token taxonomy to eliminate hardcoded values

---

## PROPOSED TOKEN ADDITIONS

### 1. SPACING TOKENS (Additions)

```typescript
const spacing = {
  // Existing
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Proposed additions
  micro: 2,     // Micro-adjustments, baseline alignment
  hairline: 1,  // Border-like spacing
} as const;
```

**Gap addressed:** 2px micro-adjustments currently hardcoded

---

### 2. ICON BOX SIZE TOKENS

```typescript
const iconBoxSizes = {
  // Semantic names based on usage
  compact: 32,     // Chevron boxes, small indicators
  default: 40,     // Line card headers
  standard: 44,    // Navigation header, departure items
  large: 48,       // Transport overview, onboarding
  xlarge: 52,      // LineDetail header
  xxlarge: 64,     // Municipality selection
} as const;
```

**Gap addressed:** 4 different icon box sizes currently without semantic naming

---

### 3. BORDER RADIUS TOKENS (Additions)

```typescript
const borders = {
  // Existing
  radiusSharp: 0,
  radiusSoft: 4,
  radiusCard: 0,
  radiusPill: 9999,

  // Proposed additions
  radiusMedium: 12,  // Photo tiles, selection cards
  radiusLarge: 20,   // Status badges
  radiusCircle: 40,  // Confirmation checkmarks (size-dependent)
} as const;
```

**Gap addressed:** 12px, 20px, 32px, 40px border radius hardcoded

---

### 4. LINE HEIGHT TOKENS

```typescript
const typography = {
  lineHeight: {
    // Existing (multipliers)
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,

    // Proposed additions (fixed values for specific use)
    fixed: {
      sm: 18,   // Small text blocks
      md: 20,   // Standard paragraphs
      lg: 22,   // Body text
      xl: 24,   // Large text, descriptions
    },
  },
} as const;
```

**Gap addressed:** 18, 20, 22, 24 line heights hardcoded inconsistently

---

### 5. SHADOW TOKENS (Additions)

```typescript
const shadows = {
  // Existing
  none: { ... },
  card: { ... },
  soft: { ... },
  menuItemBox: { ... },

  // Proposed additions
  offset: {
    small: 2,   // Subtle offset
    medium: 4,  // Standard card offset
    large: 6,   // Menu items
  },
} as const;
```

**Gap addressed:** Shadow offset values scattered in code

---

### 6. FIXED DIMENSION TOKENS

```typescript
const dimensions = {
  // Height tokens
  headerHeight: 64,
  eventCardHeight: 110,
  photoPreviewHeight: 120,
  mapPreviewHeight: 180,
  largeBlockHeight: 200,
  modalHeight: 216,

  // Width tokens
  timeBlockWidth: 72,
  photoPreviewWidth: 80,
  statusBadgeWidth: 120,
} as const;
```

**Gap addressed:** Fixed heights/widths hardcoded in components

---

### 7. OPACITY TOKENS

```typescript
const opacity = {
  hidden: 0,
  subtle: 0.6,
  muted: 0.7,
  soft: 0.8,
  strong: 0.9,
  full: 1,
} as const;
```

**Gap addressed:** 0, 0.6, 0.7, 0.8, 0.9 opacity values hardcoded

---

### 8. BADGE SYSTEM TOKENS (Additions)

```typescript
const components = {
  badge: {
    // Existing
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borders.radiusSharp,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    paddingHorizontalLarge: spacing.md,
    paddingVerticalLarge: spacing.xs,
    fontSizeLarge: typography.fontSize.sm,

    // Proposed additions
    stackGap: spacing.xs,  // Gap between stacked badges
    maxWidth: 120,         // Prevent badge overflow
  },
} as const;
```

---

### 9. BUTTON SYSTEM TOKENS (Complete)

```typescript
const components = {
  button: {
    // Existing tokens are complete
    // No additions needed
  },
} as const;
```

**Status:** Button system is fully tokenized

---

### 10. TAB COMPONENT TOKENS

```typescript
const components = {
  tab: {
    // Existing
    paddingVertical: 14, // Currently hardcoded, should be token
    fontSize: typography.fontSize.lg,
    inactiveColor: colors.textMuted,
    activeColor: colors.textPrimary,
    activeWeight: typography.fontWeight.semiBold,
    borderBottomWidth: borders.widthCard,
    borderBottomColor: colors.border,

    // Should be added to spacing
    // Replace 14 with new token
  },
} as const;
```

**Gap addressed:** Tab vertical padding (14px) is orphan value

---

## COMPLETE TOKEN TAXONOMY

### A. Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `spacing.hairline` | 1px | Border-like |
| `spacing.micro` | 2px | Micro-adjustments |
| `spacing.xs` | 4px | Tight |
| `spacing.sm` | 8px | Small |
| `spacing.md` | 12px | Medium |
| `spacing.lg` | 16px | Large |
| `spacing.xl` | 20px | Extra large |
| `spacing.xxl` | 24px | Section gaps |
| `spacing.xxxl` | 32px | Major sections |

### B. Borders

| Token | Value | Usage |
|-------|-------|-------|
| `borders.widthHairline` | 1px | Subtle lines |
| `borders.widthThin` | 2px | Icon boxes, dividers |
| `borders.widthCard` | 3px | Cards, headers |
| `borders.widthHeavy` | 4px | Navigation, emphasis |
| `borders.widthExtraHeavy` | 8px | Major dividers |

### C. Radius

| Token | Value | Usage |
|-------|-------|-------|
| `borders.radiusSharp` | 0px | Neobrutalist default |
| `borders.radiusSoft` | 4px | Small elements |
| `borders.radiusMedium` | 12px | Photos, cards |
| `borders.radiusLarge` | 20px | Large badges |
| `borders.radiusPill` | 9999px | Pills |

### D. Icon Box Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `sizes.iconBox.compact` | 32px | Chevrons |
| `sizes.iconBox.default` | 40px | Line cards |
| `sizes.iconBox.standard` | 44px | Headers |
| `sizes.iconBox.large` | 48px | Overview |
| `sizes.iconBox.xlarge` | 52px | Detail |
| `sizes.iconBox.xxlarge` | 64px | Onboarding |

### E. Typography

| Token | Value | Usage |
|-------|-------|-------|
| `typography.fontSize.xs` | 10px | Badges |
| `typography.fontSize.sm` | 12px | Meta |
| `typography.fontSize.md` | 14px | Labels |
| `typography.fontSize.lg` | 16px | Body |
| `typography.fontSize.xl` | 18px | H2 |
| `typography.fontSize.xxl` | 24px | H1 |
| `typography.fontSize.xxxl` | 28px | Hero |
| `typography.lineHeight.sm` | 18px | Compact |
| `typography.lineHeight.md` | 20px | Standard |
| `typography.lineHeight.lg` | 22px | Body |
| `typography.lineHeight.xl` | 24px | Large |

### F. Opacity

| Token | Value | Usage |
|-------|-------|-------|
| `opacity.hidden` | 0 | Hidden elements |
| `opacity.disabled` | 0.5 | Disabled state |
| `opacity.subtle` | 0.6 | Very muted |
| `opacity.muted` | 0.7 | Muted |
| `opacity.soft` | 0.8 | Soft |
| `opacity.strong` | 0.9 | Nearly full |

---

## MIGRATION IMPACT

| Category | Current Hardcoded | After Tokenization |
|----------|-------------------|-------------------|
| Spacing | ~50 | 0 |
| Border radius | ~12 | 0 |
| Font size | ~5 | 0 |
| Line height | ~30 | 0 |
| Icon box sizes | ~20 | 0 |
| Opacity | ~10 | 0 |

**Total hardcoded values eliminated: ~127**

---

## END OF PHASE 5 PROPOSAL
