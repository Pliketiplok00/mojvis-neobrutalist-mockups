# Flight Test Phase 4: UX, Mobile Stability & i18n — Analysis Report

**Date:** 2026-01-10
**Branch:** `feat/auth-backend-phase1b`
**Scope:** READ-ONLY analysis (no code changes)

---

## Executive Summary

| Category | Status | Severity |
|----------|--------|----------|
| Mobile Stability | ✅ PASS | - |
| Banner Tap Behavior | ✅ PASS | - |
| UX Correctness | ⚠️ PARTIAL | Medium |
| i18n Completeness | ❌ CRITICAL | High |

**Critical Finding:** Locale files exist but are **NOT integrated**. English users see Croatian UI despite selecting English in onboarding.

---

## 1. Entry Conditions Verification

| Condition | Status | Evidence |
|-----------|--------|----------|
| Phase 1-3 complete | ✅ | Completion reports for all phases |
| Admin auth enforced | ✅ | `adminAuthHook` in index.ts:78 |
| Security tests pass | ✅ | 311/311 tests pass |
| Release gate unblocked | ✅ | All foundational work complete |

---

## 2. Mobile Stability Analysis

### 2.1 Crash Paths Checked

| Screen | Error Handling | Empty State | Edge Cases |
|--------|---------------|-------------|------------|
| HomeScreen | ✅ Silent fail on banner fetch | N/A | ✅ |
| InboxListScreen | ✅ Error state with retry | ✅ Empty state | ✅ |
| EventsScreen | ✅ Error state | ✅ "Nema dogadaja" | ✅ Calendar handles all months |
| RoadTransportScreen | ✅ Error state with retry | ✅ "Nema linija" | ✅ |
| SeaTransportScreen | ✅ Error state with retry | ✅ "Nema linija" | ✅ |
| StaticPageScreen | ✅ Error state with retry | N/A (page or error) | ✅ |
| FeedbackFormScreen | ✅ Error on submit | N/A | ✅ Rate limit handled |
| ClickFixFormScreen | ✅ Error on submit | N/A | ✅ Permission alerts |

### 2.2 Runtime Exception Risks

| Risk | Status | Location |
|------|--------|----------|
| Null pointer on API response | ✅ Handled | All screens use optional chaining |
| Missing navigation params | ✅ Handled | TypeScript enforces params |
| AsyncStorage failures | ⚠️ Not persisted | UnreadContext, OnboardingContext (TODOs present) |
| Device ID not persisted | ⚠️ Known limitation | Regenerated each session |

### 2.3 Edge Cases

| Scenario | Status | Notes |
|----------|--------|-------|
| Empty inbox | ✅ | Shows "Nema poruka" with emoji icon |
| Expired banners | ✅ | Filtered server-side, empty list handled |
| No events for day | ✅ | Shows "Nema dogadaja za ovaj dan" |
| No transport data | ✅ | Shows "Nema dostupnih linija" |
| No network | ⚠️ | Error states exist, no offline mode |

**Verdict: MOBILE STABILITY — PASS**

---

## 3. Banner Tap Verification

### 3.1 Banner Component (System Banners)

**File:** `mobile/src/components/Banner.tsx`

```typescript
// Line 36-38
const handlePress = (): void => {
  navigation.navigate('InboxDetail', { messageId: message.id });
};
```

**Screens using BannerList:**
| Screen | Correct Usage | Banner Tags |
|--------|--------------|-------------|
| HomeScreen | ✅ | home context (opcenito, hitno, municipal) |
| RoadTransportScreen | ✅ | transport context (cestovni_promet, hitno) |
| SeaTransportScreen | ✅ | transport context (pomorski_promet, hitno) |
| EventsScreen | ✅ | events context |

### 3.2 Notice Block (CMS Content Blocks)

**File:** `mobile/src/screens/pages/StaticPageScreen.tsx`

```typescript
// Line 90-92
const handleNoticePress = (noticeId: string): void => {
  navigation.navigate('InboxDetail', { messageId: noticeId });
};
```

**Verified:** Notice blocks on static pages correctly navigate to InboxDetail.

### 3.3 Banner Tap Summary

| Location | Tap Target | Behavior | Status |
|----------|------------|----------|--------|
| Home | Banner | → InboxDetail | ✅ CORRECT |
| RoadTransport | Banner | → InboxDetail | ✅ CORRECT |
| SeaTransport | Banner | → InboxDetail | ✅ CORRECT |
| StaticPage | NoticeBlock | → InboxDetail | ✅ CORRECT |
| Events | Banner | → InboxDetail | ✅ CORRECT |

**Verdict: BANNER TAP BEHAVIOR — PASS**

---

## 4. UX Correctness Analysis

### 4.1 Navigation Flows

| Flow | Status | Notes |
|------|--------|-------|
| Onboarding → Home | ✅ | Language → Mode → Municipality → Home |
| Menu → Any screen | ✅ | All core items navigate correctly |
| Banner tap → Inbox detail | ✅ | Back returns to origin |
| Inbox → Message detail | ✅ | Back returns to list |
| Events → Event detail | ✅ | Back returns to calendar |
| Transport → Line detail | ✅ | Back returns to list |
| Feedback form → Confirmation | ✅ | No dead ends |
| Click & Fix → Confirmation | ✅ | No dead ends |

