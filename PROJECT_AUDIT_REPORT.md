# PROJECT AUDIT REPORT - MOJ VIS
**Datum**: 2026-02-14
**Generirao**: Claude (automatska analiza)
**Svrha**: Kompletna analiza stanja projekta za preuzimanje od nedostupnog kolege

---

## KRATKI SAŽETAK (Za Menadžere)

**MOJ VIS** je mobilna aplikacija za grad Vis i općinu Komižu koja pruža informacije o:
- Javnom prijevozu (autobus, trajekt)
- Događanjima
- Vijestima/obavijestima (Inbox)
- Prijavama problema ("Slikaj i popravi" / Click & Fix)
- Povratnim informacijama građana (Feedback)
- Statičnim stranicama (flora, fauna, javne usluge)

### Tehnički stack:
| Komponenta | Tehnologija | Status |
|------------|-------------|--------|
| Mobile App | React Native + Expo (SDK 54) | Aktivno u razvoju |
| Backend API | Fastify + TypeScript + PostgreSQL | Funkcionalan |
| Admin Panel | React + Vite | Funkcionalan |
| Web Mockup | React + Vite + Tailwind (shadcn/ui) | Legacy/Mockup |

### Trenutni branch: `fix/final-unbox-all-icons-pattern-based`
### Remote: `git@github.com:Pliketiplok00/mojvis-neobrutalist-mockups.git`

---

## 1. STRUKTURA PROJEKTA

```
mojvis-neobrutalist-mockups/
├── admin/                    # Admin panel (React + Vite)
│   ├── src/
│   │   ├── layouts/
│   │   ├── pages/           # click-fix, events, feedback, inbox, menu-extras, pages
│   │   ├── services/
│   │   └── types/
│   └── e2e/                 # Playwright E2E testovi
│
├── backend/                  # API server (Fastify + TypeScript)
│   ├── src/
│   │   ├── config/
│   │   ├── data/            # lines, seed, test-lines
│   │   ├── db/migrations/   # 21 SQL migracija
│   │   ├── jobs/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/          # 18 route datoteka
│   │   ├── services/
│   │   └── types/
│   ├── scripts/
│   └── uploads/             # click-fix slike
│
├── mobile/                   # Mobilna aplikacija (Expo + React Native)
│   ├── src/
│   │   ├── components/      # Banner, DepartureItem, GlobalHeader, MenuOverlay
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── design-mirror/   # Design system komponente
│   │   ├── hooks/
│   │   ├── i18n/locales/
│   │   ├── navigation/
│   │   ├── screens/         # 14 screen kategorija (vidi dolje)
│   │   ├── services/
│   │   ├── types/
│   │   ├── ui/
│   │   └── utils/
│   ├── ios/                 # iOS native projekt
│   ├── locales/             # HR/EN prijevodi
│   └── assets/
│
├── src/                      # Web mockup (legacy)
│   ├── components/
│   ├── pages/
│   └── themes/
│
├── docs/                     # OPSEŽNA dokumentacija (100+ .md datoteka)
│   ├── audit/
│   ├── flight-test/
│   ├── templates/
│   ├── todo/
│   ├── transport/
│   └── wireframes/
│
├── design-mirror/            # HTML/CSS design reference
├── scripts/                  # Utility skripte
└── public/                   # Statički asseti
```

---

## 2. PACKAGE.JSON ANALIZA

### Root (`/package.json`)
- **Name**: `vite_react_shadcn_ts`
- **Version**: `0.0.0`
- **Scripts**:
  - `dev`: Vite dev server
  - `build`: Vite build
  - `lint`: ESLint
  - `design:guard`: Design system validacija
  - `typecheck`: TypeScript provjera svih projekata
- **Ključne dependencies**: React 18, Radix UI, Tailwind, shadcn/ui komponente

### Backend (`/backend/package.json`)
- **Name**: `mojvis-backend`
- **Version**: `0.1.0`
- **Scripts**:
  - `dev`: `tsx watch src/index.ts` (hot reload)
  - `build`: TypeScript kompilacija
  - `start`: Produkcijski server
  - `test`: Vitest testovi
  - `transport:import`: CLI za import voznih redova
- **Ključne dependencies**: Fastify 4.26, PostgreSQL (pg), bcrypt

