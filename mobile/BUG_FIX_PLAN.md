# BUG FIX PLAN - Za review

**Datum**: 2026-02-14
**Status**: CEKA ODOBRENJE - nista nije implementirano

---

## BUG 1: Events kalendar oznacava SUTRA umjesto DANAS

### A) Postojece sto koristim

**Funkcije:**

`formatDateISO()` iz `src/utils/dateFormat.ts:109-114`:
```typescript
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

**Zasto ova funkcija**: Koristi `getFullYear()`, `getMonth()`, `getDate()` koje vracaju LOKALNE vrijednosti (ne UTC). Trenutna `toDateString()` koristi `toISOString()` koji konvertira u UTC i uzrokuje pomak datuma.

**Pattern koji slijedim:**

Transport koristi ovo ovako (`LineDetailScreen.tsx:585-587`):
```typescript
function getTodayString(): string {
  const today = new Date();
  return formatDateISO(today);
}
```

I u komponenti (`LineDetailScreen.tsx:110`):
```typescript
const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
```

### B) Promjene

**Datoteka: `src/screens/events/EventsScreen.tsx`**

| Akcija | Linija | Promjena |
|--------|--------|----------|
| IMPORT | 46 (nakon postojecih importa) | Dodajem: `import { formatDateISO } from '../../utils/dateFormat';` |
| BRISANJE | 53-55 | Brisem lokalnu funkciju `toDateString()` |
| ZAMJENA | 93 | `toDateString(new Date())` → `formatDateISO(new Date())` |
| ZAMJENA | 94 | `toDateString(selectedDate)` → `formatDateISO(selectedDate)` |
| ZAMJENA | 108 | `toDateString(date)` → `formatDateISO(date)` |
| ZAMJENA | 293 | `toDateString(date)` → `formatDateISO(date)` |

**Zasto brisem `toDateString()`:**
- Linija 54: `return date.toISOString().split('T')[0];` koristi UTC
- `formatDateISO()` VEC postoji i radi ispravno

**Novi importi:**
```typescript
import { formatDateISO } from '../../utils/dateFormat';
```

### C) Provjera hardkodiranja

- [x] Nema novih stringova - samo koristim postojecu funkciju
- [x] Nema boja - nije UI promjena
- [x] Nema velicina - nije UI promjena
- [x] Slijedim postojeci pattern iz LineDetailScreen.tsx

### D) Testiranje

1. Otvoriti Events screen
2. Provjeriti da je DANASNJI datum oznacen zutom bojom (ne sutrasnji)
3. Provjeriti da Transport kalendar jos uvijek radi ispravno
4. Testirati na razlicitim vremenima dana (ujutro, navecer)

**Rizik**: NIZAK - samo zamjena jedne funkcije drugom koja radi isto ali ispravno

---

## BUG 2: Inbox prikazuje samo 1 tag (ikonu)

### A) Postojece sto koristim

**Komponente:**

`Badge` iz `src/ui/Badge.tsx`:
```typescript
export function Badge({
  children,
  variant = 'default',
  backgroundColor,  // custom boja
  textColor,        // custom boja teksta
  size = 'default', // 'default' | 'compact' | 'large'
  style,
}: BadgeProps): React.JSX.Element
```

**Provjera - koje boje koristi InboxDetailScreen za tagove?**

`InboxDetailScreen.tsx:132-136`:
```typescript
<Badge
  key={tag}
  backgroundColor={skin.colors.backgroundSecondary}
  textColor={skin.colors.textMuted}
>
  {formatTag(tag)}
