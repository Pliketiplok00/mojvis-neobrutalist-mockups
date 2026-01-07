# MOJ VIS Admin Web Editor

React web application for Admin and Supervisor content management.

## Status: Phase 0 (Skeleton)

This is a minimal setup with:
- Vite + React + TypeScript
- React Router for navigation
- Login page skeleton
- Dashboard layout with sidebar navigation
- Placeholder pages for all main sections

**No authentication logic, no API calls yet.**

## Requirements

- Node.js >= 18.0.0

## Setup

1. **Install dependencies:**
   ```bash
   cd admin
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:5173
   ```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
admin/
├── src/
│   ├── components/         # Shared components (empty)
│   ├── layouts/
│   │   └── DashboardLayout.tsx    # Main admin layout
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login screen
│   │   └── DashboardPage.tsx      # Main dashboard
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
├── public/                 # Static assets
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login page |
| `/dashboard` | Main dashboard |
| `/messages` | Messages management (placeholder) |
| `/events` | Events management (placeholder) |
| `/pages` | Static pages CMS (placeholder) |
| `/transport` | Transport management (placeholder) |

## MVP Language

Per specification, the Admin UI is **HR-only for MVP**.
No English translation is required for admin interface elements.

## What's Missing (Intentionally)

Phase 0 does NOT include:
- Authentication logic
- API integration
- Form handling
- State management
- Role-based access control
- Actual CRUD operations

These will be added in subsequent phases.
