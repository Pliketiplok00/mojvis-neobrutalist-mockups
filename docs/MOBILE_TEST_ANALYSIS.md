# MOBILE TEST ANALYSIS

**Datum**: 2026-02-14
**Auditor**: Claude agent

---

## Trenutno stanje

### Jest konfiguracija
- **Jest config file**: NE POSTOJI (nema `jest.config.js`)
- **Jest u package.json**: Nije konfiguriran (samo script)
- **Test script**: `"test": "jest"` (postoji ali neće raditi bez configa)

### Test dependencies
| Paket | Verzija | Status |
|-------|---------|--------|
| jest | ^30.2.0 | Instaliran |
| ts-jest | ^29.4.6 | Instaliran |
| @types/jest | ^30.0.0 | Instaliran |
| @testing-library/react-native | - | **NE POSTOJI** |

### Postojeći testovi
- **Broj testova u src/**: **0**
- **Test direktoriji**: Samo u node_modules

---

## Preporučeni setup

### 1. Kreiraj jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
```

### 2. (Opcionalno) Za React komponente
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

---

## Kandidati za testiranje

### UTILS (3 datoteke, ~260 linija)

| Datoteka | Funkcije | Linija | Težina | Prioritet |
|----------|----------|--------|--------|-----------|
| dateFormat.ts | 9 | 159 | Lako | **VISOK** |
| wikiThumb.ts | 2 | 74 | Lako | Srednji |
| transportFormat.ts | 1 | 24 | Lako | Nizak |

#### dateFormat.ts - 9 funkcija
1. `formatDateTimeCroatian(isoString)` → `"14.2.2026. 09:30"`
2. `formatDateShort(isoString)` → `"14/02/2026"`
3. `formatDateTimeSlash(isoString)` → `"14/02/2026, 09:30"`
4. `formatDateLocaleFull(isoString, locale)` → `"petak, 14. veljače 2026."`
5. `formatTime(isoString, locale)` → `"09:30"` / `"9:30 AM"`
6. `formatEventTime(isoString, isAllDay, allDayText, locale)`
7. `formatDateISO(date)` → `"2026-02-14"`
8. `formatDisplayDate(isoString)` → `"14.2.2026."`
9. `formatDayWithDate(date, locale)` → `"Petak, 14.02.2026."`

#### wikiThumb.ts - 2 funkcije
1. `safeDecode(s)` - interno
2. `wikiThumb(url, width)` - glavna funkcija s edge cases

#### transportFormat.ts - 1 funkcija
1. `formatLineTitle(lineNumber, origin, destination)` → `"602: Vis-Split"`

### HOOKS (1 datoteka, 45 linija)

| Datoteka | Težina | Prioritet |
|----------|--------|-----------|
| useUserContext.ts | Srednje | Srednji |

Zahtijeva mock za:
- `useOnboarding()`
- `useTranslations()`

### SERVICES (1 velika datoteka, 811 linija)

| Datoteka | Težina | Prioritet |
|----------|--------|-----------|
| api.ts | Teško | Nizak (za sada) |

Zahtijeva:
- Mock fetch
- Test server ili MSW

---

## Prioriteti za testiranje

### 1. LAKO (utility funkcije) - ~30 min setup + testovi

**dateFormat.ts** - 9 čistih funkcija, bez ovisnosti

Primjer testa:
```typescript
// src/utils/__tests__/dateFormat.test.ts
import {
  formatDateTimeCroatian,
  formatDateShort,
  formatDateISO,
  formatDateLocaleFull,
} from '../dateFormat';

describe('dateFormat', () => {
  describe('formatDateTimeCroatian', () => {
    it('should format ISO string to Croatian datetime', () => {
      expect(formatDateTimeCroatian('2026-02-14T09:30:00Z'))
        .toBe('14.2.2026. 10:30'); // UTC+1
    });
  });

  describe('formatDateShort', () => {
    it('should format ISO string to DD/MM/YYYY', () => {
      expect(formatDateShort('2026-02-14T09:30:00Z'))
        .toBe('14/02/2026');
    });
  });

  describe('formatDateISO', () => {
    it('should format Date to YYYY-MM-DD', () => {
      expect(formatDateISO(new Date(2026, 1, 14)))
        .toBe('2026-02-14');
    });
  });

  describe('formatDateLocaleFull', () => {
    it('should format HR locale', () => {
      const result = formatDateLocaleFull('2026-02-14T09:30:00Z', 'hr');
      expect(result).toContain('2026');
      expect(result).toContain('veljače');
    });

    it('should format EN locale', () => {
      const result = formatDateLocaleFull('2026-02-14T09:30:00Z', 'en');
      expect(result).toContain('2026');
      expect(result).toContain('February');
    });
  });
});
```

### 2. SREDNJE (wikiThumb) - ~20 min

**wikiThumb.ts** - Kompleksnija logika, edge cases

```typescript
// src/utils/__tests__/wikiThumb.test.ts
import { wikiThumb } from '../wikiThumb';

describe('wikiThumb', () => {
  it('should convert commons URL to thumbnail', () => {
    const input = 'https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg';
    const output = wikiThumb(input, 800);
    expect(output).toContain('/thumb/');
    expect(output).toContain('800px-');
  });

  it('should return non-wikimedia URLs unchanged', () => {
    const input = 'https://example.com/image.jpg';
    expect(wikiThumb(input)).toBe(input);
  });

  it('should handle already-thumbnail URLs', () => {
    const input = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File.jpg/400px-File.jpg';
    const output = wikiThumb(input, 800);
    expect(output).toContain('800px-');
  });
});
```

### 3. LAKO (transportFormat) - ~10 min

```typescript
// src/utils/__tests__/transportFormat.test.ts
import { formatLineTitle } from '../transportFormat';

describe('formatLineTitle', () => {
  it('should format line title with number', () => {
    expect(formatLineTitle('602', 'Vis', 'Split')).toBe('602: Vis-Split');
  });

  it('should handle null line number', () => {
    expect(formatLineTitle(null, 'Vis', 'Split')).toBe(': Vis-Split');
  });
});
```

---

## Preporuka za danas (90 min)

### Korak 1: Setup (15 min)
```bash
# Kreiraj jest.config.js
cat > mobile/jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
EOF

# Kreiraj test direktorij
mkdir -p mobile/src/utils/__tests__
```

### Korak 2: dateFormat testovi (45 min)
- Napiši testove za svih 9 funkcija
- Posebna pažnja na timezone handling

### Korak 3: wikiThumb testovi (20 min)
- Testiraj edge cases (encoded URLs, double encoding)

### Korak 4: transportFormat testovi (10 min)
- Brzi unit test za jednu funkciju

---

## Očekivani rezultat

| Metrika | Vrijednost |
|---------|------------|
| Test datoteke | 3 |
| Broj testova | ~25-30 |
| Coverage (utils) | ~90% |
| Vrijeme izvršenja | <2 sekunde |

---

## Sljedeći koraci (budućnost)

1. **React Native Testing Library** - za komponente
2. **MSW (Mock Service Worker)** - za API testove
3. **Snapshot testovi** - za UI komponente
4. **E2E testovi** - Detox ili Maestro
