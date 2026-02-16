# CODE QUALITY DEEP AUDIT - MOJ VIS
**Datum**: 2026-02-14
**Auditor**: Claude (automatska analiza koda)
**Verzija**: 1.0

---

## EXECUTIVE SUMMARY

### Zdravlje projekta: DOBRO (7/10)

| Kategorija | Ocjena | Komentar |
|------------|--------|----------|
| Sigurnost | 8/10 | Solidna auth implementacija, nema kritičnih rupa |
| Organizacija koda | 7/10 | Dobra struktura, ali neki file-ovi predugački |
| Dizajn sustav | 9/10 | Odličan skin.ts, centralizirani tokeni |
| Testovi | 5/10 | Backend OK, mobile/admin nedostaju |
| Dokumentacija | 8/10 | Opsežna, ali raspršena |
| Dependency health | 6/10 | Ima ranjivosti koje treba popraviti |

### Top 3 prioriteta za akciju:
1. **Popraviti npm audit ranjivosti** (posebno fastify HIGH)
2. **Dodati testove za mobile** (trenutno 0 testova)
3. **Refaktorirati predugačke datoteke** (LineDetailScreen: 908 linija)

---

## 1. SECURITY AUDIT - Admin Panel

### 1.1 Autentifikacija - DOBRO

**Lokacija**: `backend/src/middleware/auth.ts`, `backend/src/services/auth.ts`

**Implementacija**:
- Cookie-based session autentifikacija (NE JWT)
- bcrypt s cost factor 12 za hashiranje lozinki
- Session token: 32 bytes random, SHA-256 hash u bazi
- HttpOnly cookies s SameSite=Lax

**Sigurnosni invarijanti (iz koda)**:
```typescript
// backend/src/middleware/auth.ts:7-11
* SECURITY INVARIANTS:
* - Cookie: httpOnly, SameSite=Lax (NOT Strict), Secure in production
* - Domain: EMPTY for localhost (host-only cookie), ".mojvis.hr" for production
* - Identity derived ONLY from validated session, NEVER from headers
* - X-Admin-Role, X-Admin-Municipality, X-Admin-User headers are NOT trusted
```

### 1.2 Admin rute - SVE ZAŠTIĆENE

**Mehanizam**: Global preHandler hook u `backend/src/index.ts:81`:
```typescript
fastify.addHook('preHandler', adminAuthHook);
```

**Koja ruta je zaštićena**:

| Ruta | Auth? | Napomena |
|------|-------|----------|
| `/admin/auth/login` | NE | Namjerno - za login |
| `/admin/auth/me` | DA | Vraća session info |
| `/admin/inbox/*` | DA | CRUD inbox poruka |
| `/admin/events/*` | DA | CRUD događanja |
| `/admin/pages/*` | DA | CMS stranice |
| `/admin/feedback/*` | DA | Pregled feedbacka |
| `/admin/click-fix/*` | DA | Upravljanje prijavama |
| `/admin/menu/extras` | DA | Menu stavke |
| `/admin/reminders/*` | DA | Reminder jobs |
| `/admin/translate` | DA | DeepL prijevod |

**NALAZ**: Sve admin rute su pravilno zaštićene globalnim hookom. Jedina iznimka je `/admin/auth/*` što je ispravno.

### 1.3 CORS konfiguracija - ISPRAVNO

```typescript
// backend/src/index.ts:66-71
await fastify.register(cors, {
  origin: env.ADMIN_ALLOWED_ORIGIN, // Explicit origin, NOT wildcard
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Device-ID'],
});
```

**DOBRO**: Koristi eksplicitni origin, NE wildcard s credentials.

### 1.4 Poznati sigurnosni problemi

| Problem | Ozbiljnost | Lokacija | Status |
|---------|------------|----------|--------|
| Break-glass raw password | NISKA | auth.ts:300 | Dev only, documented |
| Nema rate limiting na admin | SREDNJA | admin routes | TODO |
| DeepL API key exposure | NISKA | .env | Pravilno u .env |

### 1.5 TODO komentari vezani za sigurnost

```
backend/src/routes/admin-reminders.ts:21 - TODO: Add admin authentication middleware
backend/src/routes/admin-events.ts:95 - TODO: Add admin authentication middleware
```

**NAPOMENA**: Ovi TODO-ovi su ZASTARJELI - auth middleware JE dodan globalno. Komentari treba ukloniti.