### 4.2 Navigation Dead Ends

**None found.** All flows have proper back navigation via iOS swipe gesture.

### 4.3 UX Issues Found

| Issue | Screen | Severity | Description |
|-------|--------|----------|-------------|
| UX-001 | HomeScreen | Low | Category cards are placeholder, not tappable |
| UX-002 | HomeScreen | Low | "Upcoming Events" is placeholder text |
| UX-003 | StaticPageScreen | Low | Map block is placeholder (no actual map) |

**Note:** These are known placeholders per spec, not bugs.

**Verdict: UX CORRECTNESS — PASS (with known placeholders)**

---

## 5. i18n Completeness Audit — CRITICAL

### 5.1 Locale Files

| File | Exists | Keys | Used |
|------|--------|------|------|
| `mobile/locales/hr.json` | ✅ | 43 | ❌ NOT USED |
| `mobile/locales/en.json` | ✅ | 43 | ❌ NOT USED |

### 5.2 i18n Library Integration

```bash
grep -r "useTranslation\|i18n\|locales" mobile/src/
# Result: No files found
```

**CRITICAL:** No i18n library is integrated. Locale files exist but are completely unused.

### 5.3 Hardcoded Strings by Screen

#### HomeScreen.tsx
| Line | String (HR) | EN Equivalent |
|------|-------------|---------------|
| 74 | "Dobrodosli na Vis!" | "Welcome to Vis!" |
| 76 | "Vas vodic za zivot i posjetu otoku" | "Your guide to life and visiting the island" |
| 81 | "Kategorije" | "Categories" |
| 92 | "Nadolazeci dogadaji" | "Upcoming Events" |
| 107 | "Imate prijedlog?" | "Have a suggestion?" |
| 109 | "Posaljite nam povratnu informaciju" | "Send us your feedback" |

#### InboxListScreen.tsx
| Line | String (HR) | EN Equivalent |
|------|-------------|---------------|
| 102 | "Greska pri ucitavanju poruka..." | "Error loading messages..." |
| 148 | "Greska pri ucitavanju poslanih poruka." | "Error loading sent messages." |
| 235 | "Nema poruka" | "No messages" |
| 238 | "Vas sanducic je prazan" | "Your inbox is empty" |
| 290 | "Nema poslanih poruka" | "No sent messages" |
| 321 | "Primljeno" | "Received" |
| 334 | "Poslano" | "Sent" |
| 385 | "Nova poruka" | "New message" |
| 388 | "Prijavi problem" | "Report problem" |

#### EventsScreen.tsx
| Line | String (HR) | EN Equivalent |
|------|-------------|---------------|
| 43 | "Cijeli dan" | "All day" |
| 82-84 | Month names array | English month names |
| 86 | Day abbreviations array | English day names |
| ~316 | "Nema dogadaja za ovaj dan" | "No events for this day" |

#### Transport Screens (Road/Sea)
| String (HR) | EN Equivalent |
|-------------|---------------|
| "Ucitavanje..." | "Loading..." |
| "Greska pri ucitavanju podataka" | "Error loading data" |
| "Pokusaj ponovo" | "Try again" |
| "Cestovni promet" / "Pomorski promet" | "Road transport" / "Sea transport" |
| "Linije" | "Lines" |
| "Polasci danas" | "Today's departures" |
| "Nema dostupnih linija" | "No lines available" |
| "Nema polazaka danas" | "No departures today" |
| Day type labels (Ponedjeljak, etc.) | Monday, etc. |

#### FeedbackFormScreen.tsx
| String (HR) | EN Equivalent |
|-------------|---------------|
| "Pošalji poruku" | "Send message" |
| "Tema" | "Subject" |
| "Poruka" | "Message" |
| "Pošalji" | "Send" |
| Validation errors | English validation errors |

#### ClickFixFormScreen.tsx
| String (HR) | EN Equivalent |
|-------------|---------------|
| "Naslov" | "Title" |
| "Opis" | "Description" |
| Permission alert messages | English permission messages |
| Location error messages | English location errors |

#### StaticPageScreen.tsx
| String (HR) | EN Equivalent |
|-------------|---------------|
| "Ucitavanje..." | "Loading..." |
| "Stranica nije pronadena..." | "Page not found..." |
| "Pokusaj ponovo" | "Try again" |
| "Karta" | "Map" |

#### Banner.tsx
| String (HR) | EN Equivalent |
|-------------|---------------|
| "HITNO" | "URGENT" |
| accessibilityHint (line 48) | Needs English version |

### 5.4 i18n Audit Table

