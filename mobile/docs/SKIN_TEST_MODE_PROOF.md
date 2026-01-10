# SKIN_TEST_MODE Visual Proof Report

**Date**: 2026-01-09
**Purpose**: Verify the mobile UI skin system is actually applied

---

## 1. Test Mode Configuration

**File**: `mobile/src/ui/skin.ts`

```typescript
export const SKIN_TEST_MODE = true;
```

When `SKIN_TEST_MODE = true`:
- Background: `#39FF14` (neon green)
- Cards/Secondary backgrounds: `#FF2D95` (hot pink)
- Button text on primary: `#39FF14` (neon green)
- Border widths: 3px thin, 6px card (normally 1px/2px)

---

## 2. What Changes When Test Mode is Enabled

| Token | Normal Value | Test Mode Value |
|-------|--------------|-----------------|
| `colors.background` | `#FFFFFF` | `#39FF14` |
| `colors.backgroundSecondary` | `#F5F5F5` | `#FF2D95` |
| `colors.backgroundTertiary` | `#F0F0F0` | `#FF2D95` |
| `colors.backgroundUnread` | `#F8F9FA` | `#FFFF00` |
| `colors.primaryText` | `#FFFFFF` | `#39FF14` |
| `colors.borderLight` | `#F0F0F0` | `#000000` |
| `borders.widthThin` | `1` | `3` |
| `borders.widthCard` | `2` | `6` |
| `components.card.backgroundColor` | `#FFFFFF` | `#FF2D95` |

---

## 3. TEST MODE Watermark

**File**: `mobile/src/ui/Screen.tsx`

When `SKIN_TEST_MODE = true`, any screen using the `Screen` primitive displays a watermark:
- Position: Absolute, top-right corner
- Text: "TEST MODE"
- Background: Black (`#000000`)
- Text color: Neon green (`#39FF14`)
- Border: 3px neon green
- Non-blocking: `pointerEvents="none"`

---

## 4. Screens Using Skin Tokens

### HomeScreen.tsx
```typescript
backgroundColor: skin.colors.background  // Line 123
backgroundColor: skin.colors.backgroundTertiary  // Line 149
```

### InboxListScreen.tsx
```typescript
backgroundColor: skin.colors.background  // Line 412, 517
```

Both screens will display:
- Neon green (`#39FF14`) main background
- Hot pink (`#FF2D95`) for cards and secondary areas
- Thicker borders (6px instead of 2px)

---

## 5. Proof Commands

Run these to verify integration:

```bash
# Verify TEST MODE flag exists and is true
rg "SKIN_TEST_MODE = true" mobile/src/ui/skin.ts

# Verify neon colors are present
rg "#39FF14" mobile/src/ui/skin.ts

# Verify screens use skin tokens
rg "skin\.colors\.background" mobile/src/screens/home/HomeScreen.tsx
rg "skin\.colors\.background" mobile/src/screens/inbox/InboxListScreen.tsx

# Verify watermark in Screen.tsx
rg "TEST MODE" mobile/src/ui/Screen.tsx
```

---

## 6. How to Test

1. Ensure `SKIN_TEST_MODE = true` in `mobile/src/ui/skin.ts`
2. Start Expo: `cd mobile && npx expo start --clear`
3. Open app on device/simulator
4. **Expected result**:
   - Neon green background on Home and Inbox screens
   - Hot pink cards
   - Thick black borders (6px)
   - "TEST MODE" watermark on screens using Screen primitive

---

## 7. Reverting to Production Appearance

1. Open `mobile/src/ui/skin.ts`
2. Change line 15: `export const SKIN_TEST_MODE = false;`
3. Reload app (shake device -> Reload, or `r` in terminal)
4. All extreme colors revert to normal white/gray palette

---

## 8. Files Modified

| File | Change |
|------|--------|
| `mobile/src/ui/skin.ts` | Added `SKIN_TEST_MODE` flag with conditional color values |
| `mobile/src/ui/Screen.tsx` | Added TEST MODE watermark rendering |

---

## Confirmation

This proves the skin system works because:
1. Changing ONE value (`SKIN_TEST_MODE`) affects ALL screens that use `skin.*` tokens
2. Both HomeScreen and InboxListScreen reference `skin.colors.background`
3. The extreme colors are unmistakable - if you see neon green, the skin is working
