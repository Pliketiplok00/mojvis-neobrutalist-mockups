# Border Radius Forensic Inventory

Generated: 2026-02-13

Scope: `mobile/src/**/*`

## Summary

| Metric | Value |
|--------|-------|
| Total non-zero radius occurrences | 37 |
| Unique non-zero values | 7 |

### Unique Values Found (sorted)

| Value | Source | Count |
|-------|--------|-------|
| 2 | `borders.radiusSmall - 2` | 1 |
| 4 | hardcoded / `radiusSoft` / `radiusSmall` / `spacing.xs` | 22 |
| 12 | hardcoded | 4 |
| 20 | hardcoded | 1 |
| 32 | hardcoded | 1 |
| 40 | hardcoded | 4 |
| 9999 | `radiusPill` | 5 |

### Token Definitions (skin.neobrut2.ts)

| Token | Value | Line |
|-------|-------|------|
| `borders.radiusSharp` | 0 | 67 |
| `borders.radiusSoft` | 4 | 68 |
| `borders.radiusCard` | 0 | 69 |
| `borders.radiusPill` | 9999 | 70 |
| `bordersToken.radiusSmall` | 4 (via radiusSoft) | 293 |
| `bordersToken.radiusLarge` | 0 (via radiusSharp) | 295 |
| `spacing.xs` | 4 | 76 |

---

## Detailed Inventory by Value

### Value: 2 (computed: `borders.radiusSmall - 2`)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/screens/dev/UiInventoryScreen.tsx` | 613 | `borderRadius: borders.radiusSmall - 2,` |

---

### Value: 4 (hardcoded literal)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/ui/Icon.tsx` | 280 | `borderRadius: 4,` |
| `mobile/src/ui/Screen.tsx` | 107 | `borderRadius: 4,` |

---

### Value: 4 (via `skin.borders.radiusSmall`)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/design-mirror/screens/MirrorHomeCompositeScreen.tsx` | 341 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorHomeCompositeScreen.tsx` | 374 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorHomeCompositeScreen.tsx` | 462 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorClickFixFormScreen.tsx` | 341 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactsListScreen.tsx` | 247 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactsListScreen.tsx` | 344 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactsListScreen.tsx` | 368 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactDetailScreen.tsx` | 332 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactDetailScreen.tsx` | 402 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactDetailScreen.tsx` | 438 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactDetailScreen.tsx` | 453 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorContactDetailScreen.tsx` | 466 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorInfoHubScreen.tsx` | 243 | `borderRadius: skin.borders.radiusSmall,` |
| `mobile/src/design-mirror/screens/MirrorInfoHubScreen.tsx` | 326 | `borderRadius: skin.borders.radiusSmall,` |

---

### Value: 4 (via `borders.radiusSmall` destructured)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/screens/dev/UiInventoryScreen.tsx` | 575 | `borderRadius: borders.radiusSmall,` |
| `mobile/src/screens/dev/UiInventoryScreen.tsx` | 604 | `borderRadius: borders.radiusSmall,` |
| `mobile/src/screens/dev/UiInventoryScreen.tsx` | 667 | `borderRadius: borders.radiusSmall,` |

---

### Value: 4 (via `skin.spacing.xs` - semantic mismatch)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/screens/pages/StaticPageScreen.tsx` | 771 | `borderRadius: skin.spacing.xs,` |
| `mobile/src/design-mirror/screens/MirrorStaticPageScreen.tsx` | 477 | `borderRadius: skin.spacing.xs,` |

---

### Value: 12 (hardcoded literal)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/components/common/PhotoSlotTile.tsx` | 122 | `borderRadius: 12,` |
| `mobile/src/design-mirror/screens/MirrorClickFixFormScreen.tsx` | 378 | `borderRadius: 12,` |
| `mobile/src/design-mirror/screens/MirrorUserModeSelectionScreen.tsx` | 154 | `borderRadius: 12,` |
| `mobile/src/design-mirror/screens/MirrorMunicipalitySelectionScreen.tsx` | 175 | `borderRadius: 12,` |

---

### Value: 20 (hardcoded literal)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | 332 | `borderRadius: 20,` |

---

### Value: 32 (hardcoded literal)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/design-mirror/screens/MirrorContactDetailScreen.tsx` | 382 | `borderRadius: 32,` |

---

### Value: 40 (hardcoded literal)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/design-mirror/screens/MirrorClickFixConfirmationScreen.tsx` | 111 | `borderRadius: 40,` |
| `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx` | 88 | `borderRadius: 40,` |
| `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx` | 88 | `borderRadius: 40,` |
| `mobile/src/design-mirror/screens/MirrorFeedbackConfirmationScreen.tsx` | 111 | `borderRadius: 40,` |

---

### Value: 9999 (via `skin.borders.radiusPill`)

| File | Line | Snippet |
|------|------|---------|
| `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx` | 231 | `borderRadius: skin.borders.radiusPill,` |
| `mobile/src/screens/feedback/FeedbackDetailScreen.tsx` | 162 | `borderRadius: skin.borders.radiusPill,` |
| `mobile/src/design-mirror/screens/MirrorFeedbackDetailScreen.tsx` | 145 | `borderRadius: skin.borders.radiusPill,` |
| `mobile/src/design-mirror/screens/MirrorClickFixDetailScreen.tsx` | 175 | `borderRadius: skin.borders.radiusPill,` |
| `mobile/src/ui/MicroPrimitives.tsx` | 172 | `borderRadius: skin.borders.radiusPill,` |

---

## Zero-Value Token References (compliant)

The following usages resolve to 0 and are already compliant with the sharp-corner rule:

| Token | Resolves To | Usage Count |
|-------|-------------|-------------|
| `skin.borders.radiusCard` | 0 | 37 |
| `skin.borders.radiusSharp` | 0 | 5 |
| `borders.radiusSharp` | 0 | 3 |
| `skin.components.events.card.borderRadius` | 0 | 4 |
| `skin.components.events.emptyStateBorderRadius` | 0 | 2 |
| `skin.components.events.detail.reminderCardRadius` | 0 | 4 |

---

## Notes

1. **Semantic mismatch**: `skin.spacing.xs` (a spacing token) is used as borderRadius in 2 places. This should use a border token instead.

2. **Pill radius (9999)**: Used for status badges and pills. Decision needed: keep pill shape or make square.

3. **radiusSmall token**: Defined as `borders.radiusSoft` (4). If all radii go to 0, this token definition should change.

4. **Hardcoded values**: 12 occurrences use literal numbers instead of tokens - these should be tokenized regardless of final value.
