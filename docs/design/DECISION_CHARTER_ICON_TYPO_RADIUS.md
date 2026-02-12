# MOJ VIS – VISUAL DECISION CHARTER

## 1. Border Philosophy

**Rule:** All UI elements must use sharp corners.

**No Exceptions:** All non-zero radii are forbidden (4/12/20/32/40 etc.)

**Impact list:**
- Photo tiles become square
- Confirmation checkmarks become square
- Status blocks become square
- Selection cards become square

## 2. Icon System (exactly 3 classes)

| Class | Size | Box | Border | Background | Corners | Token |
|-------|------|-----|--------|------------|---------|-------|
| Navigation icons | same size | yes | yes | yes | sharp | icon.nav |
| Hero/detail icons | larger than nav | yes | yes | yes | sharp | icon.hero |
| List icons | smaller than nav | no | no | no | icon only | icon.list |

**Forbidden:** No extra sizes, no fragmentation.

## 3. Typography Density (exactly 3)

- tight
- normal
- roomy

No fixed pixel line heights in components.

## 4. System Principles

- Every visual decision must have a single source of truth in the skin
- Components consume tokens, never define their own magic numbers
- Deviations require explicit documentation and approval
- Visual consistency trumps local optimization
- When in doubt, use the simpler option

## 5. Migration Strategy (not implemented)

**Phase 1:** Remove all non-zero border radius

**Phase 2:** Migrate icon system to 3-class model

**Phase 3:** Replace fixed line-heights with density tokens
