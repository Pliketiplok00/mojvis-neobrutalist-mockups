# MOJ VIS – NEOBRUT2 DESIGN SYSTEM COMPLETE SPECIFICATION

> **Tema:** Neobrutalist Mediterranean  
> **Verzija:** 1.0  
> **Datum:** Siječanj 2026

Ovaj dokument sadrži kompletnu specifikaciju svih UI elemenata, komponenti, stranica i njihovih ponašanja u V1 verziji MOJ VIS aplikacije.

---

## SADRŽAJ

1. [Dizajn Filozofija](#dizajn-filozofija)
2. [Palete Boja](#palete-boja)
3. [Tipografija](#tipografija)
4. [Globalne CSS Varijable](#globalne-css-varijable)
5. [Utility Klase](#utility-klase)
6. [Komponente](#komponente)
   - [Button](#button)
   - [Badge](#badge)
   - [Card](#card)
   - [Input](#input)
   - [Textarea](#textarea)
   - [States (Loading, Error, Empty)](#states)
7. [Layout Komponente](#layout-komponente)
   - [MobileFrame](#mobileframe)
   - [AppHeader](#appheader)
   - [MainMenu](#mainmenu)
8. [Stranice](#stranice)
   - [Onboarding](#onboarding-stranice)
   - [HomePage](#homepage)
   - [InboxPage](#inboxpage)
   - [InboxDetailPage](#inboxdetailpage)
   - [EventsCalendarPage](#eventscalendarpage)
   - [EventDetailPage](#eventdetailpage)
   - [TransportPage](#transportpage)
   - [TransportSeaPage](#transportseapage)
   - [TransportRoadPage](#transportroadpage)
   - [FeedbackPage](#feedbackpage)
   - [ClickFixPage](#clickfixpage)
   - [SettingsPage](#settingspage)
9. [Interakcije i Animacije](#interakcije-i-animacije)
10. [Ikone](#ikone)

---

## DIZAJN FILOZOFIJA

### Neobrutalist Principi
- **Struktura mora biti vidljiva** - debeli obrubi, jasne granice
- **Flat boje bez gradijenata** - čiste, pune boje
- **Hard shadows** - offset sjene bez blur-a
- **Sharp corners** - radius: 0px (pravi uglovi)
- **Bold tipografija** - uppercase, tracking, display fontovi

### Mediteranska Paleta
- Topli krem background
- Mediteransko plavo kao primary
- Terakota i maslina kao akcent
- Sunčano žuto za highlights

---

## PALETE BOJA

### Core Colors (HSL format)

```css
/* Background & Foreground */
--background: 45 30% 96%;        /* Topli krem/sand */
--foreground: 220 20% 10%;       /* Near-black za tekst i bordere */

/* Card & Popover */
--card: 45 25% 98%;              /* Svjetliji krem */
--card-foreground: 220 20% 10%;

/* Primary - Mediterranean Blue */
--primary: 210 80% 45%;
--primary-foreground: 0 0% 100%;

/* Secondary - Olive Green */
--secondary: 160 45% 38%;
--secondary-foreground: 0 0% 100%;

/* Accent - Sun Yellow */
--accent: 45 92% 55%;
--accent-foreground: 220 20% 10%;

/* Muted */
--muted: 45 15% 90%;
--muted-foreground: 220 10% 40%;

/* Destructive - Terracotta Red */
--destructive: 12 55% 50%;
--destructive-foreground: 0 0% 100%;

/* Extended Palette */
--terracotta: 12 55% 50%;
--lavender: 270 35% 70%;
--orange: 25 85% 55%;
--teal: 180 45% 42%;
--pink: 350 50% 65%;
```

### Usage Examples
- `bg-primary` → Mediteransko plavo
- `bg-secondary` → Maslinasto zeleno
- `bg-accent` → Sunčano žuto
- `bg-destructive` → Terakota crveno
- `bg-muted` → Prigušeni krem

---

## TIPOGRAFIJA

### Font Families

```css
--font-display: "Space Grotesk", system-ui, sans-serif;
--font-body: "Space Mono", monospace;
```

### Usage Classes

| Klasa | Font | Upotreba |
|-------|------|----------|
| `font-display` | Space Grotesk | Naslovi, gumbi, labele |
| `font-body` | Space Mono | Paragraf tekst, opisi |

### Text Styles

```css
/* Heading styles */
h1: font-display text-5xl font-bold uppercase tracking-tight
h2: font-display text-3xl font-bold uppercase tracking-tight
h3: font-display text-2xl font-bold uppercase
h4: font-display text-xl font-bold uppercase

/* Section labels */
.section-label: font-display text-xs font-bold uppercase tracking-widest text-muted-foreground

/* Body text */
.body-text: font-body text-sm text-foreground
.body-small: font-body text-xs text-muted-foreground

/* Meta text */
.meta: font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground
```

---

## GLOBALNE CSS VARIJABLE

### Border & Shadow

```css
--border: 220 20% 10%;           /* Pure black borders */
--border-width: 2px;             /* Standard border */
--border-heavy: 3px;             /* Heavy border */
--shadow-offset: 4px;            /* Standard shadow offset */
--shadow-offset-lg: 6px;         /* Large shadow offset */
--radius: 0px;                   /* Sharp corners */
--radius-soft: 4px;              /* Slightly softer when needed */
```

---

## UTILITY KLASE

### Border Classes

```css
.neo-border {
  border: 2px solid hsl(var(--border));
}

.neo-border-heavy {
  border: 3px solid hsl(var(--border));
}

/* Inline style za specifične debljine */
style={{ borderWidth: "3px" }}
style={{ borderWidth: "4px" }}
```

### Shadow Classes

```css
.neo-shadow {
  box-shadow: 4px 4px 0 0 hsl(var(--border));
}

.neo-shadow-lg {
  box-shadow: 6px 6px 0 0 hsl(var(--border));
}

.neo-shadow-primary {
  box-shadow: 4px 4px 0 0 hsl(var(--primary));
}

.neo-shadow-accent {
  box-shadow: 4px 4px 0 0 hsl(var(--accent));
}

.neo-shadow-secondary {
  box-shadow: 4px 4px 0 0 hsl(var(--secondary));
}

/* Inline shadow pattern */
shadow-[4px_4px_0_0_hsl(var(--foreground))]
shadow-[6px_6px_0_0_hsl(var(--foreground))]
```

### Hover Classes

```css
.neo-hover {
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
}

.neo-hover:hover {
  transform: translate(-2px, -2px);
  box-shadow: calc(var(--shadow-offset) + 2px) calc(var(--shadow-offset) + 2px) 0 0 hsl(var(--border));
}

.neo-hover:active {
  transform: translate(2px, 2px);
  box-shadow: 0 0 0 0 hsl(var(--border));
}
```

### Complete Hover Pattern (Tailwind)

```tsx
className="transition-all 
  hover:translate-x-[-2px] hover:translate-y-[-2px] 
  hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
  active:translate-x-[2px] active:translate-y-[2px] 
  active:shadow-none"
```

---

## KOMPONENTE

### Button

**Lokacija:** `src/components/ui/button.tsx`

#### Base Style
```tsx
className="inline-flex items-center justify-center gap-2 
  whitespace-nowrap text-sm font-semibold font-display 
  ring-offset-background transition-all 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
  disabled:pointer-events-none disabled:opacity-50 
  border-2 border-foreground"
```

#### Variants

| Variant | Stil |
|---------|------|
| `default` | `bg-primary text-primary-foreground shadow-neo` + neo-hover |
| `destructive` | `bg-destructive text-destructive-foreground shadow-neo` + neo-hover |
| `outline` | `bg-background hover:bg-muted shadow-neo` + neo-hover |
| `secondary` | `bg-secondary text-secondary-foreground shadow-neo` + neo-hover |
| `accent` | `bg-accent text-accent-foreground shadow-neo` + neo-hover |
| `ghost` | `border-transparent hover:bg-muted hover:border-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline border-transparent` |

#### Sizes

| Size | Stil |
|------|------|
| `default` | `h-11 px-5 py-2` |
| `sm` | `h-9 px-4 text-xs` |
| `lg` | `h-12 px-8 text-base` |
| `xl` | `h-14 px-10 text-lg` |
| `icon` | `h-11 w-11` |

#### CTA Pattern (Full-width s external shadow)
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <Button 
    size="lg" 
    className="relative w-full bg-primary text-primary-foreground 
      border-4 border-foreground font-display text-lg py-6 
      hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
  >
    <Icon size={24} strokeWidth={2.5} className="mr-3" />
    TEKST GUMBA
  </Button>
</div>
```

---

### Badge

**Lokacija:** `src/components/ui/badge.tsx`

#### Base Style
```tsx
className="inline-flex items-center border-2 border-foreground 
  px-3 py-1 text-xs font-bold font-display uppercase tracking-wide"
```

#### Variants

| Variant | Stil |
|---------|------|
| `default` | `bg-primary text-primary-foreground` |
| `secondary` | `bg-secondary text-secondary-foreground` |
| `destructive` | `bg-destructive text-destructive-foreground` |
| `accent` | `bg-accent text-accent-foreground` |
| `outline` | `bg-background text-foreground` |
| `terracotta` | `bg-terracotta text-primary-foreground` |
| `lavender` | `bg-lavender text-foreground` |
| `teal` | `bg-teal text-primary-foreground` |
| `orange` | `bg-orange text-foreground` |
| `muted` | `bg-muted text-muted-foreground border-muted-foreground` |

---

### Card

**Lokacija:** `src/components/ui/card.tsx`

#### Base Style
```tsx
className="border-2 border-foreground bg-card text-card-foreground"
```

#### Variants

| Variant | Stil |
|---------|------|
| `default` | `shadow-neo` |
| `flat` | (bez sjene) |
| `elevated` | `shadow-neo-lg` |
| `accent` | `bg-accent shadow-neo` |
| `primary` | `bg-primary text-primary-foreground shadow-neo` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-neo` |

#### Interactive Mode
```tsx
interactive={true}
// Dodaje:
className="transition-all cursor-pointer 
  hover:translate-x-[-2px] hover:translate-y-[-2px] 
  hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
  active:translate-x-[2px] active:translate-y-[2px] 
  active:shadow-none"
```

#### Card Sub-components

| Component | Padding |
|-----------|---------|
| `CardHeader` | `p-5` |
| `CardTitle` | `text-xl font-bold font-display` |
| `CardDescription` | `text-sm text-muted-foreground font-body` |
| `CardContent` | `p-5 pt-0` |
| `CardFooter` | `p-5 pt-0` |

---

### Input

**Lokacija:** `src/components/ui/input.tsx`

```tsx
className="flex h-11 w-full border-2 border-foreground bg-background 
  px-4 py-2 text-base font-body ring-offset-background shadow-neo 
  placeholder:text-muted-foreground 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
  disabled:cursor-not-allowed disabled:opacity-50 
  transition-shadow focus:shadow-neo-primary"
```

#### Custom Input u formama
```tsx
className="border-4 border-foreground font-body bg-background 
  focus:ring-0 focus:border-foreground"
```

---

### Textarea

**Lokacija:** `src/components/ui/textarea.tsx`

```tsx
className="flex min-h-[120px] w-full border-2 border-foreground bg-background 
  px-4 py-3 text-base font-body ring-offset-background shadow-neo 
  placeholder:text-muted-foreground 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
  disabled:cursor-not-allowed disabled:opacity-50 
  transition-shadow focus:shadow-neo-primary resize-none"
```

#### Custom Textarea u formama
```tsx
className="border-4 border-foreground font-body min-h-[150px] bg-background 
  focus:ring-0 focus:border-foreground"
```

---

### States

**Lokacija:** `src/components/ui/states.tsx`

#### LoadingState
```tsx
<div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
  <div className="w-16 h-16 border-4 border-foreground bg-accent 
    flex items-center justify-center animate-pulse">
    <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2.5} />
  </div>
  <p className="mt-4 font-display text-sm font-bold uppercase 
    tracking-widest text-muted-foreground">
    {message}
  </p>
</div>
```

#### ErrorState
```tsx
<div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
  {/* Icon box with offset shadow */}
  <div className="relative">
    <div className="absolute inset-0 translate-x-2 translate-y-2 bg-destructive" />
    <div className="relative w-20 h-20 border-4 border-foreground bg-background 
      flex items-center justify-center">
      <AlertTriangle className="h-10 w-10 text-destructive" strokeWidth={2.5} />
    </div>
  </div>
  <h3 className="mt-6 font-display text-lg font-bold uppercase text-center">{title}</h3>
  <p className="mt-2 font-body text-sm text-muted-foreground text-center max-w-xs">{message}</p>
  {/* Retry button with shadow */}
</div>
```

#### EmptyState

**Varijante:** `inbox`, `events`, `transport`, `generic`

**Ikone po varijanti:**
- inbox: `Inbox` (bg-primary)
- events: `Calendar` (bg-accent)
- transport: `Ship` (bg-secondary)
- generic: `FileQuestion` (bg-muted)

```tsx
<div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
  <div className="relative">
    <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground/20" />
    <div className={`relative w-20 h-20 border-4 border-foreground ${bgColor} 
      flex items-center justify-center -rotate-3`}>
      <Icon className="h-10 w-10 text-white" strokeWidth={2} />
    </div>
  </div>
  <h3 className="mt-6 font-display text-lg font-bold uppercase text-center">{title}</h3>
  <p className="mt-2 font-body text-sm text-muted-foreground text-center max-w-xs">{message}</p>
</div>
```

#### RateLimitWarning

**Normal state:**
```tsx
<div className="border-t-2 border-foreground pt-4">
  <p className="font-body text-xs text-center text-muted-foreground">
    Preostalo poruka danas: <span className="font-bold">{remaining}/{max}</span>
  </p>
</div>
```

**Low state (remaining <= 1):**
```tsx
className="text-destructive"
```

**Exhausted state (remaining === 0):**
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-destructive" />
  <div className="relative border-4 border-foreground bg-destructive/10 p-4">
    <AlertTriangle /> + title + description
  </div>
</div>
```

---

## LAYOUT KOMPONENTE

### MobileFrame

**Lokacija:** `src/components/layout/MobileFrame.tsx`

```tsx
<div className="min-h-screen bg-background">
  <div className="mx-auto max-w-md">
    {children}
  </div>
</div>
```

- `min-h-screen` - Minimalna visina = viewport
- `max-w-md` - Max width 448px (mobile)
- `mx-auto` - Centrirano horizontalno

---

### AppHeader

**Lokacija:** `src/components/layout/AppHeader.tsx`

#### Container
```tsx
<header className="sticky top-0 z-50 w-full border-b-4 border-foreground bg-background">
  <div className="flex h-16 items-center justify-between px-4">
```

#### Menu Button (Left)
```tsx
<button
  className="flex h-12 w-12 items-center justify-center 
    border-3 border-foreground bg-accent 
    transition-all 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
    active:translate-x-[2px] active:translate-y-[2px] 
    active:shadow-none"
  style={{ borderWidth: "3px" }}
>
  <Menu className="h-6 w-6" strokeWidth={3} />
</button>
```

#### Title (Center)
```tsx
<h1 className="font-display text-xl font-bold uppercase tracking-tight">
  {title}
</h1>
```

#### Inbox Button (Right)
```tsx
<button
  className="relative flex h-12 w-12 items-center justify-center 
    border-3 border-foreground bg-primary text-primary-foreground 
    transition-all 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
    active:translate-x-[2px] active:translate-y-[2px] 
    active:shadow-none"
  style={{ borderWidth: "3px" }}
>
  <Inbox className="h-6 w-6" strokeWidth={2.5} />
  {/* Notification badge */}
  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center 
    border-2 border-foreground bg-destructive 
    font-display text-[10px] font-bold text-destructive-foreground">
    3
  </span>
</button>
```

---

### MainMenu

**Lokacija:** `src/components/layout/MainMenu.tsx`

#### Backdrop
```tsx
<div className="fixed inset-0 z-40 bg-foreground/60" onClick={onClose} />
```

#### Menu Panel
```tsx
<nav className="fixed left-0 top-0 z-50 h-full w-[300px] max-w-[88vw] 
  bg-muted/30 flex flex-col border-r-4 border-foreground overflow-hidden">
```

#### Menu Header
```tsx
<div className="border-b-4 border-foreground bg-primary p-5">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="font-display text-2xl font-bold uppercase 
        leading-tight text-primary-foreground tracking-tight">
        Moj Vis
      </h2>
      <p className="mt-1 font-body text-xs text-primary-foreground/80">
        Izbornik
      </p>
    </div>
    {/* Close button with shadow */}
    <div className="relative">
      <div className="absolute inset-0 translate-x-1 translate-y-1 bg-foreground" />
      <button className="relative flex h-10 w-10 items-center justify-center 
        border-2 border-foreground bg-background 
        transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] 
        active:translate-x-0.5 active:translate-y-0.5">
        <X className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  </div>
</div>
```

#### Menu Items Container
```tsx
<div className="flex-1 overflow-y-auto p-4 bg-background border-b-4 border-foreground">
  <h3 className="mb-3 font-display text-xs font-bold uppercase 
    tracking-widest text-muted-foreground">
    Navigacija
  </h3>
  <div className="flex flex-col gap-2">
    {/* Menu items */}
  </div>
</div>
```

#### Menu Item
```tsx
<div className="relative">
  <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 
    ${isActive ? 'bg-primary' : 'bg-foreground/20'}`} />
  <button
    className={`relative flex w-full items-center gap-3 
      border-2 border-foreground p-3 text-left 
      transition-transform 
      hover:translate-x-[-1px] hover:translate-y-[-1px] 
      active:translate-x-1 active:translate-y-1 
      ${isActive ? "bg-accent" : "bg-background"}`}
  >
    {/* Icon box */}
    <div className={`flex h-10 w-10 items-center justify-center 
      border-2 border-foreground ${item.color} shrink-0`}>
      <item.icon className="h-5 w-5 text-foreground" strokeWidth={2} />
    </div>
    {/* Label */}
    <span className="flex-1 font-display text-sm font-bold uppercase tracking-tight">
      {t(item.labelKey)}
    </span>
    {/* Arrow */}
    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
  </button>
</div>
```

#### Menu Item Colors
```tsx
const menuItems = [
  { icon: Home, color: "bg-accent" },
  { icon: Calendar, color: "bg-primary" },
  { icon: Clock, color: "bg-secondary" },
  { icon: MessageSquare, color: "bg-lavender" },
  { icon: AlertTriangle, color: "bg-destructive" },
  { icon: Leaf, color: "bg-primary" },
  { icon: Fish, color: "bg-secondary" },
  { icon: Info, color: "bg-accent" },
  { icon: Settings, color: "bg-muted" },
];
```

#### Menu Footer
```tsx
<div className="p-4 bg-muted/30">
  <p className="font-body text-xs text-muted-foreground text-center">
    Općina Vis • v3.0
  </p>
</div>
```

---

## STRANICE

### Onboarding Stranice

#### OnboardingSplashPage

**Hero Section:**
```tsx
<div className="flex-1 flex flex-col items-center justify-center p-8 relative">
  {/* Background Pattern */}
  <div className="absolute inset-0 opacity-5">
    <div style={{
      backgroundImage: `repeating-linear-gradient(
        45deg,
        hsl(var(--border)),
        hsl(var(--border)) 2px,
        transparent 2px,
        transparent 20px
      )`
    }} />
  </div>

  {/* Logo Mark - layered boxes */}
  <div className="relative mb-8">
    <div className="w-32 h-32 bg-primary neo-border-heavy neo-shadow-lg 
      flex items-center justify-center">
      <MapPin size={64} strokeWidth={2.5} className="text-primary-foreground" />
    </div>
    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent neo-border-heavy" />
    <div className="absolute -top-2 -left-2 w-8 h-8 bg-secondary neo-border-heavy" />
  </div>

  {/* Title */}
  <h1 className="font-display font-bold text-5xl text-center mb-4 tracking-tight">
    MOJVIS
  </h1>

  {/* Tagline box */}
  <div className="bg-foreground neo-border-heavy px-6 py-3 mt-6">
    <p className="font-display font-bold text-background text-center">
      TVOJ GRAD. TVOJ GLAS.
    </p>
  </div>
</div>
```

**Language Selection:**
```tsx
<div className="p-6 bg-card neo-border-t">
  <div className="grid grid-cols-2 gap-4">
    <Button className="bg-primary text-primary-foreground neo-border-heavy neo-shadow 
      font-display text-lg py-6">
      HRVATSKI
    </Button>
    <Button className="bg-secondary text-secondary-foreground neo-border-heavy neo-shadow 
      font-display text-lg py-6">
      ENGLISH
    </Button>
  </div>
</div>
```

#### OnboardingModePage

**Mode Card Pattern:**
```tsx
<Card variant="flat" className={`neo-border-heavy neo-shadow neo-hover p-0 overflow-hidden 
  cursor-pointer ${isSelected ? "ring-4 ring-offset-2 ring-foreground" : ""}`}>
  {/* Header with color */}
  <div className={`${mode.color} p-4 flex items-center gap-4`}>
    <div className="w-14 h-14 bg-white/20 neo-border-heavy flex items-center justify-center">
      <Icon size={28} strokeWidth={2.5} className="text-white" />
    </div>
    <div className="flex-1">
      <h2 className="font-display font-bold text-xl text-white">{mode.title}</h2>
      <p className="font-body text-sm text-white/80">{mode.description}</p>
    </div>
    {isSelected && (
      <div className="w-8 h-8 bg-white neo-border flex items-center justify-center">
        <Check size={20} strokeWidth={3} />
      </div>
    )}
  </div>
  {/* Features list */}
  <div className="p-4 bg-card">
    <ul className="space-y-2">
      {mode.features.map((feature) => (
        <li className="flex items-center gap-2">
          <div className={`w-2 h-2 ${mode.color}`} />
          <span className="font-body text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
</Card>
```

**Progress Indicator:**
```tsx
<div className="flex gap-2">
  <div className="flex-1 h-2 bg-foreground neo-border" />
  <div className="flex-1 h-2 bg-foreground neo-border" />
</div>
<p className="font-body text-xs text-muted-foreground text-center mt-2">
  KORAK 2 OD 2
</p>
```

---

### HomePage

#### Notification Banner
```tsx
<button className="flex items-center gap-3 border-b-4 border-foreground 
  bg-accent p-4 text-left transition-colors hover:bg-accent/90">
  <div className="flex h-10 w-10 shrink-0 items-center justify-center 
    border-2 border-foreground bg-destructive">
    <AlertCircle className="h-5 w-5 text-destructive-foreground" strokeWidth={2.5} />
  </div>
  <div className="flex-1">
    <p className="font-display text-sm font-bold uppercase tracking-tight">{title}</p>
    <p className="font-body text-xs text-foreground/70">{subtitle}</p>
  </div>
  <Badge variant="destructive" className="uppercase border-2 border-foreground 
    font-display text-xs">
    New
  </Badge>
</button>
```

#### Greeting Block
```tsx
<section className="border-b-4 border-foreground bg-primary p-6">
  <h2 className="font-display text-3xl font-bold uppercase 
    leading-tight text-primary-foreground tracking-tight">
    Welcome to Vis!
  </h2>
  <p className="mt-2 font-body text-sm text-primary-foreground/80">
    Your island guide for events, transport & services
  </p>
</section>
```

#### Category Grid
```tsx
<section className="border-b-4 border-foreground bg-background p-5">
  <h3 className="mb-4 font-display text-xs font-bold uppercase 
    tracking-widest text-muted-foreground">
    Quick Access
  </h3>
  <div className="grid grid-cols-2 gap-3">
    {categoryItems.map((item) => (
      <div className="relative">
        <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
        <button className={`relative flex flex-col items-center justify-center gap-2 
          border-2 border-foreground ${item.color} ${item.textColor} p-5 w-full
          transition-transform 
          hover:translate-x-[-1px] hover:translate-y-[-1px] 
          active:translate-x-1 active:translate-y-1`}>
          <item.icon className="h-7 w-7" strokeWidth={2} />
          <span className="font-display text-sm font-bold uppercase">{item.label}</span>
        </button>
      </div>
    ))}
  </div>
</section>
```

#### Event List Item
```tsx
<div className="relative">
  <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 
    ${index === 0 ? 'bg-primary' : 'bg-foreground/20'}`} />
  <button className={`relative flex items-center gap-3 border-2 border-foreground 
    p-3 text-left w-full transition-transform 
    hover:translate-x-[-1px] hover:translate-y-[-1px] 
    active:translate-x-1 active:translate-y-1 
    ${index === 0 ? "bg-accent" : "bg-background"}`}>
    {/* Date box */}
    <div className="flex h-12 w-12 flex-col items-center justify-center 
      border-2 border-foreground bg-primary text-primary-foreground shrink-0">
      <span className="font-display text-lg font-bold leading-none">{day}</span>
      <span className="font-body text-[10px] uppercase">{month}</span>
    </div>
    {/* Content */}
    <div className="flex-1 min-w-0">
      <h4 className="font-display text-sm font-bold uppercase tracking-tight truncate">
        {title}
      </h4>
      <p className="font-body text-xs text-muted-foreground">{location}</p>
    </div>
    <span className="font-display text-sm font-bold text-muted-foreground shrink-0">
      {time}
    </span>
  </button>
</div>
```

#### CTA Block
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <button className="relative flex w-full items-center gap-4 
    border-2 border-foreground bg-secondary p-4 text-left 
    transition-transform 
    hover:translate-x-[-1px] hover:translate-y-[-1px] 
    active:translate-x-1 active:translate-y-1">
    <div className="flex h-12 w-12 items-center justify-center 
      border-2 border-foreground bg-background shrink-0">
      <MessageSquare className="h-6 w-6" strokeWidth={2} />
    </div>
    <div className="flex-1">
      <h4 className="font-display text-base font-bold uppercase tracking-tight">
        Share Your Thoughts
      </h4>
      <p className="font-body text-xs text-secondary-foreground/70">
        Ideas, suggestions & feedback
      </p>
    </div>
    <ArrowRight className="h-5 w-5 shrink-0" />
  </button>
</div>
```

---

### InboxPage

#### Tab Bar
```tsx
<div className="flex border-b-4 border-foreground">
  <button className={`flex flex-1 items-center justify-center gap-2 
    border-r-3 border-foreground p-4 
    font-display text-sm font-bold uppercase tracking-wide 
    ${isActive ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
    style={{ borderRightWidth: "3px" }}>
    <Bell className="h-5 w-5" strokeWidth={2.5} />
    {t("received")}
  </button>
  <button className={`flex flex-1 items-center justify-center gap-2 p-4 
    font-display text-sm font-bold uppercase tracking-wide 
    ${isActive ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
    <Send className="h-5 w-5" strokeWidth={2.5} />
    {t("sent")}
  </button>
</div>
```

#### Message List Item
```tsx
<button className={`flex gap-4 border-b-3 border-foreground p-4 text-left 
  transition-all hover:bg-muted 
  ${!msg.isRead ? "bg-accent/20" : "bg-background"}`}
  style={{ borderBottomWidth: "3px" }}>
  {/* Icon */}
  <div className={`flex h-12 w-12 shrink-0 items-center justify-center 
    border-3 border-foreground 
    ${msg.isEmergency ? "bg-destructive text-destructive-foreground" : bgColor}`} 
    style={{ borderWidth: "3px" }}>
    <Icon className="h-6 w-6" strokeWidth={2.5} />
  </div>
  {/* Content */}
  <div className="flex-1 overflow-hidden">
    <div className="flex items-start justify-between gap-2">
      <h4 className={`font-display text-sm uppercase truncate 
        ${!msg.isRead ? "font-bold" : "font-medium"}`}>
        {msg.title}
      </h4>
      {!msg.isRead && (
        <Badge variant="destructive" className="shrink-0 uppercase text-[10px]">
          New
        </Badge>
      )}
    </div>
    <p className="mt-1 truncate font-body text-xs text-muted-foreground">
      {msg.preview}
    </p>
    <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-wider 
      text-muted-foreground">
      {msg.date} • {msg.time}
    </p>
  </div>
  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
</button>
```

#### Type Colors
```tsx
const typeColors = {
  notice: "bg-accent",
  reminder: "bg-primary",
  reply: "bg-secondary",
  feedback: "bg-lavender",
  click_fix: "bg-orange",
};
```

---

### InboxDetailPage

#### Emergency Header
```tsx
<div className={`border-b-2 border-foreground p-5 
  ${isEmergency ? "bg-destructive/10" : "bg-background"}`}>
  {isEmergency && (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center 
      border-2 border-foreground bg-destructive">
      <AlertCircle className="h-5 w-5 text-destructive-foreground" />
    </div>
  )}
  <h1 className="font-display text-xl font-bold">{title}</h1>
</div>
```

#### Location Bar
```tsx
<div className="flex items-center gap-3 border-b-2 border-foreground bg-muted p-4">
  <MapPin className="h-5 w-5 text-muted-foreground" />
  <span className="font-body text-sm">{location}</span>
</div>
```

#### Content
```tsx
<div className="p-5">
  <p className="whitespace-pre-line font-body text-base leading-relaxed">
    {content}
  </p>
</div>
```

#### Active Period Box
```tsx
<div className="mt-5 border-4 border-foreground bg-destructive/15 p-4">
  <div className="flex items-center gap-2 mb-2">
    <Calendar className="h-4 w-4 text-muted-foreground" />
    <span className="font-display text-xs font-bold uppercase tracking-widest 
      text-muted-foreground">
      Notice Active Period
    </span>
  </div>
  <div className="flex items-center gap-3 font-body text-sm">
    <span className="font-bold">From:</span><span>{from}</span>
    <span className="text-muted-foreground">—</span>
    <span className="font-bold">To:</span><span>{to}</span>
  </div>
</div>
```

#### Admin Reply Box
```tsx
<div className="border-t-2 border-foreground bg-secondary/30 p-5">
  <div className="flex items-center gap-2 mb-3">
    <MessageSquare className="h-5 w-5" />
    <h3 className="font-display font-bold">Admin Reply</h3>
  </div>
  <p className="font-body text-base leading-relaxed">{content}</p>
  <p className="mt-3 font-body text-xs text-muted-foreground">{date} • {time}</p>
</div>
```

---

### EventsCalendarPage

#### Calendar Header
```tsx
<div className="border-b-4 border-foreground bg-primary p-5">
  <h2 className="font-display text-2xl font-bold uppercase text-primary-foreground">
    Events
  </h2>
  <p className="mt-1 font-body text-xs uppercase tracking-widest 
    text-primary-foreground/80">
    Discover what is happening
  </p>
</div>
```

#### Month Navigation
```tsx
<div className="mb-4 flex items-center justify-between">
  <button className="flex h-11 w-11 items-center justify-center 
    border-3 border-foreground bg-background 
    transition-all 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] 
    active:translate-x-[2px] active:translate-y-[2px] 
    active:shadow-none"
    style={{ borderWidth: "3px" }}>
    <ChevronLeft className="h-6 w-6" strokeWidth={3} />
  </button>
  <h3 className="font-display text-lg font-bold uppercase tracking-wide">
    {month} {year}
  </h3>
  <button>...</button>
</div>
```

#### Week Days Header
```tsx
<div className="mb-2 grid grid-cols-7 gap-1">
  {weekDays.map((day) => (
    <div className="py-2 text-center font-display text-xs font-bold uppercase 
      text-muted-foreground">
      {day}
    </div>
  ))}
</div>
```

#### Calendar Day Cell
```tsx
<button className={`relative aspect-square flex items-center justify-center 
  border-2 font-display text-sm font-bold transition-all 
  ${isSelected 
    ? "border-foreground bg-primary text-primary-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))]"
    : isToday
    ? "border-foreground bg-accent"
    : hasEvent
    ? "border-foreground bg-secondary/50 hover:bg-secondary"
    : "border-transparent hover:border-foreground hover:bg-muted"
  }`}>
  {day}
  {hasEvent && !isSelected && (
    <span className="absolute bottom-1 h-1.5 w-1.5 bg-primary" />
  )}
</button>
```

#### Empty Day State
```tsx
<div className="border-3 border-dashed border-muted-foreground p-8 text-center" 
  style={{ borderWidth: "3px" }}>
  <p className="font-display text-sm uppercase text-muted-foreground">
    No events for this day
  </p>
</div>
```

#### Event Card
```tsx
<button className="flex items-center gap-4 border-3 border-foreground bg-background 
  p-4 text-left transition-all 
  hover:translate-x-[-2px] hover:translate-y-[-2px] 
  hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] 
  active:translate-x-[2px] active:translate-y-[2px] 
  active:shadow-none"
  style={{ borderWidth: "3px" }}>
  <div className="flex-1">
    <h4 className="font-display font-bold uppercase">{title}</h4>
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-4 w-4" strokeWidth={2.5} />
        <span className="font-body">{time}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-4 w-4" strokeWidth={2.5} />
        <span className="font-body">{location}</span>
      </div>
    </div>
  </div>
  <ArrowRight className="h-5 w-5 text-muted-foreground" strokeWidth={3} />
</button>
```

---

### EventDetailPage

#### Hero Pattern
```tsx
<div className="relative aspect-[16/10] w-full border-b-4 border-foreground bg-primary"
  style={{
    backgroundImage: `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      hsl(var(--primary-foreground) / 0.1) 20px,
      hsl(var(--primary-foreground) / 0.1) 40px
    )`
  }}>
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="font-display text-7xl font-bold uppercase 
      text-primary-foreground/20">
      VIS
    </span>
  </div>
  <div className="absolute bottom-4 left-4">
    <Badge variant="accent">Featured</Badge>
  </div>
</div>
```

#### Title Block
```tsx
<div className="border-b-4 border-foreground bg-accent p-5">
  <h1 className="font-display text-2xl font-bold uppercase">{title}</h1>
</div>
```

#### Info Grid
```tsx
<div className="grid grid-cols-2 border-b-4 border-foreground">
  {/* Date */}
  <div className="flex items-center gap-3 border-b-3 border-r-3 border-foreground p-4">
    <div className="flex h-11 w-11 items-center justify-center 
      border-2 border-foreground bg-primary text-primary-foreground">
      <Calendar className="h-5 w-5" strokeWidth={2.5} />
    </div>
    <div>
      <p className="font-display text-sm font-bold">{date}</p>
      <p className="font-body text-[10px] uppercase tracking-wider 
        text-muted-foreground">Date</p>
    </div>
  </div>
  {/* Time */}
  <div className="flex items-center gap-3 border-b-3 border-foreground p-4">
    <div className="flex h-11 w-11 items-center justify-center 
      border-2 border-foreground bg-secondary text-secondary-foreground">
      <Clock className="h-5 w-5" strokeWidth={2.5} />
    </div>
    <div>...</div>
  </div>
</div>
```

#### Fixed Bottom Actions
```tsx
<div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md 
  flex gap-3 border-t-4 border-foreground bg-background p-4">
  <Button variant={hasReminder ? "secondary" : "outline"} size="lg" className="flex-1 uppercase">
    {hasReminder ? <Check /> : <Bell />}
    {hasReminder ? "Set!" : "Remind"}
  </Button>
  <Button variant="accent" size="lg" className="flex-1 uppercase">
    <Share2 />
    Share
  </Button>
</div>
```

---

### TransportPage

#### Transport Type Card
```tsx
<button className={`w-full ${type.color} neo-border-heavy neo-shadow-lg neo-hover 
  p-0 overflow-hidden`}>
  <div className="flex items-center">
    <div className="w-24 h-24 bg-white/10 flex items-center justify-center 
      border-r-[3px] border-foreground">
      <Icon size={48} strokeWidth={2} className="text-white" />
    </div>
    <div className="flex-1 p-4 text-left">
      <p className="font-display font-bold text-xl text-white">{label}</p>
      <p className="font-body text-sm text-white/80">{sublabel}</p>
    </div>
    <ChevronRight size={28} strokeWidth={2.5} className="text-white mr-4" />
  </div>
</button>
```

---

### TransportSeaPage / TransportRoadPage

#### Section Header
```tsx
<section className="border-b-4 border-foreground bg-primary p-5">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-background border-4 border-foreground 
      flex items-center justify-center -rotate-3">
      <Ship size={28} strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="font-display text-2xl font-bold uppercase text-primary-foreground">
        Pomorske linije
      </h1>
      <p className="font-body text-xs text-primary-foreground/80 uppercase tracking-widest">
        Trajekti i katamarani
      </p>
    </div>
  </div>
</section>
```

#### Section Label
```tsx
<h2 className="font-display font-bold text-xs uppercase tracking-widest 
  text-muted-foreground mb-4 border-b-2 border-foreground pb-2">
  Linije
</h2>
```

#### Line Card
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <button className="relative w-full bg-background border-4 border-foreground p-0 text-left 
    transition-all 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    active:translate-x-1 active:translate-y-1">
    {/* Title bar */}
    <div className={`w-full px-4 py-3 border-b-4 border-foreground 
      flex items-center justify-between 
      ${type === "ferry" ? "bg-primary" : "bg-teal"}`}>
      <div className="flex items-center gap-3">
        <Ship size={22} strokeWidth={2.5} className="text-white flex-shrink-0" />
        <p className="font-display font-bold text-base uppercase text-white">{name}</p>
      </div>
      <div className="w-8 h-8 border-2 border-white/50 bg-white/20 
        flex items-center justify-center flex-shrink-0">
        <ChevronRight size={18} strokeWidth={3} className="text-white" />
      </div>
    </div>
    {/* Details row */}
    <div className="px-4 py-3">
      <div className="flex items-center gap-4 mb-2">
        <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
          <Clock size={12} strokeWidth={2.5} />
          {duration}
        </span>
        <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
          <MapPin size={12} strokeWidth={2.5} />
          {stops.length} luke
        </span>
      </div>
      <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
        {stops.join(" → ")}
      </p>
    </div>
  </button>
</div>
```

#### Today's Departures
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <div className="relative bg-background border-4 border-foreground max-h-64 overflow-y-auto">
    {departures.map((departure, i) => (
      <div className={`flex items-center gap-4 p-3 
        ${i !== last ? 'border-b-2 border-foreground' : ''}`}>
        {/* Time box */}
        <div className={`w-16 h-10 border-3 border-foreground 
          flex items-center justify-center 
          ${type === "ferry" ? "bg-primary" : "bg-teal"}`}
          style={{ borderWidth: "3px" }}>
          <span className="font-display font-bold text-sm text-primary-foreground">
            {time}
          </span>
        </div>
        {/* Content */}
        <div className="flex-1">
          <p className="font-display font-bold text-sm">{line}</p>
          <p className="font-body text-xs text-muted-foreground">{direction}</p>
        </div>
        {/* Type badge */}
        <span className={`px-2 py-1 text-[10px] font-display font-bold uppercase 
          border-2 border-foreground ${type === "ferry" ? "bg-primary/20" : "bg-teal/20"}`}>
          {type === "ferry" ? "Trajekt" : "Katamaran"}
        </span>
      </div>
    ))}
  </div>
</div>
```

#### Contact Card
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary" />
  <button className="relative w-full bg-background border-4 border-foreground p-4 text-left 
    transition-all 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    active:translate-x-1 active:translate-y-1">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-accent border-4 border-foreground 
        flex items-center justify-center rotate-3">
        <Phone size={24} strokeWidth={2.5} />
      </div>
      <div className="flex-1">
        <p className="font-display font-bold uppercase">{name}</p>
        <p className="font-body text-sm text-muted-foreground">{phone}</p>
      </div>
    </div>
  </button>
</div>
```

---

### FeedbackPage

#### Page Header
```tsx
<section className="border-b-4 border-foreground bg-lavender p-5">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-background border-4 border-foreground 
      flex items-center justify-center -rotate-3">
      <MessageSquare size={28} strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="font-display text-2xl font-bold uppercase">
        Povratne informacije
      </h1>
      <p className="font-body text-xs uppercase tracking-widest">
        Ideje • Prijedlozi • Pohvale
      </p>
    </div>
  </div>
</section>
```

#### Form Section Label
```tsx
<h2 className="font-display font-bold text-xs text-muted-foreground mb-3 
  uppercase tracking-widest border-b-2 border-foreground pb-2">
  1. Vrsta poruke <span className="text-destructive">*</span>
</h2>
```

#### Feedback Type Selector
```tsx
<div className="grid grid-cols-2 gap-3">
  {feedbackTypes.map((type) => (
    <div className="relative">
      <div className={`absolute inset-0 translate-x-2 translate-y-2 
        ${isSelected ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
      <button className={`relative w-full border-4 border-foreground p-4 
        flex flex-col items-center gap-2 transition-all 
        hover:translate-x-[-2px] hover:translate-y-[-2px] 
        active:translate-x-1 active:translate-y-1 
        ${isSelected ? type.color : "bg-background"}`}>
        <Icon size={28} strokeWidth={2.5} 
          className={isSelected ? "text-white" : "text-foreground"} />
        <span className={`font-display font-bold text-xs 
          ${isSelected ? "text-white" : "text-foreground"}`}>
          {type.label}
        </span>
      </button>
    </div>
  ))}
</div>
```

**Feedback Types:**
- `idea` → "NOVA IDEJA" → `Lightbulb` → `bg-accent`
- `suggestion` → "PRIJEDLOG" → `MessageSquare` → `bg-primary`
- `criticism` → "KRITIKA" → `ThumbsDown` → `bg-destructive`
- `praise` → "POHVALA" → `ThumbsUp` → `bg-secondary`

#### Confirmation Screen
```tsx
<div className="min-h-screen flex flex-col items-center justify-center p-8">
  <div className="w-24 h-24 bg-secondary neo-border-heavy neo-shadow-lg 
    flex items-center justify-center mb-8">
    <Check size={48} strokeWidth={3} className="text-secondary-foreground" />
  </div>
  <h1 className="font-display font-bold text-3xl text-center mb-4">
    {t("messageSent").toUpperCase()}
  </h1>
  <p className="font-body text-muted-foreground text-center mb-8">
    {t("messageSentDesc")}
  </p>
  <Button size="lg" className="bg-primary text-primary-foreground 
    neo-border-heavy neo-shadow font-display text-lg py-6 px-8">
    <Home size={24} strokeWidth={2.5} className="mr-3" />
    {t("returnHome").toUpperCase()}
  </Button>
</div>
```

---

### ClickFixPage

#### Page Header
```tsx
<section className="border-b-4 border-foreground bg-orange p-5">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-background border-4 border-foreground 
      flex items-center justify-center -rotate-3">
      <MapPin size={28} strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="font-display text-2xl font-bold uppercase text-foreground">
        Klikni & Popravi
      </h1>
      <p className="font-body text-xs uppercase tracking-widest text-foreground/80">
        Prijavi problem na otoku
      </p>
    </div>
  </div>
</section>
```

#### Location Selected State
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary" />
  <div className="relative bg-background border-4 border-foreground p-4">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-primary flex items-center justify-center 
        border-4 border-foreground rotate-3">
        <MapPin size={28} strokeWidth={3} className="text-primary-foreground" />
      </div>
      <div className="flex-1">
        <p className="font-display font-bold">{location.label}</p>
        <p className="font-body text-xs text-muted-foreground">
          {lat}, {lng}
        </p>
      </div>
      <button className="w-10 h-10 bg-muted border-3 border-foreground 
        flex items-center justify-center 
        hover:bg-destructive hover:text-white transition-colors"
        style={{ borderWidth: "3px" }}>
        <X size={20} strokeWidth={2.5} />
      </button>
    </div>
  </div>
</div>
```

#### Photo Grid
```tsx
<div className="grid grid-cols-3 gap-3">
  {photos.map((photo, index) => (
    <div className="relative aspect-square bg-muted border-4 border-foreground 
      flex items-center justify-center">
      <Camera size={24} className="text-muted-foreground" />
      <button className="absolute -top-2 -right-2 w-7 h-7 bg-destructive 
        border-3 border-foreground flex items-center justify-center"
        style={{ borderWidth: "3px" }}>
        <X size={14} strokeWidth={3} className="text-destructive-foreground" />
      </button>
    </div>
  ))}
  {/* Add button */}
  <button className="aspect-square bg-background border-4 border-foreground 
    flex flex-col items-center justify-center gap-2 transition-all 
    hover:translate-x-[-2px] hover:translate-y-[-2px] 
    hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] 
    active:translate-x-1 active:translate-y-1">
    <Camera size={28} strokeWidth={2} className="text-muted-foreground" />
    <span className="font-display text-[10px] font-bold text-muted-foreground">
      DODAJ
    </span>
  </button>
</div>
```

#### Character Counter
```tsx
<p className={`font-body text-xs mt-2 
  ${description.length >= 15 ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
  {description.length}/15 znakova (minimum)
</p>
```

#### Warning Dialog
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <div className="relative bg-accent border-4 border-foreground p-4">
    <p className="font-display font-bold mb-2 uppercase">Nema fotografija</p>
    <p className="font-body text-sm mb-4">
      Jesi li siguran/na? Prijave s fotografijama imaju veću šansu za rješavanje.
    </p>
    <div className="flex gap-3">
      <Button className="flex-1 border-3 border-foreground font-display 
        bg-background text-foreground hover:bg-muted">
        DODAJ FOTO
      </Button>
      <Button className="flex-1 bg-foreground text-background 
        border-3 border-foreground font-display">
        POŠALJI SVEJEDNO
      </Button>
    </div>
  </div>
</div>
```

---

### SettingsPage

#### Setting Card
```tsx
<Card variant="flat" className="neo-border-heavy p-4">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 bg-primary neo-border flex items-center justify-center">
      <Globe size={20} strokeWidth={2.5} className="text-primary-foreground" />
    </div>
    <div>
      <h3 className="font-display font-bold uppercase">{title}</h3>
      <p className="font-body text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  {/* Options */}
</Card>
```

#### Option Button
```tsx
<button className={`neo-border-heavy p-3 flex items-center justify-center gap-2 
  transition-all 
  ${isSelected ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
  <span className="font-display font-bold text-sm">{label.toUpperCase()}</span>
  {isSelected && <Check size={16} strokeWidth={3} />}
</button>
```

#### Full-width Option
```tsx
<button className={`w-full neo-border-heavy p-4 flex items-center gap-4 
  transition-all text-left 
  ${isSelected ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}>
  <div className="flex-1">
    <p className="font-display font-bold">{title}</p>
    <p className={`font-body text-xs 
      ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
      {description}
    </p>
  </div>
  {isSelected && <Check size={20} strokeWidth={3} />}
</button>
```

---

## INTERAKCIJE I ANIMACIJE

### Neobrutalist Hover Effect
```tsx
className="transition-all 
  hover:translate-x-[-2px] hover:translate-y-[-2px] 
  hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
  active:translate-x-[2px] active:translate-y-[2px] 
  active:shadow-none"
```

### Subtler Hover (za manje elemente)
```tsx
className="transition-transform 
  hover:translate-x-[-1px] hover:translate-y-[-1px] 
  active:translate-x-1 active:translate-y-1"
```

### External Shadow Pattern
```tsx
<div className="relative">
  {/* Shadow layer */}
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  {/* Content layer */}
  <div className="relative bg-background border-4 border-foreground">
    {content}
  </div>
</div>
```

### Color Shadow Variants
- `bg-foreground` → Black shadow (default)
- `bg-primary` → Blue shadow
- `bg-secondary` → Green shadow
- `bg-foreground/20` → Subtle shadow

### Loading Animation
```tsx
<div className="animate-pulse" />
<Loader2 className="animate-spin" />
```

---

## IKONE

### Lucide React Icons

Sve ikone dolaze iz `lucide-react` biblioteke.

#### Global Settings
- **Default strokeWidth:** 2 ili 2.5
- **Bold strokeWidth:** 3
- **Sizes:** 
  - Small: `h-4 w-4` (12-16px)
  - Medium: `h-5 w-5` (20px)
  - Large: `h-6 w-6` (24px)
  - XL: `h-7 w-7` (28px)
  - Hero: `size={48}` do `size={64}`

#### Icon Box Pattern
```tsx
<div className="flex h-12 w-12 items-center justify-center 
  border-2 border-foreground bg-{color}">
  <Icon className="h-6 w-6" strokeWidth={2.5} />
</div>
```

#### Tilted Icon Box
```tsx
<div className="w-14 h-14 bg-background border-4 border-foreground 
  flex items-center justify-center -rotate-3">
  <Icon size={28} strokeWidth={2.5} />
</div>
```

```tsx
<div className="w-14 h-14 bg-primary flex items-center justify-center 
  border-4 border-foreground rotate-3">
  <Icon size={28} strokeWidth={3} className="text-primary-foreground" />
</div>
```

#### Common Icons by Context

| Context | Icons |
|---------|-------|
| Navigation | `Menu`, `X`, `ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight` |
| Inbox | `Inbox`, `Bell`, `Send`, `MessageSquare` |
| Events | `Calendar`, `Clock`, `MapPin`, `Users` |
| Transport | `Ship`, `Bus`, `Anchor`, `Phone` |
| Feedback | `Lightbulb`, `MessageSquare`, `ThumbsUp`, `ThumbsDown` |
| ClickFix | `Camera`, `MapPin`, `AlertTriangle` |
| Actions | `Check`, `Share2`, `Home`, `Settings` |
| States | `Loader2`, `AlertCircle`, `AlertTriangle`, `FileQuestion` |

---

## ZAKLJUČAK

Ovaj dokument definira sve vizualne i interaktivne elemente MOJ VIS V1 dizajn sustava. Ključne karakteristike:

1. **Neobrutalist stil** - Debeli obrubi (3-4px), hard shadows, sharp corners
2. **Mediteranska paleta** - Plava, zelena, žuta, terakota
3. **Typography sistem** - Space Grotesk za display, Space Mono za body
4. **Konzistentne interakcije** - Translate + shadow hover efekti
5. **Modularni pristup** - Reusable components i patterns

Za V2 verziju, ovi principi ostaju isti, ali s fresh interpretacijom istog stila.