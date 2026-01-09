# MOJ VIS Project File Manifest

> Complete list of all files created for this project.  
> Last updated: January 2026

---

## 📁 Root Level

### Configuration
- `eslint.config.js`
- `index.html`
- `tailwind.config.ts`
- `vite.config.ts`

---

## 📁 src/ (Main Web App)

### Core
- `src/App.css`
- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`
- `src/vite-env.d.ts`

### Assets
- `src/assets/fauna-dolphins.jpg`
- `src/assets/fauna-lizard.jpg`
- `src/assets/flora-herbs.jpg`
- `src/assets/flora-olives.jpg`
- `src/assets/info-vis-town.jpg`

### Components

#### Layout
- `src/components/layout/AppHeader.tsx`
- `src/components/layout/MainMenu.tsx`
- `src/components/layout/MobileFrame.tsx`

#### Content Blocks
- `src/components/content/CardListBlock.tsx`
- `src/components/content/ContactBlock.tsx`
- `src/components/content/ContentHeader.tsx`
- `src/components/content/HighlightBlock.tsx`
- `src/components/content/LinkListBlock.tsx`
- `src/components/content/MediaBlock.tsx`
- `src/components/content/TextBlock.tsx`

#### Navigation
- `src/components/NavLink.tsx`

#### UI Components (shadcn/ui)
- `src/components/ui/accordion.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/aspect-ratio.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/calendar.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/context-menu.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/hover-card.tsx`
- `src/components/ui/input-otp.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/menubar.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/resizable.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/slider.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/states.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/toast.tsx`
- `src/components/ui/toaster.tsx`
- `src/components/ui/toggle-group.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/use-toast.ts`

### Hooks
- `src/hooks/use-mobile.tsx`
- `src/hooks/use-toast.ts`
- `src/hooks/useRateLimit.ts`

### Libraries
- `src/lib/i18n.tsx`
- `src/lib/utils.ts`

### Pages
- `src/pages/ClickFixPage.tsx`
- `src/pages/EventDetailPage.tsx`
- `src/pages/EventsCalendarPage.tsx`
- `src/pages/FaunaPage.tsx`
- `src/pages/FeedbackPage.tsx`
- `src/pages/FloraPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/InboxDetailPage.tsx`
- `src/pages/InboxPage.tsx`
- `src/pages/Index.tsx`
- `src/pages/InfoPage.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/OnboardingModePage.tsx`
- `src/pages/OnboardingMunicipalityPage.tsx`
- `src/pages/OnboardingSplashPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/TransportPage.tsx`
- `src/pages/TransportRoadDetailPage.tsx`
- `src/pages/TransportRoadPage.tsx`
- `src/pages/TransportSeaDetailPage.tsx`
- `src/pages/TransportSeaPage.tsx`

### Themes
- `src/themes/index.ts`
- `src/themes/neobrutalist-mediterranean.ts`
- `src/themes/THEMES_README.md`

---

## 📁 admin/ (Admin Dashboard)

### Configuration
- `admin/.gitignore`
- `admin/eslint.config.js`
- `admin/index.html`
- `admin/package.json`
- `admin/package-lock.json`
- `admin/playwright.config.ts`
- `admin/tsconfig.app.json`
- `admin/tsconfig.json`
- `admin/tsconfig.node.json`
- `admin/vite.config.ts`

### E2E Tests
- `admin/e2e/feedback-clickfix.spec.ts`
- `admin/e2e/inbox.spec.ts`
- `admin/e2e/navigation.spec.ts`

### Source
- `admin/src/App.tsx`
- `admin/src/index.css`
- `admin/src/main.tsx`

### Layouts
- `admin/src/layouts/DashboardLayout.tsx`

### Pages
- `admin/src/pages/DashboardPage.tsx`
- `admin/src/pages/LoginPage.tsx`

#### Click-Fix Pages
- `admin/src/pages/click-fix/ClickFixDetailPage.tsx`
- `admin/src/pages/click-fix/ClickFixListPage.tsx`

#### Events Pages
- `admin/src/pages/events/EventEditPage.tsx`
- `admin/src/pages/events/EventsListPage.tsx`

#### Feedback Pages
- `admin/src/pages/feedback/FeedbackDetailPage.tsx`
- `admin/src/pages/feedback/FeedbackListPage.tsx`

#### Inbox Pages
- `admin/src/pages/inbox/InboxEditPage.tsx`
- `admin/src/pages/inbox/InboxListPage.tsx`

#### Static Pages
- `admin/src/pages/pages/PageEditPage.tsx`
- `admin/src/pages/pages/PagesListPage.tsx`

### Services
- `admin/src/services/api.ts`

### Types
- `admin/src/types/click-fix.ts`
- `admin/src/types/event.ts`
- `admin/src/types/feedback.ts`
- `admin/src/types/inbox.ts`
- `admin/src/types/static-page.ts`

### Reports
- `admin/E2E_TEST_REPORT.md`
- `admin/README.md`

---

## 📁 backend/ (Node.js API Server)

### Configuration
- `backend/.env.example`
- `backend/.eslintrc.json`
- `backend/.gitignore`
- `backend/package.json`
- `backend/package-lock.json`
- `backend/README.md`
- `backend/tsconfig.json`
- `backend/vitest.config.ts`

### Scripts
- `backend/scripts/admin-smoke.ts`
- `backend/scripts/api-e2e-smoke.ts`
- `backend/scripts/dev-postgres.sh`
- `backend/scripts/push-debug-status.ts`
- `backend/scripts/push-debug-trigger.ts`
- `backend/scripts/seed-dev-data.ts`
- `backend/scripts/seed-transport.ts`
- `backend/scripts/test-image.png`

### Source

#### Config
- `backend/src/config/env.ts`

#### Data
- `backend/src/data/holidays-hr-2026.json`
- `backend/src/data/seed/transport-seed.json`

#### Database Migrations
- `backend/src/db/migrations/001_inbox_messages.sql`
- `backend/src/db/migrations/002_inbox_soft_delete.sql`
- `backend/src/db/migrations/003_events.sql`
- `backend/src/db/migrations/004_reminder_subscriptions.sql`
- `backend/src/db/migrations/005_static_pages.sql`
- `backend/src/db/migrations/006_transport.sql`
- `backend/src/db/migrations/007_feedback.sql`
- `backend/src/db/migrations/008_click_fix.sql`
- `backend/src/db/migrations/009_push_notifications.sql`

#### Entry Point
- `backend/src/index.ts`

#### Jobs
- `backend/src/jobs/reminder-generation.ts`

#### Libraries
- `backend/src/lib/database.ts`
- `backend/src/lib/eligibility.ts`
- `backend/src/lib/holidays.ts`
- `backend/src/lib/push/expo.ts`
- `backend/src/lib/push/index.ts`

#### Repositories
- `backend/src/repositories/click-fix.ts`
- `backend/src/repositories/event.ts`
- `backend/src/repositories/feedback.ts`
- `backend/src/repositories/inbox.ts`
- `backend/src/repositories/push.ts`
- `backend/src/repositories/static-page.ts`
- `backend/src/repositories/transport.ts`

#### Routes (Public API)
- `backend/src/routes/click-fix.ts`
- `backend/src/routes/device.ts`
- `backend/src/routes/events.ts`
- `backend/src/routes/feedback.ts`
- `backend/src/routes/health.ts`
- `backend/src/routes/inbox.ts`
- `backend/src/routes/static-pages.ts`
- `backend/src/routes/transport.ts`

#### Routes (Admin API)
- `backend/src/routes/admin-click-fix.ts`
- `backend/src/routes/admin-events.ts`
- `backend/src/routes/admin-feedback.ts`
- `backend/src/routes/admin-inbox.ts`
- `backend/src/routes/admin-reminders.ts`
- `backend/src/routes/admin-static-pages.ts`

#### Types
- `backend/src/types/click-fix.ts`
- `backend/src/types/event.ts`
- `backend/src/types/feedback.ts`
- `backend/src/types/inbox.ts`
- `backend/src/types/push.ts`
- `backend/src/types/static-page.ts`
- `backend/src/types/transport.ts`

#### Tests
- `backend/src/__tests__/click-fix.test.ts`
- `backend/src/__tests__/eligibility.test.ts`
- `backend/src/__tests__/events.test.ts`
- `backend/src/__tests__/feedback.test.ts`
- `backend/src/__tests__/health.test.ts`
- `backend/src/__tests__/inbox.test.ts`
- `backend/src/__tests__/push.test.ts`
- `backend/src/__tests__/reminder-generation.test.ts`
- `backend/src/__tests__/static-pages.test.ts`
- `backend/src/__tests__/transport-validation.test.ts`

---

## 📁 mobile/ (React Native / Expo App)

### Configuration
- `mobile/.gitignore`
- `mobile/app.json`
- `mobile/package.json`
- `mobile/package-lock.json`
- `mobile/README.md`
- `mobile/tsconfig.json`

### Entry Points
- `mobile/App.tsx`
- `mobile/index.ts`

### Assets
- `mobile/assets/adaptive-icon.png`
- `mobile/assets/favicon.png`
- `mobile/assets/icon.png`
- `mobile/assets/splash-icon.png`

### Locales
- `mobile/locales/en.json`
- `mobile/locales/hr.json`

### Scripts
- `mobile/scripts/smoke-check-menu.ts`
- `mobile/scripts/smoke-check-onboarding.ts`
- `mobile/scripts/smoke-deeplink.ts`

### Source

#### Components
- `mobile/src/components/Banner.tsx`
- `mobile/src/components/DepartureItem.tsx`
- `mobile/src/components/GlobalHeader.tsx`
- `mobile/src/components/MenuOverlay.tsx`

#### Contexts
- `mobile/src/contexts/MenuContext.tsx`
- `mobile/src/contexts/OnboardingContext.tsx`
- `mobile/src/contexts/PushContext.tsx`
- `mobile/src/contexts/UnreadContext.tsx`

#### Navigation
- `mobile/src/navigation/AppNavigator.tsx`
- `mobile/src/navigation/types.ts`

#### Screens

##### Click-Fix
- `mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx`
- `mobile/src/screens/click-fix/ClickFixDetailScreen.tsx`
- `mobile/src/screens/click-fix/ClickFixFormScreen.tsx`

##### Events
- `mobile/src/screens/events/EventDetailScreen.tsx`
- `mobile/src/screens/events/EventsScreen.tsx`

##### Feedback
- `mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx`
- `mobile/src/screens/feedback/FeedbackDetailScreen.tsx`
- `mobile/src/screens/feedback/FeedbackFormScreen.tsx`

##### Home
- `mobile/src/screens/home/HomeScreen.tsx`

##### Inbox
- `mobile/src/screens/inbox/InboxDetailScreen.tsx`
- `mobile/src/screens/inbox/InboxListScreen.tsx`

##### Onboarding
- `mobile/src/screens/onboarding/LanguageSelectionScreen.tsx`
- `mobile/src/screens/onboarding/MunicipalitySelectionScreen.tsx`
- `mobile/src/screens/onboarding/UserModeSelectionScreen.tsx`

##### Pages
- `mobile/src/screens/pages/StaticPageScreen.tsx`

##### Settings
- `mobile/src/screens/settings/SettingsScreen.tsx`

##### Transport
- `mobile/src/screens/transport/LineDetailScreen.tsx`
- `mobile/src/screens/transport/RoadLineDetailScreen.tsx`
- `mobile/src/screens/transport/RoadTransportScreen.tsx`
- `mobile/src/screens/transport/SeaLineDetailScreen.tsx`
- `mobile/src/screens/transport/SeaTransportScreen.tsx`
- `mobile/src/screens/transport/TransportHubScreen.tsx`

#### Services
- `mobile/src/services/api.ts`

#### Types
- `mobile/src/types/click-fix.ts`
- `mobile/src/types/event.ts`
- `mobile/src/types/feedback.ts`
- `mobile/src/types/inbox.ts`
- `mobile/src/types/push.ts`
- `mobile/src/types/static-page.ts`
- `mobile/src/types/transport.ts`

---

## 📁 docs/ (Documentation)

### Project Briefs & Specifications
- `docs/00-MOJVIS-NON-NEGOTIABLE-IMPLEMENTATION-CHECKLIST.md`
- `docs/01-MOJVIS-READTHISFIRST.md`
- `docs/02-MOJVIS-GENERAL-APPBUILD-BRIEF (Global Rules + Decisions).md`
- `docs/03-MOJVIS-CONTEXT-SCOPE-LEGACY-ADAPTATION.md`
- `docs/04-MOJVIS-ADMIN-SUPERVISOR-WEBEDITOR-BRIEF.md`
- `docs/05-MOJVIS-STATIC-CONTENT-PAGES-CMS-LAYOUT-SPECIFICATION.md`

### Wireframes & Screen Specifications
- `docs/06-MOJVIS-ONBOARDINGFLOW-DESCRIPTIVE-WIREFRAME.md`
- `docs/07-MOJVIS-MAINMENU-DESCRIPTIVE-WIREFRAME.md`
- `docs/08-HOMESCREEN-DESCRIPTIVE-WIREFRAME.md`
- `docs/09-MOJVIS-STYLE-GUIDE.md`
- `docs/10-MOJVIS-EVENTS-DESCRIPTIVE-WIREFRAME.md`
- `docs/11-MOJVIS-FEEDBACK-DESCRIPTIVE-WIREFRAME.md`
- `docs/12-MOJVIS-CLICK-FIX-DESCRIPTIVE-WIREFRAME.md`
- `docs/13-MOJVIS-ROAD-TRANSPORT–DESCRIPTIVE-WIREFRAME.md`
- `docs/14-MOJVIS-SEA-TRANSPORT–DESCRIPTIVE-WIREFRAME.md`
- `docs/15-MOJVIS-ADMIN-IMPORT-TRANSPORT-DATA-NOTES.md`

### Design System
- `docs/16-MOJVIS-Full-Development-Roadmap.md`
- `docs/16-MOJVIS-UI-COMPONENT-SPECIFICATIONS.md`
- `docs/17-MOJVIS-COLOR-RULEBOOK.md`
- `docs/lovable-updated-neobrutal.md`

### Verification & Testing Reports
- `docs/ADMIN_UI_E2E_REPORT.md`
- `docs/ADMIN_VERIFICATION_REPORT.md`
- `docs/API_E2E_REPORT.md`
- `docs/COMMAND_LOG.md`
- `docs/COVERAGE_MATRIX.md`
- `docs/KNOWN_LIMITATIONS.md`
- `docs/MOBILE_CLI_VERIFICATION.md`
- `docs/MOBILE_ROUTING_AUDIT.md`
- `docs/MOBILE_RUNTIME_VERIFICATION.md`
- `docs/TESTING_BIBLE.md`
- `docs/TESTING_MASTER_REPORT.md`

### Phase Completion Reports
- `docs/PHASE_0_COMPLETION.md`
- `docs/PHASE_1_COMPLETION.md`
- `docs/PHASE_2_COMPLETION.md`
- `docs/PHASE_3_COMPLETION.md`
- `docs/phase_4_completion.md`
- `docs/PHASE_5_COMPLETION.md`
- `docs/PHASE_5_MANUAL_VERIFICATION.md`
- `docs/PHASE_6_COMPLETION.md`
- `docs/PHASE_7_COMPLETION.md`
- `docs/PHASE_7_DEVICE_VERIFICATION.md`

### Templates
- `docs/templates/home-page-template.html`
- `docs/templates/inbox-page-template.html`
- `docs/templates/menu-page-template.html`
- `docs/templates/message-detail-template.html`
- `docs/templates/static-page-template.html`
- `docs/templates/styles.css`
- `docs/templates/transport-page-template.html`

### Screenshots
- `docs/screenshots/mobile-runtime/app-launch-20260108-130021.png`

---

## 📁 public/

- `public/robots.txt`

---

## 📊 Summary

| Category | File Count |
|----------|------------|
| Web App (src/) | ~75 files |
| Admin Dashboard | ~30 files |
| Backend API | ~55 files |
| Mobile App | ~45 files |
| Documentation | ~40 files |
| **Total** | **~245 files** |

---

*Generated: January 2026*
