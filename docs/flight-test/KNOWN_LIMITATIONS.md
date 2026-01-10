# Known Limitations

This document tracks known limitations, constraints, and technical debt in the MOJ VIS project.

---

## Backend

### Authentication

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Cookie-based sessions only | No token-based API access | Sufficient for admin panel use case |
| Single admin user model | No role-based access control | Acceptable for MVP |
| No password reset flow | Admin must manually reset | Out of scope for Phase 1 |

### Database

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| SQLite single-file DB | No concurrent write scaling | Adequate for expected load |
| No database backups in CI | Data loss risk | Manual backup procedures recommended |
| Migrations are forward-only | No rollback mechanism | Test migrations in staging first |

### API

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No API versioning | Breaking changes affect all clients | Coordinate releases with mobile |
| No rate limiting on public endpoints | Potential abuse | Add in future phase |
| File uploads stored locally | Not CDN-backed | Acceptable for MVP volume |

---

## Admin Panel

### Testing

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No unit tests | Lower confidence in component logic | E2E tests provide integration coverage |
| E2E tests require backend | Cannot run in isolation | Run full stack locally |

### Features

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No image optimization | Large uploads stored as-is | Client-side compression recommended |
| No draft/preview for static pages | WYSIWYG only | Test in staging environment |

---

## Mobile App

### Build & Release

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No EAS Build configured | No automated app store builds | Manual Expo builds for now |
| No OTA updates | Requires app store release for updates | Configure in production phase |
| No crash reporting | Blind to production errors | Add Sentry/similar before launch |

### Offline Support

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No offline caching | App requires network | Acceptable for initial launch |
| No background sync | Data not persisted locally | Future enhancement |

### Push Notifications

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Device token not sent to backend | Push not functional | Implement in dedicated phase |
| No notification preferences | All-or-nothing | Add granular controls later |

---

## CI/CD

### Current State

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No automated CI | Manual testing required | Phase 5 adds GitHub Actions |
| No deployment automation | Manual deploys | Out of scope for MVP |
| No staging environment | Test in production only | Use feature branches |

### Phase 5 Scope

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Mobile not in CI | No automated mobile checks | EAS Build is paid service |
| E2E tests not in CI | Admin E2E runs locally only | Requires backend orchestration |

---

## i18n

### Translation Coverage

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| HR/EN only | No other language support | Sufficient for target market |
| No RTL support | Cannot add Arabic/Hebrew | Not required |
| Onboarding shows both languages | Deliberate UX choice | Language not yet selected |

### Content Translation

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Backend content not translated | Events/pages in single language | Admin enters both HR/EN content |
| No automatic translation | Manual translation required | Out of scope |

---

## Security

### Known Considerations

| Area | Status | Notes |
|------|--------|-------|
| SQL Injection | Protected | Parameterized queries used |
| XSS | Protected | React escapes by default |
| CSRF | Partial | SameSite cookies, but no tokens |
| Auth brute force | Unprotected | No rate limiting on login |

### Recommendations for Production

1. Add rate limiting to authentication endpoints
2. Implement CSRF tokens for state-changing operations
3. Add security headers (CSP, HSTS)
4. Regular dependency audits (`npm audit`)

---

## Performance

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No caching layer | Every request hits DB | SQLite is fast for expected scale |
| No CDN for static assets | Slower asset delivery | Host behind CDN in production |
| No database indexing review | Potential slow queries | Profile before launch |

---

## Documentation

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No API documentation | Developers must read code | Add OpenAPI spec in future |
| No deployment guide | Deployment knowledge siloed | Document before handoff |
| No architecture diagram | System understanding difficult | Create in documentation phase |

---

## Accepted Technical Debt

These items are intentionally deferred:

1. **Mobile unit tests** - E2E coverage prioritized
2. **API versioning** - Single client, coordinated releases
3. **Database migrations rollback** - Forward-only acceptable
4. **Offline mobile support** - Network required for MVP
5. **Multi-tenancy** - Single municipality deployment

---

*Last updated: Phase 5*
