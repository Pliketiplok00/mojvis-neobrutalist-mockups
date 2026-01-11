# Group C: Input Parity Report

**Date:** 2026-01-11
**Branch:** `chore/parity-input-groupC`
**Scope:** Create Input primitive and migrate form screens

## Pre-flight Evidence

```
=== Main HEAD (after Group B merge) ===
339cf20 Merge chore/parity-cta-groupB: CTA parity pass using Button primitive (Group B)

=== Group B commit present on main ===
23317ed chore(mobile): CTA parity pass using Button primitive (groupB)
```

## Input Primitive API

**File:** `mobile/src/ui/Input.tsx`

```typescript
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;           // Changes border to error color
  disabled?: boolean;        // Disables input and reduces opacity
  multiline?: boolean;       // Enables multiline mode
  numberOfLines?: number;    // Default lines for multiline (default: 4)
  height?: number;           // Fixed height for multiline (overrides numberOfLines)
  maxLength?: number;        // Character limit
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<TextStyle>;
}
```

**Features:**
- Focus state: border changes to `focusOutline` color
- Error state: border changes to `errorText` color
- Disabled state: reduced opacity, non-editable
- Multiline: automatic height calculation or fixed height
- Font family: uses app body font (`Space Mono`)

## Tokens Added/Reused

### New Tokens Added to `skin.neobrut2.ts`

**Colors:**
```typescript
focusOutline: palette.primary  // Deep sea blue for focus state
```

**Component Tokens:**
```typescript
input: {
  backgroundColor: colors.background,
  borderWidth: bordersToken.widthThin,
  borderColor: colors.border,
  borderColorFocus: colors.focusOutline,  // NEW
  borderColorError: colors.errorText,
  borderRadius: bordersToken.radiusCard,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  fontSize: typography.fontSize.lg,
  textColor: colors.textPrimary,
  placeholderColor: colors.textDisabled,
  disabledOpacity: 0.5,
}
```

### Reused Existing Tokens
- `colors.background` - input background
- `colors.border` - default border color
- `colors.errorText` - error border color
- `colors.textPrimary` - text color
- `colors.textDisabled` - placeholder color
- `borders.widthThin` - border width
- `borders.radiusCard` - border radius
- `spacing.lg`, `spacing.md` - padding
- `typography.fontSize.lg` - text size
- `typography.fontFamily.body.regular` - font family

**Rationale:** Reused existing tokens wherever possible. Only added `focusOutline` (for focus state) and `components.input` (for encapsulated input styling). This keeps the token namespace clean and consistent.

## Files Changed

| File | Change |
|------|--------|
| `mobile/src/ui/Input.tsx` | NEW - Input primitive |
| `mobile/src/ui/skin.neobrut2.ts` | Added `focusOutline` color and `components.input` tokens |
| `mobile/src/screens/feedback/FeedbackFormScreen.tsx` | Replaced TextInput with Input primitive |
| `mobile/src/screens/click-fix/ClickFixFormScreen.tsx` | Replaced TextInput with Input primitive |

## StyleSheet Cleanup

Removed from migrated files:
- `input` style (border, padding, fontSize, color, backgroundColor)
- `inputError` style (borderColor)
- `textArea` style (height, textAlignVertical)

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

### Evidence Scan (no TextInput in migrated screens)
```
rg -n '\bTextInput\b' mobile/src/screens/feedback/FeedbackFormScreen.tsx mobile/src/screens/click-fix/ClickFixFormScreen.tsx
NO MATCHES - All TextInput usages removed from form screens
```

## Migration Pattern

```tsx
// Before
<TextInput
  style={[styles.input, errors.subject && styles.inputError]}
  value={subject}
  onChangeText={setSubject}
  placeholder={t('feedback.subjectPlaceholder')}
  placeholderTextColor={skin.colors.textDisabled}
  maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
  editable={!isSubmitting}
/>

// After
<Input
  value={subject}
  onChangeText={setSubject}
  placeholder={t('feedback.subjectPlaceholder')}
  maxLength={VALIDATION_LIMITS.SUBJECT_MAX_LENGTH}
  disabled={isSubmitting}
  error={!!errors.subject}
  accessibilityLabel={t('feedback.subject')}
/>
```

## Notes

- Input primitive handles all styling internally via skin tokens
- No per-screen styling required for borders/colors/radius/placeholder
- Focus state provides visual feedback when input is active
- Multiline mode supports both fixed height and numberOfLines-based calculation
- Font family uses app body font (Space Mono) for consistency

## Exceptions

None.
