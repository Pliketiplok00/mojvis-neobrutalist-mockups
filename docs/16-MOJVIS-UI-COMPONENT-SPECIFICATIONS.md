# MOJ VIS – UI COMPONENT SPECIFICATIONS

Detaljna specifikacija dizajna svih komponenti i stranica aplikacije.

---

## GLOBALNE KOMPONENTE

### 1. AppHeader (Globalni Header)

**Lokacija:** `src/components/layout/AppHeader.tsx`

**Struktura:**
- Lijevo: Hamburger menu gumb
- Centar: Naslov aplikacije ("MOJ VIS")
- Desno: Inbox ikona s badge-om

**Stilovi:**
```
Header container:
- sticky top-0 z-50
- border-b-4 border-foreground
- bg-background
- h-16

Menu gumb (lijevo):
- h-12 w-12
- border-3 border-foreground
- bg-accent
- Hover: translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_0_hsl(var(--foreground))]
- Active: translate-x-[2px] translate-y-[2px] shadow-none
- Ikona: Menu, h-6 w-6, strokeWidth={3}

Naslov (centar):
- font-display text-xl font-bold uppercase tracking-tight

Inbox gumb (desno):
- h-12 w-12
- border-3 border-foreground
- bg-primary text-primary-foreground
- Ista hover/active animacija kao menu gumb
- Ikona: Inbox, h-6 w-6, strokeWidth={2.5}

Badge (notifikacije):
- absolute -right-2 -top-2
- h-5 w-5
- border-2 border-foreground
- bg-destructive text-destructive-foreground
- font-display text-[10px] font-bold
```

---

### 2. MainMenu (Glavni Izbornik)

**Lokacija:** `src/components/layout/MainMenu.tsx`

**Struktura:**
- Backdrop (tamni overlay)
- Menu panel (slide-in s lijeve strane)
  - Header s naslovom i close gumbom
  - Lista navigacijskih stavki
  - Footer s verzijom

**Stilovi:**

```
Backdrop:
- fixed inset-0 z-40
- bg-foreground/60

Menu Panel:
- fixed left-0 top-0 z-50
- h-full w-[300px] max-w-[88vw]
- bg-muted/30
- border-r-4 border-foreground

Header:
- border-b-4 border-foreground
- bg-primary
- p-5
- Naslov: font-display text-2xl font-bold uppercase text-primary-foreground tracking-tight
- Podnaslov: font-body text-xs text-primary-foreground/80

Close gumb:
- h-10 w-10
- border-2 border-foreground
- bg-background
- Shadow: absolute inset-0 translate-x-1 translate-y-1 bg-foreground
- Hover: translate-x-[-1px] translate-y-[-1px]
- Active: translate-x-0.5 translate-y-0.5
- Ikona: X, h-5 w-5, strokeWidth={2}

Menu Items Container:
- flex-1 overflow-y-auto p-4
- bg-background
- border-b-4 border-foreground

Section naslov:
- mb-3
- font-display text-xs font-bold uppercase tracking-widest text-muted-foreground

Menu Item:
- Wrapper: relative, gap-2 između stavki
- Shadow layer: absolute inset-0 translate-x-1.5 translate-y-1.5
  - Active: bg-primary
  - Inactive: bg-foreground/20
- Button:
  - flex w-full items-center gap-3
  - border-2 border-foreground
  - p-3
  - Active: bg-accent
  - Inactive: bg-background
  - Hover: translate-x-[-1px] translate-y-[-1px]
  - Active click: translate-x-1 translate-y-1

Icon box (unutar stavke):
- h-10 w-10
- border-2 border-foreground
- Boja prema tipu stavke (bg-accent, bg-primary, bg-secondary, bg-lavender, bg-destructive, bg-muted)
- Ikona: h-5 w-5 text-foreground, strokeWidth={2}

Label:
- font-display text-sm font-bold uppercase tracking-tight

Arrow:
- ArrowRight, h-4 w-4 text-muted-foreground, strokeWidth={2}

Footer:
- p-4 bg-muted/30
- font-body text-xs text-muted-foreground text-center

Menu stavke i boje:
1. Home - bg-accent
2. Events - bg-primary
3. Timetables - bg-secondary
4. Feedback - bg-lavender
5. Click & Fix - bg-destructive
6. Flora - bg-primary
7. Fauna - bg-secondary
8. Info - bg-accent
9. Settings - bg-muted
```

---

