# Phase 3: Header Drift Forensics

**Audit Date:** 2026-02-12
**Scope:** All header implementations across screens

---

## HEADER TYPE INVENTORY

| Type | Count | Files |
|------|-------|-------|
| GlobalHeader (navigation) | 1 | components/GlobalHeader.tsx |
| Transport Overview Header | 4 | Sea/RoadTransportScreen.tsx, Mirror variants |
| LineDetail Header | 2 | LineDetailScreen.tsx, MirrorLineDetailScreen.tsx |
| Event Detail Title Header | 2 | EventDetailScreen.tsx, MirrorEventDetailScreen.tsx |
| Service Page Header | 1 | components/services/ServicePageHeader.tsx |
| Onboarding Role Card Header | 1 | OnboardingRoleCard.tsx |
| HeroMediaHeader | 1 | ui/HeroMediaHeader.tsx |

---

## 1. GLOBALHEADER (Navigation Bar)

### File: `components/GlobalHeader.tsx`

### Properties

| Property | Value | Token |
|----------|-------|-------|
| height | 64px | `components.header.height` |
| paddingHorizontal | 16px | `components.header.paddingHorizontal` |
| backgroundColor | cream | `components.header.backgroundColor` |
| borderBottomWidth | 4px | `components.header.borderBottomWidth` |
| borderBottomColor | foreground | `components.header.borderBottomColor` |

### Icon Box - Menu (Left)

| Property | Value | Token |
|----------|-------|-------|
| width | 44px | **HARDCODED** |
| height | 44px | **HARDCODED** |
| backgroundColor | yellow | `colors.warningAccent` |
| borderWidth | 3px | `borders.widthCard` |

### Icon Box - Inbox (Right)

| Property | Value | Token |
|----------|-------|-------|
| width | 44px | **HARDCODED** |
| height | 44px | **HARDCODED** |
| backgroundColor | blue | `colors.primary` |
| borderWidth | 3px | `borders.widthCard` |

### Inbox Badge

| Property | Value | Token |
|----------|-------|-------|
| offsetTop | -6px | `inboxBadge.offsetTop` |
| offsetRight | -6px | `inboxBadge.offsetRight` |
| minSize | 20px | `inboxBadge.minSize` |
| backgroundColor | terracotta | `inboxBadge.backgroundColor` |
| fontSize | 10px | `inboxBadge.fontSize` |

### DRIFT NOTES:
- Icon box size 44x44 is HARDCODED (not tokenized)
- All other properties use tokens

---

## 2. TRANSPORT OVERVIEW HEADER (Sea/Road List Screens)

### Files: `SeaTransportScreen.tsx`, `RoadTransportScreen.tsx`

### Properties

| Property | Value | Token |
|----------|-------|-------|
| padding | 16px | `overviewHeader.padding` |
| borderBottomWidth | 4px | `overviewHeader.borderBottomWidth` |
| borderBottomColor | foreground | `overviewHeader.borderBottomColor` |
| backgroundSea | blue | `overviewHeader.backgroundSea` |
| backgroundRoad | green | `overviewHeader.backgroundRoad` |

### Icon Box

| Property | Value | Token |
|----------|-------|-------|
| size | 48px | `overviewHeader.iconBoxSize` |
| backgroundColor | white | `overviewHeader.iconBoxBackground` |
| borderWidth | 2px | `overviewHeader.iconBoxBorderWidth` |
| marginRight | 12px | `overviewHeader.iconBoxGap` |

### Title/Subtitle

| Property | Value | Token |
|----------|-------|-------|
| titleColor | white | `overviewHeader.titleColor` |
| subtitleColor | rgba(255,255,255,0.85) | `overviewHeader.subtitleColor` |

### DRIFT vs GlobalHeader:
- Icon box: 48px (vs 44px in GlobalHeader)
- Border width: 2px (vs 3px in GlobalHeader)
- Background: semantic color (vs yellow/blue in GlobalHeader)

---

## 3. LINEDETAIL HEADER (Detail Screen)

### File: `LineDetailScreen.tsx`

### Properties

| Property | Value | Token |
|----------|-------|-------|
| padding | 16px | `lineDetail.headerPadding` |
| borderWidth | 3px | `lineDetail.headerBorderWidth` |
| borderColor | foreground | `lineDetail.headerBorderColor` |
| backgroundSea | blue | `lineDetail.headerBackgroundSea` |
| backgroundRoad | green | `lineDetail.headerBackgroundRoad` |

### Icon Box

| Property | Value | Token |
|----------|-------|-------|
| size | 52px | `lineDetail.headerIconBoxSize` |
| backgroundColor | white | `lineDetail.headerIconBoxBackground` |
| borderWidth | 2px | `lineDetail.headerIconBoxBorderWidth` |

