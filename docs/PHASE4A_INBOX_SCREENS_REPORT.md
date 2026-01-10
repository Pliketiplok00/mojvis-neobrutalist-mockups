# Phase 4A: Inbox Screens Skin Migration Report

## Summary

Migrated `InboxListScreen` and `InboxDetailScreen` to be 100% skin-adopted using UI primitives from `src/ui/`.

## Branch

`feat/mobile-skin-inbox-screens-phase4a`

## Files Modified

### 1. `mobile/src/ui/Icon.tsx`
- Added new icon imports: `AlertTriangle`, `Send`, `MailOpen`, `Camera`
- Added new icon names to `IconName` type: `'mail-open'`, `'alert-triangle'`, `'send'`, `'camera'`
- Updated `ICON_MAP` with new icon mappings

### 2. `mobile/src/screens/inbox/InboxListScreen.tsx`
**Before:**
- Emoji icons: `📭` (empty mailbox), `📤` (sent), `⚠️` (error)
- Text chevron: `>`
- Hardcoded `gap: 6`
- Hardcoded `marginBottom: 2`

**After:**
- Replaced emoji icons with `Icon` primitive
- Replaced text chevron with `<Icon name="chevron-right" size="sm" colorToken="chevron" />`
- Changed `gap: 6` to `gap: skin.spacing.sm`
- Changed `marginBottom: 2` to `marginBottom: skin.spacing.xs`
- Added `Icon` to UI primitive imports
- Removed unused `chevron`, `emptyIcon`, `errorIcon` styles
- Added `emptyIconContainer`, `errorIconContainer` styles

### 3. `mobile/src/screens/inbox/InboxDetailScreen.tsx`
**Before:**
- Used `GlobalHeader` instead of `Header` primitive
- Raw `Text` components instead of `H1`, `Body`, `Meta` primitives
- Manual View-based urgent badge instead of `Badge` primitive
- Manual View-based tag badges instead of `Badge` primitive
- `TouchableOpacity` retry button instead of `Button` primitive
- Emoji icon: `⚠️` (error)
- Many hardcoded values:
  - Colors: `#FFFFFF`, `#000000`, `#666666`, `#333333`, `#999999`, `#DC3545`, `#F0F0F0`
  - Spacing: `16`, `32`, `12`, `24`, `8`, `4`, `10`
  - Font sizes: `14`, `16`, `24`, `12`
  - Border radius: `8`, `4`
  - Font weights: `'600'`, `'bold'`

**After:**
- Uses `Header` primitive from `../../ui`
- Uses `H1`, `Body`, `Meta` text primitives
- Uses `Badge variant="urgent"` for urgent state
- Uses `Badge` with skin colors for tags
- Uses `Button` primitive for retry action
- Uses `Icon name="alert-triangle"` for error state
- All styles use skin tokens:
  - `skin.colors.background`
  - `skin.colors.textPrimary`
  - `skin.colors.textMuted`
  - `skin.colors.backgroundSecondary`
  - `skin.spacing.lg`, `.md`, `.sm`, `.xs`, `.xxl`, `.xxxl`
  - `skin.typography.fontSize.lg`
  - `skin.typography.lineHeight.relaxed`

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript | PASS |
| ESLint | PASS (3 pre-existing warnings about useCallback deps) |
| Hex colors in inbox screens | 0 found |
| Direct lucide imports | 0 found |
| Emoji icons | 0 found |

## New Icons Added

| Icon Name | Lucide Component | Usage |
|-----------|------------------|-------|
| `mail-open` | `MailOpen` | Available for future use |
| `alert-triangle` | `AlertTriangle` | Error states in inbox screens |
| `send` | `Send` | Sent items empty state |
| `camera` | `Camera` | Available for future use |

## UI Primitives Used

- `skin` - Design tokens
- `Header` - Screen header
- `Button` - Actions
- `Badge` - Status indicators (urgent, type, custom colors)
- `ListRow` - Message list items
- `H1`, `H2` - Headings
- `Body` - Body text
- `Meta` - Metadata/dates
- `Icon` - All icons (chevrons, status icons, empty state icons)

## Migration Pattern

```tsx
// Before (hardcoded)
<Text style={styles.errorIcon}>⚠️</Text>

// After (skin-adopted)
<View style={styles.errorIconContainer}>
  <Icon name="alert-triangle" size="xl" colorToken="errorText" />
</View>
```

```tsx
// Before (hardcoded)
<Text style={styles.chevron}>{'>'}</Text>

// After (skin-adopted)
<Icon name="chevron-right" size="sm" colorToken="chevron" />
```

```tsx
// Before (hardcoded)
backgroundColor: '#DC3545',

// After (skin-adopted)
<Badge variant="urgent">...</Badge>
```

## Next Steps

- Phase 4B: FeedbackScreen and FeedbackFormScreen migration
- Phase 4C: ClickFixFormScreen and ClickFixDetailScreen migration
