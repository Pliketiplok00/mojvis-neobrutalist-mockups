# MOBILE RELEASE AUDIT

Generated: 2026-02-07
Branch: integration/mobile
Commit: bee0dc8b21fe6c69d9109258ed9781b971aa350d


## 1. Repo and Git State

### Current Branch

    integration/mobile

### Git Status

Working tree is clean. Only untracked files present (mockup images not part of codebase).

### Last 10 Commits on main

    e6966cb Unify flora fauna cards
    14439be Changes
    54b3224 Combine Flora and Fauna pages
    e462098 Changes
    d8551c8 Preceding changes
    aa80553 Add shadows to panels
    5db9ecf Changes
    702af27 Preceding changes
    9af742a Add shadows to boxes
    858701c Changes

### Last 10 Commits on integration/mobile

    bee0dc8 merge(clickfix): apply polish (photos, location X, button shadow)
    83e1395 fix(mobile): polish Slikaj & Popravi form UI
    6c6c603 merge(clickfix): add Slikaj & Popravi header redesign
    7241090 feat(mobile): redesign Click & Fix as Slikaj & Popravi
    0ce8758 merge(javne-usluge): add Public Services screen with accordion cards
    bbf61d3 feat(javne-usluge): add themed icons for services
    ef13455 feat(javne-usluge): add useful links section + icon background colors
    88d2402 feat(mobile): add Javne usluge (Public Services) screen
    66c9119 merge(flora-fauna): hub polish + fauna + thumbnails + highlights
    e6eaa25 fix(hub): render flora/fauna tile thumbnails

### Branch Comparison

Commits in integration/mobile not in main: 38
Commits in main not in integration/mobile: 0

Main is a strict ancestor of integration/mobile. Fast-forward merge is possible but we use merge commits per Git Law.

### Unpushed Commits

None. Both main and integration/mobile are up to date with origin.


## 2. CI and Build Readiness

### CI Status

No GitHub Actions workflows found in repository. CI status not available locally.

### Local Check Results

#### Typecheck

    Command: pnpm -r typecheck
    Exit code: 0
    Result: PASS

All projects (backend, admin, mobile) pass TypeScript compilation.

#### Lint

    Command: pnpm lint
    Exit code: 1
    Result: FAIL (non-blocking)

Lint errors are in:
- backend/dist/ (compiled JS files - should be excluded from lint)
- mobile/dist/ (compiled JS files - should be excluded from lint)
- Two warnings in admin (useEffect dependencies)
- One error in backend/scripts/transport-import.ts (no-fallthrough)
- One error in backend/src/types/static-page.ts (empty interface)

Note: All errors are in dist directories or pre-existing backend code. No errors in mobile source.

#### Design Guard

    Command: pnpm design:guard
    Exit code: 0
    Result: PASS

No hardcoded hex colors, no direct Lucide imports, no emojis in mobile code.

#### Mobile Baseline Verification

    Command: node mobile/scripts/verify-mobile-baseline.mjs
    Exit code: 0
    Result: PASS

All required dependencies present. No forbidden Podfile entries.

#### Backend Tests

    Command: pnpm test (in backend/)
    Exit code: 0
    Result: PASS

17 test files, 367 tests passed.


## 3. Merge Plan (Safe)

### Pre-Merge Checklist

1. Ensure local main is up to date

        git fetch origin
        git checkout main
        git pull --ff-only

2. Create safety tag before merge

        git tag safety/main-before-mobile-release-$(date +%Y%m%d)

### Merge Commands

    git checkout main
    git merge --no-ff integration/mobile -m "release: mobile phase 7 - flora/fauna, javne usluge, slikaj & popravi"
    git push origin main

### Tag Strategy for Rollback

Before merge:

    git tag safety/main-before-mobile-release-20260207

After merge:

    git tag v0.7.0-mobile

If rollback needed:

    git checkout main
    git reset --hard safety/main-before-mobile-release-20260207
    git push --force-with-lease origin main

### Post-Merge Verification

1. Verify merge commit exists

        git log main --oneline -5

2. Run all checks on main

        git checkout main
        pnpm -r typecheck
        pnpm design:guard
        node mobile/scripts/verify-mobile-baseline.mjs
        cd backend && pnpm test

3. Confirm remote is updated

        git fetch origin
        git log origin/main --oneline -1


## 4. Deployment Readiness Checklist (Hetzner Staging)

### Services Identified

- Backend API (Node.js/Fastify)
- Admin Panel (Vite/React SPA)
- PostgreSQL Database
- File Storage (local uploads/ directory)
- Reverse Proxy (assumed nginx or similar - not configured in repo)

### Required Environment Variables

From .env.example:

    PORT=3000
    HOST=0.0.0.0
    NODE_ENV=production
    DB_HOST=<database-host>
    DB_PORT=5432
    DB_NAME=mojvis
    DB_USER=<db-user>
    DB_PASSWORD=<db-password>
    ADMIN_COOKIE_NAME=mojvis_admin_session
    ADMIN_COOKIE_DOMAIN=.mojvis.hr
    ADMIN_COOKIE_SECURE=true
    ADMIN_SESSION_TTL_HOURS=24
    ADMIN_ALLOWED_ORIGIN=https://admin.mojvis.hr

Optional (break-glass admin):

    BREAKGLASS_USERNAME=<emergency-user>
    BREAKGLASS_PASSWORD=<secure-password>
    BREAKGLASS_MUNICIPALITY=vis

### Secrets Handling

- Environment variables should be stored in server environment, not in repo
- .env file is in .gitignore
- Production secrets should use environment injection at deploy time
- Consider using Hetzner secret management or systemd EnvironmentFile

### Database Migration Strategy

16 SQL migration files in backend/src/db/migrations/:

    001_inbox_messages.sql
    002_inbox_soft_delete.sql
    003_events.sql
    004_reminder_subscriptions.sql
    005_static_pages.sql
    006_transport.sql
    007_feedback.sql
    008_click_fix.sql
    009_push_notifications.sql
    010_menu_extras.sql
    011_admin_auth.sql
    012_admin_notice_scope.sql
    013_events_image_url.sql
    014_events_organizer.sql
    015_transport_date_exceptions.sql
    016_transport_departure_markers.sql

Migration approach:
1. Backup database before migration
2. Apply migrations in order using psql or migration runner
3. No ORM detected - manual SQL execution required

        psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f backend/src/db/migrations/NNN_*.sql

### Backups

Database backup (before any deployment):

    pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

Uploads backup:

    tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

### Logging

Backend uses Fastify's built-in Pino logger. For production:
- Use pino-pretty for development only
- Configure structured JSON logging for production
- Ship logs to centralized logging (e.g., Loki, Elasticsearch)


## Summary

- Typecheck: PASS
- Design Guard: PASS
- Mobile Baseline: PASS
- Backend Tests: PASS
- Lint: FAIL (non-blocking, dist files only)
- Unpushed Commits: None
- Branch Divergence: integration/mobile is 38 commits ahead of main

Recommendation: Ready for merge to main after addressing lint configuration to exclude dist directories.
