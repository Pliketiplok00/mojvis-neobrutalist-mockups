# Icon Stroke Consistency Audit

**Date**: 2026-02-13
**Scope**: `mobile/src/**` (excluding `design-mirror/` and `screens/dev/`)
**Status**: Investigation complete - NO CODE CHANGES MADE

---

## 1. Libraries Used

| Library | Location | Style |
|---------|----------|-------|
| lucide-react-native | `ui/Icon.tsx` only | Outline (stroke-based) |

**Finding**: Single library used. All icon imports go through the canonical `Icon` component wrapper.

---

## 2. StrokeWidth Findings

### Defined Tokens (skin.neobrut2.ts:161-165)

```typescript
strokeWidth: {
  light: 1.5,
  regular: 2,    // DEFAULT
  strong: 2.5,
}
```

### Default Behavior (ui/Icon.tsx:252)

```typescript
stroke = 'regular'  // default prop value
```

### Explicit Stroke Overrides in Real App

| File | Line | Icon | Stroke Value |
|------|------|------|--------------|
| `components/Banner.tsx` | 72 | shield-alert | `strong` (2.5) |
| `screens/home/HomeScreen.tsx` | 205 | category icons | `strong` (2.5) |
| `screens/home/HomeScreen.tsx` | 291 | message-circle | `strong` (2.5) |
| `screens/flora/FloraScreen.tsx` | 103 | alert-triangle | `strong` (2.5) |
| `screens/fauna/FaunaScreen.tsx` | 103 | alert-triangle | `strong` (2.5) |
| `ui/ListRow.tsx` | 45 | chevron-right | `regular` (2) |

**All other icons**: Use default `regular` (2) strokeWidth.

---

## 3. Filled vs Outline Findings

| Check | Result |
|-------|--------|
| Icons with `fill=` | **None** |
| Icons without stroke | **None** |
| Filled icon variants imported | **None** |
| `fill="currentColor"` usage | **None** |

**Finding**: All icons are outline style. No filled variants in use.

---

## 4. Scaling Analysis

### StrokeWidth Scaling Behavior

**CRITICAL FINDING**: StrokeWidth is CONSTANT across all sizes.

The `Icon` component uses a fixed `strokeWidth` value regardless of icon size:

```typescript
// ui/Icon.tsx:261
const strokeWidth = skin.icons.strokeWidth[stroke];  // Fixed value
```

### Stroke-to-Size Ratio Table

| Size | Pixels | Stroke (regular) | Ratio | Visual Weight |
|------|--------|------------------|-------|---------------|
| sm | 24 | 2 | **8.33%** | Heaviest |
| md | 32 | 2 | 6.25% | Heavy |
| lg | 48 | 2 | 4.17% | Medium |
| xl | 64 | 2 | 3.13% | Light |
| xxl | 80 | 2 | **2.50%** | Lightest |

**Visual Impact**: Smaller icons (sm, md) appear significantly BOLDER than larger icons (xl, xxl) because the stroke occupies a higher percentage of the icon's area.

---

## 5. Wrapper Bypass List

| Component | Bypasses Icon Wrapper? |
|-----------|----------------------|
| All real app files | **No** |

**Finding**: No bypasses detected. All icon usage goes through `ui/Icon.tsx`.

Only `ui/Icon.tsx` imports from `lucide-react-native` directly.

---

## 6. Conclusion

### Root Cause Hypothesis

**Primary (90% confidence)**: Constant strokeWidth causes visual inconsistency.

The fixed `strokeWidth: 2` creates a **3.3x ratio difference** between the smallest (sm: 8.33%) and largest (xxl: 2.5%) icons. This makes small icons appear visually heavier/bolder than large icons.

**Secondary (10% confidence)**: Inconsistent stroke prop usage.

Some icons explicitly use `stroke="strong"` (2.5) while most use default `stroke="regular"` (2). This creates intentional differentiation for emphasis but may contribute to perceived inconsistency if not systematically applied.

### Recommended Fix Strategy (NOT IMPLEMENTED)

**Option A: Proportional StrokeWidth (Recommended)**

Scale strokeWidth proportionally to icon size:

```typescript
// Proposed calculation
const proportionalStroke = baseStroke * (iconSize / referenceSize);
```

Example with `referenceSize = 32` and `baseStroke = 2`:
- sm (24): 2 * (24/32) = 1.5
- md (32): 2 * (32/32) = 2.0 (reference)
- lg (48): 2 * (48/32) = 3.0
- xl (64): 2 * (64/32) = 4.0
- xxl (80): 2 * (80/32) = 5.0

**Option B: Size-Specific StrokeWidth Tokens**

Define explicit strokeWidth per size in skin:

```typescript
strokeWidth: {
  sm: { light: 1.25, regular: 1.5, strong: 2 },
  md: { light: 1.5, regular: 2, strong: 2.5 },
  lg: { light: 2, regular: 2.5, strong: 3 },
  // etc.
}
```

**Option C: Accept Current Behavior**

Document that smaller icons intentionally appear bolder for legibility at small sizes. No code change.

---

## Summary Table

| Aspect | Finding |
|--------|---------|
| Library count | 1 (lucide-react-native) |
| Bypass count | 0 |
| StrokeWidth tokens | 3 (1.5, 2, 2.5) |
| Default stroke | `regular` (2) |
| Icons with explicit stroke | 6 files |
| Filled icons | 0 |
| StrokeWidth scales? | **NO** (constant) |
| Root cause | Constant stroke creates visual weight mismatch |
