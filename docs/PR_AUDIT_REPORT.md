# Pull Request Audit Report

**Datum**: 2026-02-14
**Otvorenih PR-ova**: 8
**Auditor**: Claude agent

---

## Sazimanje

| PR # | Naziv | Commitova | Konflikti | Preporuka | Razlog |
|------|-------|-----------|-----------|-----------|--------|
| #99 | fix(transport): exclude Bisevo + white header icons | 2 | NE | **MERGE** | Kritican bug fix - Bisevo filter NIJE na main |
| #98 | docs(audit): source of truth for transport regressions | 1 | NE | CLOSE | Superseded by #99 |
| #97 | fix(ui): GlobalHeader boxed icons + chevron micro size | 2 | NE | CLOSE | Overlaps with main's 8148e76 commit |
| #96 | fix: normalize icon stroke + Vis departure filter | 4 | N/A | CLOSE | Stacked on #95 which has conflicts |
| #95 | feat(icons): unbox all icons | 2 | **DA** | CLOSE | Conflicts + main already has icon unboxing |
| #94 | docs(audit): real-app icon inventory | 3 | NE | MERGE | Clean docs, no conflicts |
| #92 | docs: visual decision charter + radius inventory | 2 | NE | MERGE | Clean docs, no conflicts |

---

## Detaljna analiza

### PR #99: fix(transport): exclude Bisevo + white header icons

**Branch**: `fix/transport-today-exclude-bisevo-and-header-icon-colors`
**Otvoren**: 2026-02-13
**Autor**: Pliketiplok00
**Commitova**: 2

**Sto radi**:
1. Dodaje 'Porat' i 'Porat (Bisevo)' u MAINLAND_STOP_NAMES exclusion listu
2. Ispravlja boju ikona na transport headerima (textPrimary -> primaryText)

**Datoteke** (5 files):
- backend/src/repositories/transport.ts
- backend/src/__tests__/transport-today-direction.test.ts
- mobile/src/screens/transport/SeaTransportScreen.tsx
- mobile/src/screens/transport/RoadTransportScreen.tsx
- mobile/src/screens/transport/LineDetailScreen.tsx

**Konflikti s main**: NE

**Preporuka**: **MERGE**

**Obrazlozenje**:
KRITICNI FIX! Trenutno na main-u `MAINLAND_STOP_NAMES = ['Split']` - Bisevo polasci se pogresno prikazuju kao "polasci s otoka Visa". Ovaj PR ispravlja taj bug. Header icon boje su bonus fix.

---

### PR #98: docs(audit): source of truth for transport regressions

**Branch**: `audit/source-truth-transport-regressions`
**Otvoren**: 2026-02-13
**Autor**: Pliketiplok00
**Commitova**: 1

**Sto radi**:
Dokumentira root cause za dva buga (today departures + icon colors) + dodaje failing test.

**Datoteke** (3 docs):
- docs/audit/TODAY_DEPARTURES_SOURCE_OF_TRUTH.md
- docs/audit/TRANSPORT_ICON_COLOR_PATHS.md
- backend/src/__tests__/transport-today-direction.test.ts (failing test)

**Konflikti s main**: NE

**Preporuka**: CLOSE

**Obrazlozenje**:
Ovo je "audit" PR koji je prethodio PR #99. PR #99 sadrzi stvarne fixeve i isti failing test. Ovaj PR je sada obsolete - dokumentacija moze ostati na branchu za referencu ali ne treba merge.

---

### PR #97: fix(ui): GlobalHeader boxed icons + transport header colors + chevron micro size

**Branch**: `fix/ui-header-icons-transport-chevrons`
**Otvoren**: 2026-02-13
**Autor**: Pliketiplok00
**Commitova**: 2

**Sto radi**:
1. Dodaje globalHeader skin tokene
2. Dodaje unboxed.xs (20px) icon size
3. Mijenja chevrone na md -> xs

**Datoteke** (10 files):
- mobile/src/ui/skin.neobrut2.ts
- mobile/src/ui/Icon.tsx
- mobile/src/components/GlobalHeader.tsx
- mobile/src/ui/HeroMediaHeader.tsx
- mobile/src/ui/ListRow.tsx
- mobile/src/components/transport/DepartureItem.tsx
- mobile/src/screens/flora/FloraSpeciesCard.tsx
- mobile/src/screens/fauna/FaunaSpeciesCard.tsx
- + 2 transport screens

**Konflikti s main**: NE

**Preporuka**: CLOSE

**Obrazlozenje**:
Main vec ima commit `8148e76 fix(mobile): unbox 27 ghost icon wrappers` i `f7f7cb3 chore(skin): tokenize micro spacing, opacity, and header icon box`. Ovaj PR radi slicne stvari ali na drugaciji nacin - merge bi stvorio konfuziju. Bolje zatvoriti i cherry-pick ako nesto nedostaje.

---

### PR #96: fix: normalize icon stroke + tighten Vis island departure filter