### Admin (`/admin/package.json`)
- **Name**: `mojvis-admin`
- **Version**: `0.1.0`
- **Scripts**:
  - `dev`: Vite dev server
  - `build`: Build
  - `test:e2e`: Playwright E2E testovi
- **Ključne dependencies**: React 19, react-router-dom 7

### Mobile (`/mobile/package.json`)
- **Name**: `mobile`
- **Version**: `1.0.0`
- **Scripts**:
  - `start`: Expo start
  - `ios`: Expo run:ios
  - `android`: Expo run:android
  - `test`: Jest (nema testova trenutno)
- **Ključne dependencies**:
  - Expo SDK 54
  - React Native 0.81.5
  - React 19.1.0
  - React Navigation 7
  - lucide-react-native (ikone)

---

## 3. DOKUMENTACIJA (Sažetak)

Projekt ima **ekstenzivnu dokumentaciju** u `/docs/` direktoriju (100+ datoteka).

### Ključni dokumenti za razumijevanje projekta:

| Datoteka | Sadržaj |
|----------|---------|
| `01-MOJVIS-READTHISFIRST.md` | **OBAVEZNO** - Temeljna pravila dizajna |
| `00-MOJVIS-NON-NEGOTIABLE-IMPLEMENTATION-CHECKLIST.md` | Checklist implementacije |
| `02-MOJVIS-GENERAL-APPBUILD-BRIEF.md` | Globalna pravila i odluke |
| `09-MOJVIS-STYLE-GUIDE.md` | Visual style guide |
| `17-MOJVIS-COLOR-RULEBOOK.md` | Boje i pravila korištenja |
| `FONTS-AND-ICONS-SPEC.md` | Tipografija i ikone |
| `TESTING_BIBLE.md` | Strategija testiranja |

### Wireframe dokumenti (po screenu):
- `06-MOJVIS-ONBOARDINGFLOW-DESCRIPTIVE-WIREFRAME.md`
- `07-MOJVIS-MAINMENU-DESCRIPTIVE-WIREFRAME.md`
- `08-HOMESCREEN-DESCRIPTIVE-WIREFRAME.md`
- `10-MOJVIS-EVENTS-DESCRIPTIVE-WIREFRAME.md`
- `11-MOJVIS-FEEDBACK-DESCRIPTIVE-WIREFRAME.md`
- `12-MOJVIS-CLICK-FIX-DESCRIPTIVE-WIREFRAME.md`
- `13-MOJVIS-ROAD-TRANSPORT-DESCRIPTIVE-WIREFRAME.md`
- `14-MOJVIS-SEA-TRANSPORT-DESCRIPTIVE-WIREFRAME.md`

### Transport dokumenti (kritično za održavanje):
- `/docs/transport/TRANSPORT_IMPORT_RUNBOOK.md` - Kako importirati vozne redove
- `/docs/transport/HOLIDAYS_2026_ALL_LINES.md` - Praznici i posebni rasporedi
- `/docs/transport/HETZNER_REIMPORT_2026.md` - Deployment na produkciju

---

## 4. GIT STATUS

### Trenutni branch
```
fix/final-unbox-all-icons-pattern-based
```

### Remote
```
origin  git@github.com:Pliketiplok00/mojvis-neobrutalist-mockups.git
```

### Zadnjih 20 commitova
```
8148e76 fix(mobile): unbox 27 ghost icon wrappers + add guardrail
56aa61b docs: boxed-icon inventory scan (pattern-based)
a938578 docs(audit): pattern-based boxed icon wrapper inventory
4e71925 fix(ui): radius zero real app (#93)
f7f7cb3 chore(skin): tokenize micro spacing, opacity, and header icon box (#91)
2186c3d Merge fix/transport-sea-cards-linedetail-consolidated
dc6ffd5 fix(i18n): add missing transport.seasonal translation key
2161979 fix(line-detail): restore headerMetaRow structure
3c357e8 ui(sea-transport): teal headers + consistent seasonal badge
74a6a96 fix(import): preserve line_number when missing in JSON (#90)
6c464ee fix(data): correct direction labels for sea line 659 (#89)
7214864 fix(line-detail): remove markers + always show ticket box (#88)
140e785 feat(line-detail): remove notes + add carrier ticket info box (#87)
8a645b8 Merge pull request #86
e5be7a9 ui(line-detail): compact yellow date row
2ff6ca3 feat(mobile): shared line title formatter
f7ce686 feat(api): include line_number in line detail response
9424ece Merge pull request #85
eca2773 fix(fixtures): update transport fixtures
691e256 fix(types): include mobile transport types update
```