### 3. MobileFrame

**Lokacija:** `src/components/layout/MobileFrame.tsx`

**Svrha:** Wrapper koji simulira mobilni uređaj za desktop pregled.

**Stilovi:**
```
- max-w-md mx-auto
- min-h-screen
- bg-background
- shadow-xl (na desktopu)
```

---

## STRANICE

### 4. HomePage (Početna)

**Lokacija:** `src/pages/HomePage.tsx`

**Sekcije:**

#### A. Active Notification Banner
```
Container:
- flex items-center gap-3
- border-b-4 border-foreground
- bg-accent
- p-4
- Hover: bg-accent/90

Icon box:
- h-10 w-10
- border-2 border-foreground
- bg-destructive
- Ikona: AlertCircle, h-5 w-5 text-destructive-foreground, strokeWidth={2.5}

Content:
- Naslov: font-display text-sm font-bold uppercase tracking-tight
- Opis: font-body text-xs text-foreground/70

Badge:
- variant="destructive"
- uppercase border-2 border-foreground font-display text-xs
```

#### B. Greeting Block
```
Container:
- border-b-4 border-foreground
- bg-primary
- p-6

Naslov:
- font-display text-3xl font-bold uppercase leading-tight text-primary-foreground tracking-tight

Podnaslov:
- mt-2
- font-body text-sm text-primary-foreground/80
```

#### C. Category Grid
```
Container:
- border-b-4 border-foreground
- bg-background
- p-5

Section naslov:
- mb-4
- font-display text-xs font-bold uppercase tracking-widest text-muted-foreground

Grid:
- grid grid-cols-2 gap-3

Category Card:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground
- Button:
  - relative flex flex-col items-center justify-center gap-2
  - border-2 border-foreground
  - p-5 w-full
  - Boja prema kategoriji (bg-primary, bg-secondary, bg-destructive, bg-accent)
  - Hover: translate-x-[-1px] translate-y-[-1px]
  - Active: translate-x-1 translate-y-1
- Ikona: h-7 w-7, strokeWidth={2}
- Label: font-display text-sm font-bold uppercase

Kategorije i boje:
1. Events - bg-primary text-primary-foreground
2. Bus - bg-secondary text-secondary-foreground
3. Ferry - bg-destructive text-destructive-foreground
4. Info - bg-accent text-accent-foreground
```

#### D. Upcoming Events
```
Container:
- p-5 bg-background border-b-4 border-foreground

Header:
- flex items-center justify-between mb-4
- Naslov: font-display text-xs font-bold uppercase tracking-widest text-muted-foreground
- View all gumb: variant="ghost" size="sm", uppercase text-xs font-display font-bold

Event Item:
- Wrapper: relative
- Shadow: 
  - Prvi event: bg-primary
  - Ostali: bg-foreground/20
- Button:
  - flex items-center gap-3
  - border-2 border-foreground
  - p-3 w-full
  - Prvi event: bg-accent
  - Ostali: bg-background
  - Hover: translate-x-[-1px] translate-y-[-1px]
  - Active: translate-x-1 translate-y-1

Date box:
- h-12 w-12
- border-2 border-foreground
- bg-primary text-primary-foreground
- Dan: font-display text-lg font-bold leading-none
- Mjesec: font-body text-[10px] uppercase

Event info:
- Naslov: font-display text-sm font-bold uppercase tracking-tight truncate
- Lokacija: font-body text-xs text-muted-foreground
- Vrijeme: font-display text-sm font-bold text-muted-foreground
```

#### E. Feedback Entry
```
Container:
- p-5 pb-8 bg-muted/30

Card:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-foreground
- Button:
  - flex w-full items-center gap-4
  - border-2 border-foreground
  - bg-secondary
  - p-4
  - Hover: translate-x-[-1px] translate-y-[-1px]
  - Active: translate-x-1 translate-y-1

Icon box:
- h-12 w-12
- border-2 border-foreground
- bg-background
- Ikona: MessageSquare, h-6 w-6, strokeWidth={2}

Content:
- Naslov: font-display text-base font-bold uppercase tracking-tight
- Opis: font-body text-xs text-secondary-foreground/70

Arrow: h-5 w-5
```

---

### 5. InboxPage (Inbox)

**Lokacija:** `src/pages/InboxPage.tsx`

