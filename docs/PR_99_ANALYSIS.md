# PR #99 Detaljna Analiza

**Datum**: 2026-02-14
**Auditor**: Claude agent

---

## Trenutno na main:

```typescript
// backend/src/repositories/transport.ts:426
const MAINLAND_STOP_NAMES = ['Split'];
```

## Nakon PR #99:

```typescript
// backend/src/repositories/transport.ts:430
const MAINLAND_STOP_NAMES = ['Split', 'Porat', 'Porat (Biševo)'];
```

---

## Logika filtriranja

SQL query koristi `NOT IN` klauzulu:

```sql
AND origin.name_hr NOT IN ('Split', 'Porat', 'Porat (Biševo)')
```

### Rezultat:

| Polazak | Prije PR #99 | Nakon PR #99 |
|---------|--------------|--------------|
| Vis -> Split | PRIKAZAN | PRIKAZAN |
| Komiza -> Bisevo | PRIKAZAN | PRIKAZAN |
| Split -> Vis | ISKLUCEN | ISKLUCEN |
| **Porat -> Komiza** | PRIKAZAN (BUG!) | **ISKLUCEN** |
| **Porat (Bisevo) -> Komiza** | PRIKAZAN (BUG!) | **ISKLUCEN** |

---

## Test Coverage

### Sto testira:

| Test | Status |
|------|--------|
| MAINLAND_STOP_NAMES sadrzi Split | PASS |
| MAINLAND_STOP_NAMES NE sadrzi Vis | PASS |
| MAINLAND_STOP_NAMES NE sadrzi Komizu | PASS |
| isIslandOrigin('Vis') = true | PASS |
| isIslandOrigin('Split') = false | PASS |
| filterForIslandOrigins() filtrira mijesanu listu | PASS |

### Sto NE testira:

| Nedostaje | Razlog |
|-----------|--------|
| `isIslandOrigin('Porat') = false` | Nema eksplicitnog testa |
| `isIslandOrigin('Porat (Bisevo)') = false` | Nema eksplicitnog testa |

**VAZNO**: Filter RADI ispravno jer `MAINLAND_STOP_NAMES` sadrzi Porat vrijednosti. Ali nema **eksplicitnog testa** koji to dokumentira!

### Zastarjeli komentar (BUG):

```typescript
// test file header (line 8-9)
* Valid origins: Vis, Komiža, Hvar, Milna, Porat (Biševo), etc.  // <-- KRIVO!
```

Ovaj komentar nije azuriran i jos uvijek navodi `Porat (Bisevo)` kao "valid origin" sto je sada netocno.

---

## Test rezultat

```
npm test -- transport-today-direction

 ✓ src/__tests__/transport-today-direction.test.ts (18 tests) 10ms

 Test Files  1 passed (1)
      Tests  18 passed (18)
```

**SVI TESTOVI PROLAZE**

---

## Preporuka

**[x] SIGURNO ZA MERGE** - logika je ispravna

### Opcionalna poboljsanja (mogu se napraviti poslije):

1. **Ispraviti zastarjeli komentar** u test fileu (linija 8-9)
   - Trenutno: `Valid origins: Vis, Komiža, Hvar, Milna, Porat (Biševo), etc.`
   - Treba biti: `Valid origins: Vis, Komiža, Hvar, Milna, etc.`

2. **Dodati eksplicitne testove** za Bisevo scenarij:
   ```typescript
   it('should REJECT Porat origin', () => {
     expect(isIslandOrigin('Porat')).toBe(false);
   });

   it('should REJECT Porat (Biševo) origin', () => {
     expect(isIslandOrigin('Porat (Biševo)')).toBe(false);
   });
   ```

---

---

## Dodatno: Icon Color Fix

PR #99 takodjer ispravlja boju ikona na transport headerima.

### Prije (main):
```tsx
// SeaTransportScreen.tsx:190
<Icon name="ship" size="lg" colorToken="textPrimary" />  // crna ikona na plavoj pozadini = LOSE

// RoadTransportScreen.tsx:174
<Icon name="bus" size="lg" colorToken="textPrimary" />   // crna ikona na zelenoj pozadini = LOSE
```

### Poslije (PR #99):
```tsx
// SeaTransportScreen.tsx:190
<Icon name="ship" size="lg" colorToken="primaryText" />  // bijela ikona na plavoj pozadini = DOBRO

// RoadTransportScreen.tsx:174
<Icon name="bus" size="lg" colorToken="primaryText" />   // bijela ikona na zelenoj pozadini = DOBRO
```

| Token | Boja | Koristi se za |
|-------|------|---------------|
| textPrimary | #000000 (crna) | Tekst na bijeloj pozadini |
| primaryText | #FFFFFF (bijela) | Tekst/ikone na obojenoj pozadini |

---

## Zakljucak

| Kriterij | Status |
|----------|--------|
| Bisevo filter ispravan | DA |
| Icon color fix ispravan | DA |
| Testovi prolaze | DA (18/18) |
| Bisevo scenarij pokriven | DA (implicitno) |
| Eksplicitni Bisevo test | NE (nice-to-have) |

**MERGE PREPORUKA: DA**

PR #99 ispravlja DVA buga:
1. **Bisevo filter** - Porat polasci vise nece biti u "danas s Visa"
2. **Icon colors** - Bijele ikone na obojenim headerima

Nedostaje samo kozmetika (komentar + eksplicitni test) koja se moze dodati u follow-up commitu.