### Untracked files (nisu commited)
```
MOBILE_RELEASE_AUDIT.md
docs/DECISION_CHARTER_ICON_TYPO_RADIUS.md
docs/DEEP_AUDIT_TRANSPORT_HEADERS_TABS.md
docs/DESIGN_DEBT_AND_REFACTOR_PLAN.md
docs/DESIGN_TOKENS_USAGE_MAP.md
docs/Funnel_Display,Sora/ (fontovi)
docs/UI_COMPONENT_INVENTORY.md
docs/audit/*.md (više audit izvještaja)
docs/transport/*.md (transport dokumentacija za 2026)
docs/wireframes/
mobile/.env
```

### Broj lokalnih brancheva
**130+ lokalnih brancheva** (mnogi su feature/fix branchevi koji su vjerojatno mergani)

### Glavni branchevi za rad:
- `main` - produkcijska verzija
- `fix/final-unbox-all-icons-pattern-based` - trenutni rad (ikone)

---

## 5. TODO/FIXME KOMENTARI U KODU

### Aktivni TODO-ovi koje treba riješiti:

| Lokacija | Komentar |
|----------|----------|
| `mobile/src/services/api.ts:87` | Store persistently using AsyncStorage |
| `mobile/src/services/api.ts:96` | Get from app settings/context |
| `backend/src/routes/admin-reminders.ts:9` | Schedule automatic execution at 00:01 |
| `backend/src/routes/admin-reminders.ts:21` | Add admin authentication middleware |
| `backend/src/routes/admin-inbox.ts:177` | Add anonymous device identification |
| `backend/src/routes/admin-static-pages.ts:198` | Implement deep sanitization |
| `backend/src/routes/admin-events.ts:95` | Add admin authentication middleware |
| `backend/src/types/static-page.ts:771` | Implement proper HTML sanitization |
| `backend/src/jobs/reminder-generation.ts:14` | Schedule daily job |
| `backend/src/repositories/push.ts:121` | Add device municipality to token table |
| `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx:40` | Apply language to app UI |
| `mobile/src/contexts/UnreadContext.tsx:67-68` | Load/Save from AsyncStorage |

### BUG označen u kodu:
- `docs/transport/QUERY_ROOT_CAUSE_REPORT_2026.md:51` - Query dohvaća samo PRVU sezonu (potencijalni bug)

---

## 6. ENV I KONFIGURACIJA

### Pronađene .env datoteke:

| Datoteka | Sadržaj (struktura, bez tajni) |
|----------|-------------------------------|
| `backend/.env` | Produkcijske postavke (NE COMMITATI) |
| `backend/.env.example` | Primjer konfiguracije |
| `mobile/.env` | `EXPO_PUBLIC_API_URL` |
| `mobile/.env.local` | Lokalne override postavke |

### Backend .env struktura:
```
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mojvis
DB_USER=postgres
DB_PASSWORD=<SECRET>

# Admin Authentication
ADMIN_COOKIE_NAME=mojvis_admin_session
ADMIN_COOKIE_DOMAIN=
ADMIN_COOKIE_SECURE=false
ADMIN_SESSION_TTL_HOURS=24
ADMIN_ALLOWED_ORIGIN=http://localhost:5173

# Break-glass admin (emergency)
# BREAKGLASS_USERNAME=breakglass
# BREAKGLASS_PASSWORD=<SECRET>
# BREAKGLASS_MUNICIPALITY=vis

# DeepL API (optional)
# DEEPL_API_KEY=<SECRET>
```

### Mobile .env:
```
EXPO_PUBLIC_API_URL=https://api.mojvis-test.pliketiplok.com
```

### Ostale config datoteke:
- `admin/playwright.config.ts` - E2E test konfiguracija
- `admin/vite.config.ts` - Vite build config
- `backend/vitest.config.ts` - Unit test config
- `mobile/app.json` - Expo konfiguracija
- `tailwind.config.ts` - Tailwind CSS config
- `tsconfig.json` (root, backend, admin, mobile) - TypeScript configs

---

## 7. KOMPONENTE I STRANICE

