# Visitor vs Local Mode: Implemented Behavioral Differences

**Date:** 2026-01-09
**Scope:** Runtime differences affecting what users can SEE or DO

---

## A) Executive Summary

1. **Visitors CANNOT see municipal messages** - Messages tagged `vis` or `komiza` are hidden from visitors in Inbox and banners
2. **Locals see ONLY their municipality's messages** - A Vis local cannot see Komiža messages (and vice versa)
3. **Municipal banners follow the same rules** - `hitno + vis` banners are invisible to visitors and Komiža locals
4. **Static page notices respect user context** - Municipal notices injected into static pages follow the same eligibility rules
5. **All other features are IDENTICAL** - Events, Transport, Click & Fix, Feedback have no userMode-based differences
6. **Feedback/Click & Fix store userMode as metadata only** - Both visitors and locals can submit; no restrictions
7. **Settings screen shows municipality label only for locals** - Cosmetic display difference, not functional

---

## B) Feature Comparison Table

| Feature Area | Visitor | Local | Municipality Impact | Code Locations |
|-------------|---------|-------|---------------------|----------------|
| **Inbox Messages** | Cannot see messages with `vis` or `komiza` tags | Can see messages matching their municipality only | Vis locals see `vis` messages; Komiža locals see `komiza` messages | `backend/src/lib/eligibility.ts:65-90` (`isMessageEligible`), `backend/src/routes/inbox.ts:143-144` |
| **Inbox Detail** | Cannot access municipal message by ID | Can access municipal message only if municipality matches | 404 returned if not eligible | `backend/src/routes/inbox.ts:190-195` |
| **Banners (Home)** | Cannot see `hitno + vis` or `hitno + komiza` banners | Can see `hitno + vis` OR `hitno + komiza` if municipality matches | Municipal banners appear on home only | `backend/src/lib/eligibility.ts:166-193` (`isBannerEligible`), `backend/src/lib/eligibility.ts:236-251` (`isBannerForScreen`) |
| **Banners (Events)** | Only `hitno + kultura` | Only `hitno + kultura` | **No difference** - municipal banners don't appear on events | `backend/src/lib/eligibility.ts:242-243` |
| **Banners (Transport)** | Only `hitno + promet` | Only `hitno + promet` | **No difference** - municipal banners don't appear on transport | `backend/src/lib/eligibility.ts:245-247` |
| **Static Page Notices** | Municipal notices hidden | Municipal notices shown if municipality matches | Notices follow banner eligibility rules | `backend/src/routes/static-pages.ts:244-263` |
| **Events** | Full access | Full access | **No difference** | Events API has no userMode filtering |
| **Transport** | Full access | Full access | **No difference** | Transport API has no userMode filtering |
| **Feedback** | Can submit | Can submit | userMode stored with submission but no restrictions | `backend/src/routes/feedback.ts:132-141` |
| **Click & Fix** | Can submit | Can submit | userMode stored with submission but no restrictions | `backend/src/routes/click-fix.ts:254-265` |
| **Push Notifications** | Can opt-in | Can opt-in | **No difference** | Push API has no userMode filtering |
| **Settings Display** | Shows "Posjetitelj" / "Visitor" | Shows "Lokalni stanovnik" + municipality name | Display only, not functional | `mobile/src/screens/settings/SettingsScreen.tsx:84-89,152-163` |

---

## C) No Differences Found

The following feature areas have **identical behavior** for visitors and locals:

1. **Events Screen** - All events visible to all users; subscription/reminder functionality identical
2. **Transport (Road & Sea)** - All timetables, departures, and line details visible to all users
3. **Click & Fix Submission** - Both can submit reports with photos; no field or validation differences
4. **Feedback Submission** - Both can submit feedback; no field or validation differences
5. **Push Notifications** - Both can register for and receive emergency (`hitno`) push notifications
6. **Static Page Content** - All pages visible to all users (only injected notices differ based on eligibility)

---

## D) Open Issues / Surprising Differences

1. **Hardcoded userContext in mobile screens** - Multiple screens use hardcoded `{ userMode: 'visitor', municipality: null }` instead of reading from OnboardingContext:
   - `mobile/src/screens/inbox/InboxListScreen.tsx:87`
   - `mobile/src/screens/events/EventsScreen.tsx:207`
   - `mobile/src/screens/transport/TransportHubScreen.tsx` (line ~65)
   - `mobile/src/screens/transport/RoadTransportScreen.tsx:62`
   - `mobile/src/screens/transport/SeaTransportScreen.tsx:62`

2. **userMode stored but never queried** - Feedback and Click & Fix submissions store `user_mode` and `municipality` in the database, but admin views and filtering do not use these fields

3. **No municipal-specific events** - Events have no tagging system, so there's no way to show municipal-only events to locals

4. **Banner cap applies globally** - The 3-banner cap is per-screen, but municipal banners compete with non-municipal banners (no reserved slots)

5. **Settings allows mode change via reset only** - There's no direct way to switch from visitor to local or change municipality without resetting all settings

---

## Technical Details

### Eligibility Flow

```
User Request → getUserContext() → isMessageEligible() / isBannerEligible()
                    ↓
            Extract from headers:
            - X-User-Mode: 'visitor' | 'local'
            - X-Municipality: 'vis' | 'komiza' | null
                    ↓
            For municipal messages (tagged vis or komiza):
            - If visitor: REJECT
            - If local + wrong municipality: REJECT
            - If local + matching municipality: ACCEPT
```

### Key Functions

| Function | File | Purpose |
|----------|------|---------|
| `getUserContext()` | `backend/src/routes/inbox.ts:49-64` | Extract userMode and municipality from request headers |
| `isMessageEligible()` | `backend/src/lib/eligibility.ts:65-90` | Check if message is visible to user |
| `isBannerEligible()` | `backend/src/lib/eligibility.ts:166-193` | Check if message qualifies as banner for user |
| `isMunicipal()` | `backend/src/types/inbox.ts:226-228` | Check if message has `vis` or `komiza` tag |
| `getMunicipalityFromTags()` | `backend/src/types/inbox.ts:233-237` | Extract municipality from message tags |

---

## Proof

```
$ git status
On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        docs/VISITOR_VS_LOCAL_DIFFERENCES.md

$ git diff --name-only
(empty - no modified files)
```
