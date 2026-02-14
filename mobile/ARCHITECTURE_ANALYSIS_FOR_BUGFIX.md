# Architecture Analysis for Bug Fixes

**Datum**: 2026-02-14
**Svrha**: Razumjeti postojecu arhitekturu prije implementacije fixeva

---

## 1. i18n Arhitektura

### Kako sustav TREBA raditi

```
                    ┌─────────────────────┐
                    │  AsyncStorage       │
                    │  @mojvis/language   │
                    └─────────┬───────────┘
                              │ persist
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   OnboardingContext                      │
│  - data.language: 'hr' | 'en'                           │
│  - Sprema/ucitava iz AsyncStorage                       │
│  - Single source of truth za user preferences           │
└─────────────────────────┬───────────────────────────────┘
                          │ useOnboarding()
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   LanguageContext                        │
│  - Cita language iz OnboardingContext                   │
│  - Pruza { language, t } via useTranslations() hook     │
│  - t(key) vraca prijevod iz hr.json ili en.json         │
└─────────────────────────┬───────────────────────────────┘
                          │ useTranslations()
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Screen Components                      │
│  const { t, language } = useTranslations();             │
│  - t('key') za staticki tekst                           │
│  - language za dynamic formatting (dates, locale)       │
└─────────────────────────────────────────────────────────┘
```

**Kljucne datoteke**:
- `src/contexts/OnboardingContext.tsx` - perzistencija jezika
- `src/i18n/LanguageContext.tsx` - t() funkcija i language
- `src/i18n/locales/hr.json` - hrvatski prijevodi (361 linija)
- `src/i18n/locales/en.json` - engleski prijevodi (361 linija)

### ISPRAVAN PATTERN (iz Transport ekrana)

```typescript
// LineDetailScreen.tsx:93
const { t, language } = useTranslations();

// Koristenje language za formatiranje
// LineDetailScreen.tsx:335
{formatDayWithDate(new Date(selectedDate), language)}
```

**Transport ekrani ISPRAVNO**:
1. Koriste `useTranslations()` za `t` I `language`
2. Prosljeduju `language` u `formatDayWithDate(date, locale)`
3. dateFormat.ts `formatDayWithDate` prima `locale: 'hr' | 'en'` parametar

### Gdje je PROBLEM

#### Problem 1: api.ts hardcoded language

```typescript
// src/services/api.ts:98-101
function getLanguage(): 'hr' | 'en' {
  // Default to Croatian
  return 'hr';  // <-- HARDCODED!
}
```

API pozivi UVIJEK salju `Accept-Language: hr`, ignorira user selection.

**Zasto ovo postoji**: Komentar na liniji 96-97 kaze `// TODO: Get from app settings/context`. api.ts je servisna datoteka koja NEMA pristup React Context-u.

#### Problem 2: useUserContext ne ukljucuje language

```typescript
// src/hooks/useUserContext.ts
export function useUserContext(): UserContext {
  const { data } = useOnboarding();
  return {
    userMode: data?.userMode ?? 'visitor',
    municipality: data?.municipality ?? null,
    // NEMA language!
  };
}
```

**Pattern koji VEC postoji**: `useUserContext` izvlaci `userMode` i `municipality` iz OnboardingContext za API pozive.

#### Problem 3: Hardcoded locale stringovi

| Lokacija | Problem |
|----------|---------|
| `EventsScreen.tsx:355` | `toLocaleDateString('hr-HR', ...)` |
| `dateFormat.ts:64,78,98` | `'hr-HR'` hardcoded u 3 funkcije |
| `InboxDetailScreen.tsx:160-169` | `formatTag()` s hrvatskim labelama |
| `FloraSpeciesCard.tsx:259,276,289` | Hardcoded hrvatski tekst |
| `FaunaSpeciesCard.tsx:259,276,289` | Hardcoded hrvatski tekst |

### Preporuceno rjesenje

**Minimalna promjena koja se UKLAPA u postojecu arhitekturu**:

