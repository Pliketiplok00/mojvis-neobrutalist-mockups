# Transport UI Lock

## Status: ENFORCED

This document defines the **canonical locked state** for transport UI layouts.

---

## CANONICAL STABLE POINT

| Property | Value |
|----------|-------|
| Git tag | `UI_TRANSPORT_STABLE_2026-01-18` |
| Commit | `1207a92` |
| Branch | `fix/ui-transport-header-alignment` |
| Date | 2026-01-18 |

**This is a HARD REFERENCE POINT. Do not modify without updating tests and documentation.**

---

## 1. TRANSPORT LINE CARDS LAYOUT

### Canonical Layout

```
+------------------------------------------------------------------+
|  [ ICON ]  [ TITLE (flex: 1)              ]  [ TAG ]             |
|  (square)  (takes available space)           (right-aligned)     |
+------------------------------------------------------------------+
|                                                                  |
|  Stops: Vis - Split                                              |
|  2 stations • 2h 20min                                    [ > ]  |
|                                                                  |
+------------------------------------------------------------------+
```

### Rules (NON-NEGOTIABLE)

1. **Icon box MUST be square** (width === height using same token)
2. **Icon aligns vertically** with both title top and tag bottom
3. **Title has `flex: 1`** to take available space
4. **Tag is RIGHT-ALIGNED** at the edge of the header row
5. **Tag has `borderRadius: 0`** (sharp corners, neobrutalist)
6. **NO stacked or inline tag layouts**
7. **Title position MUST NOT move**

### JSX Structure (LOCKED)

```jsx
<View style={styles.lineCardHeader}>
  <View style={styles.lineCardHeaderIconBox}>
    <Icon ... />
  </View>
  <H2 style={styles.lineCardHeaderTitle}>{line.name}</H2>
  {line.subtype && (
    <View style={styles.lineSubtypeBadge}>
      <Meta style={styles.lineSubtypeText}>{line.subtype}</Meta>
    </View>
  )}
</View>
```

### Style Requirements (LOCKED)

```typescript
lineCardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  // ...
},
lineCardHeaderIconBox: {
  width: listTokens.lineCardHeaderIconBoxSize,
  height: listTokens.lineCardHeaderIconBoxSize, // MUST be square
  // ...
},
lineCardHeaderTitle: {
  flex: 1, // MUST take available space
  // ...
},
lineSubtypeBadge: {
  borderRadius: 0, // MUST be sharp corners
  marginLeft: spacing.sm,
  // ...
},
```

---

## 2. TODAY DEPARTURES LAYOUT

### Canonical Layout

```
+------------------------------------------------------------------+
|  +--------+                                                      |
|  | 08:00  |  Vis - Split                         [ TRAJEKT ]     |
|  +--------+  Vis → Split                                         |
+------------------------------------------------------------------+
|  +--------+                                                      |
|  | 09:30  |  Komiža - Biševo                     [ BROD ]        |
|  +--------+  Komiža → Biševo                                     |
+------------------------------------------------------------------+
```

### Rules (NON-NEGOTIABLE)

1. **Time block is FIXED LEFT** (unchanged from original)
2. **Info container has `flex: 1`** (title + direction)
3. **Tag is OUTSIDE info container** (sibling, not nested)
4. **Tag is RIGHT-ALIGNED** at the edge of the row
5. **Tag has `borderRadius: 0`** (sharp corners)
6. **NO inline or wrapped tag layouts**
7. **Sea and Road screens MUST behave identically**

### JSX Structure (LOCKED)

```jsx
<Pressable style={styles.todayRow}>
  {/* Time block - fixed left */}
  <View style={styles.todayTimeBlock}>
    <H2 style={styles.todayTime}>{formatTime(dep.departure_time)}</H2>
  </View>
  {/* Info: title + direction (flex: 1) */}
  <View style={styles.todayInfo}>
    <Label style={styles.todayLineName}>{dep.line_name}</Label>
    <Meta style={styles.todayDirection}>{dep.direction_label}</Meta>
  </View>
  {/* Badge: right-aligned */}
  {dep.subtype && (
    <View style={styles.todaySubtypeBadge}>
      <Meta style={styles.todaySubtypeText}>{dep.subtype}</Meta>
    </View>
  )}
</Pressable>
```

