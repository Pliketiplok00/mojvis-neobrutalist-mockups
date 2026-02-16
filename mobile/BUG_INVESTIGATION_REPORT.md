# BUG INVESTIGATION REPORT

**Datum**: 2026-02-14
**Izvrsio**: Claude agent
**Status**: SAMO ISTRAZIVANJE - NISTA NIJE POPRAVLJENO

---

## BUG 1: Events Calendar - SUTRA oznacena kao DANAS

### Opis problema
Calendar u EventsScreen oznacava SUTRA kao danas umjesto danasnjeg datuma.

### Root Cause - IDENTIFICIRANO

**Lokacija**: `src/screens/events/EventsScreen.tsx`, linije 53-55

```typescript
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

**Problem**: Funkcija `toDateString()` koristi `toISOString()` koja konvertira datum u **UTC timezone**, a ne lokalnu vremensku zonu.

**Mehanizam kvara**:

1. Calendar tile se kreira na liniji 107: `const date = new Date(year, month, day);`
   - Ovo stvara datum u **lokalnoj vremenskoj zoni** u ponoc (00:00)

2. Na liniji 108: `const dateStr = toDateString(date);`
   - Ovdje se lokalni datum konvertira u UTC

3. **Primjer za Hrvatsku (UTC+1)**:
   - Lokalno: 14.02.2026 00:00:00 (ponoc)
   - UTC: 13.02.2026 23:00:00
   - `toISOString()` vraca: "2026-02-13T23:00:00.000Z"
   - `.split('T')[0]` vraca: "2026-02-13" (JUCER!)

4. Ali `const today = toDateString(new Date());` (linija 93):
   - Ako je sada 14.02.2026 14:00 lokalno = 13:00 UTC
   - `toISOString()` vraca: "2026-02-14T13:00:00.000Z"
   - today = "2026-02-14"

5. **Rezultat**:
   - today = "2026-02-14"
   - Calendar tile za 14.02. ima dateStr = "2026-02-13" (pomak unazad!)
   - Calendar tile za 15.02. ima dateStr = "2026-02-14" (odgovara `today`!)
   - **SUTRA se oznacava kao DANAS!**

### Ispravna implementacija postoji!

**Lokacija**: `src/utils/dateFormat.ts`, linije 109-114

```typescript
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

Ova funkcija koristi `getFullYear()`, `getMonth()`, `getDate()` koje vracaju **lokalne** vrijednosti - tocno isto sto koristi Transport modul (`LineDetailScreen.tsx`, linija 585-588).

### Preporuka za fix

Zamijeniti `toDateString()` funkciju u EventsScreen.tsx sa importom `formatDateISO` iz `src/utils/dateFormat.ts`.

---

## BUG 2: EN Localizacija nepotpuna

### Opis problema
Aplikacija ne prikazuje engleski prijevod cak ni kada je korisnik odabrao English u onboardingu.

### Root Cause #1 - HARDCODED LANGUAGE U API

**Lokacija**: `src/services/api.ts`, linije 98-101

```typescript
function getLanguage(): 'hr' | 'en' {
  // Default to Croatian
  return 'hr';
}
```

Funkcija `getLanguage()` **uvijek vraca 'hr'** bez obzira na korisnikov odabir. Ova funkcija se koristi u svim API pozivima za `Accept-Language` header.

**Komentari u kodu potvrdjuju**:
- Linija 96-97: `// TODO: Get from app settings/context`

### Root Cause #2 - HARDCODED LOCALE STRINGOVI

Pronadeno **13+ lokacija** s hardkodiranim 'hr-HR' ili hrvatskim tekstom:

