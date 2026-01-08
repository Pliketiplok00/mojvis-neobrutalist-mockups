# MOJ VIS Backend API

Fastify + TypeScript backend for the MOJ VIS mobile app.

## Status: Phase 0 (Skeleton)

This is a minimal setup with:
- Fastify server with TypeScript
- Health endpoint (`/health`)
- PostgreSQL connection (env-based)
- Basic logging

**No business logic implemented yet.**

## Requirements

- Node.js >= 18.0.0
- PostgreSQL running locally (or accessible)

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

3. **Create database (if needed):**
   ```sql
   CREATE DATABASE mojvis;
   ```

## Running

**Development (with hot reload):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Full health check (server + database) |
| `/health/live` | GET | Simple liveness check |
| `/health/ready` | GET | Readiness check (database connectivity) |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts          # Environment configuration
│   ├── lib/
│   │   └── database.ts     # PostgreSQL connection
│   ├── routes/
│   │   └── health.ts       # Health check routes
│   └── index.ts            # Main entry point
├── .env.example            # Example environment file
├── .eslintrc.json          # ESLint configuration
├── package.json
├── tsconfig.json           # TypeScript configuration
└── README.md
```

## What's Missing (Intentionally)

Phase 0 does NOT include:
- Database schema/migrations
- Authentication
- Business logic routes
- Input validation schemas
- Rate limiting
- API documentation

These will be added in subsequent phases.