### Mobile Screens (`mobile/src/screens/`)

| Folder | Screeni |
|--------|---------|
| `click-fix/` | Slikaj i popravi forma |
| `dev/` | Dev/debug screeni |
| `events/` | Događanja |
| `fauna/` | Fauna otoka |
| `feedback/` | Povratne informacije |
| `flora/` | Flora otoka |
| `home/` | Početni zaslon |
| `inbox/` | Inbox poruke |
| `onboarding/` | Onboarding flow (7 datoteka) |
| `pages/` | Statične stranice |
| `services/` | Javne usluge |
| `settings/` | Postavke |
| `transport/` | Prijevoz (8 datoteka) |

### Mobile Components (`mobile/src/components/`)

| Komponenta | Namjena |
|------------|---------|
| `Banner.tsx` | Banner komponenta za obavijesti |
| `DepartureItem.tsx` | Prikaz polaska |
| `GlobalHeader.tsx` | Globalni header (hamburger/back, MOJ VIS, inbox) |
| `MenuOverlay.tsx` | Hamburger menu overlay |
| `common/` | Zajedničke komponente |
| `services/` | Service komponente |

### Admin Pages (`admin/src/pages/`)

| Folder | Namjena |
|--------|---------|
| `click-fix/` | Upravljanje prijavama |
| `events/` | Upravljanje događanjima |
| `feedback/` | Pregled povratnih informacija |
| `inbox/` | Upravljanje inbox porukama |
| `menu-extras/` | Upravljanje dodatnim menu stavkama |
| `pages/` | Uređivanje statičnih stranica |

---

## 8. BACKEND ANALIZA

### API Rute (`backend/src/routes/`)

| Route file | Endpoint prefix | Namjena |
|------------|-----------------|---------|
| `health.ts` | `/health` | Health check |
| `device.ts` | `/device` | Registracija uređaja |
| `inbox.ts` | `/inbox` | Inbox poruke (čitanje) |
| `events.ts` | `/events` | Događanja (čitanje) |
| `feedback.ts` | `/feedback` | Slanje povratnih info |
| `click-fix.ts` | `/click-fix` | Slikaj i popravi |
| `transport.ts` | `/transport` | Vozni redovi |
| `static-pages.ts` | `/pages` | Statične stranice |
| `menu-extras.ts` | `/menu-extras` | Dodatne menu stavke |
| `admin-auth.ts` | `/admin/auth` | Admin autentifikacija |
| `admin-inbox.ts` | `/admin/inbox` | Admin inbox CRUD |
| `admin-events.ts` | `/admin/events` | Admin events CRUD |
| `admin-feedback.ts` | `/admin/feedback` | Admin feedback |
| `admin-click-fix.ts` | `/admin/click-fix` | Admin click-fix |
| `admin-static-pages.ts` | `/admin/pages` | Admin pages CRUD |
| `admin-menu-extras.ts` | `/admin/menu-extras` | Admin menu extras |
| `admin-reminders.ts` | `/admin/reminders` | Reminder job trigger |
| `admin-translate.ts` | `/admin/translate` | DeepL HR→EN |

### Database migracije (`backend/src/db/migrations/`)

21 SQL migracija, od kojih su ključne:
- `001_inbox_messages.sql` - Inbox sustav
- `003_events.sql` - Događanja
- `005_static_pages.sql` - CMS stranice
- `006_transport.sql` - Prijevoz (linije, polasci, sezone)
- `007_feedback.sql` - Feedback
- `008_click_fix.sql` - Slikaj i popravi
- `009_push_notifications.sql` - Push notifikacije
- `011_admin_auth.sql` - Admin autentifikacija
- `020_transport_seasons_multi_per_year.sql` - Više sezona godišnje
- `021_transport_line_number.sql` - Broj linije

---

## 9. MOBILE ANALIZA

