# Group D: Cards/Rows Parity Report

**Date:** 2026-01-11
**Branch:** `chore/parity-cards-rows-groupD`
**Scope:** Enhance Card primitive with selection variant and migrate onboarding selection screens

## Pre-flight Evidence

```
=== Main HEAD (after Group C merge) ===
578826a Merge chore/parity-input-groupC: Input parity pass using Input primitive (Group C)

=== Group C commit present on main ===
f36b3e9 chore(mobile): input parity pass using Input primitive (groupC)
```

## Card Primitive Enhancement

**File:** `mobile/src/ui/Card.tsx`

### New Variant: `selection`

```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'outlined' | 'filled' | 'selection';  // NEW: selection
  backgroundColor?: string;
  accessibilityLabel?: string;  // NEW prop
  style?: ViewStyle;
}
```

### Selection Variant Styling

```typescript
selection: {
  backgroundColor: colors.backgroundSecondary,
  borderWidth: borders.widthThin,
  borderColor: colors.borderLight,
  borderRadius: borders.radiusCard,
}
```

**Features:**
- Matches onboarding selection card styling (backgroundSecondary + thin border + light border color)
- Pressable cards now have `accessibilityRole="button"` for better accessibility
- Added `accessibilityLabel` prop support

## Tokens Reused

All tokens already existed in `skin.neobrut2.ts`:
- `colors.backgroundSecondary` - card background
- `colors.borderLight` - subtle border color
- `borders.widthThin` - 2px border width
- `borders.radiusCard` - 8px border radius
- `components.card.padding` - default xl (20px) padding

**No new tokens were added.** The selection variant reuses existing tokens.

## Files Changed

| File | Change |
|------|--------|
| `mobile/src/ui/Card.tsx` | Added `selection` variant and `accessibilityLabel` prop |
| `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx` | Replaced TouchableOpacity with Card primitive |
| `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx` | Replaced TouchableOpacity with Card primitive |

## StyleSheet Cleanup

### UserModeSelectionScreen.tsx
Removed:
- `optionCard` style (backgroundColor, padding, borderRadius, borderWidth, borderColor)

### MunicipalitySelectionScreen.tsx
Simplified:
- `municipalityCard` style reduced to only padding override (`xxl` instead of default `xl`)

## Migration Pattern

```tsx
// Before
<TouchableOpacity
  style={styles.optionCard}
  onPress={handleSelect}
  accessibilityLabel="Visitor"
>
  <Icon name="globe" />
  <ButtonText>Option Title</ButtonText>
</TouchableOpacity>

// After
<Card
  variant="selection"
  onPress={handleSelect}
  accessibilityLabel="Visitor"
>
  <Icon name="globe" />
  <ButtonText>Option Title</ButtonText>
</Card>
```

## Verification Outputs

### Typecheck
```
Scope: all 4 projects
. typecheck$ pnpm --dir backend typecheck && pnpm --dir admin exec tsc -b --noEmit && pnpm --dir mobile exec tsc --noEmit
backend typecheck: Done
. typecheck: Done
```

### Design Guard
```
> node scripts/design-guard.mjs all
Design guard passed.
```

### Evidence Scan (no manual optionCard/municipalityCard styling)
```
# Verify TouchableOpacity removed from selection cards
grep -n 'TouchableOpacity' mobile/src/screens/onboarding/UserModeSelectionScreen.tsx
# Result: NO MATCHES - TouchableOpacity removed from imports and usage

grep -n 'Card' mobile/src/screens/onboarding/UserModeSelectionScreen.tsx
# Result: Card imported and used (2 Card components for visitor/local options)
```

## Scope Notes

### Migrated
- Onboarding selection cards (UserModeSelectionScreen, MunicipalitySelectionScreen)

### Not Migrated (and why)
1. **Transport option cards** (TransportHubScreen) - Already using Card primitive with custom content layout (icon + text + manual chevron). Complex multi-element layout doesn't benefit from further abstraction.

2. **Event list items** (EventsScreen) - Card-style rows with border/radius, not ListRow-style (borderBottom separator). Already well-structured with skin tokens.

3. **Menu overlay items** (MenuOverlay) - Different pattern: icon on LEFT + label, no chevron. ListRow primitive has chevron on RIGHT with borderBottom. Pattern mismatch.

4. **Contact rows** (LineDetailScreen) - Inline link pattern with icon on left, not a card or list row pattern.

5. **Date navigation arrows** (LineDetailScreen, EventsScreen) - Simple TouchableOpacity wrappers for icon clicks. Creating IconButton primitive for these would be over-engineering.

## Exceptions

None. All onboarding selection cards successfully migrated to Card primitive.