</Badge>
```

**PROBLEM**: `formatTag()` je hardcoded na linijama 160-169:
```typescript
function formatTag(tag: string): string {
  const tagLabels: Record<string, string> = {
    promet: 'Promet',      // HARDCODED!
    kultura: 'Kultura',    // HARDCODED!
    opcenito: 'Općenito',  // HARDCODED!
    // ...
  };
  return tagLabels[tag] || tag;
}
```

**Prijevodi VEC postoje** u `src/i18n/locales/`:

`hr.json:88-95`:
```json
"tags": {
  "promet": "Promet",
  "kultura": "Kultura",
  "opcenito": "Opcenito",
  "hitno": "Hitno",
  "vis": "Vis",
  "komiza": "Komiza"
}
```

`en.json:88-95`:
```json
"tags": {
  "promet": "Transport",
  "kultura": "Culture",
  "opcenito": "General",
  "hitno": "Urgent",
  "vis": "Vis",
  "komiza": "Komiza"
}
```

**Pattern koji slijedim - InboxListScreen tag filter** (`InboxListScreen.tsx:497`):
```typescript
{t(`inbox.tags.${tag}`)}  // KORISTI i18n!
```

**Boje za tagove** iz `skin.neobrut2.ts:953-969`:
```typescript
chipBackgrounds: {
  promet: palette.primary,      // Blue
  kultura: palette.lavender,    // Purple
  opcenito: palette.secondary,  // Green
  hitno: palette.destructive,   // Terracotta
  vis: palette.amber,           // Amber
  komiza: palette.amber,        // Amber
},
chipTextColors: {
  promet: colors.primaryText,   // White
  kultura: colors.textPrimary,  // Dark
  // ...
}
```

### B) Promjene

#### Datoteka 1: `src/screens/inbox/InboxDetailScreen.tsx`

| Akcija | Linija | Promjena |
|--------|--------|----------|
| ZAMJENA | 137 | `{formatTag(tag)}` → `{t(\`inbox.tags.${tag}\`)}` |
| BRISANJE | 160-170 | Brisem cijelu funkciju `formatTag()` |

**Prije:**
```typescript
<Badge ...>
  {formatTag(tag)}
</Badge>
```

**Poslije:**
```typescript
<Badge ...>
  {t(`inbox.tags.${tag}`)}
</Badge>
```

**Novi importi:** Nema - `t` je VEC importan na liniji 52 via `useTranslations()`

#### Datoteka 2: `src/screens/inbox/InboxListScreen.tsx`

| Akcija | Linija | Promjena |
|--------|--------|----------|
| DODAJ | nakon 279 (iza messageTitle) | Dodajem tag pills |

**Sto dodajem** (unutar `renderMessage` funkcije, nakon title View-a):

```typescript
{/* Tag pills - show first 2 tags (excluding hitno which is shown as icon) */}
{(() => {
  const visibleTags = item.tags.filter((tag) => tag !== 'hitno').slice(0, 2);
  if (visibleTags.length === 0) return null;
  return (
    <View style={styles.tagPillsRow}>
      {visibleTags.map((tag) => (
        <Badge
          key={tag}
          size="compact"
          backgroundColor={inboxTokens.tagFilter.chipBackgrounds[tag]}
          textColor={inboxTokens.tagFilter.chipTextColors[tag]}
        >
          {t(`inbox.tags.${tag}`)}
        </Badge>
      ))}
    </View>
  );
})()}
```

**Novi stil** (dodajem u StyleSheet):

```typescript
tagPillsRow: {
  flexDirection: 'row',
  gap: skin.spacing.xs,
  marginTop: skin.spacing.xs,
},
```

**Novi importi:** Nema - `Badge`, `inboxTokens`, `t`, `skin` su VEC importani

### C) Provjera hardkodiranja

- [x] Stringovi za tagove dolaze iz: `t('inbox.tags.${tag}')` (i18n)
- [x] Boje dolaze iz: `inboxTokens.tagFilter.chipBackgrounds[tag]` (skin.ts)
- [x] Tekst boje dolaze iz: `inboxTokens.tagFilter.chipTextColors[tag]` (skin.ts)
- [x] Velicine: `size="compact"` je postojeca Badge opcija, `gap` i `marginTop` dolaze iz `skin.spacing.*`
- [x] Ne uvodim nove patterne - slijedim InboxListScreen filter bar pattern

### D) Testiranje

1. Inbox lista - provjeriti da poruke s vise tagova prikazuju tag pills
2. Inbox lista - provjeriti da 'hitno' tag NIJE prikazan kao pill (vec kao ikona)
3. Inbox detail - provjeriti da tagovi koriste ispravan jezik (EN/HR)
4. Promijeniti jezik u Settings i provjeriti da se tagovi mijenjaju

**Rizik**: NIZAK - reuse postojecih komponenti i tokena

---

## BUG 3: EN lokalizacija ne radi

### A) Postojece sto koristim

**Kako Transport proslijeduje jezik u API?**

Transport NE proslijeduje jezik direktno u API! Provjerio sam:
- `LineDetailScreen.tsx:93`: `const { t, language } = useTranslations();`
- `language` se koristi samo za UI formatting (`formatDayWithDate(date, language)`)
- API pozivi koriste `getLanguage()` iz api.ts koji je hardcoded

**Kako eventsApi radi?** (`api.ts:237`):
```typescript
headers: {
  'Accept-Language': getLanguage(),  // HARDCODED 'hr'
}
```

**Provjera - koji kljucevi trebaju prijevode:**

| Kljuc | hr.json | en.json |
|-------|---------|---------|
| `inbox.tags.promet` | "Promet" | "Transport" |
| `inbox.tags.kultura` | "Kultura" | "Culture" |
| `inbox.tags.opcenito` | "Opcenito" | "General" |
| `inbox.tags.hitno` | "Hitno" | "Urgent" |
| `inbox.tags.vis` | "Vis" | "Vis" |
| `inbox.tags.komiza` | "Komiza" | "Komiza" |

**SVI kljucevi VEC postoje!** Problem nije u prijevodima.

**Gdje je stvarni problem:**

1. `api.ts:98-101` - `getLanguage()` UVIJEK vraca `'hr'`
2. `useUserContext` ne ukljucuje `language`
3. `api.ts:106-109` - `UserContext` interface nema `language` polje

### B) Promjene

#### Datoteka 1: `src/hooks/useUserContext.ts`

| Akcija | Linija | Promjena |
|--------|--------|----------|
| IMPORT | 14 | Dodajem: `import { useTranslations } from '../i18n';` |
| TIP | 17-20 | Prosirujem interface s `language` |
| HOOK | 29 | Dodajem: `const { language } = useTranslations();` |
| RETURN | 36 | Dodajem `language` u memoized objekt |

**Prije:**
```typescript
export interface UserContext {
  userMode: UserMode;
  municipality: Municipality;
}

export function useUserContext(): UserContext {
  const { data } = useOnboarding();
  // ...
  return useMemo(
    () => ({ userMode, municipality }),
    [userMode, municipality]
  );
}
```

**Poslije:**
```typescript
import { useTranslations } from '../i18n';
import type { Language } from '../contexts/OnboardingContext';

export interface UserContext {
  userMode: UserMode;
  municipality: Municipality;
  language: Language;
}

export function useUserContext(): UserContext {
  const { data } = useOnboarding();
  const { language } = useTranslations();

  const userMode = data?.userMode ?? 'visitor';
  const municipality = data?.municipality ?? null;

  return useMemo(
    () => ({ userMode, municipality, language }),
    [userMode, municipality, language]
  );
}
```

#### Datoteka 2: `src/services/api.ts`

| Akcija | Linija | Promjena |
|--------|--------|----------|
| TIP | 106-109 | Dodajem `language` u UserContext interface |
| BRISANJE | 94-101 | Brisem `getLanguage()` funkciju |
| ZAMJENA | 125 | `getLanguage()` → `context.language ?? 'hr'` |
| ZAMJENA | svi ostali | Isti pattern za sve pozive (17 mjesta) |

**PROBLEM**: Neke API funkcije NE primaju `context` parametar!

Provjera - koje funkcije NEMAJU context:
- `eventsApi.getEvents()` - linija 221-246, NEMA context
- `eventsApi.getEvent()` - linija 251-264, NEMA context
- `eventsApi.getEventDates()` - linija 269-278, NEMA context
- `transportApi.*` - sve funkcije NEMAJU context
- `menuExtrasApi.getExtras()` - NEMA context

**RJESENJE**: Za funkcije bez contexta, dodati opcionalni `language` parametar:

```typescript
async getEvents(
  page: number = 1,
  pageSize: number = 20,
  date?: string,
  language: 'hr' | 'en' = 'hr'  // NOVI parametar
): Promise<EventListResponse>
```

**ALTERNATIVA** (cistija): Prosiriti SVE API funkcije da primaju context

### PITANJE ZA REVIEW

**Opcija A**: Dodati `language` kao opcionalni parametar samo funkcijama koje ga trebaju
- Pro: Minimalna promjena
- Con: Nekonzistentnost - neke funkcije imaju context, neke language

**Opcija B**: Refaktorirati SVE API funkcije da primaju UserContext
- Pro: Konzistentnost
- Con: Vise promjena, svi pozivi moraju proslijediti context

**Moja preporuka**: Opcija A za sada (minimalni fix), Opcija B kao tech debt za kasnije

#### Datoteka 3: `src/screens/events/EventsScreen.tsx`

| Akcija | Linija | Promjena |
|--------|--------|----------|
| DODAJ | nakon 229 | `const { language } = useTranslations();` - VEC postoji na 229! |
| ZAMJENA | 355-360 | Koristiti `formatDayWithDate` umjesto inline `toLocaleDateString` |

**Prije:**
```typescript
{selectedDate.toLocaleDateString('hr-HR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).toUpperCase()}
```

**Poslije:**
```typescript
{formatDayWithDate(selectedDate, language).toUpperCase()}
```

**Novi import:**
```typescript
import { formatDateISO, formatDayWithDate } from '../../utils/dateFormat';
```

#### Datoteka 4: `src/utils/dateFormat.ts`

Funkcije koje trebaju locale parametar:

| Funkcija | Linija | Trenutno | Potrebno |
|----------|--------|----------|----------|
| `formatDateLocaleFull` | 62-70 | hardcoded 'hr-HR' | dodati `locale` param |
| `formatTimeHrHR` | 76-83 | hardcoded 'hr-HR' | preimenovati, dodati `locale` |
| `formatEventTime` | 89-103 | hardcoded 'hr-HR' | dodati `locale` param |

**NAPOMENA**: Ovo je VECA promjena jer zahtijeva update svih poziva ovih funkcija.

**PITANJE ZA REVIEW**: Zelite li da dodam locale parametre ovim funkcijama sada, ili da to ostavim kao zasebni task?

### C) Provjera hardkodiranja

- [x] `language` dolazi iz `useTranslations()` (i18n context)
- [x] Fallback `'hr'` je eksplicitan za edge case-ove
- [x] Ne uvodim nove hardcoded stringove

### D) Testiranje

1. Promijeniti jezik na EN u Settings
2. Otvoriti Events - provjeriti da je datum na engleskom
3. Otvoriti Inbox - provjeriti da su tagovi na engleskom
4. Otvoriti Transport - provjeriti da je datum na engleskom
5. Provjeriti da API vraca sadrzaj na engleskom (ako backend podrzava)

**Rizik**: SREDNJI - vise datoteka, potrebno testirati sve ekrane

---

## BUG 4: Click & Fix "network failed" ali uspjesno spremi

### A) Postojece sto koristim

**Provjera - koristi li se AbortController negdje u projektu?**
```bash
grep -rn "AbortController" mobile/src/
```
Rezultat: **NE** - nigdje se ne koristi

**Provjera - postoji li TIMEOUT konstanta?**
```bash
grep -rn "TIMEOUT" mobile/src/
```
Rezultat: **NE** - ne postoji

**Provjera - kako backend handla upload?**

`backend/src/routes/click-fix.ts:82-87`:
```typescript
await fastify.register(multipart, {
  limits: {
    fileSize: CLICK_FIX_VALIDATION.MAX_PHOTO_SIZE_BYTES,  // 5MB
    files: CLICK_FIX_VALIDATION.MAX_PHOTOS,               // 3 files
  },
});
```

Backend koristi streaming (`pipeline()`) i NEMA timeout - sprema na disk i onda u DB.

### B) Promjene

#### Datoteka: `src/services/api.ts`

| Akcija | Linija | Promjena |
|--------|--------|----------|
| KONSTANTA | vrh filea | Dodajem: `const UPLOAD_TIMEOUT_MS = 120000; // 2 minute za photo upload` |
| PROMJENA | 635-639 | Dodajem AbortController s timeout |

**Prije** (linija 635-639):
```typescript
const response = await fetch(url, {
  method: 'POST',
  headers,
  body: formData,
});
```

**Poslije:**
```typescript
// Timeout za upload - 2 minute (slike mogu biti velike)
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

try {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (response.status === 429) {
    // ... existing rate limit handling
  }

  if (!response.ok) {
    // ... existing error handling
  }

  return response.json() as Promise<ClickFixSubmitResponse>;
} catch (error) {
  clearTimeout(timeoutId);

  // Specifican error za timeout
  if (error instanceof Error && error.name === 'AbortError') {
    throw new Error('Upload timeout - please try again with smaller images or better connection');
  }

  throw error;
}
```

**Novi importi:** Nema - `AbortController` je globalno dostupan u React Native

### C) Provjera hardkodiranja

- [x] Timeout vrijednost: `UPLOAD_TIMEOUT_MS = 120000` - konstanta na vrhu filea
- [x] Error poruka: "Upload timeout..." - **PITANJE**: treba li ovo biti u locale fileovima?
- [x] Ne uvodim nove UI promjene

**PITANJE ZA REVIEW**:
1. Je li 2 minute dovoljan timeout za 3 slike od 5MB na sporoj vezi?
2. Treba li timeout error poruka biti lokalizirana?

### D) Testiranje

1. Testirati upload BEZ slika - mora raditi normalno
2. Testirati upload S slikama na dobroj vezi - mora raditi
3. Testirati s velikim slikama - provjeriti da timeout radi
4. Testirati na STVARNOM uredaju (ne simulator)
5. Simulirati sporu vezu (Network Link Conditioner na iOS)

**Rizik**: SREDNJI
- Timeout moze biti prekratak za spore veze
- Potrebno testiranje na stvarnom uredaju
- Error poruka mozda nije dovoljno jasna korisniku

**VAZNO**: Ovo je HIPOTEZA. Bug mozda nije u timeoutu. Potrebno:
1. Provjeriti backend logove za vrijeme testa
2. Testirati vise puta da se vidi reproducira li se

---

## SAZETAK ZA REVIEW

| Bug | Datoteke | Novi kod | Reuse postojeceg | Rizik |
|-----|----------|----------|------------------|-------|
| 1 - Calendar | 1 | 0 linija | `formatDateISO()` | **NIZAK** |
| 2 - Inbox tags | 2 | ~15 linija | `Badge`, `inboxTokens`, `t()` | **NIZAK** |
| 3 - EN i18n | 4+ | ~30 linija | `useTranslations`, `UserContext` | **SREDNJI** |
| 4 - Click&Fix | 1 | ~20 linija | `AbortController` (novi pattern) | **SREDNJI** |

---

## PITANJA ZA REVIEW

### BUG 3 - EN lokalizacija

1. **API funkcije bez context-a**: Zelite li Opciju A (dodati `language` parametar samo gdje treba) ili Opciju B (refaktorirati sve da primaju context)?

2. **dateFormat.ts funkcije**: Zelite li da dodam `locale` parametar funkcijama `formatDateLocaleFull`, `formatTimeHrHR`, `formatEventTime` sada, ili kao zasebni task?

3. **Flora/Fauna hardcoded stringovi**: Ove komponente koriste inline `language === 'hr' ? 'Hrvatski' : 'English'` pattern. Zelite li da ih prebacim na `t()` sada ili kao zasebni task?

### BUG 4 - Click & Fix

4. **Timeout vrijednost**: Je li 2 minute (120s) prihvatljivo za upload? Alternativa: 3 minute za sigurnost.

5. **Error lokalizacija**: Treba li timeout error poruka biti u locale fileovima?

6. **Validacija hipoteze**: Zelite li da prvo dodamo logging da potvrdimo da je timeout stvarni uzrok prije implementacije fixa?

---

## REDOSLIJED IMPLEMENTACIJE (ako se odobri)

1. **BUG 1 - Calendar** (5 min)
   - Nema ovisnosti
   - Najjednostavniji fix

2. **BUG 2 - Inbox tags** (15 min)
   - Ovisi o BUG 1 samo ako zelimo konzistentno testiranje
   - Moze se raditi paralelno

3. **BUG 3 - EN i18n** (30-45 min)
   - Ovisno o odgovorima na pitanja
   - Zahtijeva testiranje svih ekrana

4. **BUG 4 - Click & Fix** (20 min + testiranje)
   - Zahtijeva testiranje na stvarnom uredaju
   - Mozda potrebna iteracija