1. **Prosiriti useUserContext** da ukljuci `language`:
   ```typescript
   export interface UserContext {
     userMode: UserMode;
     municipality: Municipality;
     language: Language;  // DODATI
   }
   ```

2. **api.ts prima language kao parametar** (ne cita iz context-a):
   - API funkcije koje trebaju jezik vec primaju `context` parametar
   - Prosiriti `UserContext` interfejs u api.ts da ukljuci `language`
   - Zamijeniti `getLanguage()` pozive s `context.language`

3. **dateFormat.ts prosiriti funkcije** koje koriste locale:
   - `formatDateLocaleFull(isoString, locale)`
   - `formatTimeHrHR(isoString, locale)` -> `formatTime(isoString, locale)`
   - `formatEventTime(isoString, isAllDay, allDayText, locale)`
   - Pattern VEC postoji u `formatDayWithDate(date, locale)`

4. **InboxDetailScreen.tsx**: Koristiti `t('inbox.tags.${tag}')` umjesto `formatTag()`
   - Prijevodi VEC postoje u locale datotekama

### Alternative razmotrene i odbacene

| Alternativa | Zasto NE |
|-------------|----------|
| Globalna varijabla za language | Nije React-way, tesko testirati |
| AsyncStorage direktno u api.ts | Async, komplicirano, duplikacija |
| Singleton language service | Over-engineering za jednostavan problem |
| Quick fix samo za EventsScreen | Ne rjesava sistemski problem |

---

## 2. Date Formatting Arhitektura

### Postojeci pattern u dateFormat.ts

```typescript
// ISPRAVNO - koristi lokalne date metode
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();      // lokalno
  const month = date.getMonth() + 1;    // lokalno
  const day = date.getDate();           // lokalno
  return `${year}-${month}-${day}`;
}

// ISPRAVNO - prima locale parametar
export function formatDayWithDate(date: Date, locale: 'hr' | 'en'): string {
  const localeCode = locale === 'hr' ? 'hr-HR' : 'en-US';
  // ...
}
```

### Zasto Events ne koristi ispravan pattern

```typescript
// EventsScreen.tsx:53-55 - POGRESNO
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];  // UTC!
}
```

**Problem**: `toISOString()` konvertira u UTC. U Hrvatskoj (UTC+1/+2):
- Lokalno: 14.02.2026 00:00:00
- UTC: 13.02.2026 23:00:00
- Rezultat: "2026-02-13" umjesto "2026-02-14"

**Zasto ovo postoji**: EventsScreen je vjerojatno napisan prije konsolidacije dateFormat.ts. Programer nije znao za `formatDateISO()`.

### Preporuceno rjesenje

**Jedna linija promjene**:

```typescript
// PRIJE (EventsScreen.tsx:53-55)
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// POSLIJE - brisanje lokalne funkcije, koristenje centralne
import { formatDateISO } from '../../utils/dateFormat';
// Zamijeniti sve toDateString(date) s formatDateISO(date)
```

**Dodatno** - EventsScreen.tsx:355 koristi hardcoded 'hr-HR':
```typescript
// PRIJE
selectedDate.toLocaleDateString('hr-HR', {...})

// POSLIJE
import { formatDayWithDate } from '../../utils/dateFormat';
formatDayWithDate(selectedDate, language)
```

---

## 3. Inbox Tag Rendering

### Pattern iz DetailScreen (ISPRAVAN)

```typescript
// InboxDetailScreen.tsx:124-142
{(() => {
  const tags = Array.isArray(message.tags) ? message.tags : [];
  const visibleTags = tags.filter((tag) => tag !== 'hitno');
  if (visibleTags.length === 0) return null;
  return (
    <View style={styles.tagsContainer}>
      {visibleTags.map((tag) => (
        <Badge
          key={tag}
          backgroundColor={skin.colors.backgroundSecondary}
          textColor={skin.colors.textMuted}
        >
          {formatTag(tag)}  // <-- ALI OVO JE HARDCODED!
        </Badge>
      ))}
    </View>
  );
})()}
```