### Tech Stack
- **Framework**: React Native 0.81.5
- **Platform**: Expo SDK 54 (managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State**: React Context
- **Icons**: lucide-react-native
- **Fonts**: Space Grotesk, Space Mono (Google Fonts)

### App identifikatori
- **iOS Bundle ID**: `com.mojvis.app`
- **Android Package**: `com.mojvis.app`
- **App Name**: MOJ VIS
- **Version**: 0.1.0

### Lokalizacija
- Hrvatski (hr) - primarni
- English (en) - sekundarni
- Datoteke: `mobile/locales/hr.json`, `mobile/locales/en.json`

### API konekcija
- URL konfigurabilan preko `EXPO_PUBLIC_API_URL`
- Trenutno: `https://api.mojvis-test.pliketiplok.com` (Hetzner)

---

## 10. TESTOVI

### Backend testovi
**Status: PROLAZE**

```
✓ src/__tests__/language-enforcement.test.ts  (26 tests)
✓ src/__tests__/menu-extras.test.ts  (19 tests)
✓ src/__tests__/transport-import.test.ts  (9 tests)
✓ src/__tests__/inbox-source-type-filter.test.ts  (9 tests)
✓ src/__tests__/transport-validation.test.ts  (30 tests)
✓ src/__tests__/reminder-generation.test.ts  (7 tests)
```

**Ukupno: 100 testova**

### Mobile testovi
**Status: NEMA TESTOVA**

Jest je konfiguriran ali nema test datoteka.

### Admin E2E testovi
**Status: NE MOGU SE POKRENUTI LOKALNO**

Playwright testovi postoje (`admin/e2e/`) ali zahtijevaju:
- Lokalni PostgreSQL na portu 5432
- Backend server pokrenut

Testovi uključuju:
- `navigation.spec.ts`
- `inbox.spec.ts`
- `feedback-clickfix.spec.ts`

---

## 11. PROBLEMI I UPOZORENJA

### Lint rezultati

**Warnings (2)**:
- `admin/src/pages/events/EventEditPage.tsx:56` - Missing dependency u useEffect
- `admin/src/pages/inbox/InboxEditPage.tsx:130` - Missing dependency u useEffect

**Errors (14+)**:
- Svi errori su u `backend/dist/` (kompiliranim JS datotekama)
- Uzrok: ESLint pokušava validirati JS output s TypeScript pravilima
- **Rješenje**: Dodati `backend/dist/` u `.eslintignore`

### Build rezultati

| Projekt | Build status |
|---------|--------------|
| Backend | **OK** (tsc kompilira bez grešaka) |
| Admin | **OK** (vite build uspješan) |
| Mobile | **OK** (Expo bundle uspješan) |

### TypeCheck rezultati
**OK** - Sve tri komponente prolaze typecheck bez grešaka

### Poznati problemi

1. **Expo upozorenja o verzijama paketa**:
   ```
   @react-native-community/datetimepicker@8.6.0 - expected 8.4.4
   react-native-screens@4.19.0 - expected ~4.16.0
   react-native-svg@15.15.1 - expected 15.12.1
   ```

2. **Push notifikacije u Expo Go**:
   - Ograničena funkcionalnost u Expo Go
   - Za punu funkcionalnost potreban development build

3. **Untracked datoteke**:
   - `mobile/.env` nije commitan (sadrži API URL)
   - Brojni dokumenti u `docs/` nisu commitani

---

## 12. KAKO POKRENUTI PROJEKT

### Preduvjeti
- Node.js >= 18
- PostgreSQL (za backend)
- Expo Go app (za mobile testiranje)

### Backend
```bash
cd backend
cp .env.example .env
# Urediti .env s PostgreSQL credentials
npm install
npm run dev
```

### Admin panel
```bash
cd admin
npm install
npm run dev
# Otvori http://localhost:5173
```

### Mobile app
```bash
cd mobile
npm install
npx expo start
# Skeniraj QR kod s Expo Go aplikacijom
```

### Produkcijski API
- URL: `https://api.mojvis-test.pliketiplok.com`
- Server: Hetzner

---

## 13. KONTAKTI I RESURSI

### Git repository
`git@github.com:Pliketiplok00/mojvis-neobrutalist-mockups.git`

### Produkcija
- API: `api.mojvis-test.pliketiplok.com`
- Server: Hetzner

### Ključna dokumentacija za čitanje
1. `docs/01-MOJVIS-READTHISFIRST.md` - **OBAVEZNO PRVO**
2. `docs/TESTING_BIBLE.md` - Strategija testiranja
3. `docs/transport/TRANSPORT_IMPORT_RUNBOOK.md` - Import voznih redova
4. `backend/README.md` - Backend setup
5. `mobile/README.md` - Mobile setup

---

*Izvještaj generiran: 2026-02-14*
