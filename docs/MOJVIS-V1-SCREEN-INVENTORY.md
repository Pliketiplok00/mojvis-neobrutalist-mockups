# MOJ VIS – V1 COMPLETE SCREEN INVENTORY

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Scope:** All V1 screens (excludes V2 pages in `src/pages-v2/`)

This document provides a **complete inventory of every screen** in the MOJ VIS V1 application, listing **all visual blocks/items** contained within each screen.

---

## TABLE OF CONTENTS

1. [Onboarding Screens](#1-onboarding-screens)
   - [Splash Page](#11-onboardingsplashpage)
   - [Mode Selection Page](#12-onboardingmodepage)
   - [Municipality Selection Page](#13-onboardingmunicipalitypage)
2. [Main Screens](#2-main-screens)
   - [Home Page](#21-homepage)
   - [Inbox List Page](#22-inboxpage)
   - [Inbox Detail Page](#23-inboxdetailpage)
   - [Events Calendar Page](#24-eventscalendarpage)
   - [Event Detail Page](#25-eventdetailpage)
3. [Transport Screens](#3-transport-screens)
   - [Transport Hub Page](#31-transportpage)
   - [Sea Transport Page](#32-transportseapage)
   - [Road Transport Page](#33-transportroadpage)
4. [Form Screens](#4-form-screens)
   - [Feedback Page](#41-feedbackpage)
   - [Click-Fix Page](#42-clickfixpage)
5. [Content Pages](#5-content-pages)
   - [Flora Page](#51-florapage)
   - [Fauna Page](#52-faunapage)
   - [Info Page](#53-infopage)
6. [Settings](#6-settings)
   - [Settings Page](#61-settingspage)
7. [Global Components](#7-global-components)
   - [App Header](#71-appheader)
   - [Main Menu](#72-mainmenu)
   - [Mobile Frame](#73-mobileframe)

---

## 1. ONBOARDING SCREENS

### 1.1 OnboardingSplashPage

**Route:** `/onboarding`  
**File:** `src/pages/OnboardingSplashPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **Background Pattern** | Diagonal stripes pattern (45deg), 5% opacity |
| 2 | **Logo Mark** | Layered boxes composition: |
|   | – Main Logo Box | 128×128px, `bg-primary`, heavy border, large shadow |
|   | – MapPin Icon | 64px, strokeWidth 2.5, `text-primary-foreground` |
|   | – Accent Box (bottom-right) | 48×48px, `bg-accent`, heavy border |
|   | – Secondary Box (top-left) | 32×32px, `bg-secondary`, heavy border |
| 3 | **App Title** | "MOJVIS", `font-display text-5xl font-bold`, centered |
| 4 | **Service Label** | "GRAĐANSKI SERVIS", `font-body text-lg text-muted-foreground` |
| 5 | **Tagline Box** | Inverted colors: `bg-foreground`, heavy border |
|   | – Tagline Text | "TVOJ GRAD. TVOJ GLAS.", `font-display font-bold text-background` |
| 6 | **Language Selection Section** | `bg-card` with top border |
|   | – Instruction Text | "Odaberi jezik / Select language", muted, uppercase |
|   | – Language Button Grid | 2-column grid |
|   | – Croatian Button | `bg-primary`, heavy border, shadow, "HRVATSKI" |
|   | – English Button | `bg-secondary`, heavy border, shadow, "ENGLISH" |
|   | – Helper Text | "Jezik možeš promijeniti kasnije u Postavkama" |

---

### 1.2 OnboardingModePage

**Route:** `/onboarding/mode`  
**File:** `src/pages/OnboardingModePage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **Header Section** | Bottom border |
|   | – Back Button | ArrowLeft icon + "NATRAG" |
|   | – Page Title | "KAKO KORISTIŠ APP?", `text-3xl font-bold` |
|   | – Subtitle | Helper text, `text-muted-foreground` |
| 2 | **Mode Selection Cards** | 2 stacked cards |
|   | **Visitor Mode Card** | |
|   | – Card Header | `bg-primary`, heavy border, shadow, hover effect |
|   | – Icon Box | 56×56px, `bg-white/20`, User icon |
|   | – Title | "POSJETITELJ", white text |
|   | – Description | Mode description, white/80 text |
|   | – Selection Indicator | Check icon in white box (when selected) |
|   | – Features List | Bullet list with color dots |
|   | **Local Resident Card** | |
|   | – Card Header | `bg-secondary` |
|   | – Icon Box | MapPin icon |
|   | – Title | "LOKALNI STANOVNIK" |
|   | – Features List | Enhanced feature set |
| 3 | **Progress Indicator** | |
|   | – Progress Bars | 2 filled bars (step 2 of 2) |
|   | – Step Label | "KORAK 2 OD 2" |
| 4 | **CTA Section** | `bg-card` with top border |
|   | – Action Button | Full-width, `bg-foreground text-background`, "ZAVRŠI" or "NASTAVI" |

---

### 1.3 OnboardingMunicipalityPage

**Route:** `/onboarding/municipality`  
**File:** `src/pages/OnboardingMunicipalityPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **Header Section** | |
|   | – Back Button | ArrowLeft + "NATRAG" |
|   | – Page Title | "ODABERI OPĆINU" |
|   | – Subtitle | Selection instructions |
| 2 | **Municipality Cards** | 2 stacked cards |
|   | **Each Municipality Card** | |
|   | – Card Container | Heavy border, shadow, hover effect, ring when selected |
|   | – Icon Box | 64×64px, Building2 icon |
|   | – Municipality Name | `text-2xl font-bold` |
|   | – Description | "Općina Komiža" or "Grad Vis" |
|   | – Selection Indicator | Check icon in white box |
| 3 | **Helper Text** | Centered, single municipality note |
| 4 | **Progress Indicator** | |
|   | – Progress Bars | 3 filled bars (step 3 of 3) |
|   | – Step Label | "KORAK 3 OD 3" |
| 5 | **CTA Section** | |
|   | – Action Button | "ZAVRŠI POSTAVLJANJE" with ArrowRight |

---

## 2. MAIN SCREENS

### 2.1 HomePage

**Route:** `/home`  
**File:** `src/pages/HomePage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Global header component (see Section 7.1) |
| 2 | **MainMenu** | Slide-out menu (see Section 7.2) |
| 3 | **Alert Notification Banner** | Clickable banner, navigates to inbox |
|   | – Alert Icon Box | 40×40px, `bg-destructive`, AlertCircle icon |
|   | – Alert Title | "Road Works Notice", uppercase, bold |
|   | – Alert Subtitle | Preview text |
|   | – New Badge | `variant="destructive"`, "New" |
| 4 | **Greeting Block** | `bg-primary`, 4px bottom border |
|   | – Welcome Title | "Welcome to Vis!", `text-3xl`, primary-foreground |
|   | – Welcome Subtitle | Description text |
| 5 | **Category Grid Section** | `bg-background`, bottom border |
|   | – Section Label | "Quick Access", muted, uppercase, tracking-widest |
|   | – Category Grid | 2×2 grid |
|   | **Each Category Button** | |
|   | – Shadow Layer | `translate-x-1.5 translate-y-1.5 bg-foreground` |
|   | – Button | Colored background, icon + label |
|   | – Categories: | Events (primary), Bus (secondary), Ferry (destructive), Info (accent) |
| 6 | **Upcoming Events Section** | `bg-background`, bottom border |
|   | – Section Header | "Upcoming Events" + "View all" button |
|   | **Event List Items (3)** | |
|   | – Shadow Layer | Primary for first, foreground/20 for others |
|   | – Date Box | 48×48px, day + month, `bg-primary` |
|   | – Event Title | Uppercase, bold, truncated |
|   | – Location | Muted text |
|   | – Time | Right-aligned |
| 7 | **Feedback CTA Block** | `bg-muted/30` padding |
|   | – Shadow Layer | `translate-x-2 translate-y-2 bg-foreground` |
|   | – CTA Button | `bg-secondary`, icon box + text + arrow |
|   | – Icon Box | MessageSquare, `bg-background` |
|   | – Title | "Share Your Thoughts" |
|   | – Subtitle | "Ideas, suggestions & feedback" |

---

### 2.2 InboxPage

**Route:** `/inbox`  
**File:** `src/pages/InboxPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Title: "Inbox" (translated) |
| 2 | **MainMenu** | Global menu |
| 3 | **Tab Bar** | 4px bottom border |
|   | – Received Tab | Bell icon + label, `bg-primary` when active |
|   | – Sent Tab | Send icon + label |
|   | – Tab Divider | 3px right border on first tab |
| 4 | **Message List** | (or EmptyState) |
|   | **Each Message Item (Received)** | |
|   | – Item Container | 3px bottom border, `bg-accent/20` if unread |
|   | – Type Icon Box | 48×48px, 3px border, colored by type |
|   | – Message Title | Uppercase, bold if unread |
|   | – New Badge | `variant="destructive"` if unread |
|   | – Preview Text | Truncated, muted |
|   | – Timestamp | Date + time, `text-[10px]` |
|   | – Arrow | ArrowRight, muted |
|   | **Each Message Item (Sent)** | |
|   | – Status Badge | variant by status (received/review/accepted) |
| 5 | **Empty State** | (if no messages) |
|   | – Icon Box | Tilted, `bg-primary` |
|   | – Title | "No messages" |
|   | – Description | Helper text |

#### Message Type Colors:
- `notice` → `bg-accent`
- `reminder` → `bg-primary`
- `reply` → `bg-secondary`
- `feedback` → `bg-lavender`
- `click_fix` → `bg-orange`

---

### 2.3 InboxDetailPage

**Route:** `/inbox/:id`  
**File:** `src/pages/InboxDetailPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Title: "MOJ VIS" |
| 2 | **MainMenu** | Global menu |
| 3 | **Message Header** | 2px bottom border |
|   | – Emergency Indicator | `bg-destructive/10` if emergency |
|   | – Emergency Icon Box | 40×40px, `bg-destructive`, AlertCircle |
|   | – Message Title | `text-xl font-bold` |
|   | – Meta Row | Date + time + status badge (if sent) |
| 4 | **Location Bar** | (if location present) |
|   | – Location Icon | MapPin, muted |
|   | – Location Text | Address/place name |
| 5 | **Content Block** | Padding, whitespace-pre-line |
|   | – Message Body | `font-body text-base leading-relaxed` |
| 6 | **Active Period Box** | (for notices, if active dates) |
|   | – Calendar Icon | Calendar, muted |
|   | – Section Label | "Notice Active Period" |
|   | – Date Range | From + To dates |
| 7 | **Attached Photos** | (for sent messages) |
|   | – Section Title | "Attached Photos" |
|   | – Photo Grid | Placeholder boxes |
| 8 | **Admin Reply Box** | (if reply exists) |
|   | – Section Background | `bg-secondary/30` |
|   | – Icon + Title | MessageSquare + "Admin Reply" |
|   | – Reply Content | Body text |
|   | – Reply Timestamp | Date + time |

---

### 2.4 EventsCalendarPage

**Route:** `/events`  
**File:** `src/pages/EventsCalendarPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default title |
| 2 | **MainMenu** | Global menu |
| 3 | **Page Header** | `bg-primary`, 4px bottom border |
|   | – Title | "Events", uppercase |
|   | – Subtitle | "Discover what is happening" |
| 4 | **Calendar Section** | 4px bottom border |
|   | **Month Navigation** | |
|   | – Previous Button | 44×44px, 3px border, ChevronLeft |
|   | – Month/Year Label | `text-lg font-bold uppercase` |
|   | – Next Button | ChevronRight |
|   | **Week Days Header** | 7-column grid |
|   | – Day Labels | M T W T F S S, muted |
|   | **Calendar Grid** | 7-column grid |
|   | **Each Day Cell** | aspect-square |
|   | – Selected State | `bg-primary`, shadow |
|   | – Today State | `bg-accent` |
|   | – Has Events State | `bg-secondary/50` |
|   | – Default State | Transparent border |
|   | – Event Indicator | 1.5×1.5px dot, `bg-primary` |
| 5 | **Selected Day Events** | |
|   | – Day Label | Day + Month name |
|   | **Empty Day State** | 3px dashed border |
|   | – Empty Text | "No events for this day" |
|   | **Event Cards** | (if events exist) |
|   | – Card Container | 3px border, hover effect |
|   | – Event Title | Uppercase, bold |
|   | – Time Row | Clock icon + time range |
|   | – Location Row | MapPin icon + place |
|   | – Arrow | ArrowRight |

---

### 2.5 EventDetailPage

**Route:** `/events/:id`  
**File:** `src/pages/EventDetailPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default title |
| 2 | **MainMenu** | Global menu |
| 3 | **Hero Image/Pattern** | aspect-[16/10], `bg-primary` |
|   | – Pattern Background | 45deg stripes |
|   | – Watermark Text | "VIS", 7xl, 20% opacity |
|   | – Featured Badge | Bottom-left, `variant="accent"` |
| 4 | **Event Title Block** | `bg-accent`, 4px bottom border |
|   | – Event Title | `text-2xl font-bold uppercase` |
| 5 | **Info Grid** | 2-column, 4px bottom border |
|   | **Date Cell** | |
|   | – Icon Box | 44×44px, `bg-primary`, Calendar |
|   | – Date Value | Bold |
|   | – Label | "Date", muted |
|   | **Time Cell** | |
|   | – Icon Box | `bg-secondary`, Clock |
|   | – Time Value | Start time |
|   | **Location Cell** | Full-width (col-span-2) |
|   | – Icon Box | `bg-teal`, MapPin |
|   | – Location Name | Bold |
|   | – Address | Muted |
| 6 | **Organizer & Capacity Row** | 4px bottom border |
|   | **Organizer Cell** | |
|   | – Icon Box | 40×40px, `bg-lavender`, User |
|   | – Organizer Name | Uppercase, bold |
|   | **Capacity Cell** | |
|   | – Icon Box | `bg-orange`, Users |
|   | – Capacity Number | |
| 7 | **Description Section** | Padding |
|   | – Section Label | "About", muted |
|   | – Description Text | Whitespace-pre-line |
| 8 | **Fixed Bottom Actions** | Fixed, 4px top border |
|   | – Reminder Button | `variant="outline"` or `variant="secondary"` if set |
|   | – Share Button | `variant="accent"` |

---

## 3. TRANSPORT SCREENS

### 3.1 TransportPage

**Route:** `/transport`  
**File:** `src/pages/TransportPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Title: "MOJ VIS" |
| 2 | **MainMenu** | Global menu |
| 3 | **Active Notice Banner** | (if notice exists) |
|   | – Alert Icon Box | `bg-white/20`, AlertTriangle |
|   | – Notice Title | White, bold |
|   | – Notice Description | White/80 |
|   | – Arrow | ChevronRight |
| 4 | **Section Title** | "Odaberi vrstu prijevoza" |
| 5 | **Transport Type Cards** | 2 stacked cards |
|   | **Sea Transport Card** | `bg-primary` |
|   | – Icon Area | 96×96px, Ship icon (48px) |
|   | – Label | "POMORSKI PRIJEVOZ" |
|   | – Sublabel | "Trajekti i katamarani" |
|   | – Arrow | ChevronRight |
|   | **Road Transport Card** | `bg-secondary` |
|   | – Icon Area | Bus icon |
|   | – Label | "CESTOVNI PRIJEVOZ" |
|   | – Sublabel | "Autobusne linije" |
| 6 | **Info Card** | Flat variant, heavy border |
|   | – Info Text | Schedule update note |

---

### 3.2 TransportSeaPage

**Route:** `/transport/sea`  
**File:** `src/pages/TransportSeaPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **Active Notice Banner** | Red shadow layer |
|   | – Icon Box | `bg-destructive`, rotate-3, AlertTriangle |
|   | – Notice Title/Description | |
| 4 | **Section Header** | `bg-primary`, 4px bottom border |
|   | – Icon Box | 56×56px, `bg-background`, -rotate-3, Ship |
|   | – Title | "Pomorske linije" |
|   | – Subtitle | "Trajekti i katamarani" |
| 5 | **Lines Section** | `bg-background`, bottom border |
|   | – Section Label | "Linije", bordered |
|   | **Line Cards (3)** | |
|   | – Shadow Layer | `translate-x-2 translate-y-2 bg-foreground` |
|   | – Title Bar | `bg-primary` (ferry) or `bg-teal` (catamaran) |
|   | – Icon | Ship or Anchor |
|   | – Line Name | White, uppercase |
|   | – Arrow Box | Semi-transparent white |
|   | – Details Row | Duration + stops count |
|   | – Route | Stops joined by " → " |
| 6 | **Today's Departures Section** | Bottom border |
|   | – Section Header | Label + date badge |
|   | – Date Badge | `bg-primary`, 3px border |
|   | – Departures Container | Shadow + scrollable list |
|   | **Each Departure Item** | |
|   | – Time Box | 64×40px, colored by type |
|   | – Line Name | Bold |
|   | – Direction | Muted |
|   | – Type Badge | "Trajekt" or "Katamaran" |
| 7 | **Contacts Section** | `bg-muted/30` |
|   | – Section Label | "Kontakti" |
|   | **Contact Cards (2)** | |
|   | – Shadow Layer | `bg-primary` |
|   | – Icon Box | 56×56px, `bg-accent`, rotate-3, Phone |
|   | – Contact Name | Uppercase, bold |
|   | – Phone Number | Muted |

---

### 3.3 TransportRoadPage

**Route:** `/transport/road`  
**File:** `src/pages/TransportRoadPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **Active Notice Banner** | Same as Sea Transport |
| 4 | **Section Header** | `bg-secondary`, 4px bottom border |
|   | – Icon Box | `bg-background`, -rotate-3, Bus |
|   | – Title | "Autobusne linije" |
|   | – Subtitle | "Otočni prijevoz" |
| 5 | **Lines Section** | |
|   | – Section Label | "Linije" |
|   | **Line Cards (3)** | |
|   | – Title Bar | Alternating `bg-primary`/`bg-secondary` |
|   | – Bus Icon | |
|   | – Line Name | |
|   | – Details Row | Duration + stops count |
|   | – Route | Stops with truncation |
| 6 | **Today's Departures Section** | |
|   | – Date Badge | Current date |
|   | **Departure Items** | |
|   | – Time Box | `bg-primary` |
|   | – Line + Direction | |
| 7 | **Contacts Section** | |
|   | – Shadow Layer | `bg-secondary` |
|   | – Contact Cards | Same pattern as Sea |

---

## 4. FORM SCREENS

### 4.1 FeedbackPage

**Route:** `/feedback`  
**File:** `src/pages/FeedbackPage.tsx`

#### Visual Blocks – Form State:

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **Section Header** | `bg-lavender`, 4px bottom border |
|   | – Icon Box | 56×56px, `bg-background`, -rotate-3, MessageSquare |
|   | – Title | "Povratne informacije" |
|   | – Subtitle | "Ideje • Prijedlozi • Pohvale" |
| 4 | **Form Section 1: Type** | |
|   | – Section Label | "1. Vrsta poruke *", bordered |
|   | **Type Selector Grid** | 2×2 grid |
|   | **Each Type Button** | |
|   | – Shadow Layer | Dynamic color |
|   | – Button | 4px border, icon + label |
|   | – Types: | Idea (accent), Suggestion (primary), Criticism (destructive), Praise (secondary) |
|   | – Selected State | Colored background, white text |
| 5 | **Form Section 2: Subject** | |
|   | – Section Label | "2. Naslov *" |
|   | – Input | 4px border, placeholder |
| 6 | **Form Section 3: Message** | |
|   | – Section Label | "3. Poruka *" |
|   | – Textarea | 4px border, min-height 150px |
| 7 | **Submit CTA** | |
|   | – Shadow Layer | `bg-foreground` |
|   | – Submit Button | `bg-primary`, Send icon + "POŠALJI PORUKU" |
| 8 | **Rate Limit Warning** | |
|   | – Remaining Count | X/Y format |
|   | – Exhausted State | Red warning box |

#### Visual Blocks – Confirmation State:

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **Success Icon Box** | 96×96px, `bg-secondary`, Check icon (48px) |
| 2 | **Success Title** | `text-3xl`, uppercase |
| 3 | **Success Description** | Muted text |
| 4 | **Return Home Button** | `bg-primary`, Home icon + label |

---

### 4.2 ClickFixPage

**Route:** `/click-fix`  
**File:** `src/pages/ClickFixPage.tsx`

#### Visual Blocks – Form State:

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **Section Header** | `bg-orange`, 4px bottom border |
|   | – Icon Box | `bg-background`, -rotate-3, MapPin |
|   | – Title | "Klikni & Popravi" |
|   | – Subtitle | "Prijavi problem na otoku" |
| 4 | **Form Section 1: Location** | |
|   | – Section Label | "1. Lokacija *" |
|   | **Location Not Set State** | |
|   | – Shadow Layer | `bg-foreground` |
|   | – Select Button | `bg-muted`, MapPin + "ODABERI LOKACIJU NA KARTI" |
|   | **Location Set State** | |
|   | – Shadow Layer | `bg-primary` |
|   | – Location Container | 4px border |
|   | – Icon Box | 56×56px, `bg-primary`, rotate-3, MapPin |
|   | – Location Label | Place name |
|   | – Coordinates | lat, lng |
|   | – Clear Button | 40×40px, X icon, hover:destructive |
| 5 | **Form Section 2: Photos** | |
|   | – Section Label | "2. Fotografije (opcionalno, max 3)" |
|   | **Photo Grid** | 3-column grid |
|   | **Photo Placeholder** | |
|   | – Container | aspect-square, 4px border, `bg-muted` |
|   | – Camera Icon | Centered |
|   | – Delete Button | Absolute, `bg-destructive`, 3px border, X icon |
|   | **Add Photo Button** | |
|   | – Container | 4px border, hover effect |
|   | – Camera Icon | Centered |
|   | – Label | "DODAJ" |
| 6 | **Form Section 3: Description** | |
|   | – Section Label | "3. Opis problema *" |
|   | – Textarea | 4px border, min-height 120px |
|   | – Character Counter | X/15 znakova, green when valid |
| 7 | **No Photo Warning Dialog** | (conditional) |
|   | – Shadow Layer | `bg-foreground` |
|   | – Dialog Container | `bg-accent`, 4px border |
|   | – Warning Title | "Nema fotografija" |
|   | – Warning Text | Explanation |
|   | – Button Row | "DODAJ FOTO" + "POŠALJI SVEJEDNO" |
| 8 | **Submit CTA** | |
|   | – Shadow Layer | `bg-foreground` |
|   | – Submit Button | `bg-primary`, Send icon + label |
| 9 | **Rate Limit Warning** | Same as Feedback |

#### Visual Blocks – Confirmation State:

Same pattern as Feedback confirmation.

---

## 5. CONTENT PAGES

### 5.1 FloraPage

**Route:** `/flora`  
**File:** `src/pages/FloraPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **ContentHeader** | |
|   | – Icon | Leaf |
|   | – Title | "Flora of Vis" |
|   | – Subtitle | Description |
| 4 | **MediaBlock** | Image carousel/grid |
|   | – Images | flora-herbs.jpg, flora-olives.jpg |
|   | – Caption | Text below images |
| 5 | **TextBlock** | |
|   | – Title | "Mediterranean Biodiversity" |
|   | – Body Paragraphs | Multiple paragraphs |
| 6 | **HighlightBlock (Warning)** | |
|   | – Title | "Protected Species" |
|   | – Body | Conservation message |
| 7 | **CardListBlock** | 2-column grid |
|   | – Title | "Plant Categories" |
|   | **Category Cards (4)** | |
|   | – Card Title | Category name |
|   | – Description | Summary |
|   | – Meta | Location/season |
| 8 | **HighlightBlock (Tip)** | |
|   | – Title | "Best Viewing Seasons" |
|   | – Body | Seasonal tips |

---

### 5.2 FaunaPage

**Route:** `/fauna`  
**File:** `src/pages/FaunaPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **ContentHeader** | Fish icon, title, subtitle |
| 4 | **MediaBlock** | fauna-dolphins.jpg, fauna-lizard.jpg |
| 5 | **TextBlock** | "Island Wildlife" |
| 6 | **HighlightBlock (Info)** | "Marine Protected Areas" |
| 7 | **CardListBlock** | "Wildlife Categories" (4 cards) |
| 8 | **HighlightBlock (Warning)** | "Wildlife Guidelines" |
| 9 | **HighlightBlock (Tip)** | "Best Wildlife Encounters" |

---

### 5.3 InfoPage

**Route:** `/info`  
**File:** `src/pages/InfoPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Default |
| 2 | **MainMenu** | Global menu |
| 3 | **ContentHeader** | Info icon, title, subtitle |
| 4 | **MediaBlock** | info-vis-town.jpg |
| 5 | **TextBlock** | "About the Island" |
| 6 | **Emergency Numbers Grid** | 2×2 grid |
|   | **Each Emergency Card** | |
|   | – Shadow Layer | Colored |
|   | – Card | Clickable (tel: link) |
|   | – Icon | Phone, Flame, Anchor, AlertCircle |
|   | – Label | "Police", "Fire", "Sea Rescue", "Emergency" |
|   | – Number | 192, 193, 195, 112 |
|   | – Colors | primary, accent, secondary, destructive |
| 7 | **ContactBlock** | "Important Contacts" |
|   | – Contact Cards | Tourist offices, health center, pharmacy, harbor |
|   | – Each Card | Name, address, phones, email, hours, notes |
| 8 | **LinkListBlock** | "App Sections" |
|   | – Internal Links | Events, Bus, Ferry, Flora, Fauna |
| 9 | **LinkListBlock** | "External Links" |
|   | – External Links | Croatia tourism, Jadrolinija, Weather |
| 10 | **HighlightBlock (Tip)** | "Local Tips" |

---

## 6. SETTINGS

### 6.1 SettingsPage

**Route:** `/settings`  
**File:** `src/pages/SettingsPage.tsx`

#### Visual Blocks (Top to Bottom):

| # | Block Name | Description |
|---|------------|-------------|
| 1 | **AppHeader** | Title: "Settings" (translated) |
| 2 | **MainMenu** | Global menu |
| 3 | **Language Setting Card** | Flat variant, heavy border |
|   | – Icon Box | 40×40px, `bg-primary`, Globe |
|   | – Title | "Language" |
|   | – Subtitle | Selection instruction |
|   | **Language Options Grid** | 2-column |
|   | – Croatian Button | Selected: `bg-primary` + Check |
|   | – English Button | |
| 4 | **User Mode Setting Card** | Heavy border |
|   | – Icon Box | `bg-secondary`, User |
|   | – Title | "Način korištenja" |
|   | – Subtitle | "Posjetitelj ili stanovnik" |
|   | **Mode Options** | Stacked buttons |
|   | – Visitor Button | Full-width, `bg-primary` when selected |
|   | – Local Button | `bg-secondary` when selected |
|   | – Each: Title + description + Check |
| 5 | **Municipality Setting Card** | (only if local mode) |
|   | – Icon Box | `bg-teal`, Building2 |
|   | – Title | "Općina" |
|   | **Municipality Options** | 2-column grid |
|   | – VIS Button | `bg-teal` when selected |
|   | – KOMIŽA Button | |
| 6 | **App Info Card** | `bg-muted`, lighter border |
|   | – Version | "MOJ VIS v3.0" |
|   | – Description | "Građanski servis otoka Visa" |

---

## 7. GLOBAL COMPONENTS

### 7.1 AppHeader

**File:** `src/components/layout/AppHeader.tsx`

#### Visual Elements:

| Element | Description |
|---------|-------------|
| **Container** | `sticky top-0 z-50`, 64px height, 4px bottom border |
| **Menu Button (Left)** | |
| – Size | 48×48px |
| – Style | 3px border, `bg-accent` |
| – Icon | Menu (24px), strokeWidth 3 |
| – Hover | translate + shadow effect |
| **Title (Center)** | |
| – Text | "MOJ VIS" or custom |
| – Style | `font-display text-xl font-bold uppercase` |
| **Inbox Button (Right)** | (hidden on inbox pages) |
| – Size | 48×48px |
| – Style | 3px border, `bg-primary` |
| – Icon | Inbox (24px) |
| **Notification Badge** | |
| – Position | Absolute, -right-2 -top-2 |
| – Size | 20×20px |
| – Style | 2px border, `bg-destructive` |
| – Text | Count, 10px |

---

### 7.2 MainMenu

**File:** `src/components/layout/MainMenu.tsx`

#### Visual Elements:

| Element | Description |
|---------|-------------|
| **Backdrop** | Fixed, inset-0, z-40, `bg-foreground/60` |
| **Panel** | Fixed left, z-50, 300px width, max 88vw |
| **Header** | `bg-primary`, 4px bottom border |
| – Title | "Moj Vis", `text-2xl`, primary-foreground |
| – Subtitle | "Izbornik" |
| – Close Button | Shadow layer + button with X icon |
| **Menu Items Container** | `bg-background`, scrollable |
| – Section Label | "Navigacija", muted |
| **Menu Items (9)** | |
| – Each Item | Shadow layer + button |
| – Icon Box | 40×40px, colored background |
| – Label | Uppercase, bold |
| – Arrow | ArrowRight, muted |
| – Active State | Primary shadow + accent background |
| **Footer** | `bg-muted/30` |
| – Text | "Općina Vis • v3.0" |

#### Menu Items:
1. Home → `bg-accent`
2. Events → `bg-primary`
3. Timetables → `bg-secondary`
4. Feedback → `bg-lavender`
5. Click-Fix → `bg-destructive`
6. Flora → `bg-primary`
7. Fauna → `bg-secondary`
8. Info → `bg-accent`
9. Settings → `bg-muted`

---

### 7.3 MobileFrame

**File:** `src/components/layout/MobileFrame.tsx`

#### Visual Elements:

| Element | Description |
|---------|-------------|
| **Outer Container** | `min-h-screen bg-background` |
| **Inner Container** | `mx-auto max-w-md` (448px) |

---

## SUMMARY

### Screen Count by Category:

| Category | Screens |
|----------|---------|
| Onboarding | 3 |
| Main | 5 |
| Transport | 3 |
| Forms | 2 |
| Content | 3 |
| Settings | 1 |
| **Total** | **17 screens** |

### Total Visual Blocks (Approximate):

| Screen | Block Count |
|--------|-------------|
| OnboardingSplashPage | 6 |
| OnboardingModePage | 4 |
| OnboardingMunicipalityPage | 5 |
| HomePage | 7 |
| InboxPage | 5 |
| InboxDetailPage | 8 |
| EventsCalendarPage | 5 |
| EventDetailPage | 8 |
| TransportPage | 6 |
| TransportSeaPage | 7 |
| TransportRoadPage | 7 |
| FeedbackPage | 8 |
| ClickFixPage | 9 |
| FloraPage | 8 |
| FaunaPage | 9 |
| InfoPage | 10 |
| SettingsPage | 6 |
| **Total** | **~118 visual blocks** |

---

*This document covers V1 screens only. V2 screens in `src/pages-v2/` are excluded.*
