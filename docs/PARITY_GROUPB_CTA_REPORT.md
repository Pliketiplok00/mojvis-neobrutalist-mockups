# Group B: CTA/Button Parity Report

**Date:** 2026-01-11
**Branch:** `chore/parity-cta-groupB`
**Scope:** Replace raw TouchableOpacity/Pressable CTAs with Button primitive

## Summary

Unified all primary/secondary/danger CTA buttons across the mobile app to use the `Button` primitive from `mobile/src/ui/Button.tsx`.

## Button Primitive Enhancements

### Added `danger` variant
- **skin.neobrut2.ts**: Added `components.button.danger` tokens
- **Button.tsx**: Updated to support `variant?: 'primary' | 'secondary' | 'danger'`
- **Button.tsx**: Added `accessibilityLabel` and `accessibilityRole="button"` props

## Files Migrated

### Priority Screens

| File | Changes |
|------|---------|
| `ClickFixConfirmationScreen.tsx` | Replaced 2 CTAs (primary + secondary) with Button |
| `FeedbackConfirmationScreen.tsx` | Replaced 2 CTAs (primary + secondary) with Button |
| `FeedbackFormScreen.tsx` | Replaced submit button with Button (loading state) |
| `ClickFixFormScreen.tsx` | Replaced submit + location buttons with Button |
| `SettingsScreen.tsx` | Replaced danger button with `Button variant="danger"` |
| `StaticPageScreen.tsx` | Replaced retry button with Button |
| `EventDetailScreen.tsx` | Replaced share button with `Button variant="secondary"` |
| `LanguageSelectionScreen.tsx` | Replaced 2 language CTAs with Button |

### Not Migrated (by design)

| Pattern | Reason |
|---------|--------|
| Icon-only buttons (removePhotoButton) | Not text CTAs |
| Dashed border buttons (addPhotoButton) | Specialized styling |
| Date navigation arrows | Navigation controls, not CTAs |
| Direction toggles | Toggle buttons with active states |
| Menu navigation items | Navigation list rows, not CTAs |
| Contact links (phone/email/web) | Inline links for external apps |
| Calendar controls | Specialized UI pattern |
| Event list items | List navigation rows |
| Selection cards (onboarding) | Group D - cards, not CTAs |

## StyleSheet Cleanup

Removed redundant button styles from migrated files:
- `primaryButton`, `primaryButtonText`
- `secondaryButton`, `secondaryButtonText`
- `dangerButton`, `dangerButtonText`
- `languageButton`, `languageButtonText`
- `submitButton` (kept only margin)
- `retryButton`, `retryText`
- `shareButton` (kept only margin)

## Verification

```
pnpm -r typecheck    # PASS
pnpm design:guard    # PASS
```

## Pattern Applied

```tsx
// Before
<TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
  <ButtonText style={styles.primaryButtonText}>Submit</ButtonText>
</TouchableOpacity>

// After
<Button variant="primary" onPress={handleSubmit} loading={isSubmitting}>
  Submit
</Button>
```

## Notes

- Button primitive now has full accessibility support (`accessibilityLabel`, `accessibilityRole`)
- Loading state handled via `loading` prop (no manual ActivityIndicator)
- All button styling comes from skin tokens via Button primitive