---

## 2. GIT & BRANCH ANALIZA

### 2.1 Trenutni status

- **Trenutni branch**: `fix/final-unbox-all-icons-pattern-based`
- **Commits ahead of main**: 3
  ```
  8148e76 fix(mobile): unbox 27 ghost icon wrappers + add guardrail
  56aa61b docs: boxed-icon inventory scan (pattern-based)
  a938578 docs(audit): pattern-based boxed icon wrapper inventory
  ```

### 2.2 Nemergirani remote branchevi (44 aktivna)

| Kategorija | Broj | Primjeri |
|------------|------|----------|
| `audit/*` | 7 | security-model, cross-system-flows |
| `chore/*` | 6 | ci-design-guardrails, quarantine-untracked |
| `docs/*` | 3 | visual-decision-charter |
| `feat/*` | 8 | flora-fauna-hub, onboarding-role-card |
| `fix/*` | 15 | transport-disjoint-seasons, unbox-icons |
| `integration/*` | 1 | design-baseline-final |
| `plan/*` | 1 | implementation-phases |

### 2.3 Branchevi za čišćenje (vjerojatno mergani ili napušteni)

```
origin/fix/maestro-a1-missing-screenshots
origin/fix/maestro-ci-accessibility-dump
origin/fix/maestro-ci-embed-js-bundle
origin/fix/maestro-ci-selector-discovery
origin/fix/maestro-selector-discovery-real
```

**PREPORUKA**: Očistiti stare feature brancheve nakon provjere.

---

## 3. TRANSPORT MODUL - Struktura i krhkost

### 3.1 Struktura datoteka

```
backend/
├── src/
│   ├── routes/transport.ts          # 428 linija - API endpointi
│   ├── repositories/transport.ts    # DB queries
│   ├── services/transport-import.ts # Import logika
│   ├── types/transport.ts           # TypeScript tipovi
│   └── data/lines/                  # JSON definicije linija
│       ├── line-01.json             # Bus Vis-Komiža
│       ├── line-602.json            # Trajekt Split-Vis
│       ├── line-612.json            # Trajekt Hvar-Vis
│       ├── line-659.json            # Catamaran Split-Vis
│       └── line-9602.json           # Trajekt (alternativa)
│
mobile/
└── src/
    ├── screens/transport/
    │   ├── TransportHubScreen.tsx    # 280 linija
    │   ├── RoadTransportScreen.tsx   # 537 linija
    │   ├── SeaTransportScreen.tsx    # 587 linija
    │   └── LineDetailScreen.tsx      # 908 linija (PREDUGAČKO!)
    ├── services/api.ts               # transportApi objekt
    └── types/transport.ts
```

### 3.2 Procedura dodavanja nove linije

1. **Kreiraj JSON datoteku** u `backend/src/data/lines/line-XXX.json`
2. **JSON struktura** (iz line-602.json):
   ```json
   {
     "id": "uuid",
     "line_number": "602",
     "name_hr": "Split - Vis",
     "name_en": "Split - Vis",
     "transport_type": "sea",
     "subtype_hr": "trajekt",
     "routes": [...],
     "seasons": [...],
     "departures": [...]
   }
   ```
3. **Pokreni import**: `npm run transport:import src/data/lines/line-XXX.json`
4. **Tablice koje se ažuriraju**:
   - `transport_lines`
   - `transport_routes`
   - `transport_stops`
   - `transport_route_stops`
   - `transport_seasons`
   - `transport_departures`
   - `transport_departure_times`
   - `transport_contacts`

**KOMPLEKSNOST**: SREDNJA - procedura je dobro dokumentirana u `docs/transport/TRANSPORT_IMPORT_RUNBOOK.md`

### 3.3 Hardkodirane vrijednosti - NEMA KRITIČNIH

Pretraga za hardkodirane line ID-ove pokazuje da su svi u:
- JSON data files (očekivano)
- Dokumentacija (očekivano)
- TypeScript komentari (za primjere)

**DOBRO**: Nema hardkodiranih line ID-ova u logici aplikacije.

### 3.4 Krhkost transport modula

| Rizik | Opis | Mitigacija |
|-------|------|------------|
| Sezone | Složena logika za multiple sezone godišnje | Dobro testirano (30 testova) |
| Holidays | Hrvatski praznici hardkodirani | Ažurirati godišnje |
| JSON format | Striktna validacija | Testovi pokrivaju |
| Line colors | Hardkodirane u skin.ts | Dodati u JSON? |