#### Tabs
```
Container:
- flex border-b-4 border-foreground

Tab button:
- flex flex-1 items-center justify-center gap-2
- border-r-3 border-foreground (samo prvi tab)
- p-4
- font-display text-sm font-bold uppercase tracking-wide
- Active: bg-primary text-primary-foreground
- Inactive: bg-background hover:bg-muted
- Ikone: Bell, Send - h-5 w-5, strokeWidth={2.5}
```

#### Message Item (Received)
```
Container:
- flex gap-4
- border-b-3 border-foreground
- p-4
- Nepročitano: bg-accent/20
- Pročitano: bg-background
- Hover: bg-muted

Icon box:
- h-12 w-12
- border-3 border-foreground
- Emergency: bg-destructive text-destructive-foreground
- Po tipu: bg-accent, bg-primary, bg-secondary, bg-lavender, bg-orange
- Ikona: h-6 w-6, strokeWidth={2.5}

Content:
- Naslov: font-display text-sm uppercase
  - Nepročitano: font-bold
  - Pročitano: font-medium
- Preview: font-body text-xs text-muted-foreground, truncate
- Datum: font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground

Badge (New):
- variant="destructive"
- uppercase text-[10px]

Arrow: h-5 w-5 text-muted-foreground, strokeWidth={2.5}
```

#### Message Item (Sent)
```
Isto kao Received, ali bez bg-accent/20 za nepročitano.

Status Badge:
- received: variant="secondary"
- under_review: variant="accent"
- accepted: variant="teal"
- rejected: variant="default"
```

---

### 6. EventsCalendarPage (Kalendar Događaja)

**Lokacija:** `src/pages/EventsCalendarPage.tsx`

#### Header
```
- border-b-4 border-foreground
- bg-primary
- p-5
- Naslov: font-display text-2xl font-bold uppercase text-primary-foreground
- Podnaslov: font-body text-xs uppercase tracking-widest text-primary-foreground/80
```

#### Month Navigation
```
- flex items-center justify-between mb-4

Nav buttons:
- h-11 w-11
- border-3 border-foreground
- bg-background
- Hover: translate-x-[-2px] translate-y-[-2px] shadow-[4px_4px_0_0_hsl(var(--foreground))]
- Active: translate-x-[2px] translate-y-[2px] shadow-none
- Ikone: ChevronLeft/Right, h-6 w-6, strokeWidth={3}

Month label:
- font-display text-lg font-bold uppercase tracking-wide
```

#### Week Days Header
```
- grid grid-cols-7 gap-1 mb-2
- font-display text-xs font-bold uppercase text-muted-foreground
- py-2 text-center
```

#### Calendar Grid
```
- grid grid-cols-7 gap-1

Day cell:
- aspect-square
- flex items-center justify-center
- border-2
- font-display text-sm font-bold

States:
- Selected: border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]
- Today: border-foreground bg-accent
- Has events: border-foreground bg-secondary/50, hover:bg-secondary
- Default: border-transparent, hover:border-foreground hover:bg-muted

Event indicator:
- absolute bottom-1
- h-1.5 w-1.5 bg-primary
```

#### Selected Day Events
```
Container:
- p-4

Date header:
- mb-4
- font-display text-sm font-bold uppercase tracking-widest text-muted-foreground

Empty state:
- border-3 border-dashed border-muted-foreground
- p-8 text-center
- font-display text-sm uppercase text-muted-foreground

Event card:
- border-3 border-foreground
- bg-background
- p-4
- Hover: translate-x-[-2px] translate-y-[-2px] shadow-[4px_4px_0_0_hsl(var(--foreground))]
- Active: translate-x-[2px] translate-y-[2px] shadow-none

Event title:
- font-display font-bold uppercase

Event details:
- mt-2 flex flex-col gap-1
- text-xs text-muted-foreground
- Ikone: Clock, MapPin - h-4 w-4, strokeWidth={2.5}
```

---

### 7. TransportRoadPage (Autobusne linije)

**Lokacija:** `src/pages/TransportRoadPage.tsx`

#### Active Notice Banner
```
- Wrapper: relative border-b-4 border-foreground
- Shadow: absolute inset-0 translate-x-1 translate-y-1 bg-destructive
- Button: bg-accent p-4, hover:translate-x-[-2px] translate-y-[-2px]

Icon box:
- w-12 h-12
- bg-destructive
- border-4 border-foreground
- rotate-3
- Ikona: AlertTriangle, size={24}, strokeWidth={2.5}, text-white
```

