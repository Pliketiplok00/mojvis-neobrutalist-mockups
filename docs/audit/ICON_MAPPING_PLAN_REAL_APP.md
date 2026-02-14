# Icon Mapping Plan - Real App Only

Generated: 2026-02-13

Based on: `docs/audit/ICON_INVENTORY_REAL_APP.md`

Reference: Visual Decision Charter (`docs/design/DECISION_CHARTER_ICON_TYPO_RADIUS.md`)

---

## Decision Charter Icon Classes (Target State)

| Class | Description | Box | Border | Background | Token |
|-------|-------------|-----|--------|------------|-------|
| icon.nav | Navigation icons | Yes | Yes | Yes | `icon.nav` |
| icon.hero | Hero/detail icons | Yes | Yes | Yes | `icon.hero` |
| icon.list | List icons | No | No | No | `icon.list` |

---

## Proposed Mapping from Current State

### 1. icon.nav (Navigation)

**Current state:** GlobalHeader uses 44x44 consistently for both menu and inbox icons.

| Property | Current Value | Source |
|----------|---------------|--------|
| size | 44px | `skin.components.header.iconBoxSize` |
| borderWidth | 3px (widthCard) | Token |
| backgroundColor | warningAccent (menu), primary (inbox) | Tokens |

**Proposed icon.nav token:**
```typescript
icon: {
  nav: {
    size: 44,
    borderWidth: bordersToken.widthCard,
    // backgroundColor varies per context
  }
}
```

**Status:** CLEAR - single size used in navigation context.

---

### 2. icon.hero (Hero/Detail)

**Current state:** AMBIGUOUS - multiple sizes used in hero/detail contexts.

| Context | Size | Source |
|---------|------|--------|
| EventDetailScreen info tiles | 44px | `events.detail.infoTileIconBoxSize` |
| Transport overview headers | 48px | `transport.overviewHeader.iconBoxSize` |
| LineDetailScreen header | 52px | `transport.lineDetail.headerIconBoxSize` |
| HomeScreen CTA box | 48px | Hardcoded |
| OnboardingRoleCard | 48px | `onboarding.roleCard.iconBox.size` |
| ServiceAccordionCard | 44px | Hardcoded constant |
| Banner | 44px | Hardcoded |
| Warning boxes (Flora/Fauna) | 44px | Hardcoded |

**Size distribution:**
- 44px: 4 contexts (EventDetail, ServiceAccordion, Banner, Warnings)
- 48px: 3 contexts (Transport overview, HomeScreen CTA, OnboardingRoleCard)
- 52px: 1 context (LineDetail header)

**DECISION REQUIRED:**

The Decision Charter specifies "Hero/detail icons: larger than nav". Current nav is 44px.

Options:
1. **Use 48px as icon.hero** (most common "larger than nav" size)
   - Would require: EventDetail, ServiceAccordion, Banner, Warnings to increase from 44 to 48
   - LineDetail header would decrease from 52 to 48

2. **Use 52px as icon.hero** (largest current size)
   - Would require: All 44px and 48px contexts to increase to 52
   - Significant visual change

3. **Keep multiple hero sizes** (48px standard, 52px for transport detail only)
   - Violates "exactly 3 classes" rule
   - But may be necessary for visual hierarchy

**Recommendation:** STOP AND ASK - need design decision on whether:
- 48px should be the single hero size
- OR transport detail should have a special larger size

---

### 3. icon.list (List Icons)

**Current state:** Most list icons are ALREADY UNBOXED.

**Unboxed list icons (compliant):**
| Size | Usage Count | Examples |
|------|-------------|----------|
| xs | 2 | EventsScreen meta (clock, map-pin) |
| sm | ~25 | Chevrons, meta icons, form validation |
| md | ~15 | Menu items, inbox message type, general list |

**Proposed icon.list default:** `sm` (most common for meta/chevron patterns)

**FLAGGED: Currently boxed list icons that should become unboxed:**

