# Mobile App i18n (Internationalization) Findings

**Branch:** `audit/mobile-runtime-verification`
**Date:** 2025-01-09
**Scope:** Language support analysis across all screens

---

## Executive Summary

The app supports language selection (Croatian/English) during onboarding, but **UI strings are predominantly hardcoded in Croatian**. English translations exist only in onboarding screens as secondary text. Post-onboarding screens are Croatian-only.

---

## Onboarding Language Support

### Language Selection Screen
**File:** `screens/onboarding/LanguageSelectionScreen.tsx`

| Element | Croatian | English |
|---------|----------|---------|
| Title | Dobrodosli | Welcome |
| Subtitle | Odaberite jezik | Select language |
| Button 1 | Hrvatski | - |
| Button 2 | English | - |

**Status:** Bilingual (both shown simultaneously)

### User Mode Selection Screen
**File:** `screens/onboarding/UserModeSelectionScreen.tsx`

| Element | Croatian | English |
|---------|----------|---------|
| Title | Kako koristite aplikaciju? | How do you use the app? |
| Visitor option | Posjetitelj | Visitor |
| Local option | Lokalac | Local |
| Descriptions | YES | YES (italic secondary) |
| Hint | Mozete promijeniti kasnije | You can change this later |

**Status:** Bilingual (English shown as secondary gray text)

### Municipality Selection Screen
**File:** `screens/onboarding/MunicipalitySelectionScreen.tsx`

| Element | Croatian | English |
|---------|----------|---------|
| Title | Odaberite opcinu | Select your municipality |
| Back button | Natrag | Back |
| Hint | YES | YES |

**Status:** Bilingual (English shown as secondary)

---

## Post-Onboarding Screens (Croatian Only)

### Home Screen
**File:** `screens/home/HomeScreen.tsx`

```typescript
// Line 127-129 - HARDCODED CROATIAN
<H1 style={styles.greetingTitle}>Dobrodosli na Vis!</H1>
<Body color={skin.colors.textMuted}>
  Vas vodic za zivot i posjetu otoku
</Body>
```

| String | Translation Needed |
|--------|-------------------|
| "Dobrodosli na Vis!" | "Welcome to Vis!" |
| "Vas vodic za zivot i posjetu otoku" | "Your guide for life and visiting the island" |

### Inbox List Screen
**File:** `screens/inbox/InboxListScreen.tsx`

| String | Line | Translation |
|--------|------|-------------|
| "Primljeno" | 321 | "Received" |
| "Poslano" | 334 | "Sent" |
| "Greska pri ucitavanju poruka. Pokusajte ponovo." | 102 | "Error loading messages. Try again." |
| "Greska pri ucitavanju poslanih poruka." | 148 | "Error loading sent messages." |
| "Nema poruka" | 235 | "No messages" |
| "Vas sanducic je prazan" | 238 | "Your inbox is empty" |
| "Niste poslali nijednu poruku" | 239 | "You haven't sent any messages" |
| "Pokusaj ponovo" | 248 | "Try again" |
| "HITNO" | 210 | "URGENT" |
| "PRIJAVA" | 261 | "REPORT" |
| "Nova poruka" | 385 | "New message" |
| "Prijavi problem" | 388 | "Report problem" |
| "slika" | 278 | "images" |
| "Nema poslanih poruka" | 290 | "No sent messages" |
| "Posaljite prvu poruku putem gumba ispod" | 292 | "Send your first message using the button below" |
| "Ucitavanje..." | 344 | "Loading..." |

### Events Screen
**File:** `screens/events/EventsScreen.tsx`

| String | Line | Translation |
|--------|------|-------------|
| Month names array | 81-84 | Standard month names |
| Day names array | 86 | "Sun", "Mon", "Tue", etc. |
| "Cijeli dan" | 43 | "All day" |
| "Dogadaji" | 283 | "Events" |
| "Pregledajte dogadanja na otoku" | 285 | "Browse events on the island" |
| "Greska pri ucitavanju dogadaja" | 242 | "Error loading events" |
| "Nema dogadaja za ovaj dan" | 316 | "No events for this day" |

### Transport Hub Screen
**File:** `screens/transport/TransportHubScreen.tsx`