**Branch**: `fix/ui-stroke-and-vis-departures-filter`
**Otvoren**: 2026-02-13
**Autor**: Pliketiplok00
**Commitova**: 4
**Base branch**: `feat/icon-system-unboxed-sizes` (NOT main!)

**Sto radi**:
1. Size-aware stroke width mapping za ikone
2. Dodaje Bisevo Porat u filter (slicno kao #99)
3. Downgrade placeholder ikona xl -> lg

**Datoteke** (9 files vs parent branch):
- mobile/src/ui/Icon.tsx
- mobile/src/ui/States.tsx
- mobile/src/ui/HeroMediaHeader.tsx
- + flora/fauna cards
- + transport repository

**Konflikti s main**: N/A (cilja parent branch, ne main)

**Preporuka**: CLOSE

**Obrazlozenje**:
Ovo je "stacked PR" koji cilja #95 kao base branch. Buduci da #95 ima konflikt s main i treba biti zatvoren, ovaj PR automatski postaje obsolete. Bisevo fix je vec pokriven u #99.

---

### PR #95: feat(icons): unbox all icons with unified semantic size system

**Branch**: `feat/icon-system-unboxed-sizes`
**Otvoren**: 2026-02-13
**Autor**: Pliketiplok00
**Commitova**: 2

**Sto radi**:
1. BREAKING: Uklanja visual icon boxeve iz svih komponenti
2. Dodaje unified unboxed icon sizes (sm, md, lg, xl, xxl)
3. Ispravlja sea ship icon consistency

**Datoteke** (19 files):
- mobile/src/ui/Icon.tsx
- mobile/src/ui/skin.neobrut2.ts
- GlobalHeader, Banner, EventDetail, ServiceAccordion...
- OnboardingRoleCard, Confirmation screens...

**Konflikti s main**:
```
CONFLICT: mobile/src/components/Banner.tsx
CONFLICT: mobile/src/components/services/ServiceAccordionCard.tsx
CONFLICT: mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx
```

**Preporuka**: CLOSE

**Obrazlozenje**:
Main vec ima icon unboxing kroz `8148e76`. Ovaj PR je starija verzija istog posla s drugacijim pristupom. Ima 3 konflikta i nije vrijedan rjesavanja jer je posao vec napravljen na main-u.

---

### PR #94: docs(audit): add real-app icon inventory and mapping plan

**Branch**: `docs/audit-realapp-icon-inventory`
**Otvoren**: 2026-02-12
**Autor**: Pliketiplok00
**Commitova**: 3

**Sto radi**:
1. Forensic inventory svih icon usages (90 instances)
2. Mapping plan za boxed -> unboxed
3. Verification report

**Datoteke** (3 docs):
- docs/audit/ICON_INVENTORY_REAL_APP.md
- docs/audit/ICON_MAPPING_PLAN_REAL_APP.md
- docs/audit/ICON_INVENTORY_VERIFICATION_REPORT.md

**Konflikti s main**: NE

**Preporuka**: **MERGE**

**Obrazlozenje**:
Cista dokumentacija, nema konflikata. Koristan audit trail koji dokumentira stanje prije icon unboxing refactora. Moze se mergati bez rizika.

---

### PR #92: docs: add visual decision charter + border radius inventory

**Branch**: `docs/visual-decision-charter-radius-inventory`
**Otvoren**: 2026-02-12
**Autor**: Pliketiplok00
**Commitova**: 2

**Sto radi**:
1. Visual decision charter (locked design principles)
2. Border radius forensic inventory (37 non-zero occurrences)

**Datoteke** (2 docs):
- docs/design/DECISION_CHARTER_ICON_TYPO_RADIUS.md
- docs/audit/RADIUS_INVENTORY.md

**Konflikti s main**: NE

**Preporuka**: **MERGE**

**Obrazlozenje**:
Cista dokumentacija, nema konflikata. Ustanovljuje design principe za buduce odluke. Vrijedi mergati.

---

## Akcijski plan

### Za MERGE (odmah):

1. **PR #99** - PRIORITET! Bisevo filter fix + transport header icons
   ```bash
   gh pr merge 99 --merge
   ```

2. **PR #94** - Icon inventory dokumentacija
   ```bash
   gh pr merge 94 --merge
   ```

3. **PR #92** - Design charter dokumentacija
   ```bash
   gh pr merge 92 --merge
   ```

### Za CLOSE (s komentarom):

1. **PR #98** - "Superseded by #99 which contains the actual fixes."

2. **PR #97** - "Overlaps with commits already on main (8148e76, f7f7cb3). Closing to avoid confusion."

3. **PR #96** - "Stacked PR targeting #95 which is being closed. Bisevo fix already in #99."

4. **PR #95** - "Icon unboxing already done differently on main (8148e76). Has merge conflicts."

### Za CEKA (potrebna akcija):

*Nema PR-ova koji cekaju.*

---

## Napomena

- **NE mergaj automatski** - ovaj izvjestaj je samo preporuka
- Prije merganja PR #99, preporucam run tests: `cd backend && npm test`
- Dokumentacijski PR-ovi (#94, #92) su low-risk i mogu se mergati bez testiranja