#### Section Header
```
- border-b-4 border-foreground
- bg-secondary
- p-5

Icon box:
- w-14 h-14
- bg-background
- border-4 border-foreground
- -rotate-3
- Ikona: Bus, size={28}, strokeWidth={2.5}

Naslov:
- font-display text-2xl font-bold uppercase text-secondary-foreground

Podnaslov:
- font-body text-xs text-secondary-foreground/80 uppercase tracking-widest
```

#### Lines List
```
Section container:
- p-5 bg-background border-b-4 border-foreground

Section naslov:
- font-display font-bold text-xs uppercase tracking-widest text-muted-foreground
- mb-4 border-b-2 border-foreground pb-2

Line card:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-foreground
- Button: bg-background border-4 border-foreground, p-0
- Hover: translate-x-[-2px] translate-y-[-2px]
- Active: translate-x-1 translate-y-1

Title bar:
- w-full px-4 py-3
- border-b-4 border-foreground
- Alternating colors: bg-primary (parni) / bg-secondary (neparni)
- Ikona: Bus, size={22}, strokeWidth={2.5}, text-white
- Naslov: font-display font-bold text-base uppercase text-white
- Arrow container: w-8 h-8 border-2 border-white/50 bg-white/20
- Arrow: ChevronRight, size={18}, strokeWidth={3}, text-white

Details:
- px-4 py-3
- Duration/stops: flex items-center gap-1, font-body text-xs text-muted-foreground
- Ikone: Clock, MapPin - size={12}, strokeWidth={2.5}
- Route: font-body text-[11px] text-muted-foreground leading-relaxed
```

#### Today's Departures
```
Section container:
- p-5 bg-background border-b-4 border-foreground

Header:
- flex items-center justify-between mb-4 border-b-2 border-foreground pb-2
- Naslov: font-display font-bold text-xs uppercase tracking-widest text-muted-foreground
- Date badge: bg-primary border-3 border-foreground px-3 py-1, font-display font-bold text-xs text-primary-foreground

List container:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-foreground
- Container: bg-background border-4 border-foreground max-h-64 overflow-y-auto

Departure item:
- flex items-center gap-4 p-3
- border-b-2 border-foreground (osim zadnjeg)

Time box:
- w-16 h-10
- bg-primary
- border-3 border-foreground
- font-display font-bold text-sm text-primary-foreground

Line info:
- Naslov: font-display font-bold text-sm
- Direction: font-body text-xs text-muted-foreground
```

#### Contacts Section
```
Container:
- p-5 pb-8 bg-muted/30

Contact card:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-secondary
- Button: bg-background border-4 border-foreground p-4
- Hover: translate-x-[-2px] translate-y-[-2px]
- Active: translate-x-1 translate-y-1

Icon box:
- w-14 h-14
- bg-accent
- border-4 border-foreground
- rotate-3
- Ikona: Phone, size={24}, strokeWidth={2.5}

Contact info:
- Name: font-display font-bold uppercase
- Phone: font-body text-sm text-muted-foreground
```

---

### 8. TransportSeaPage (Pomorske linije)

**Lokacija:** `src/pages/TransportSeaPage.tsx`

Identična struktura kao TransportRoadPage, s razlikama:

```
Header boja: bg-primary (umjesto bg-secondary)
Ikona: Ship (umjesto Bus)

Line card colors:
- Ferry: bg-primary
- Catamaran: bg-teal

Departure type badge:
- Ferry: bg-primary/20
- Catamaran: bg-teal/20

Contact shadow: bg-primary (umjesto bg-secondary)
```

---

### 9. FeedbackPage (Povratne informacije)

**Lokacija:** `src/pages/FeedbackPage.tsx`

#### Header
```
- border-b-4 border-foreground
- bg-lavender
- p-5

Icon box:
- w-14 h-14
- bg-background
- border-4 border-foreground
- -rotate-3
- Ikona: MessageSquare, size={28}, strokeWidth={2.5}

Naslov:
- font-display text-2xl font-bold uppercase

Podnaslov:
- font-body text-xs uppercase tracking-widest
```