| Screen | Total Strings | HR | EN | Coverage |
|--------|--------------|-----|-----|----------|
| HomeScreen | 6 | 6 | 0 | 0% |
| InboxListScreen | 12+ | 12+ | 0 | 0% |
| EventsScreen | 20+ | 20+ | 0 | 0% |
| RoadTransportScreen | 15+ | 15+ | 0 | 0% |
| SeaTransportScreen | 15+ | 15+ | 0 | 0% |
| StaticPageScreen | 5 | 5 | 0 | 0% |
| FeedbackFormScreen | 10+ | 10+ | 0 | 0% |
| ClickFixFormScreen | 15+ | 15+ | 0 | 0% |
| SettingsScreen | ~10 | 5 | 5 | 50%* |
| MenuOverlay | 16 | 8 | 8 | 100%** |

*SettingsScreen uses language ternary for some strings
**MenuOverlay shows both HR and EN labels

### 5.5 Impact Assessment

**User Journey (English selected):**
1. ✅ Onboarding: Partially translated (via ternary logic)
2. ❌ Home: Croatian only
3. ❌ Inbox: Croatian only
4. ❌ Events: Croatian only (including calendar)
5. ❌ Transport: Croatian only
6. ❌ Feedback: Croatian only
7. ❌ Click & Fix: Croatian only
8. ⚠️ Menu: Both languages shown

**Verdict: i18n COMPLETENESS — CRITICAL FAILURE**

---

## 6. Crash / Risk Register

| ID | Risk | Severity | Likelihood | Impact | Mitigation |
|----|------|----------|------------|--------|------------|
| R-001 | EN users see HR UI | High | 100% | UX broken for EN users | Integrate i18n library |
| R-002 | Device ID not persisted | Medium | 100% | Re-onboarding on app restart | Implement AsyncStorage |
| R-003 | Unread state not persisted | Medium | 100% | Badge resets on restart | Implement AsyncStorage |
| R-004 | Network failure | Low | Variable | Error state shown | Acceptable (no offline mode) |
| R-005 | Permission denied (location/camera) | Low | Variable | Graceful fallback | ✅ Already handled |

---

## 7. Summary of Findings

### PASS
- ✅ Mobile stability (no crash paths)
- ✅ Banner tap behavior (all open InboxDetail)
- ✅ Navigation flows (no dead ends)
- ✅ Empty state handling
- ✅ Error state handling

### CRITICAL ISSUES
1. **i18n not integrated** — English users see Croatian UI
2. **Locale files unused** — `hr.json` and `en.json` exist but no import

### MEDIUM ISSUES
1. **AsyncStorage not implemented** — Device ID and unread state not persisted
2. **Calendar hardcoded** — Month/day names in Croatian only

### LOW ISSUES
1. **Placeholder content** — Category cards, upcoming events, map block

---

## 8. Recommendations

### MUST FIX (Phase 4 Scope)
1. Integrate i18n library (e.g., react-i18next or custom context)
2. Replace all hardcoded strings with translation keys
3. Verify every screen renders correctly in both HR and EN

### SHOULD FIX (Phase 4 Scope if time permits)
1. Persist device ID to AsyncStorage
2. Persist unread state to AsyncStorage

### OUT OF SCOPE (Phase 4)
- Category cards functionality
- Upcoming events integration
- Map block implementation
- Offline mode

---

## 9. Files Requiring Changes

### High Priority (i18n)
```
mobile/src/screens/home/HomeScreen.tsx
mobile/src/screens/inbox/InboxListScreen.tsx
mobile/src/screens/inbox/InboxDetailScreen.tsx
mobile/src/screens/events/EventsScreen.tsx
mobile/src/screens/events/EventDetailScreen.tsx
mobile/src/screens/transport/RoadTransportScreen.tsx
mobile/src/screens/transport/SeaTransportScreen.tsx
mobile/src/screens/transport/LineDetailScreen.tsx
mobile/src/screens/feedback/FeedbackFormScreen.tsx
mobile/src/screens/feedback/FeedbackConfirmationScreen.tsx
mobile/src/screens/feedback/FeedbackDetailScreen.tsx
mobile/src/screens/click-fix/ClickFixFormScreen.tsx
mobile/src/screens/click-fix/ClickFixConfirmationScreen.tsx
mobile/src/screens/click-fix/ClickFixDetailScreen.tsx
mobile/src/screens/pages/StaticPageScreen.tsx
mobile/src/screens/settings/SettingsScreen.tsx
mobile/src/components/Banner.tsx
mobile/src/components/GlobalHeader.tsx
mobile/src/types/feedback.ts (validation messages)
mobile/src/types/click-fix.ts (validation messages)
```

### Medium Priority (Persistence)
```
mobile/src/contexts/OnboardingContext.tsx
mobile/src/contexts/UnreadContext.tsx
mobile/src/hooks/useDeviceId.ts (to be created)
```

---

## 10. Conclusion

**Flight Test Phase 4 Analysis: BLOCKERS FOUND**

The mobile app has a **critical i18n failure**: English users see Croatian UI throughout the app. The locale files exist but are not integrated.

All other areas (stability, banner tap, navigation) pass verification.

**Next Step:** User approval required before implementing fixes.

---

**Report Generated:** 2026-01-10
**Author:** Claude Code (Phase 4 Audit)