| File | Context | Current Size | Issue |
|------|---------|--------------|-------|
| RoadTransportScreen.tsx | lineCardHeaderIconBox | 40px | Boxed in list card |
| SeaTransportScreen.tsx | lineCardHeaderIconBox | 40px | Boxed in list card |
| LineDetailScreen.tsx | contactIconBox | 32px | Boxed contact links |

These violate the Decision Charter rule that list icons should be unboxed. Migration will need to:
1. Remove box styling from these containers
2. Change icons to use `icon.list` token (unboxed, smaller)

**Note:** The transport line card icons (bus/ship in colored headers) may be considered "mini hero" rather than "list" icons. Clarification needed.

---

## Summary of Required Decisions

### Must Decide Before Implementation:

1. **Hero icon size ambiguity**
   - Current sizes: 44px, 48px, 52px all used in "hero" contexts
   - Question: Should icon.hero be 48px (standard) or 52px (maximum)?
   - Should LineDetail header have a special size or conform to icon.hero?

2. **Transport line card icons classification**
   - Are these "list" icons (should be unboxed)?
   - Or "mini hero" icons (can stay boxed)?
   - Current: 40px boxed in colored card headers

3. **Contact link icons in LineDetail**
   - Currently 32px boxed
   - Should these become unboxed per icon.list?
   - Or do they serve a different purpose (action affordance)?

---

## Proposed Token Structure (Draft)

```typescript
// skin.neobrut2.ts additions
icon: {
  nav: {
    boxSize: 44,
    borderWidth: bordersToken.widthCard, // 3px
    // backgroundColor varies (yellow for menu, blue for inbox)
  },
  hero: {
    boxSize: 48, // OR 52 - DECISION NEEDED
    borderWidth: bordersToken.widthThin, // 1px
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  list: {
    // No box properties - icon only
    defaultSize: 'sm', // Maps to icons.sizes.sm (16px)
  },
}
```

---

## Migration Steps (Once Decisions Made)

### Phase 1: Create tokens
1. Add `icon.nav`, `icon.hero`, `icon.list` tokens to skin
2. Set sizes based on decisions above

### Phase 2: Migrate navigation icons
1. GlobalHeader - already correct, just reference new token

### Phase 3: Migrate hero icons
1. Update all hero contexts to use `icon.hero.boxSize`
2. Standardize border/background styling

### Phase 4: Migrate list icons
1. Update transport line card icons (decision pending on classification)
2. Update contact link icons in LineDetail
3. Ensure all other list icons use `icon.list` sizing

---

## Files That Will Change (Estimated)

| File | Change Type |
|------|-------------|
| skin.neobrut2.ts | Add icon tokens |
| GlobalHeader.tsx | Use icon.nav token |
| EventDetailScreen.tsx | Use icon.hero token |
| RoadTransportScreen.tsx | Use icon.hero + possibly unbox line cards |
| SeaTransportScreen.tsx | Use icon.hero + possibly unbox line cards |
| LineDetailScreen.tsx | Use icon.hero + unbox contacts |
| HomeScreen.tsx | Use icon.hero token |
| OnboardingRoleCard.tsx | Use icon.hero token |
| ServiceAccordionCard.tsx | Decide: nav or hero? |
| Banner.tsx | Decide: nav or hero? |
| FaunaScreen.tsx | Use icon.hero token |
| FloraScreen.tsx | Use icon.hero token |

---

## Ambiguities Requiring User Decision

1. **What should icon.hero size be?** 48px or 52px?

2. **Should transport line card icons (40px boxed) be:**
   - Unboxed (icon.list) per Decision Charter?
   - Keep as boxed (special "card header" category)?

3. **Should ServiceAccordionCard and Banner use:**
   - icon.nav (same size as header, 44px)?
   - icon.hero (larger, 48px)?

4. **Should MunicipalitySelection 64px icons be:**
   - A fourth category (icon.emphasis)?
   - Consolidated to icon.hero?
   - Kept as special onboarding-only size?