#### Form Sections
```
Section header:
- font-display font-bold text-xs text-muted-foreground
- mb-3 uppercase tracking-widest
- border-b-2 border-foreground pb-2
- Required marker: text-destructive

Feedback Type Grid:
- grid grid-cols-2 gap-3

Type button:
- Wrapper: relative
- Shadow: 
  - Selected: bg-foreground
  - Unselected: bg-muted-foreground/30
- Button:
  - border-4 border-foreground
  - p-4 flex flex-col items-center gap-2
  - Selected: boja prema tipu (bg-accent, bg-primary, bg-destructive, bg-secondary)
  - Unselected: bg-background
  - Hover: translate-x-[-2px] translate-y-[-2px]
  - Active: translate-x-1 translate-y-1
- Ikona: size={28}, strokeWidth={2.5}
  - Selected: text-white
  - Unselected: text-foreground
- Label: font-display font-bold text-xs
  - Selected: text-white
  - Unselected: text-foreground

Input/Textarea:
- border-4 border-foreground
- font-body
- bg-background
- focus:ring-0 focus:border-foreground

Submit button:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-foreground
- Button:
  - w-full
  - bg-primary text-primary-foreground
  - border-4 border-foreground
  - font-display text-lg py-6
  - Hover: translate-x-[-2px] translate-y-[-2px]
```

#### Success State
```
Container:
- min-h-screen flex flex-col items-center justify-center p-8

Success icon:
- w-24 h-24
- bg-secondary
- neo-border-heavy neo-shadow-lg
- Ikona: Check, size={48}, strokeWidth={3}, text-secondary-foreground

Message:
- Naslov: font-display font-bold text-3xl text-center mb-4
- Opis: font-body text-muted-foreground text-center mb-8

Home button:
- bg-primary text-primary-foreground
- neo-border-heavy neo-shadow
- font-display text-lg py-6 px-8
```

---

### 10. ClickFixPage (Klikni & Popravi)

**Lokacija:** `src/pages/ClickFixPage.tsx`

Identična struktura kao FeedbackPage, s razlikama:

```
Header boja: bg-orange
Ikona: MapPin

Location Selected State:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-primary
- Container: bg-background border-4 border-foreground p-4

Location icon box:
- w-14 h-14
- bg-primary
- border-4 border-foreground
- rotate-3
- Ikona: MapPin, size={28}, strokeWidth={3}, text-primary-foreground

Remove button:
- w-10 h-10
- bg-muted
- border-3 border-foreground
- Hover: bg-destructive text-white

Photo Grid:
- grid grid-cols-3 gap-3

Photo cell:
- aspect-square
- bg-muted
- border-4 border-foreground
- Ikona: Camera, size={24}, text-muted-foreground

Remove photo button:
- absolute -top-2 -right-2
- w-7 h-7
- bg-destructive
- border-3 border-foreground
- Ikona: X, size={14}, strokeWidth={3}, text-destructive-foreground

Add photo button:
- aspect-square
- bg-background
- border-4 border-foreground
- Hover: translate-x-[-2px] translate-y-[-2px] shadow-[4px_4px_0_0_hsl(var(--foreground))]
- Active: translate-x-1 translate-y-1

Character counter:
- font-body text-xs mt-2
- Valid: text-secondary font-bold
- Invalid: text-muted-foreground

Warning dialog:
- Wrapper: relative
- Shadow: absolute inset-0 translate-x-2 translate-y-2 bg-foreground
- Container: bg-accent border-4 border-foreground p-4
- Naslov: font-display font-bold mb-2 uppercase
- Opis: font-body text-sm mb-4
- Buttons: flex gap-3, border-3 border-foreground, font-display
```

---

### 11. SettingsPage (Postavke)

**Lokacija:** `src/pages/SettingsPage.tsx`

#### Settings Card
```
Container:
- neo-border-heavy
- p-4

Icon box:
- w-10 h-10
- neo-border
- Boja prema tipu (bg-primary, bg-secondary, bg-teal)
- Ikona: size={20}, strokeWidth={2.5}

Header:
- Naslov: font-display font-bold uppercase
- Opis: font-body text-xs text-muted-foreground

Option Grid (2 columns):
- grid grid-cols-2 gap-3

Option button:
- neo-border-heavy
- p-3 ili p-4
- flex items-center justify-center gap-2
- Selected: bg-primary text-primary-foreground ili bg-secondary text-secondary-foreground
- Unselected: bg-card hover:bg-muted
- Label: font-display font-bold text-sm
- Check icon: size={16}, strokeWidth={3}

Full-width option:
- w-full
- neo-border-heavy
- p-4
- flex items-center gap-4
- text-left
```

#### App Info Footer
```
- neo-border
- p-4
- bg-muted
- font-body text-sm text-center text-muted-foreground
```

