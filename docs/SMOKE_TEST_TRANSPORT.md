# Transport Smoke Test Checklist

## Prerequisites

- App running via `pnpm --dir mobile start --clear`
- Metro cache cleared
- Test both HR and EN language settings

---

## Sea Transport List (`SeaTransportScreen`)

### Test: Line 602 (Jadrolinija Ferry)
- [ ] Header background is TEAL
- [ ] Icon is SHIP (not anchor)
- [ ] Title shows route correctly
- [ ] Subtype badge shows "TRAJEKT"
- [ ] No seasonal badge visible
- [ ] Card body shows stops count and duration

### Test: Line 612 (Nauticki centar Komiza)
- [ ] Header background is TEAL
- [ ] Icon is SHIP
- [ ] Subtype badge shows correctly (if present)
- [ ] No seasonal badge visible

### Test: Line 9602 (Krilo Catamaran)
- [ ] Header background is TEAL
- [ ] Icon is SHIP (not anchor)
- [ ] Subtype badge shows "KATAMARAN"
- [ ] No seasonal badge visible

### Test: Line 659 (Seasonal Catamaran)
- [ ] Header background is TEAL (NOT yellow)
- [ ] Icon is SHIP (not anchor)
- [ ] Title text is WHITE (not black)
- [ ] Subtitle shows "Samo sezonski / ljeto 2026" (HR) or "Seasonal only / Summer 2026" (EN)
- [ ] Badge stack visible on right side:
  - [ ] Top badge: "KATAMARAN"
  - [ ] Bottom badge: "SEZONSKA" (HR) or "SEASONAL" (EN)
- [ ] Both badges are same size/style
- [ ] Seasonal badge has YELLOW background

---

## Sea Line Detail (`LineDetailScreen` via `SeaLineDetailScreen`)

### Test: Line 659 Detail Page
- [ ] Navigate to line 659 detail
- [ ] Header background is TEAL
- [ ] Icon is SHIP
- [ ] Badge stack visible on right side of header:
  - [ ] Subtype badge: "KATAMARAN"
  - [ ] Seasonal badge: "SEZONSKA/SEASONAL" with yellow background
- [ ] `headerMetaRow` shows duration correctly (e.g., "2h 15min")
- [ ] Date selector works
- [ ] Direction tabs work
- [ ] Departures list loads correctly

### Test: Line 602 Detail Page
- [ ] Navigate to line 602 detail
- [ ] Header background is TEAL
- [ ] Subtype badge: "TRAJEKT"
- [ ] NO seasonal badge visible
- [ ] Duration meta displays correctly

### Test: Line 9602 Detail Page
- [ ] Navigate to line 9602 detail
- [ ] Subtype badge: "KATAMARAN"
- [ ] NO seasonal badge visible

---

## Road Transport List (`RoadTransportScreen`)

### Test: Any Road Line
- [ ] Header background is GREEN
- [ ] Icon is BUS
- [ ] Subtype (if present) shows as Meta text in card body
- [ ] No badge stack visible
- [ ] Behavior unchanged from before transport consolidation

---

## Road Line Detail

### Test: Any Road Line Detail
- [ ] Header background is GREEN
- [ ] Icon is BUS
- [ ] `headerMetaRow` shows subtype as Meta text (not Badge)
- [ ] Duration displays correctly
- [ ] No badge stack visible

---

## Inbox Tabs (`InboxListScreen`)

### Test: Tab Behavior
- [ ] "PRIMLJENO" / "RECEIVED" tab works
- [ ] "POSLANO" / "SENT" tab works
- [ ] Tab labels are UPPERCASE
- [ ] Active tab styling correct
- [ ] Behavior unchanged

---

## Language Toggle

### Test: Switch HR <-> EN
- [ ] Badge label changes: "SEZONSKA" <-> "SEASONAL"
- [ ] Subtitle changes: "Samo sezonski / ljeto 2026" <-> "Seasonal only / Summer 2026"
- [ ] All other labels translate correctly

---

## DepartureItem Regression Check

### Test: Departure Rows
- [ ] Time block displays correctly (colored background)
- [ ] Route/direction label displays
- [ ] No visual regression in departure list items
- [ ] Tap navigates correctly

---

## Sign-off

| Tester | Date | Result | Notes |
|--------|------|--------|-------|
| | | | |