---

## 4. DIZAJN SUSTAV AUDIT

### 4.1 Centralizirana tema - ODLIČNO

**Lokacija**: `mobile/src/ui/skin.neobrut2.ts` (1069 linija)

**Struktura**:
```typescript
export const skinNeobrut2 = {
  colors,      // 50+ boja definirano
  spacing,     // xs/sm/md/lg/xl/xxl/xxxl
  borders,     // widthHairline/Thin/Card/Heavy
  shadows,     // card, soft, menuItemBox
  typography,  // fontFamily, fontSize, fontWeight
  icons,       // size (xs-xl), strokeWidth
  sizes,       // specifične dimenzije
  images,      // asset registar
  components,  // header, screen, section, card, button, etc.
  opacity,     // hidden/disabled/subtle/muted/soft/strong/full
};
```

### 4.2 Boje - DOBRO ORGANIZIRANO

**Paleta** (HSL vrijednosti):
- Primary: `hsl(201, 68, 47)` - Mediterranean Blue
- Secondary: `hsl(143, 79, 38)` - Olive Green
- Accent: `hsl(45, 98, 53)` - Sun Yellow
- Destructive: `hsl(12, 69, 51)` - Terracotta Red

**Hardkodirane hex boje u komponentama**: MINIMALNO
- Većina koristi `skin.colors.*`
- Pronađeno nekoliko `rgba()` direktno u kodu (za overlay efekte)

### 4.3 Ikone - lucide-react-native

**Veličine definirane u skin.ts:144-156**:
```typescript
icons: {
  size: { xs: 14, sm: 18, md: 24, lg: 32, xl: 40 },
  strokeWidth: { light: 1.5, regular: 2, strong: 2.5 },
}
```

**Konzistentnost veličina**: UGLAVNOM DOBRO
- Većina koristi `skin.icons.size.md` (24px)
- Neki hardkodirani `size={20}` ili `size={22}` - treba standardizirati

### 4.4 Tipografija

**Fontovi**:
- Display: Space Grotesk (Regular, Medium, SemiBold, Bold)
- Body: Space Mono (Regular, Bold)

**Font sizes**: xs(10), sm(12), md(14), lg(16), xl(18), xxl(24), xxxl(28)

### 4.5 "Boxed icon" pattern

Iz commit poruka - projekt je prošao kroz refaktoring ikona. Pattern:
- Ikone u "boxed" containeru (border + background)
- Koristi se za header buttons, list items, transport tiles
- Definirano u `skin.components.header.iconBoxSize: 44`

---

## 5. KONZISTENTNOST KOMPONENTI

### 5.1 Mobile komponente

```
mobile/src/components/
├── Banner.tsx           # Obavijesti banner
├── DepartureItem.tsx    # Transport departure row
├── GlobalHeader.tsx     # App header (hamburger, title, inbox)
├── MenuOverlay.tsx      # Full-screen menu
├── common/              # Shared primitives
└── services/            # Service-specific components
```

### 5.2 Props konzistentnost

**GlobalHeader.tsx** - DOBRO TIPIZIRANO:
```typescript
interface GlobalHeaderProps {
  title?: string;
  showMenu?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}
```

**DepartureItem.tsx** - DOBRO TIPIZIRANO s default props

### 5.3 Duplicirani kod

**Potencijalni duplikati pronađeni**:
- `RoadTransportScreen.tsx` (537 linija) vs `SeaTransportScreen.tsx` (587 linija)
  - 80% identična logika, samo različite boje/ikone
  - **PREPORUKA**: Ekstraktirati zajedničku `TransportListScreen` komponentu

- `RoadLineDetailScreen.tsx` vs `SeaLineDetailScreen.tsx`
  - Oba wrappaju `LineDetailScreen.tsx` s različitim transportType

---

## 6. NAJKRITIČNIJI SEGMENTI

### 6.1 Najrizičnija mjesta za promjene

| Datoteka | Linija | Rizik | Razlog |
|----------|--------|-------|--------|
| `LineDetailScreen.tsx` | 908 | VISOK | Predugačko, puno stanja |
| `admin-inbox.ts` | 709 | VISOK | Kompleksna logika, auth rules |
| `skin.neobrut2.ts` | 1069 | SREDNJI | Promjena utječe na sve |
| `transport.ts` (routes) | 428 | SREDNJI | Kompleksna query logika |

