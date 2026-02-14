# BUG 4 Investigation: Click & Fix Network Error

**Datum**: 2026-02-14
**Status**: ISTRAGA ZAVRSENA - potrebno dodatno testiranje

---

## Kontekst

- Bug je **NOV** - prije je radilo
- Uvijek s slikama, uvijek WiFi
- Korisnica je prvi put prijavila ovaj problem
- "Error network na slanju ali uspjesno se snimi"

---

## Sto se promijenilo nedavno

### Relevantni commitovi (zadnja 2 tjedna):

```
8148e76 fix(mobile): unbox 27 ghost icon wrappers + add guardrail
4e71925 fix(ui): radius zero real app (#93)
a287337 fix(mobile): support EXPO_PUBLIC_API_URL for API base URL
83e1395 fix(mobile): polish Slikaj & Popravi form UI
7241090 feat(mobile): redesign Click & Fix as Slikaj & Popravi
```

### Kljucna promjena: `a287337`

Dodana podrska za `EXPO_PUBLIC_API_URL` env varijablu:
```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
  ?? (__DEV__ ? 'http://localhost:3000' : 'https://api.mojvis.hr');
```

**Trenutna konfiguracija** (`.env` i `.env.local`):
```
EXPO_PUBLIC_API_URL=https://api.mojvis-test.pliketiplok.com
```

---

## npm audit fix promjene

Commit `f6f72da` (danas):
- Backend: fastify 5.7.4, vitest 4.0.18
- Mobile: tar, brace-expansion updated
- Admin: react-router 7.12.1+

**NIJEDNA** promjena u mobile/src nije napravljena.
Samo `package-lock.json` je azuriran.

**Relevantne network biblioteke - NISU mijenjane**:
- `react-native` verzija ostala ista
- `expo` verzija ostala ista
- Nema promjena u fetch/network layeru

---

## Backend status

### API Endpoint Test:

```bash
curl -s -X POST https://api.mojvis-test.pliketiplok.com/click-fix \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Response: {"error":"X-Device-ID header is required"}
# HTTP Status: 400
```

**Zakljucak**: Server je DOSTUPAN i ODGOVARA. Problem nije u nedostupnosti servera.

---

## Usporedba Feedback vs Click & Fix

### Feedback Form (api.ts:513-548):
```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ... },
  body: JSON.stringify(data),  // Simple JSON
});
```

### Click & Fix (api.ts:603-653):
```typescript
const formData = new FormData();
formData.append('subject', data.subject);
formData.append('photos', { uri, name, type });  // File upload

const response = await fetch(url, {
  method: 'POST',
  headers,  // NO Content-Type (auto-set for FormData)
  body: formData,  // Multipart form data
});
```

**Kljucna razlika**: Click & Fix koristi **FormData za multipart upload** (slike).

---

## Error Handling Analiza

### ClickFixFormScreen.tsx:141-170:
```typescript
try {
  const response = await clickFixApi.submit(...);
  navigation.replace('ClickFixConfirmation', { clickFixId: response.id });
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : t('clickFix.error.submit');
  setSubmitError(errorMessage);
} finally {
  setIsSubmitting(false);
}
```

### Moguc scenarij za "uspjesno snimi ali error":

1. `fetch()` salje request
2. Server primi request i **SPREMI podatke**
3. Server salje 201 response
4. **NESTO PREKINE** prije nego klijent primi response:
   - Timeout na klijentu
   - Network prekid nakon sto je server odgovorio
   - React Native fetch error
5. Klijent udje u `catch` blok i pokaze error
6. Ali podaci su vec na serveru!

---

## Hipoteze

### Hipoteza 1: TIMEOUT NA PHOTO UPLOAD (Srednja vjerojatnost)

- Nema eksplicitnog timeouta u fetch pozivu
- Velike slike (do 5MB x 3) mogu trajati dugo
- Ali korisnica kaze da je ista WiFi veza kao prije

### Hipoteza 2: INTERMITTENT NETWORK ISSUE (Visoka vjerojatnost)

- Bug je NOV - prije je radilo
- Ista WiFi, iste slike
- Moguce da je WiFi imao kratki prekid TOCNO u trenutku kada je server odgovorio
- To bi objasnilo "error ali uspjesno spremi"

### Hipoteza 3: EXPO/METRO DEV ISSUE (Niska vjerojatnost)

- Vidjeli smo ranije TreeFS error s Metro bundlerom
- Moguce da dev environment ima intermittentne probleme
- Ali to ne bi objasnilo "uspjesno spremi"

### Hipoteza 4: RESPONSE PARSING ERROR (Niska vjerojatnost)

- Server mozda vraca neocekivan response format
- `response.json()` bi mogao baciti error
- Ali to bi se trebalo reproducirati konzistentno

---

## Preporuceni sljedeci koraci

### Korak 1: DODATI LOGGING (Hitno)

Dodati detaljan logging u `clickFixApi.submit()`:
```typescript
console.log('[ClickFix] Starting submit...');
const response = await fetch(url, {...});
console.log('[ClickFix] Response status:', response.status);
console.log('[ClickFix] Response headers:', response.headers);
const data = await response.json();
console.log('[ClickFix] Response data:', data);
```

### Korak 2: TESTIRATI BEZ SLIKA

Zamoliti korisnika da posalje Click & Fix **bez slika** i vidi radi li.
Ako radi bez slika → problem je u photo upload.

### Korak 3: PROVJERITI BACKEND LOGOVE

Ako je moguce, provjeriti backend logove u trenutku kada se bug dogodi:
- Je li request uopce dosao?
- Koji je response poslan?
- Ima li errora na serveru?

### Korak 4: TESTIRATI NA DRUGOM UREDAJU

Reproducirati bug na drugom uredaju/simulatoru da iskljucimo uredaj-specificne probleme.

### Korak 5: RAZMOTRITI TIMEOUT FIX

Ako se potvrdi da je timeout uzrok, implementirati:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 120000);
const response = await fetch(url, { signal: controller.signal, ... });
clearTimeout(timeoutId);
```

---

## Zakljucak

**NE MOZEMO sa sigurnoscu utvrditi root cause** bez dodatnog testiranja.

Najvjerojatniji scenariji:
1. Intermittent network issue (jednokratni WiFi prekid)
2. Timeout na photo upload (ali zasto sada, ne prije?)

**Preporuka**: Dodati logging PRIJE implementacije fixa da se potvrdi hipoteza.

---

## NAPOMENA

Ovaj bug se mozda NECE ponoviti. Ako se dogodio samo jednom i bilo je to zbog intermittent network issue, nema potrebe za hitnim fixom.

Ako se reproducira, prioritet je:
1. Logging
2. Potvrda hipoteze
3. Implementacija fixa
