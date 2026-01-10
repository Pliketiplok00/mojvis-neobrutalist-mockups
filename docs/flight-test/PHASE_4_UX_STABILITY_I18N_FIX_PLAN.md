# Flight Test Phase 4: UX, Mobile Stability & i18n — Fix Plan

**Date:** 2026-01-10
**Status:** AWAITING APPROVAL
**Depends on:** PHASE_4_UX_STABILITY_I18N_ANALYSIS.md

---

## Scope Confirmation

Per Flight Test Phase 4 rules:
- ✅ Fix correctness issues only
- ✅ No redesign
- ✅ No new features
- ✅ No architecture changes
- ✅ Minimal changes

---

## Proposed Fixes

### FIX-001: Integrate i18n System (CRITICAL)

**Severity:** Critical
**Status:** NEEDS CONFIRMATION

#### Approach Options

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| A | react-i18next | Industry standard, proven | New dependency |
| B | Custom context + hook | No new deps, simple | More code to maintain |
| C | Language ternary pattern | Already used in Settings | Verbose, harder to maintain |

**Recommendation:** Option B (Custom context + hook)
- Matches existing codebase patterns
- No new dependencies
- Locale files already exist in correct format
- Can be implemented quickly

#### Implementation

1. Create `mobile/src/contexts/LanguageContext.tsx`:
   - Load locale from OnboardingContext
   - Provide `t(key)` function
   - Export `useTranslations()` hook

2. Expand locale files with all missing keys

3. Update each screen to use `t()` instead of hardcoded strings

**Files to modify:**
- NEW: `mobile/src/contexts/LanguageContext.tsx`
- MODIFY: `mobile/locales/hr.json` (expand)
- MODIFY: `mobile/locales/en.json` (expand)
- MODIFY: All 18 screen files (replace hardcoded strings)

**Risk:** Low (additive change, no breaking changes)

---

### FIX-002: Expand Locale Files (CRITICAL)

**Severity:** Critical
**Status:** SAFE TO IMPLEMENT

Current locale files have ~43 keys. Required keys: ~150+

#### New Keys Required

```json
{
  "inbox": {
    "title": "Inbox / Pristiglo",
    "tabs": {
      "received": "Received / Primljeno",
      "sent": "Sent / Poslano"
    },
    "empty": {
      "received": "Your inbox is empty / Vaš sandučić je prazan",
      "sent": "No sent messages / Nema poslanih poruka"
    },
    "error": "Error loading messages / Greška pri učitavanju poruka",
    "newMessage": "New message / Nova poruka",
    "reportProblem": "Report problem / Prijavi problem"
  },
  "events": {
    "title": "Events / Događaji",
    "allDay": "All day / Cijeli dan",
    "noEvents": "No events for this day / Nema događaja za ovaj dan",
    "months": ["January", "February", ...],
    "days": ["Sun", "Mon", ...]
  },
  "transport": {
    "road": {
      "title": "Road Transport / Cestovni promet"
    },
    "sea": {
      "title": "Sea Transport / Pomorski promet"
    },
    "lines": "Lines / Linije",
    "todaysDepartures": "Today's departures / Polasci danas",
    "noLines": "No lines available / Nema dostupnih linija",
    "noDepartures": "No departures today / Nema polazaka danas",
    "dayTypes": {
      "MON": "Monday / Ponedjeljak",
      "TUE": "Tuesday / Utorak",
      ...
    }
  },
  "feedback": {
    "title": "Send message / Pošalji poruku",
    "subject": "Subject / Tema",
    "message": "Message / Poruka",
    "send": "Send / Pošalji",
    "validation": {
      "subjectRequired": "Subject is required / Tema je obavezna",
      "messageRequired": "Message is required / Poruka je obavezna",
      ...
    }
  },
  "clickFix": {
    "title": "Report problem / Prijavi problem",
    "titleField": "Title / Naslov",
    "description": "Description / Opis",
    "location": "Location / Lokacija",
    "photos": "Photos / Fotografije",
    "validation": {...},
    "permissions": {...}
  },
  "common": {
    "loading": "Loading... / Učitavanje...",
    "error": "An error occurred / Došlo je do greške",
    "retry": "Try again / Pokušaj ponovo",
    "urgent": "URGENT / HITNO",
    "back": "Back / Natrag"
  },
  "staticPage": {
    "notFound": "Page not found / Stranica nije pronađena",
    "map": "Map / Karta"
  }
}
```

