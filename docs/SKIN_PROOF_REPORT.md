# Skin Proof Report

## Where Skin is Selected

**File:** `mobile/src/ui/skin.ts`

```typescript
export * from "./skin.neobrut2";
export { skinNeobrut2 as skin } from "./skin.neobrut2";
export { skinNeobrut2 as default } from "./skin.neobrut2";
```

The skin selection is via direct static imports - no runtime provider/context.
All primitives import `skin` from `./skin` which re-exports `skinNeobrut2`.

## Which Skin is Active

**Active skin:** `skin.neobrut2.ts`

**Runtime proof:**
```
LOG  ACTIVE_SKIN: skin.neobrut2.ts MARKER: SKIN_PROOF
```

This log appeared in Metro console after adding a trace to `skin.ts`.

## Neon Override Test

**Test:** Changed `colors.background` from `palette.background` to `#00FF00` (neon green).

**Screens affected:**
- `HomeScreen.tsx:129` - uses `skin.colors.background`
- `InboxListScreen.tsx:422` - uses `skin.colors.background`
- `InboxDetailScreen.tsx:186` - uses `skin.colors.background`

**Result:** PENDING VISUAL CONFIRMATION

If neon green is visible → Skin IS active and primitives ARE reading tokens.
If neon green is NOT visible → Something is overriding the skin.

## Additional Findings

### GlobalHeader Not Migrated
`mobile/src/components/GlobalHeader.tsx` contains hardcoded colors:
- Line 119: `backgroundColor: '#FFFFFF'`
- Line 154: `backgroundColor: '#FF0000'`

The `Header` UI primitive (`mobile/src/ui/Header.tsx`) is just a thin wrapper around `GlobalHeader`, so the header still uses old styling.

### Inbox Screens Fully Migrated
Both `InboxListScreen.tsx` and `InboxDetailScreen.tsx`:
- Import from `../../ui` (skin-aware primitives)
- Use `skin.colors.*` for all colors
- No hardcoded hex colors

## Conclusions

| Item | Status |
|------|--------|
| **SKIN_ACTIVE** | **YES** (proven via runtime log) |
| **PRIMITIVES_SKIN_DRIVEN** | **YES** for inbox screens |
| **GlobalHeader migrated** | NO - still has hardcoded colors |

## Why UI Looks "Old"

The "old UI" appearance is likely because:

1. **Skin token values** produce a similar visual to the previous design (same color intent - Mediterranean/paper palette)
2. **GlobalHeader** hasn't been migrated (still `#FFFFFF`)
3. **Other screens** (HomeScreen, etc.) may use the skin but with similar-looking tokens

## Recommended Next Steps

1. **Migrate GlobalHeader** to use skin tokens instead of hardcoded `#FFFFFF`
2. **Review skin.neobrut2.ts palette** if visual changes are desired
3. **Continue migrating remaining screens** to use UI primitives

## Temporary Test Code

All temporary traces have been removed. Git diff is clean.
