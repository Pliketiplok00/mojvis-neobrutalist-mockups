# Phase 5 — Build Reproducibility Guide

## Overview

This document describes how to achieve reproducible builds for each component of the MOJ VIS project.

---

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime for all JS/TS components |
| npm | 10.x | Package management |
| Git | 2.x+ | Version control |

### Recommended

- `.nvmrc` file created at project root specifying Node version

---

## Backend (`/backend`)

### Build Steps

```bash
cd backend
npm ci                    # Install exact versions from lock file
npm run lint              # Verify code style
npm test                  # Run test suite
npm run build             # Compile TypeScript
```

### Environment Setup

Create `.env` file from template:
```bash
cp .env.example .env
```

Required variables:
```
PORT=3001
DB_PATH=./data/mojvis.db
ADMIN_COOKIE_SECRET=<32+ char secret>
ADMIN_SESSION_MAX_AGE=86400000
ADMIN_ALLOWED_ORIGIN=http://localhost:5174
```

### Database Initialization

```bash
npm run db:migrate        # Apply migrations
```

### Verification

```bash
npm test                  # All 311 tests should pass
npm run build             # Should produce dist/ directory
```

---

## Admin Panel (`/admin`)

### Build Steps

```bash
cd admin
npm ci                    # Install exact versions
npm run lint              # Verify code style
npm run build             # TypeScript + Vite build
```

### Environment Setup

No environment variables required for build.

For development, configure backend URL in Vite config if needed.

### Verification

```bash
npm run build             # Should produce dist/ directory
ls dist/                  # Should contain index.html, assets/
```

---

## Mobile App (`/mobile`)

### Build Steps

```bash
cd mobile
npm ci                    # Install exact versions
npm test                  # Run Jest tests (if configured)
```

### Local Development

```bash
npx expo start            # Start Metro bundler
```

### Production Build

Requires Expo Application Services (EAS):
```bash
npm install -g eas-cli
eas build --platform all
```

**Note:** EAS is a paid service for production builds. No `eas.json` is currently configured.

### Verification

```bash
npx expo start --clear    # Should start without errors
```

---

## Lock File Policy

All components use `package-lock.json` for dependency locking:

| Component | Lock File | Status |
|-----------|-----------|--------|
| Backend | `backend/package-lock.json` | Present |
| Admin | `admin/package-lock.json` | Present |
| Mobile | `mobile/package-lock.json` | Present |
| Root | `package-lock.json` | Present |

### Rules

1. **Always use `npm ci`** for CI/production builds
2. **Never delete lock files** without team discussion
3. **Commit lock file changes** when updating dependencies
4. **Review lock file diffs** in PRs for unexpected changes

---

## CI Build Commands

### Backend CI
```bash
cd backend && npm ci && npm run lint && npm test && npm run build
```

### Admin CI
```bash
cd admin && npm ci && npm run lint && npm run build
```

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules
npm ci
```

### TypeScript version mismatch
Ensure using workspace TypeScript:
```bash
npx tsc --version         # Should match package.json
```

### SQLite native module issues
```bash
npm rebuild               # Rebuild native modules
```

---

## Version Matrix

| Component | Node | TypeScript | Key Framework |
|-----------|------|------------|---------------|
| Backend | >=18.0.0 | ~5.9 | Fastify 5.x |
| Admin | (any LTS) | ~5.9 | Vite 7.x, React 19 |
| Mobile | (Expo managed) | ~5.9 | Expo SDK 54 |
