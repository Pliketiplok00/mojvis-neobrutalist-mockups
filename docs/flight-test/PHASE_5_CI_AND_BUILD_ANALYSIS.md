# Phase 5 — CI, Release Hardening & Build Reproducibility
## Analysis Document

### Entry Condition Verification

| Condition | Status | Evidence |
|-----------|--------|----------|
| Phase 4 Completion Report exists | PASS | `docs/flight-test/PHASE_4_UX_STABILITY_I18N_COMPLETION_REPORT.md` |
| Backend tests pass | PASS | 311/311 tests passing (Vitest) |
| Mobile app runs | PASS | Expo SDK 54 configured, no build blockers |
| Admin auth enforced | PASS | `backend/src/middleware/auth.ts` exists with cookie-session auth |

---

### Current CI State

**Status: NO CI CONFIGURATION EXISTS**

- No `.github/workflows/` directory at project root
- No CI/CD automation for any component
- Manual testing only

---

### Component Analysis

#### 1. Backend (`/backend`)

| Aspect | Value |
|--------|-------|
| Runtime | Node.js >= 18.0.0 |
| Framework | Fastify 5.x |
| Language | TypeScript (ES2022 target) |
| Test Framework | Vitest |
| Test Count | 311 tests across 13 files |
| Build Command | `npm run build` (tsc) |
| Test Command | `npm test` |
| Lint Command | `npm run lint` |
| Lock File | `package-lock.json` (present) |

**Test File Locations:**
- `src/__tests__/*.test.ts`

**Environment Variables Required (from `.env.example`):**
- `PORT` - Server port
- `DB_PATH` - SQLite database path
- `ADMIN_COOKIE_SECRET` - Session cookie secret
- `ADMIN_SESSION_MAX_AGE` - Session expiry
- `ADMIN_ALLOWED_ORIGIN` - CORS origin for admin

#### 2. Admin Panel (`/admin`)

| Aspect | Value |
|--------|-------|
| Framework | Vite + React 19 |
| Language | TypeScript |
| Build Command | `npm run build` (tsc + vite) |
| Lint Command | `npm run lint` |
| E2E Tests | Playwright (`npm run test:e2e`) |
| Lock File | `package-lock.json` (present) |

**Note:** No unit tests configured, only E2E tests.

#### 3. Mobile App (`/mobile`)

| Aspect | Value |
|--------|-------|
| Framework | Expo SDK 54 |
| Runtime | React Native 0.81.5 |
| Language | TypeScript |
| Test Framework | Jest |
| Test Command | `npm test` |
| Lock File | `package-lock.json` (present) |

**EAS Build:** Not configured (no `eas.json`)

#### 4. Root/Frontend Mockups (`/`)

| Aspect | Value |
|--------|-------|
| Framework | Vite + React 18 |
| Purpose | Design mockups (not production) |
| Build Command | `npm run build` |
| Lock File | `package-lock.json` (present) |

---

### Proposed CI Configuration

#### GitHub Actions Workflow Structure

```
.github/
  workflows/
    backend.yml     # Backend tests + lint + build
    admin.yml       # Admin lint + build + E2E
```

#### Backend Workflow (`backend.yml`)

**Triggers:**
- Push to `main` branch (backend/** paths)
- Pull requests targeting `main` (backend/** paths)

**Jobs:**
1. **lint-and-test**
   - Node.js 20.x
   - Install dependencies (`npm ci`)
   - Run lint (`npm run lint`)
   - Run tests (`npm test`)

2. **build**
   - Node.js 20.x
   - Install dependencies
   - Run TypeScript build (`npm run build`)

#### Admin Workflow (`admin.yml`)

**Triggers:**
- Push to `main` branch (admin/** paths)
- Pull requests targeting `main` (admin/** paths)

**Jobs:**
1. **lint-and-build**
   - Node.js 20.x
   - Install dependencies
   - Run lint
   - Run build

**Note:** E2E tests excluded from CI initially (require running backend)

---

### Reproducibility Concerns

1. **Node Version**: No `.nvmrc` file specifies exact Node version
2. **Lock Files**: All present and committed
3. **Environment Variables**: Backend requires env vars for tests (some tests may need DB_PATH)

---

### Recommended Actions

1. Add `.nvmrc` file specifying Node 20 LTS
2. Create minimal GitHub Actions workflows
3. Document environment variable requirements
4. Add CI status badges to README

---

### Out of Scope (Phase 5)

- Mobile CI (requires EAS Build setup, paid service)
- E2E tests in CI (require backend orchestration)
- Deployment automation
- Docker containerization