**Risk:** None (data-only change)

---

### FIX-003: Update Screen Components (CRITICAL)

**Severity:** Critical
**Status:** SAFE TO IMPLEMENT (after FIX-001)

#### Pattern to Apply

**Before:**
```typescript
<Text>Nema poruka</Text>
```

**After:**
```typescript
const { t } = useTranslations();
// ...
<Text>{t('inbox.empty.received')}</Text>
```

#### Screens to Update

| Screen | Est. Strings | Complexity |
|--------|-------------|------------|
| HomeScreen | 6 | Low |
| InboxListScreen | 12 | Medium |
| InboxDetailScreen | 3 | Low |
| EventsScreen | 20+ | High (calendar) |
| EventDetailScreen | 5 | Low |
| RoadTransportScreen | 15 | Medium |
| SeaTransportScreen | 15 | Medium |
| LineDetailScreen | 10 | Medium |
| StaticPageScreen | 5 | Low |
| FeedbackFormScreen | 10 | Medium |
| FeedbackConfirmationScreen | 3 | Low |
| FeedbackDetailScreen | 5 | Low |
| ClickFixFormScreen | 15 | High (permissions) |
| ClickFixConfirmationScreen | 3 | Low |
| ClickFixDetailScreen | 5 | Low |
| SettingsScreen | 10 | Low (partially done) |
| Banner.tsx | 2 | Low |
| GlobalHeader.tsx | 1 | Low |

**Risk:** Low (string replacement only)

---

### FIX-004: Fix Validation Message i18n (MEDIUM)

**Severity:** Medium
**Status:** SAFE TO IMPLEMENT

**Files:**
- `mobile/src/types/feedback.ts`
- `mobile/src/types/click-fix.ts`

These files contain hardcoded Croatian validation messages.

#### Pattern to Apply

**Before:**
```typescript
if (!subject) return 'Tema je obavezna';
```

**After:**
```typescript
// Export validation keys, let component translate
export const VALIDATION_KEYS = {
  subjectRequired: 'feedback.validation.subjectRequired',
  // ...
};
```

**Risk:** Low

---

## NOT Implementing (Out of Scope)

Per Phase 4 rules, the following are NOT being fixed:

| Item | Reason |
|------|--------|
| AsyncStorage persistence | Not a correctness issue |
| Device ID persistence | Not a correctness issue |
| Category cards | Placeholder per spec |
| Map implementation | Out of scope |
| Offline mode | Feature, not bug |

---

## Implementation Order

1. **FIX-001**: Create LanguageContext (foundation)
2. **FIX-002**: Expand locale files (data)
3. **FIX-003**: Update screens (one by one)
4. **FIX-004**: Fix validation messages

---

## Verification Plan

After implementation:

1. **EN Flow Test:**
   - Select English in onboarding
   - Navigate through ALL screens
   - Verify NO Croatian text visible (except data from API)

2. **HR Flow Test:**
   - Select Croatian in onboarding
   - Navigate through ALL screens
   - Verify Croatian text

3. **Screen-by-Screen Checklist:**
   - [ ] HomeScreen (EN/HR)
   - [ ] InboxListScreen (EN/HR)
   - [ ] InboxDetailScreen (EN/HR)
   - [ ] EventsScreen (EN/HR) including calendar
   - [ ] EventDetailScreen (EN/HR)
   - [ ] RoadTransportScreen (EN/HR)
   - [ ] SeaTransportScreen (EN/HR)
   - [ ] LineDetailScreen (EN/HR)
   - [ ] StaticPageScreen (EN/HR)
   - [ ] FeedbackFormScreen (EN/HR)
   - [ ] ClickFixFormScreen (EN/HR)
   - [ ] SettingsScreen (EN/HR)
   - [ ] All confirmation screens (EN/HR)
   - [ ] All detail screens (EN/HR)
   - [ ] Banner component (EN/HR)
   - [ ] Error states (EN/HR)
   - [ ] Empty states (EN/HR)

---

## Approval Request

**Question for User:**

Do you approve this fix plan?

- **Option A:** Approve all fixes (FIX-001 through FIX-004)
- **Option B:** Approve i18n fixes only (FIX-001 through FIX-003)
- **Option C:** Modify plan (specify changes)
- **Option D:** Reject (provide reason)

**Note:** I will NOT implement any code until you provide explicit approval.

---

**Plan Generated:** 2026-01-10
**Author:** Claude Code (Phase 4 Audit)