**PROBLEM u DetailScreen**: `formatTag()` je hardcoded:
```typescript
function formatTag(tag: string): string {
  const tagLabels: Record<string, string> = {
    promet: 'Promet',      // hardcoded Croatian
    kultura: 'Kultura',    // ...
    // ...
  };
  return tagLabels[tag] || tag;
}
```

### Pattern iz ListScreen tag filter (ISPRAVAN)

```typescript
// InboxListScreen.tsx:497
{t(`inbox.tags.${tag}`)}  // KORISTI i18n!
```

### Sto nedostaje u ListScreen

**List item NE prikazuje tag pills**. Renderira samo:
- Icon (baziran na prvom matching tagu)
- Title
- Body preview
- Date
- NEW badge
- Chevron

Tagovi se koriste za:
1. Odredivanje ikone (`getMessageIconConfig`)
2. Client-side filtriranje

### Preporuceno rjesenje

1. **InboxDetailScreen.tsx**: Zamijeniti `formatTag(tag)` s `t('inbox.tags.${tag}')`
   - Prijevodi VEC postoje u locale datotekama
   - Brisati `formatTag()` funkciju

2. **InboxListScreen.tsx**: Dodati tag pills u `renderMessage()`:
   ```typescript
   // Nakon messageTitle, prije messagePreview
   {item.tags.length > 0 && (
     <View style={styles.tagRow}>
       {item.tags.slice(0, 2).map((tag) => (
         <Badge key={tag} variant="small">
           {t(`inbox.tags.${tag}`)}
         </Badge>
       ))}
     </View>
   )}
   ```

**Komponente za reuse**:
- `Badge` iz `src/ui/Badge.tsx` - VEC koristen u InboxDetailScreen
- Tag background boje VEC definirane u `inboxTokens.tagFilter.chipBackgrounds`

---

## 4. Click & Fix Submit Flow

### Kompletan flow

```
┌──────────────────────────────────────────────────────────────────┐
│ ClickFixFormScreen.tsx                                           │
│                                                                  │
│ handleSubmit() {                                                 │
│   1. validateClickFixForm(subject, description, location)        │
│   2. setIsSubmitting(true)                                       │
│   3. clickFixApi.submit(userContext, data, photos)              │
│      │                                                           │
│      ▼                                                           │
│   4. On success: navigation.replace('ClickFixConfirmation')      │
│   5. On error: setSubmitError(errorMessage)                      │
│   6. finally: setIsSubmitting(false)                             │
│ }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ api.ts - clickFixApi.submit()                                    │
│                                                                  │
│ 1. Kreira FormData                                               │
│    - append('subject', data.subject)                             │
│    - append('description', data.description)                     │
│    - append('location', JSON.stringify(data.location))           │
│    - for each photo: append('photos', {uri, name, type})         │
│                                                                  │
│ 2. fetch(url, { method: 'POST', body: formData })                │
│    - NO TIMEOUT CONFIGURED!                                      │
│    - Headers: X-Device-ID, X-User-Mode, Accept-Language          │
│                                                                  │
│ 3. Check response.ok                                             │
│ 4. Return response.json()                                        │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend - POST /click-fix                                        │
│                                                                  │
│ 1. @fastify/multipart parsira stream                             │
│ 2. Validira polja                                                │
│ 3. Stream photos to disk (UPLOADS_DIR)                           │
│ 4. createClickFix() - sprema u DB                                │
│ 5. Return 201 { id, message }                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Gdje nastaje error

**Hipoteza temeljena na dokazima**:

1. **Nema timeout konfiguracije**:
   - `fetch()` u api.ts nema AbortController
   - React Native default timeout nije dokumentiran
   - Velike slike (3x5MB) mogu uploadati minutama

2. **Backend streaming radi ispravno**:
   - Koristi `pipeline()` za stream to disk
   - Validira NAKON uploada (file size)
   - Sprema u DB tek kad sve proslave

3. **Moguc scenarij**:
   - User uploada 3 slike na sporoj vezi (npr. 3G na otoku)
   - Upload traje 30+ sekundi
   - OS/network layer prijavi "network failed" klijentu
   - Server nastavi primati stream i uspjesno spremi
   - Korisnik vidi error, ali podaci su spremljeni

### Root cause

**NEDOSTATAK TIMEOUT KONFIGURACIJE** u kombinaciji sa:
- Velike slike (do 5MB x 3)
- Spora mobilna veza (karakteristicno za otok Vis)
- Nema progress indicator za upload

### Preporuceno rjesenje

1. **Dodati timeout s AbortController**:
   ```typescript
   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s

   try {
     const response = await fetch(url, {
       signal: controller.signal,
       // ...
     });
   } finally {
     clearTimeout(timeoutId);
   }
   ```

2. **Razmotriti retry logiku**:
   - Ako error ali nije AbortError, retry 1x
   - Ili: pokazati "Checking status..." i provjeriti /click-fix/sent

3. **UX poboljsanje** (izvan scope buga):
   - Progress bar za upload
   - Kompresija slika prije slanja

**VAZNO**: Potrebno testirati na stvarnom uredaju sa sporom vezom!

---

## Redoslijed implementacije

### Preporuceni redoslijed (s ovisnostima)

```
1. BUG 1: Calendar datum
   - Nema ovisnosti
   - Jedna linija promjene
   - Najnizi rizik

