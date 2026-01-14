# Header & Menu Skin-Pure Restore Report

## Summary

Restored `GlobalHeader.tsx` and `MenuOverlay.tsx` to be fully skin-pure by removing all emoji icons and hardcoded hex colors.

## Branch

- **Branch:** `fix/mobile-header-menu-skin-pure`
- **Based on:** `feat/mobile-skin-inbox-screens-phase4a` (commit `776b1ba`)

## Changes Made

### GlobalHeader.tsx

**Emoji Icons Replaced:**
| Before | After |
|--------|-------|
| `☰` (hamburger) | `<Icon name="menu" />` |
| `📥` (inbox) | `<Icon name="inbox" />` |

**Hex Colors Replaced:**
| Before | After (Skin Token) |
|--------|---------------------|
| `#FFFFFF` | `skin.colors.backgroundTertiary` |
| `#E0E0E0` | `skin.colors.borderLight` |
| `#000000` | `skin.colors.textPrimary` |
| `#FF0000` (badge) | `skin.colors.urgent` |
| `#FFFFFF` (badge text) | `skin.colors.urgentText` |

**Typography Tokens Added:**
- Title now uses `skin.typography.fontFamily.display.bold`
- Font sizes from `skin.typography.fontSize`
- Font weights from `skin.typography.fontWeight`

### MenuOverlay.tsx

**Emoji Icons Replaced:**
| Before | After |
|--------|-------|
| `🏠` | `home` |
| `📅` | `calendar` |
| `🚌` | `bus` |
| `🌿` | `leaf` |
| `ℹ️` | `info` |
| `🔧` | `wrench` |
| `💬` | `message-circle` |
| `📞` | `phone` |
| `📄` | `file-text` |

**MenuItem Type Updated:**
```typescript
// Before
icon: string;

// After
icon: IconName;
```

**Hex Colors Replaced:**
| Before | After (Skin Token) |
|--------|---------------------|
| `rgba(0, 0, 0, 0.5)` | `skin.colors.overlay` |
| `#FFFFFF` | `skin.colors.backgroundTertiary` |
| `#000` (shadow) | `skin.shadows.soft` (full shadow token) |
| `#E0E0E0` | `skin.colors.borderLight` |
| `#000000` | `skin.colors.textPrimary` |
| `#666666` | `skin.colors.textMuted` |
| `#F0F0F0` | `skin.colors.backgroundSecondary` |
| `#999999` | `skin.colors.textMuted` |

**Typography Tokens Added:**
- Header title uses `skin.typography.fontFamily.display.bold`
- Menu labels use `skin.typography.fontFamily.body`
- All font sizes from `skin.typography.fontSize`
- All font weights from `skin.typography.fontWeight`

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript | PASS (no errors) |
| ESLint | PASS (no warnings) |
| Emoji Scan | PASS (no emoji found) |
| Hex Color Scan | PASS (no hardcoded colors) |

## Files Modified

1. `mobile/src/components/GlobalHeader.tsx`
2. `mobile/src/components/MenuOverlay.tsx`

## Icon Primitive Used

Both components now use the `<Icon />` primitive from `mobile/src/ui/Icon.tsx`, which:
- Uses `lucide-react-native` icons
- Accepts skin-controlled size and color tokens
- Provides consistent icon rendering across the app

## Next Steps

1. Merge this branch after verification
2. Test on physical device to confirm visual appearance
3. Ensure all other screens using emoji icons follow the same pattern