---

## TIPOGRAFIJA

### Font Families
```
Display (headings, labels, buttons):
- font-display
- Space Grotesk
- Uvijek UPPERCASE

Body (paragraphs, descriptions):
- font-body
- Space Mono
- Normal case
```

### Font Sizes
```
Heading XL: text-3xl font-bold uppercase
Heading L: text-2xl font-bold uppercase
Heading M: text-xl font-bold uppercase
Heading S: text-lg font-bold uppercase
Section label: text-xs font-bold uppercase tracking-widest
Body: text-sm
Body small: text-xs
Caption: text-[10px] ili text-[11px]
```

---

## BOJE

### Primarne
```
primary: Mediteranska plava (hsl(217, 91%, 40%))
secondary: Zelena (hsl(122, 39%, 44%))
accent: Žuta (hsl(48, 100%, 68%))
destructive: Crvena (hsl(4, 82%, 56%))
```

### Extended Mediterranean
```
teal: Tirkizna (hsl(180, 70%, 35%))
lavender: Lavanda (hsl(270, 60%, 80%))
orange: Narančasta (hsl(35, 100%, 55%))
coral: Koraljno crvena (hsl(16, 85%, 65%))
olive: Maslinasta (hsl(70, 40%, 40%))
sand: Pješčana (hsl(35, 50%, 75%))
```

### Semantic
```
background: Svijetla pozadina
foreground: Tamni tekst
muted: Siva za neaktivne elemente
muted-foreground: Sivi tekst
border: Tamna boja za bordere
```

---

## SJENE I BORDERI

### Border Widths
```
Standard: border-2
Heavy: border-3 ili border-4
Light: border-1
```

### Shadow System (Neobrutalist)
```
Standard shadow:
- absolute inset-0 translate-x-1.5 translate-y-1.5 bg-[color]

Large shadow:
- absolute inset-0 translate-x-2 translate-y-2 bg-[color]

Inline shadow (Tailwind):
- shadow-[4px_4px_0_0_hsl(var(--foreground))]
- shadow-[6px_6px_0_0_hsl(var(--foreground))]
```

---

## INTERAKTIVNI EFEKTI

### Hover/Active Pattern
```
Default state:
- translate-x-0 translate-y-0

Hover:
- translate-x-[-1px] translate-y-[-1px]
- ili translate-x-[-2px] translate-y-[-2px]
- Može dodati shadow

Active (click):
- translate-x-1 translate-y-1
- ili translate-x-0.5 translate-y-0.5
- ili translate-x-[2px] translate-y-[2px]
- Shadow: none
```

### Transition
```
- transition-all
- transition-colors
- transition-transform
```

---

## IKONE

### Library: Lucide React

### Sizes
```
Small: h-4 w-4 ili size={12}
Default: h-5 w-5 ili size={20}
Medium: h-6 w-6 ili size={24}
Large: h-7 w-7 ili size={28}
XL: size={48}
```

### Stroke Widths
```
Light: strokeWidth={2}
Default: strokeWidth={2.5}
Bold: strokeWidth={3}
```

---

## SPACING

### Padding
```
Container: p-4 ili p-5
Cards: p-3 ili p-4
Compact: p-2
Large sections: p-5 pb-8
```

### Gap
```
Tight: gap-1 ili gap-2
Default: gap-3 ili gap-4
Loose: gap-6
```

### Margins
```
Section spacing: mb-4
Element spacing: mt-2
Section title underline: pb-2 border-b-2
```

---

## LAYOUT PATTERNS

### Page Structure
```tsx
<MobileFrame>
  <AppHeader onMenuClick={() => setMenuOpen(true)} />
  <MainMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
  
  <main className="flex flex-col bg-muted/30">
    {/* Sections */}
  </main>
</MobileFrame>
```

### Section Pattern
```tsx
<section className="border-b-4 border-foreground bg-[color] p-5">
  <h2 className="font-display font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4 border-b-2 border-foreground pb-2">
    Section Title
  </h2>
  {/* Content */}
</section>
```

### Card with Shadow Pattern
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <div className="relative border-4 border-foreground bg-background p-4">
    {/* Content */}
  </div>
</div>
```

### Interactive Card Pattern
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
  <button
    className="relative w-full border-2 border-foreground bg-background p-4 text-left transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-1 active:translate-y-1"
  >
    {/* Content */}
  </button>
</div>
```