2. BUG 3: Inbox tagovi
   - Nema ovisnosti
   - Dva ekrana za promijeniti
   - Reuse postojecih komponenti

3. BUG 2: EN lokalizacija
   - Ovisi o razumijevanju svih zahvacenih ekrana
   - Vise datoteka za promijeniti
   - Moze uvesti regresije ako se ne testira

4. BUG 4: Click & Fix network
   - Najvise rizika
   - Zahtijeva testiranje na uredaju
   - Moze biti false positive (mozda nije bug)
```

### Razlog za redoslijed

1. **Calendar** - 100% siguran fix, jedan import
2. **Inbox tagovi** - Jasno definiran scope, copy-paste existing pattern
3. **EN lokalizacija** - Sistemska promjena, testirati sve ekrane
4. **Click & Fix** - Potrebna analiza s logovima, mozda nije bug

---

## Procjena vremena

| Bug | Promjene | Kompleksnost | Rizik |
|-----|----------|--------------|-------|
| BUG 1: Calendar | 1 datoteka, ~5 linija | Niska | Nizak |
| BUG 2: EN i18n | 5+ datoteka, refactoring | Srednja | Srednji |
| BUG 3: Inbox tags | 2 datoteke, ~30 linija | Niska | Nizak |
| BUG 4: Click & Fix | 1 datoteka, ~20 linija | Srednja | Visok* |

*Visok rizik za BUG 4 jer:
- Moze biti false positive
- Zahtijeva testiranje na uredaju
- Promjena moze utjecati na sve API pozive

---

## Appendix: Kljucne datoteke za reference

```
# i18n sustav
src/contexts/OnboardingContext.tsx    # Perzistencija jezika
src/i18n/LanguageContext.tsx          # t() hook
src/i18n/locales/hr.json              # Hrvatski
src/i18n/locales/en.json              # Engleski
src/hooks/useUserContext.ts           # UserContext za API

# Date formatting
src/utils/dateFormat.ts               # Centralne funkcije

# Inbox
src/screens/inbox/InboxListScreen.tsx
src/screens/inbox/InboxDetailScreen.tsx
src/ui/Badge.tsx                      # Badge komponenta

# Click & Fix
src/screens/click-fix/ClickFixFormScreen.tsx
src/services/api.ts                   # clickFixApi.submit()
backend/src/routes/click-fix.ts       # Server handler

# Transport (reference za ispravne patterne)
src/screens/transport/LineDetailScreen.tsx
src/screens/transport/SeaTransportScreen.tsx
```