| Datoteka | Linija | Problem |
|----------|--------|---------|
| `EventsScreen.tsx` | 355 | `toLocaleDateString('hr-HR', ...)` |
| `dateFormat.ts` | 64 | `toLocaleDateString('hr-HR', ...)` |
| `dateFormat.ts` | 78 | `toLocaleTimeString('hr-HR', ...)` |
| `dateFormat.ts` | 98 | `toLocaleTimeString('hr-HR', ...)` |
| `FloraSpeciesCard.tsx` | 259 | `'Slika nije dostupna'` hardcoded |
| `FloraSpeciesCard.tsx` | 276 | `'Kako prepoznati'` hardcoded |
| `FloraSpeciesCard.tsx` | 289 | `'Staniste'` hardcoded |
| `FaunaSpeciesCard.tsx` | 259 | `'Slika nije dostupna'` hardcoded |
| `FaunaSpeciesCard.tsx` | 276 | `'Kako prepoznati'` hardcoded |
| `FaunaSpeciesCard.tsx` | 289 | `'Staniste'` hardcoded |
| `MirrorEventsScreen.tsx` | 275 | `toLocaleDateString('hr-HR', ...)` |
| `MirrorEventDetailScreen.tsx` | 48 | `toLocaleDateString('hr-HR', ...)` |

### Status locale datoteka

**DOBRA VIJEST**: Locale datoteke su KOMPLETNE!

- `src/i18n/locales/hr.json` - 361 linija
- `src/i18n/locales/en.json` - 361 linija

Obje datoteke imaju istu strukturu i sve kljuceve. Problem nije u prijevodima vec u tome sto se prijevodi ne koriste.

### Preporuka za fix

1. **api.ts**: Implementirati `getLanguage()` da cita iz OnboardingContext
2. **dateFormat.ts**: Prosiriti funkcije da primaju `locale` parametar (kao sto `formatDayWithDate` vec radi na liniji 135)
3. **FloraSpeciesCard/FaunaSpeciesCard**: Zamijeniti hardkodirane stringove s `t()` pozivima
4. **EventsScreen.tsx linija 355**: Koristiti language iz context-a

---

## BUG 3: Inbox pokazuje samo 1 tag

### Opis problema
Na listi poruka u Inboxu vidi se samo jedan tag (ili ikona bazirana na jednom tagu) umjesto svih tagova koje poruka ima.

### Root Cause - TAG PILLS NISU IMPLEMENTIRANI U LISTI

**Lokacija**: `src/screens/inbox/InboxListScreen.tsx`

**Sto se dogada**:

1. **Tagovi se KORISTE** za odredivanje ikone (linija 270):
   ```typescript
   const { icon, background } = getMessageIconConfig(item.tags, item.is_urgent);
   ```

2. **Logika `getMessageIconConfig`** (linije 72-89) vraca SAMO JEDNU ikonu bazirano na prioritetu:
   - hitno (urgent) → shield-alert
   - promet → traffic-cone
   - kultura → calendar-heart
   - opcenito → newspaper
   - vis/komiza → megaphone
   - default → mail

3. **U renderMessage funkciji** (linije 268-326), UI prikazuje:
   - Ikonu (baziranu na prvom matching tagu)
   - Naslov
   - Preview teksta
   - Datum
   - NEW badge (ako neprocitano)
   - Chevron

   **ALI NEMA PRIKAZIVANJA TAGOVA KAO PILLS/BADGES!**

4. **Usporedba s InboxDetailScreen** (linije 124-142):
   ```typescript
   {visibleTags.map((tag) => (
     <Badge key={tag} ...>
       {formatTag(tag)}
     </Badge>
   ))}
   ```
   Detail screen PRAVILNO prikazuje sve tagove kao badges.

### Sto korisnik ocekuje vs sto dobiva

| Ocekivano | Stvarno |
|-----------|---------|
| Svaka poruka ima tag pills (npr. "Promet", "Kultura") | Samo ikona koja predstavlja JEDAN tag |
| Vise tagova vidljivo odjednom | Samo prioritetna ikona vidljiva |

### Filter tagovi vs Display tagovi

- **Filter bar** (linije 470-505): Radi ispravno - korisnik moze filtrirati po tagovima
- **List item display**: NE prikazuje tagove - korisnik ne zna koji tagovi su na poruci dok ne otvori detail

### Preporuka za fix

Dodati tag pills u `renderMessage` funkciju nakon naslova ili iznad datuma, koristeci isti pattern kao u InboxDetailScreen.

---