### Style Requirements (LOCKED)

```typescript
todayInfo: {
  flex: 1, // MUST take available space
  // ...
},
todaySubtypeBadge: {
  alignSelf: 'center',
  borderRadius: 0, // MUST be sharp corners
  marginRight: spacing.md,
  // ...
},
```

---

## 3. BACKEND DATA CONTRACTS

### Subtype Fields (MANDATORY)

Every transport line MUST have:
- `subtype_hr` (Croatian: Trajekt, Katamaran, Brod, Autobus)
- `subtype_en` (English: Ferry, Catamaran, Boat, Bus)

Every today departure MUST include:
- `subtype` (localized based on Accept-Language header)

### Origin Filter (LOCKED)

"Polasci danas" (Today's departures) MUST only include **island-origin** departures:

| Allowed Origins | Transport Type |
|-----------------|----------------|
| `Vis` | Sea |
| `Komiža` | Sea |

**NEVER include Split-origin sea departures in today's departures list.**

---

## 4. ALLOWED SUBTYPE VALUES

| HR Value | EN Value | Transport Type |
|----------|----------|----------------|
| Trajekt | Ferry | sea |
| Katamaran | Catamaran | sea |
| Brod | Boat | sea |
| Autobus | Bus | road |

---

## 5. FILES PROTECTED BY THIS LOCK

### Mobile UI
- `mobile/src/screens/transport/SeaTransportScreen.tsx`
- `mobile/src/screens/transport/RoadTransportScreen.tsx`

### Backend
- `backend/src/repositories/transport.ts`
- `backend/src/routes/transport.ts`

### Tests
- `backend/src/__tests__/transport-subtype-contract.test.ts`
- `backend/src/__tests__/transport-ui-lock.test.ts`

---

## 6. CI ENFORCEMENT

The following tests MUST pass before any transport changes:

### Code Invariant Tests
- `getTodaysDepartures query MUST include l.subtype_hr`
- `transport routes MUST map subtype to response`
- `Line card header MUST have [ICON][TITLE][TAG] layout`
- `Today row MUST have [TIME][INFO][TAG] layout`
- `Badge MUST have borderRadius: 0`
- `Origin filter MUST include Vis and Komiža`

### Lock Comment Tests
- `SeaTransportScreen MUST have TRANSPORT_UI_LOCK comment`
- `RoadTransportScreen MUST have TRANSPORT_UI_LOCK comment`
- `transport.ts repository MUST have TRANSPORT_UI_LOCK comment`

---

## 7. HOW TO MAKE CHANGES

### DO NOT:
- Refactor transport screens "for cleanliness"
- Move badges to different positions
- Change layout semantics
- Remove subtype from queries
- Touch this code without updating tests

### IF YOU MUST CHANGE:
1. Update `docs/TRANSPORT_UI_LOCK.md` first
2. Update tests in `transport-ui-lock.test.ts`
3. Update tests in `transport-subtype-contract.test.ts`
4. Run ALL tests before committing
5. Create a new git tag for the new stable point

---

## 8. REVERT INSTRUCTIONS

If transport UI regresses, revert to the stable point:

```bash
# Checkout the stable tag
git checkout UI_TRANSPORT_STABLE_2026-01-18

# Or reset to the stable commit
git reset --hard 1207a92

# Or cherry-pick the fix onto current branch
git cherry-pick 1207a92
```

---

## 9. WARNING

```
+------------------------------------------------------------------+
|                                                                  |
|   DO NOT CHANGE WITHOUT BREAKING CONTRACT                        |
|                                                                  |
|   This layout has regressed 4+ times. Each time it required      |
|   emergency fixes. The current state is the result of careful    |
|   debugging and user feedback.                                   |
|                                                                  |
|   IF TESTS FAIL AFTER YOUR CHANGE:                               |
|   1. Your change broke the contract                              |
|   2. Revert your change                                          |
|   3. Read this document again                                    |
|   4. Update tests FIRST if layout change is intentional          |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 10. CHANGELOG

| Date | Change | Commit |
|------|--------|--------|
| 2026-01-18 | Initial lock: line cards + today departures | `1207a92` |
