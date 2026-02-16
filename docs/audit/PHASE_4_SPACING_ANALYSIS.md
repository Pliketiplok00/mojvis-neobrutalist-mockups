# Phase 4: Spacing Grid Extraction

**Audit Date:** 2026-02-12
**Scope:** All spacing values in mobile/src

---

## DEFINED SPACING TOKENS (skin.neobrut2.ts)

| Token | Value | Base Multiple |
|-------|-------|---------------|
| `xs` | 4px | 1x |
| `sm` | 8px | 2x |
| `md` | 12px | 3x |
| `lg` | 16px | 4x |
| `xl` | 20px | 5x |
| `xxl` | 24px | 6x |
| `xxxl` | 32px | 8x |

**Base Grid: 4px**

---

## SPACING TOKEN USAGE (from grep)

| Token | Approximate Occurrences |
|-------|------------------------|
| `spacing.xs` | ~150 |
| `spacing.sm` | ~200 |
| `spacing.md` | ~250 |
| `spacing.lg` | ~200 |
| `spacing.xl` | ~80 |
| `spacing.xxl` | ~50 |
| `spacing.xxxl` | ~40 |

**Total tokenized spacing usages: ~970**

---

## HARDCODED SPACING VALUES FOUND

### Padding Values

| Value | Count | On Grid? | Files |
|-------|-------|----------|-------|
| `0` | 11 | Yes | Multiple transport/home screens |
| `2` | 7 | No (0.5x) | StaticPageScreen, FloraScreen, FaunaScreen |
| `6` | 1 | No (1.5x) | Screen.tsx |
| `8` | 1 | Yes (2x) | Screen.tsx |
| `14` | 1 | No (3.5x) | skin.neobrut2.ts (tab token) |

### Margin Values

| Value | Count | On Grid? | Files |
|-------|-------|----------|-------|
| `2` | 3 | No (0.5x) | StaticPageScreen, UiInventoryScreen, MirrorStaticPageScreen |
| `4` | 2 | Yes (1x) | FloraScreen, FaunaScreen |
| `6` | 3 | No (1.5x) | FloraScreen, FaunaScreen, skin.neobrut2.ts |

### Gap Values

| Value | Count | On Grid? | Files |
|-------|-------|----------|-------|
| `0` | 2 | Yes | StaticBannerList, Banner |

---

## OFF-GRID VALUES ANALYSIS

### 2px Usage
- `paddingVertical: 2` - badge padding, fine-tuning
- `marginTop: 2` - micro-adjustment for text alignment
- `paddingTop: 2` - baseline alignment

**Purpose:** Micro-adjustments below 4px base grid

### 6px Usage
- `paddingVertical: 6` - Screen.tsx TEST MODE badge
- `marginTop: 6` - bullet alignment with text baseline

**Purpose:** 1.5x base for special alignment cases

### 14px Usage
- `paddingVertical: 14` - Tab component

**Purpose:** Specific vertical rhythm for tabs (not 12px or 16px)

---

## SIZE/DIMENSION VALUES (Non-Spacing)

### Icon Box Sizes

| Value | Grid Multiple | Usage |
|-------|---------------|-------|
| 20px | 5x | Badge minSize |
| 24px | 6x | Icon default, PhotoSlot |
| 32px | 8x | Chevron box, indicators |
| 36px | 9x | Line card chevron |
| 40px | 10x | Line card icon box |
| 44px | 11x | Header icon boxes |
| 48px | 12x | Overview/Onboarding icon boxes |
| 52px | 13x | LineDetail icon box |
| 64px | 16x | Header height, municipality icon |
| 72px | 18x | Time block width, thumbnail |
| 80px | 20x | Confirmation checkmark |
| 120px | 30x | Photo preview |

**Observation:** Not all sizes follow 8px sub-grid (36, 44, 52, 72)

### Fixed Heights

| Value | Usage |
|-------|-------|
| 64px | GlobalHeader height |
| 110px | Home event card height |
| 120px | Photo preview |
| 180px | Map preview |
| 200px | Large content blocks |
| 216px | LineDetail modal |

---

## GRID COMPLIANCE ANALYSIS

### Values on 4px Grid

| Value | Percentage of Total |
|-------|-------------------|
| 0 | Common |
| 4 | Common |
| 8 | Common |
| 12 | Common |
| 16 | Common |
| 20 | Common |
| 24 | Common |
| 32 | Common |

### Values OFF 4px Grid

| Value | Count | Category |
|-------|-------|----------|
| 2px | 13 | Micro-adjustment |
| 6px | 5 | Special alignment |
| 14px | 1 | Tab vertical |
| 36px | 3 | Chevron box |
| 44px | 10+ | Icon boxes |
| 52px | 2 | LineDetail icon |
| 72px | 4 | Time block |
| 110px | 1 | Event card |

**Off-grid percentage:** ~15% of unique values

---

## SPACING PATTERN SUMMARY

### Consistent Patterns

1. **Screen padding:** `spacing.lg` (16px) - universal
2. **Section margin:** `spacing.xxl` (24px) or `spacing.xxxl` (32px)
3. **Card padding:** `spacing.xl` (20px) - from token
4. **Badge padding:** `spacing.sm` (8px) horizontal, 2px vertical
5. **Row gaps:** `spacing.md` (12px) or `spacing.lg` (16px)

### Inconsistent Patterns

1. **Icon box sizes:** 40/44/48/52 - no clear progression
2. **Line heights:** 18/20/22/24 - not standardized
3. **Tab padding:** 14px vertical - unique value
4. **Micro-adjustments:** 2px/6px scattered for alignment

---

## GRID SYSTEM ASSESSMENT

| Aspect | Status |
|--------|--------|
| Base grid defined | Yes (4px) |
| Token system complete | Yes (7 tokens) |
| Token adoption rate | ~95% |
| Off-grid exceptions | ~15% of unique values |
| Semantic naming | Yes (xs/sm/md/lg/xl/xxl/xxxl) |
| 8px sub-grid | Partially followed |

---

## CONCLUSION

**The spacing system is fundamentally sound with a 4px base grid.**

Issues:
1. Icon box sizes don't follow a clear progression
2. Some micro-adjustments (2px) could be tokenized as `spacing.micro` or `spacing.hairline`
3. Line height values need standardization
4. Tab vertical padding (14px) is an orphan value

---

## END OF PHASE 4 ANALYSIS
