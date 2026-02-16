# Phase 6: Risk Report

**Audit Date:** 2026-02-12
**Purpose:** Document fragmentation risks and cleanup complexity

---

## COMPONENT FRAGMENTATION RANKING

### Most Fragmented Components

| Rank | Component | Fragmentation Level | Details |
|------|-----------|---------------------|---------|
| 1 | **Icon Box Sizes** | HIGH | 6 different sizes (32, 40, 44, 48, 52, 64) without semantic tokens |
| 2 | **Line Height Values** | HIGH | 4 values (18, 20, 22, 24) used inconsistently across 15+ files |
| 3 | **Border Radius** | MEDIUM | 5 hardcoded values (4, 12, 20, 32, 40) outside token system |
| 4 | **Fixed Heights** | MEDIUM | 8+ unique heights without clear naming |
| 5 | **Opacity Values** | LOW | 5 values used, easy to tokenize |

### Least Fragmented Components

| Component | Status | Notes |
|-----------|--------|-------|
| Badge | Good | 8 variants, fully tokenized |
| Button | Good | 3 variants, fully tokenized |
| Card | Good | 5 variants, fully tokenized |
| Spacing (tokens) | Good | 95% adoption rate |
| GlobalHeader | Good | 95% tokenized |

---

## CASCADE RISK MATRIX

### HIGH CASCADE RISK

| Change | Files Affected | Risk |
|--------|---------------|------|
| Icon box size standardization | 15+ files | Layout shifts in headers across all screens |
| Line height standardization | 20+ files | Text reflow, card height changes |
| Transport header restructure | 6 files | Visual regression in transport flows |

### MEDIUM CASCADE RISK

| Change | Files Affected | Risk |
|--------|---------------|------|
| Border radius tokenization | 8 files | Minor visual changes to photo tiles, badges |
| Opacity standardization | 10 files | Subtle visual changes, mostly safe |
| Spacing micro token | 15 files | Baseline alignment may shift |

### LOW CASCADE RISK

| Change | Files Affected | Risk |
|--------|---------------|------|
| Fixed height tokenization | 5 files | Isolated changes per screen |
| Shadow offset tokens | 3 files | Already consistent |
| Tab padding fix | 2 files | Localized change |

---

## SCREEN INCONSISTENCY RANKING

### Most Visually Inconsistent Screens

| Rank | Screen | Issues |
|------|--------|--------|
| 1 | **StaticPageScreen** | Most line height variations, hardcoded heights |
| 2 | **FloraScreen / FaunaScreen** | Duplicate code, hardcoded micro-spacing |
| 3 | **ClickFixDetailScreen** | Hardcoded border radius, width/height |
| 4 | **HomeScreen** | Hardcoded letter spacing, event card heights |
| 5 | **InboxListScreen** | Tab system different from transport |

### Most Visually Consistent Screens

| Screen | Notes |
|--------|-------|
| TransportHubScreen | Clean tokenization |
| SettingsScreen | Simple, tokenized |
| LanguageSelectionScreen | Clean |
| MunicipalitySelectionScreen | Uses card tokens |

---

## CLEANUP COMPLEXITY ESTIMATES

### LOW Complexity (1-2 hours each)

| Task | Files | Changes |
|------|-------|---------|
| Add `spacing.micro` token | 1 | Add token |
| Replace hardcoded 2px | 15 | Find/replace |
| Add opacity tokens | 1 | Add tokens |
| Replace hardcoded opacity | 10 | Find/replace |

### MEDIUM Complexity (3-5 hours each)

| Task | Files | Changes |
|------|-------|---------|
| Add icon box size tokens | 1 | Define semantic sizes |
| Update GlobalHeader icon box | 1 | Use new token |
| Standardize line heights | 20+ | Careful replacement |
| Add border radius tokens | 1 | Define tokens |
| Update photo tile radius | 4 | Use new tokens |

### HIGH Complexity (1-2 days each)

| Task | Files | Changes | Risk |
|------|-------|---------|------|
| Icon box size migration | 15 | Update all icon boxes | Layout shifts |
| Transport header unification | 6 | Structural changes | Visual regression |
| Flora/Fauna deduplication | 4 | Shared component extraction | Code restructure |
| Line height full migration | 20+ | All text blocks | Text reflow |

---

## RECOMMENDED CLEANUP ORDER

### Phase A: Low Risk, High Impact

1. Add `spacing.micro` (2px) token
2. Add `opacity` tokens
3. Replace hardcoded opacity values
4. Replace hardcoded 2px values

**Estimated effort:** 4-6 hours
**Risk:** Very low

### Phase B: Medium Risk, Foundation

1. Add icon box size tokens
2. Add border radius tokens
3. Add line height fixed tokens
4. Update GlobalHeader to use icon box token

**Estimated effort:** 8-12 hours
**Risk:** Low-medium

### Phase C: High Risk, Full Consistency

1. Migrate all icon box sizes
2. Migrate all border radius values
3. Migrate all line heights
4. Flora/Fauna component extraction

**Estimated effort:** 2-3 days
**Risk:** Medium-high (requires visual QA)

---

## CRITICAL WARNINGS

### Do NOT Change Without Visual QA

1. **Icon box sizes in headers** - Changes visible on every screen
2. **Line heights in card text** - Will cause reflow
3. **Transport header structure** - Core user flow
4. **Badge border radius** - Part of neobrutalist identity (must stay 0)

### Safe to Change

1. Opacity values - subtle visual impact
2. Spacing micro values - minimal visual change
3. Fixed heights in isolated screens
4. Shadow offsets - already consistent

---

## DESIGN SYSTEM HEALTH SCORE

| Metric | Score | Notes |
|--------|-------|-------|
| Token Adoption | 85/100 | Strong foundation |
| Component Consistency | 75/100 | Some fragmentation |
| Spacing Grid Compliance | 90/100 | Good 4px base |
| Color System | 95/100 | Well-organized palette |
| Typography System | 70/100 | Line height issues |
| Shadow System | 90/100 | Clean implementation |

**Overall Health: 84/100**

---

## SUMMARY

### Strengths

1. Strong token system foundation in `skin.neobrut2.ts`
2. Core UI primitives (Badge, Button, Card) fully tokenized
3. Spacing tokens have 95% adoption
4. Color system well-organized with HSL palette
5. Neobrutalist identity consistently applied (sharp corners)

### Weaknesses

1. Icon box sizes fragmented (4+ sizes without semantic naming)
2. Line heights inconsistent across screens
3. Some screens have hardcoded micro-adjustments
4. Flora/Fauna screens have duplicated code
5. Tab component padding is orphan value

### Priority Actions

1. **Immediate:** Add micro spacing token (2px)
2. **Short-term:** Add icon box size tokens
3. **Medium-term:** Standardize line heights
4. **Long-term:** Full visual consistency pass

---

## END OF PHASE 6 RISK REPORT

---

## AUDIT COMPLETE

All 6 phases documented in `docs/audit/`:
- PHASE_1_RAW_GREP_INVENTORY.md
- PHASE_2_COMPONENT_VARIATION_MATRIX.md
- PHASE_3_HEADER_DRIFT_REPORT.md
- PHASE_4_SPACING_ANALYSIS.md
- PHASE_5_TOKENIZATION_PROPOSAL.md
- PHASE_6_RISK_REPORT.md