| String | Line | Translation |
|--------|------|-------------|
| "Vozni red" | 73 | "Timetable" |
| "Odaberite vrstu prijevoza" | 74 | "Select transport type" |
| "Cestovni promet" | 86 | "Road transport" |
| "Autobusne linije" | 87 | "Bus lines" |
| "Pomorski promet" | 99 | "Sea transport" |
| "Trajekti i katamarani" | 100 | "Ferries and catamarans" |

### Click & Fix Form Screen
**File:** `screens/click-fix/ClickFixFormScreen.tsx`

| String | Line | Translation |
|--------|------|-------------|
| "Prijavi problem" | 214 | "Report problem" |
| "Prijavite problem na lokaciji otoka Visa." | 216 | "Report a problem at a location on Vis island." |
| "Naslov" | 230 | "Subject" |
| "Kratki opis problema" | 236 | "Brief description of problem" |
| "Opis" | 254 | "Description" |
| "Detaljniji opis problema" | 264 | "Detailed description" |
| "Lokacija" | 285 | "Location" |
| "Dohvati trenutnu lokaciju" | 313 | "Get current location" |
| "Promijeni" | 297 | "Change" |
| "Slike" | 326 | "Photos" |
| "Odaberi iz galerije" | 354 | "Choose from gallery" |
| "Slikaj" | 361 | "Take photo" |
| "Posalji prijavu" | 377 | "Submit report" |
| Alert dialogs | Multiple | Various error messages |

### Menu Overlay
**File:** `components/MenuOverlay.tsx`

| String | Translation |
|--------|-------------|
| "Pocetna" | "Home" |
| "Sanducic" | "Inbox" |
| "Dogadaji" | "Events" |
| "Vozni red" | "Timetable" |
| "Postavke" | "Settings" |

---

## i18n Implementation Status

### Current State
1. **No i18n library integrated** (no react-i18next, i18n-js, etc.)
2. **Language stored in context** but not used for translations
3. **Onboarding uses dual-language display** pattern
4. **All other screens use hardcoded Croatian**

### Onboarding Context
**File:** `contexts/OnboardingContext.tsx`

```typescript
type Language = 'hr' | 'en';

interface OnboardingData {
  language: Language;
  userMode: 'visitor' | 'local';
  municipality: 'vis' | 'komiza' | null;
}
```

The language is stored but never read to translate UI strings.

---

## String Count Summary

| Screen | Croatian Strings | Needs Translation |
|--------|------------------|-------------------|
| Onboarding (3 screens) | ~20 | Already bilingual |
| HomeScreen | 2 | YES |
| InboxListScreen | ~18 | YES |
| EventsScreen | ~12 | YES |
| TransportHubScreen | 6 | YES |
| ClickFixFormScreen | ~15 | YES |
| FeedbackFormScreen | ~10 | YES (estimated) |
| MenuOverlay | 5 | YES |
| StaticPageScreen | 2-3 | YES |
| **TOTAL** | **~90** | **~70** |

---

## Recommended Implementation

### Option A: react-i18next (Recommended)

1. Install: `npm install react-i18next i18next`
2. Create translation files:
   ```
   mobile/src/i18n/
   ├── index.ts
   ├── hr.json
   └── en.json
   ```
3. Wrap app with `I18nextProvider`
4. Use `useTranslation()` hook in components
5. Read language from `OnboardingContext` and set i18n language

### Option B: Custom Translation Hook

1. Create `useTranslation()` hook that reads `OnboardingContext`
2. Create translation object with HR/EN keys
3. Return function `t(key)` that returns appropriate string

### Option C: Dual-Language Display (Current Onboarding Pattern)

Show both languages on all screens (not recommended for main app).

---

## Priority Strings for Translation

### High Priority (User-Facing Errors)
1. Error messages in Inbox
2. Error messages in Events
3. Error messages in Click & Fix
4. Empty state messages

### Medium Priority (Navigation)
1. Menu items
2. Tab labels
3. Button labels

### Lower Priority (Decorative)
1. Welcome messages
2. Section subtitles
3. Hints

---

## Conclusion

The app has a **language selection mechanism** but **does not apply translations**. To provide English support:

1. Integrate an i18n library
2. Extract ~70 hardcoded Croatian strings
3. Create English translations
4. Wire language context to i18n system

**Estimated Effort:** Medium (2-3 days for full implementation)