## BUG 4: Click & Fix - Network error ali uspjesno spremi

### Opis problema
Prilikom slanja Click & Fix prijave, korisnik vidi "network failed" error poruku, ali prijava se uspjesno spremi u bazu.

### Analiza koda

**Lokacija submit handlera**: `src/screens/click-fix/ClickFixFormScreen.tsx`, linije 141-170

```typescript
const handleSubmit = useCallback(async () => {
  // ... validation ...
  setIsSubmitting(true);

  try {
    const response = await clickFixApi.submit(
      userContext,
      { subject, description, location },
      photos
    );
    navigation.replace('ClickFixConfirmation', { clickFixId: response.id });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : t('clickFix.error.submit');
    setSubmitError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
}, [...]);
```

**Lokacija API poziva**: `src/services/api.ts`, linije 603-653

```typescript
async submit(...): Promise<ClickFixSubmitResponse> {
  // FormData za multipart upload (slike)
  const formData = new FormData();
  // ... append fields ...

  for (const photo of photos) {
    formData.append('photos', {
      uri: photo.uri,
      name: photo.fileName,
      type: photo.mimeType,
    } as unknown as Blob);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) { throw ... }
  return response.json();
}
```

### Moguce root cause hipoteze

#### Hipoteza 1: TIMEOUT NA UPLOAD VELIKIH SLIKA (NAJVJEROJATNIJA)

- React Native fetch **NEMA eksplicitan timeout**
- Upload 3 slike moze trajati dugo na sporoj vezi
- OS/network layer moze prijaviti "network failed" prije nego sto RN dobije odgovor
- Server primi podatke i spremi ih, ali klijent ne primi potvrdu

**Dokaz**:
- Nema `timeout` parametra u fetch pozivu (linija 635-639)
- Slike se salju kao FormData multipart (linije 617-623)

#### Hipoteza 2: Race condition s navigacijom

- Na uspjeh: `navigation.replace()` uklanja ekran (linija 163)
- `finally` blok se izvrsava na unmountanom componentu (linija 168)
- Moguce React Native upozorenje o state update na unmounted component

#### Hipoteza 3: Expo/Metro dev server issue

- Vidjeli smo ranije TreeFS error s Metro bundlerom
- Moguc prekid dev server veze tijekom uploada
- Produkcija mozda ne bi imala ovaj problem

### Preporuke za daljnju istragu

1. **Testirati bez slika** - ako radi bez slika, problem je u upload timeoutu
2. **Dodati explicit timeout** u fetch poziv (npr. AbortController)
3. **Logirati response status** prije navigacije
4. **Testirati na production buildu** - iskljuciti Metro bundler probleme

---

## SAZETAK

| Bug | Status | Root Cause | Slozjenost fixa |
|-----|--------|------------|-----------------|
| BUG 1: Calendar datum | IDENTIFICIRANO | UTC vs Local timezone u toDateString() | Jednostavno - zamjena funkcije |
| BUG 2: EN lokalizacija | IDENTIFICIRANO | Hardcoded 'hr' + 'hr-HR' na 13+ mjesta | Srednje - refactoring |
| BUG 3: Inbox tagovi | IDENTIFICIRANO | Tag pills nisu implementirani u listi | Jednostavno - dodati UI |
| BUG 4: Network error | HIPOTEZA | Vjerojatno timeout na photo upload | Srednje - potrebno testiranje |

---

## VAZNE DATOTEKE ZA POPRAVKE

```
src/screens/events/EventsScreen.tsx        # BUG 1, BUG 2
src/screens/inbox/InboxListScreen.tsx      # BUG 3
src/screens/click-fix/ClickFixFormScreen.tsx # BUG 4
src/services/api.ts                        # BUG 2, BUG 4
src/utils/dateFormat.ts                    # BUG 2
src/screens/flora/components/FloraSpeciesCard.tsx # BUG 2
src/screens/fauna/components/FaunaSpeciesCard.tsx # BUG 2
```

---

**NAPOMENA**: Ovaj izvjestaj dokumentira samo istrazivanje. Niti jedna datoteka nije modificirana.