### Title/Meta

| Property | Value | Token |
|----------|-------|-------|
| titleColor | white | `lineDetail.headerTitleColor` |
| metaColor | rgba(255,255,255,0.85) | `lineDetail.headerMetaColor` |

### Badge Stack (Sea only)

- Position: right-aligned in header
- Gap: 4px between badges
- Badge size: large

### DRIFT vs Transport Overview:
- Icon box: 52px (vs 48px)
- Header border: 3px (vs 4px bottom only)
- Has badge stack, overview doesn't

---

## 4. EVENT DETAIL TITLE HEADER

### File: `EventDetailScreen.tsx`

### Properties

| Property | Value | Token |
|----------|-------|-------|
| padding | 20px | `events.detail.titlePadding` |
| borderWidth | 3px | `events.detail.titleBorderWidth` |
| backgroundColor | yellow | `events.detail.titleBackground` (palette.accent) |

### DRIFT vs Transport Headers:
- Background always yellow (not semantic)
- No icon box
- Different padding (20px vs 16px)

---

## 5. SERVICE PAGE HEADER

### File: `components/services/ServicePageHeader.tsx`

### Properties

| Property | Value | Token |
|----------|-------|-------|
| paddingVertical | 16px | `spacing.lg` |
| paddingHorizontal | 16px | `spacing.lg` |
| borderBottomWidth | 4px | `borders.widthHeavy` |
| backgroundColor | prop | Via `backgroundColor` prop |

### DRIFT:
- Uses generic spacing tokens
- No icon box
- Background via prop (not semantic token)

---

## 6. ONBOARDING ROLE CARD HEADER

### File: `OnboardingRoleCard.tsx`

### Properties

| Property | Value | Token |
|----------|-------|-------|
| paddingVertical | 16px | `roleCard.header.paddingVertical` |
| paddingHorizontal | 16px | `roleCard.header.paddingHorizontal` |
| backgroundColor | blue/green | `roleCard.visitor/local.headerBackground` |

### Icon Box

| Property | Value | Token |
|----------|-------|-------|
| size | 48px | `roleCard.iconBox.size` |
| backgroundColor | white | `roleCard.iconBox.background` |
| borderWidth | 2px | `roleCard.iconBox.borderWidth` |

### DRIFT vs Transport Headers:
- Same icon box size (48px)
- Same border width (2px)
- Different semantic background colors

---

## COMPARISON MATRIX

| Header Type | Height | Padding | Icon Size | Icon Border | Header Border |
|-------------|--------|---------|-----------|-------------|---------------|
| GlobalHeader | 64px | 16px | 44px | 3px | 4px bottom |
| Transport Overview | auto | 16px | 48px | 2px | 4px bottom |
| LineDetail | auto | 16px | 52px | 2px | 3px all sides |
| Event Title | auto | 20px | none | - | 3px all sides |
| Service Page | auto | 16px | none | - | 4px bottom |
| Onboarding Card | auto | 16px | 48px | 2px | included in card |

---

## ICON BOX SIZE DRIFT

| Size | Used In |
|------|---------|
| 40px | Line Card Header (list) |
| 44px | GlobalHeader, DepartureItem, Events, Banner |
| 48px | Transport Overview, Onboarding |
| 52px | LineDetail |

**4 distinct icon box sizes without clear semantic reasoning**

---

## BORDER WIDTH DRIFT

| Width | Used In |
|-------|---------|
| 2px | Icon boxes (non-nav), section dividers |
| 3px | Cards, Line/Event detail headers |
| 4px | Navigation header, transport overview |

---

## PADDING DRIFT

| Value | Used In |
|-------|---------|
| 16px | GlobalHeader, Transport, LineDetail, Service, Onboarding |
| 20px | Event Title only |

**Event Title is the only outlier at 20px padding**

---

## TOKENIZATION STATUS

| Header | Fully Tokenized | Hardcoded Values |
|--------|-----------------|------------------|
| GlobalHeader | 95% | iconBoxSize (44x44) |
| Transport Overview | 100% | none |
| LineDetail | 100% | none |
| Event Title | 100% | none |
| Service Page | 90% | background via prop |
| Onboarding Card | 100% | none |

---

## RECOMMENDATIONS (READ-ONLY OBSERVATION)

1. **Icon Box Sizes**: 4 different sizes should be consolidated to 2-3 semantic sizes
2. **GlobalHeader 44px**: Should be tokenized as `components.header.iconBoxSize`
3. **Event Title Padding**: 20px is outlier - should align with 16px or have explicit token
4. **Border Width**: 2px/3px/4px all used - consider semantic naming (thin/medium/thick)

---

## END OF PHASE 3 REPORT