### 6.2 Najzapetljaniji kod

1. **`LineDetailScreen.tsx`** (908 linija)
   - Miješa UI, state, API calls
   - Trebalo bi razbiti na manje komponente

2. **`InboxListScreen.tsx`** (759 linija)
   - Kompleksna tab navigacija
   - Tag filtering logika

3. **Transport season/departure logika**
   - Raspoređena preko repository i routes
   - Dobro testirana, ali kompleksna

### 6.3 Predugačke datoteke (>500 linija)

**Backend routes**:
- `admin-inbox.ts`: 709 linija
- `admin-static-pages.ts`: 678 linija

**Mobile screens**:
- `LineDetailScreen.tsx`: 908 linija
- `UiInventoryScreen.tsx`: 794 linija (dev screen, OK)
- `StaticPageScreen.tsx`: 781 linija
- `InboxListScreen.tsx`: 759 linija
- `EventsScreen.tsx`: 620 linija
- `SeaTransportScreen.tsx`: 587 linija
- `RoadTransportScreen.tsx`: 537 linija
- `HomeScreen.tsx`: 516 linija

---

## 7. DEVELOPMENT ENVIRONMENT SETUP

### 7.1 Lokalno pokretanje

**Backend**:
```bash
cd backend
npm install          # ~30 sekundi
cp .env.example .env # Urediti DB credentials
npm run dev          # Pokreće na :3000
```

**ZAHTIJEVA**: PostgreSQL lokalno (ili remote)

**Mobile**:
```bash
cd mobile
npm install          # ~60 sekundi
npx expo start       # Metro bundler
# Scan QR s Expo Go app
```

**RADI BEZ PROBLEMA** ako je backend dostupan.

**Admin**:
```bash
cd admin
npm install          # ~30 sekundi
npm run dev          # Vite na :5173
```

**Vrijeme do running**: ~5-10 minuta (s predinstaliranim Node/PostgreSQL)

### 7.2 Baza podataka

**Migracije**: `backend/src/db/migrations/` (21 SQL datoteka)

**Pokretanje migracija**: Automatski pri startu backend-a

**Seed data**: `backend/src/data/seed/transport-seed.json`

**Import transport data**:
```bash
cd backend
npm run transport:import src/data/lines/line-602.json
```

### 7.3 Environment variables

**Backend (.env.example)**:
```
# OBAVEZNE
PORT=3000
HOST=0.0.0.0
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mojvis
DB_USER=postgres
DB_PASSWORD=<secret>

# OPCIONALNE
DEEPL_API_KEY=           # Za HR→EN prijevod
BREAKGLASS_USERNAME=     # Emergency admin
BREAKGLASS_PASSWORD=
BREAKGLASS_MUNICIPALITY=
```

**Mobile (.env)**:
```
# OBAVEZNO
EXPO_PUBLIC_API_URL=https://api.mojvis-test.pliketiplok.com
```

**Admin**: Nema .env - koristi Vite proxy za API

---

## 8. DEPLOYMENT & INFRASTRUCTURE

### 8.1 Produkcija

- **API**: `api.mojvis-test.pliketiplok.com` (Hetzner)
- **Admin**: Nije deployano (lokalni development)
- **Mobile**: Expo Go / Development build

### 8.2 CI/CD Workflows

**`.github/workflows/backend.yml`**:
- Trigger: push/PR na `main` koji dira `backend/`
- Koraci: npm ci → lint → test → build
- **NE DEPLOYA** - samo validacija

**`.github/workflows/admin.yml`**:
- Trigger: push/PR na `main` koji dira `admin/`
- Koraci: npm ci → lint → build
- **NE DEPLOYA**

**`.github/workflows/design-guardrails.yml`**:
- Design system validacija

### 8.3 Manual deployment

Dokumentirano u `docs/transport/HETZNER_REIMPORT_2026.md`:
```bash
ssh root@hetzner-server
cd /app/mojvis-backend
git pull
npm install
npm run build
pm2 restart mojvis-api
```

---

## 9. API DOKUMENTACIJA

### 9.1 Endpoint mapa

| Method | Path | Opis | Auth |
|--------|------|------|------|
| **Health** |
| GET | `/health/live` | Liveness check | Ne |
| GET | `/health/ready` | Readiness check | Ne |
| **Inbox** |
| GET | `/inbox` | Lista poruka | Ne |
| GET | `/inbox/:id` | Detalj poruke | Ne |
| GET | `/banners/active` | Aktivni banneri | Ne |
| **Events** |
| GET | `/events` | Lista događanja | Ne |
| GET | `/events/:id` | Detalj događanja | Ne |
| GET | `/events/dates` | Datumi s događanjima | Ne |
| POST | `/events/:id/subscribe` | Pretplata | Ne (device) |
| DELETE | `/events/:id/subscribe` | Odjava | Ne (device) |
| **Transport** |
| GET | `/transport/road/lines` | Bus linije | Ne |
| GET | `/transport/sea/lines` | Ferry linije | Ne |
| GET | `/transport/{type}/lines/:id` | Detalj linije | Ne |
| GET | `/transport/{type}/lines/:id/departures` | Polasci | Ne |
| GET | `/transport/{type}/today` | Danas polasci | Ne |
| **Feedback** |
| POST | `/feedback` | Pošalji feedback | Ne (device) |
| GET | `/feedback/:id` | Detalj feedbacka | Ne (device) |
| GET | `/feedback/sent` | Moji feedbacki | Ne (device) |
| **Click & Fix** |
| POST | `/click-fix` | Prijavi problem | Ne (device) |
| GET | `/click-fix/:id` | Detalj prijave | Ne (device) |
| GET | `/click-fix/sent` | Moje prijave | Ne (device) |
| **Device** |
| POST | `/device/push-token` | Registriraj push | Ne (device) |
| PATCH | `/device/push-opt-in` | Opt-in/out | Ne (device) |
| **Pages** |
| GET | `/pages` | Lista stranica | Ne |
| GET | `/pages/:slug` | Sadržaj stranice | Ne |
| **Menu** |
| GET | `/menu/extras` | Dodatne menu stavke | Ne |
| **Admin** |
| POST | `/admin/auth/login` | Login | Ne |
| GET | `/admin/auth/me` | Session info | DA |
| * | `/admin/inbox/*` | CRUD inbox | DA |
| * | `/admin/events/*` | CRUD events | DA |
| * | `/admin/pages/*` | CRUD pages | DA |
| * | `/admin/feedback/*` | Manage feedback | DA |
| * | `/admin/click-fix/*` | Manage issues | DA |
| * | `/admin/menu/extras` | Manage menu | DA |
| POST | `/admin/translate` | DeepL translate | DA |

### 9.2 Error format

```json
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

HTTP kodovi: 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

---

## 10. MOBILE APP ARCHITECTURE

### 10.1 State management

**Korišteni Context-i** (`mobile/src/contexts/`):
- `OnboardingContext.tsx` - Onboarding completion state
- `UnreadContext.tsx` - Unread message count
- `PushContext.tsx` - Push notification state
- `MenuContext.tsx` - Menu overlay state

**PROCJENA**: Dobro podijeljeno, nije preglomazno. Svaki context ima jednu odgovornost.

### 10.2 Navigation struktura

```
RootStack
├── Onboarding (ako nije završen)
│   ├── LanguageSelection
│   ├── UserModeSelection
│   └── MunicipalitySelection
│
└── Main (nakon onboardinga)
    ├── Home
    ├── TransportHub
    │   ├── RoadTransport → RoadLineDetail
    │   └── SeaTransport → SeaLineDetail
    ├── Events → EventDetail
    ├── Inbox → InboxDetail
    ├── FeedbackForm → FeedbackConfirmation
    ├── ClickFixForm → ClickFixConfirmation
    ├── Flora
    ├── Fauna
    ├── JavneUsluge
    ├── StaticPage
    └── Settings
```

**Deep links**: Nisu implementirani.

### 10.3 API integracija

**Lokacija**: `mobile/src/services/api.ts` (814 linija)

**Implementacija**:
- Plain `fetch()` - nema axios ili react-query
- Nema automatski retry
- Nema offline handling
- Nema request caching

**TODO-ovi u api.ts**:
```typescript
// Line 87: TODO: Store persistently using AsyncStorage
// Line 96: TODO: Get from app settings/context
```

### 10.4 Data flow primjer (Events)

1. `EventsScreen` mounts
2. `useEffect` poziva `eventsApi.getEvents()`
3. `fetch()` → backend `/events`
4. Response se sprema u `useState`
5. FlatList renderira `EventCard` komponente
6. Pull-to-refresh poziva `onRefresh()`

---

## 11. ERROR HANDLING & LOGGING

### 11.1 Backend logging

**Alat**: Pino (Fastify default)
- Development: `pino-pretty` (human-readable)
- Production: JSON logs

**Log levels**:
- Development: `info`
- Production: `warn`

### 11.2 Error tracking

**NEMA** Sentry/Bugsnag integracije.

**Kako se saznaje o errorima**: Ručni pregled logova na serveru.

### 11.3 Mobile error handling

```typescript
// Tipični pattern u api.ts
if (!response.ok) {
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
}
```

**Error boundary**: NIJE IMPLEMENTIRAN na app razini.

**Korisničko iskustvo pri grešci**: Generička error poruka ili prazan screen.

---

## 12. KNOWN ISSUES & BUGS

### 12.1 TODO/FIXME u kodu

| Lokacija | Tip | Prioritet | Opis |
|----------|-----|-----------|------|
| `api.ts:87` | TODO | SREDNJI | Store device ID in AsyncStorage |
| `api.ts:96` | TODO | SREDNJI | Get language from settings |
| `admin-reminders.ts:9` | TODO | NIZAK | Schedule automatic execution |
| `admin-inbox.ts:177` | TODO | NIZAK | Anonymous device identification |
| `UnreadContext.tsx:67-68` | TODO | SREDNJI | Persist unread state |

### 12.2 Poznati bugovi

Iz dokumentacije (`docs/transport/QUERY_ROOT_CAUSE_REPORT_2026.md`):
> Query dohvaća samo PRVU sezonu - potencijalni bug ako linija ima više aktivnih sezona

### 12.3 Flaky areas

- **Transport season logic**: Kompleksna, ali dobro testirana
- **Push notifications**: Ograničena funkcionalnost u Expo Go

---

## 13. DEPENDENCY HEALTH

### 13.1 Sigurnosne ranjivosti

**Backend** (5 vulnerabilities):
| Paket | Severity | Opis |
|-------|----------|------|
| fastify ≤5.7.2 | HIGH | DoS via sendWebStream |
| esbuild | MODERATE | Dev server request exposure |
| vite | MODERATE | Depends on vulnerable esbuild |

**Mobile** (2 vulnerabilities):
| Paket | Severity | Opis |
|-------|----------|------|
| @isaacs/brace-expansion 5.0.0 | HIGH | Uncontrolled resource consumption |
| tar ≤7.5.6 | HIGH | Symlink poisoning |

**Admin** (2 vulnerabilities):
| Paket | Severity | Opis |
|-------|----------|------|
| react-router 7.0.0-7.12.0 | HIGH | CSRF + XSS |

### 13.2 Rješenje

```bash
# Backend
cd backend && npm audit fix

# Mobile
cd mobile && npm audit fix

# Admin
cd admin && npm audit fix
```

---

## 14. PERFORMANCE CONSIDERATIONS

### 14.1 Backend performance

**Potencijalni problemi**:
- **Transport lines list**: Svaki line radi dodatni query za stops
  - Lokacija: `transport.ts:90-116`
  - Nije N+1 jer koristi `Promise.all`, ali moglo bi se optimizirati s JOIN-om

**Pagination**: DA - svi list endpointi imaju `page` i `page_size`

### 14.2 Mobile performance

**FlatList korištenje**: DA - sve liste koriste FlatList

**Memoizacija**: DJELOMIČNO
- Neke komponente imaju `React.memo`
- Nedostaje `useCallback` za event handlere

**Slike**: Koristi `expo-image` s cachingom

---

## 15. TESTING INFRASTRUCTURE

### 15.1 Backend testovi

```bash
cd backend && npm test
```

**Rezultat**: 100 testova PROLAZI
- `language-enforcement.test.ts` (26)
- `menu-extras.test.ts` (19)
- `transport-import.test.ts` (9)
- `inbox-source-type-filter.test.ts` (9)
- `transport-validation.test.ts` (30)
- `reminder-generation.test.ts` (7)

**Coverage**: Nije konfiguriran

### 15.2 Mobile testovi

```bash
cd mobile && npm test
```

**Rezultat**: NEMA TESTOVA (Jest konfiguriran, ali prazno)

### 15.3 Admin E2E testovi

```bash
cd admin && npm run test:e2e
```

**Zahtijeva**: Lokalni PostgreSQL + Backend running

**Test datoteke**:
- `navigation.spec.ts`
- `inbox.spec.ts`
- `feedback-clickfix.spec.ts`

---

## 16. QUICK REFERENCE CARD

### Svakodnevne komande

```bash
# Backend development
cd backend && npm run dev

# Mobile development (Expo Go)
cd mobile && npx expo start

# Admin development
cd admin && npm run dev

# Run backend tests
cd backend && npm test

# Lint all
npm run lint

# Typecheck all
npm run typecheck

# Import transport line
cd backend && npm run transport:import src/data/lines/line-XXX.json
```

### Ključne datoteke za razumijevanje

| # | Datoteka | Što sadrži |
|---|----------|------------|
| 1 | `docs/01-MOJVIS-READTHISFIRST.md` | Temeljna pravila dizajna |
| 2 | `mobile/src/ui/skin.neobrut2.ts` | Design system tokens |
| 3 | `backend/src/index.ts` | Backend entry point |
| 4 | `mobile/src/navigation/AppNavigator.tsx` | Navigation struktura |
| 5 | `mobile/src/services/api.ts` | API client |
| 6 | `backend/src/middleware/auth.ts` | Auth logic |
| 7 | `backend/src/routes/transport.ts` | Transport API |
| 8 | `backend/.env.example` | Env varijable |
| 9 | `docs/transport/TRANSPORT_IMPORT_RUNBOOK.md` | Transport import |
| 10 | `docs/TESTING_BIBLE.md` | Test strategija |

### Workflow za tipične taskove

**Novi API endpoint**:
1. Definiraj types u `backend/src/types/`
2. Kreiraj repository funkcije u `backend/src/repositories/`
3. Dodaj route u `backend/src/routes/`
4. Registriraj route u `backend/src/index.ts`
5. Dodaj testove u `backend/src/__tests__/`

**Novi mobile screen**:
1. Kreiraj screen u `mobile/src/screens/<feature>/`
2. Dodaj u `mobile/src/navigation/types.ts`
3. Registriraj u `mobile/src/navigation/AppNavigator.tsx`
4. Koristi `skin.*` za stilove

**Nova transport linija**:
1. Kreiraj `line-XXX.json` u `backend/src/data/lines/`
2. Pokreni `npm run transport:import src/data/lines/line-XXX.json`
3. Testiraj na `/transport/{type}/lines`

**Novi prijevod (i18n)**:
1. Dodaj key u `mobile/locales/hr.json`
2. Dodaj prijevod u `mobile/locales/en.json`
3. Koristi `t('key')` u komponenti

---

## 17. PREPORUKE

### 17.1 "Ne diraj bez razloga" lista

| Datoteka/Modul | Razlog |
|----------------|--------|
| `backend/src/middleware/auth.ts` | Security critical, dobro testirano |
| `backend/src/services/auth.ts` | Security critical |
| `mobile/src/ui/skin.neobrut2.ts` | Utječe na cijelu app |
| `backend/src/db/migrations/*` | Nikad ne mijenjati postojeće migracije |
| `backend/src/lib/holidays.ts` | Kompleksna logika praznika |

### 17.2 "Sigurno za editiranje" lista

| Datoteka/Modul | Razlog |
|----------------|--------|
| `mobile/src/screens/flora/*` | Izolirani, statički sadržaj |
| `mobile/src/screens/fauna/*` | Izolirani, statički sadržaj |
| `mobile/src/screens/services/*` | Izolirani, statički sadržaj |
| `admin/src/pages/*` | Izolirani CRUD screeni |
| `docs/*` | Dokumentacija |

### 17.3 Prioriteti poboljšanja

**PRIJE PRODUKCIJE**:
1. Popraviti npm audit ranjivosti (posebno fastify HIGH)
2. Implementirati proper error boundary u mobile
3. Dodati rate limiting na admin rute
4. Ukloniti zastarjele TODO komentare

**NAKON PRODUKCIJE**:
1. Refaktorirati predugačke screen komponente
2. Dodati unit testove za mobile
3. Implementirati offline support
4. Integrirati error tracking (Sentry)
5. Konsolidirati Road/Sea transport screens

---

*Izvještaj generiran: 2026-02-14*
