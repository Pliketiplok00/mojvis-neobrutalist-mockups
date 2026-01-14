# MOJ VIS – COMPLETE V1 DESIGN SYSTEM

> **Theme:** Neobrutalist Mediterranean  
> **Version:** 1.0.0  
> **Last Updated:** January 2026

This document is the **single source of truth** for all visual design elements in the MOJ VIS V1 application. It covers colors, typography, spacing, components, layouts, animations, and page-specific patterns.

---

## TABLE OF CONTENTS

1. [Design Philosophy](#1-design-philosophy)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Borders & Shadows](#5-borders--shadows)
6. [Icons](#6-icons)
7. [Core Components](#7-core-components)
8. [Layout Components](#8-layout-components)
9. [Form Components](#9-form-components)
10. [State Components](#10-state-components)
11. [List Patterns](#11-list-patterns)
12. [Card Patterns](#12-card-patterns)
13. [Page Headers](#13-page-headers)
14. [Navigation Patterns](#14-navigation-patterns)
15. [Banners & Notifications](#15-banners--notifications)
16. [Calendar & Date Patterns](#16-calendar--date-patterns)
17. [Interactive Patterns](#17-interactive-patterns)
18. [Confirmation & Success Patterns](#18-confirmation--success-patterns)
19. [Page Specifications](#19-page-specifications)
20. [Animations & Transitions](#20-animations--transitions)
21. [Utility Classes](#21-utility-classes)
22. [Quick Reference](#22-quick-reference)

---

## 1. DESIGN PHILOSOPHY

### Neobrutalist Principles
- **Structure must be visible** – Heavy borders, clear boundaries, no hidden elements
- **Flat colors without gradients** – Pure, solid colors only
- **Hard shadows** – Offset shadows with NO blur (0px blur)
- **Sharp corners** – `border-radius: 0px` everywhere
- **Bold typography** – Uppercase, tracked, display fonts for labels

### Mediterranean Palette Inspiration
- Warm cream backgrounds (sand/limestone)
- Mediterranean blue (Adriatic sea)
- Olive green (island vegetation)
- Sun yellow (highlight & accent)
- Terracotta red (rooftops, alerts)

---

## 2. COLOR SYSTEM

### 2.1 CSS Variables (HSL Format)

All colors are defined in `src/index.css`:

```css
:root {
  /* Core Background & Foreground */
  --background: 45 30% 96%;        /* Warm cream/sand */
  --foreground: 220 20% 10%;       /* Near-black */
  
  /* Card & Popover */
  --card: 45 25% 98%;              /* Lighter cream */
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
  
  /* Extended Mediterranean Palette */
  --terracotta: 12 55% 50%;
  --lavender: 270 35% 70%;
  --orange: 25 85% 55%;
  --teal: 180 45% 42%;
  --pink: 350 50% 65%;
  
  /* Border & Input */
  --border: 220 20% 10%;           /* Pure black borders */
  --input: 45 25% 98%;
  --ring: 210 80% 45%;
  
  /* Sizing */
  --border-width: 2px;
  --border-heavy: 3px;
  --shadow-offset: 4px;
  --shadow-offset-lg: 6px;
  --radius: 0px;                   /* Sharp corners - true brutalist */
  --radius-soft: 4px;
}
```

### 2.2 Tailwind Color Classes

| Token | Class | Usage |
|-------|-------|-------|
| Primary | `bg-primary`, `text-primary` | Main actions, headers, links |
| Secondary | `bg-secondary`, `text-secondary` | Support actions, transport sea |
| Accent | `bg-accent`, `text-accent` | Highlights, today's date, menu |
| Destructive | `bg-destructive`, `text-destructive` | Errors, emergencies, delete |
| Muted | `bg-muted`, `text-muted-foreground` | Disabled, meta text, backgrounds |
| Terracotta | `bg-terracotta` | Alternative to destructive |
| Lavender | `bg-lavender` | Feedback section |
| Orange | `bg-orange` | Click-Fix section |
| Teal | `bg-teal` | Catamaran transport |
| Pink | `bg-pink` | Decorative accents |

### 2.3 Color Usage by Feature

| Feature | Primary Color | Secondary Color |
|---------|--------------|-----------------|
| Header | `bg-background` | `bg-primary` (inbox button) |
| Home | `bg-primary` (greeting) | `bg-accent` (categories) |
| Events | `bg-primary` | `bg-accent` (today marker) |
| Transport Sea | `bg-primary` (ferry) | `bg-teal` (catamaran) |
| Transport Road | `bg-secondary` | `bg-muted` |
| Feedback | `bg-lavender` | Various per type |
| Click-Fix | `bg-orange` | `bg-primary` (location) |
| Inbox | `bg-primary` (tabs) | Per message type |
| Settings | `bg-muted` | `bg-primary` (selected) |

---

## 3. TYPOGRAPHY

### 3.1 Font Families

```css
--font-display: "Space Grotesk", system-ui, sans-serif;
--font-body: "Space Mono", monospace;
```

**Package Dependencies:**
- `@fontsource/space-grotesk` (^5.2.10)
- `@fontsource/space-mono` (^5.2.9)

### 3.2 Font Usage Rules

| Context | Font | Class |
|---------|------|-------|
| Headings (h1-h6) | Space Grotesk | `font-display` |
| Buttons & Labels | Space Grotesk | `font-display font-bold uppercase` |
| Body text | Space Mono | `font-body` |
| Descriptions | Space Mono | `font-body text-muted-foreground` |
| Meta/Timestamps | Space Mono | `font-body text-[10px] uppercase tracking-wider` |

### 3.3 Text Styles Reference

```tsx
/* Page Titles */
h1: "font-display text-5xl font-bold uppercase tracking-tight"
h1: "font-display text-3xl font-bold uppercase tracking-tight"  // Mobile

/* Section Titles */
h2: "font-display text-2xl font-bold uppercase tracking-tight"

/* Card Titles */
h3: "font-display text-xl font-bold uppercase"

/* List Item Titles */
h4: "font-display text-sm font-bold uppercase tracking-tight"

/* Section Labels */
.section-label: "font-display text-xs font-bold uppercase tracking-widest text-muted-foreground"

/* Body Text */
.body: "font-body text-base leading-relaxed"
.body-sm: "font-body text-sm"
.body-xs: "font-body text-xs text-muted-foreground"

/* Meta Text */
.meta: "font-body text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
```

### 3.4 Letter Spacing

| Style | Tailwind Class | Use Case |
|-------|----------------|----------|
| Tight | `tracking-tight` | Large headings, app title |
| Normal | (default) | Body text |
| Wide | `tracking-wide` | Badges, status labels |
| Widest | `tracking-widest` | Section labels, meta text |

---

## 4. SPACING & LAYOUT

### 4.1 Base Spacing Scale

Tailwind's default scale is used. Key values:

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `p-1`, `gap-1` | Icon spacing |
| sm | 8px | `p-2`, `gap-2` | Compact elements |
| md | 12px | `p-3`, `gap-3` | List items, cards |
| lg | 16px | `p-4`, `gap-4` | Sections, containers |
| xl | 20px | `p-5`, `gap-5` | Page padding, large cards |
| 2xl | 32px | `p-8`, `gap-8` | Hero sections |

### 4.2 Container Widths

```tsx
/* MobileFrame wrapper */
max-w-md  // 448px - Mobile app container

/* Tailwind container config */
screens: {
  "sm": "640px",
  "md": "768px",
  "lg": "1024px",
  "xl": "1280px",
}
```

### 4.3 Component Heights

| Component | Height | Tailwind |
|-----------|--------|----------|
| Header | 64px | `h-16` |
| Button default | 44px | `h-11` |
| Button sm | 36px | `h-9` |
| Button lg | 48px | `h-12` |
| Button xl | 56px | `h-14` |
| Input | 44px | `h-11` |
| Icon button | 48x48px | `h-12 w-12` |
| Menu icon box | 40x40px | `h-10 w-10` |
| Date box | 48x48px | `h-12 w-12` |

### 4.4 Grid Layouts

```tsx
/* 2-column grid */
"grid grid-cols-2 gap-3"

/* Category grid */
"grid grid-cols-2 gap-3"

/* Photo grid */
"grid grid-cols-3 gap-3"

/* Calendar grid */
"grid grid-cols-7 gap-1"
```

---

## 5. BORDERS & SHADOWS

### 5.1 Border Widths

| Type | Width | Tailwind/Style |
|------|-------|----------------|
| Standard | 2px | `border-2` |
| Heavy | 3px | `style={{ borderWidth: "3px" }}` |
| Extra Heavy | 4px | `border-4` |

**Note:** Tailwind only goes up to `border-2` by default. Use inline styles for 3px borders.

### 5.2 Border Patterns

```tsx
/* Standard component border */
"border-2 border-foreground"

/* Heavy border (3px) */
className="border-3 border-foreground" 
style={{ borderWidth: "3px" }}

/* Section divider */
"border-b-4 border-foreground"

/* Card with all sides */
"border-4 border-foreground"

/* Dashed border (empty states) */
"border-3 border-dashed border-muted-foreground"
```

### 5.3 Shadow System

All shadows are hard (0 blur), offset diagonally.

```css
/* Tailwind config shadows */
shadow-neo: "4px 4px 0 0 hsl(var(--border))"
shadow-neo-lg: "6px 6px 0 0 hsl(var(--border))"
shadow-neo-primary: "4px 4px 0 0 hsl(var(--primary))"
shadow-neo-accent: "4px 4px 0 0 hsl(var(--accent))"
shadow-neo-secondary: "4px 4px 0 0 hsl(var(--secondary))"
```

### 5.4 External Shadow Pattern (Layered)

For prominent elements, use a separate div as shadow:

```tsx
<div className="relative">
  {/* Shadow layer */}
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  {/* Content layer */}
  <div className="relative bg-background border-4 border-foreground">
    {/* content */}
  </div>
</div>
```

**Shadow color variants:**
- `bg-foreground` – Black (default)
- `bg-primary` – Blue
- `bg-secondary` – Green
- `bg-foreground/20` – Subtle/inactive

---

## 6. ICONS

### 6.1 Icon Library

**Package:** `lucide-react` (^0.462.0)

### 6.2 Icon Sizing

| Size | Dimensions | Tailwind | Usage |
|------|------------|----------|-------|
| xs | 12px | `h-3 w-3` | Decorative dots |
| sm | 16px | `h-4 w-4` | Meta icons, arrows |
| md | 20px | `h-5 w-5` | List items, buttons |
| lg | 24px | `h-6 w-6` | Header actions |
| xl | 28px | `h-7 w-7` or `size={28}` | Section headers |
| hero | 48-64px | `size={48}` | Splash screens |

### 6.3 Stroke Width

| Context | strokeWidth | Usage |
|---------|-------------|-------|
| Default | 2 | Most icons |
| Medium | 2.5 | Prominent icons, buttons |
| Bold | 3 | Header menu, navigation |

### 6.4 Icon Box Pattern

```tsx
/* Standard icon box */
<div className="flex h-12 w-12 items-center justify-center 
  border-2 border-foreground bg-{color}">
  <Icon className="h-6 w-6" strokeWidth={2.5} />
</div>

/* Tilted icon box (negative rotation) */
<div className="w-14 h-14 bg-background border-4 border-foreground 
  flex items-center justify-center -rotate-3">
  <Icon size={28} strokeWidth={2.5} />
</div>

/* Tilted icon box (positive rotation) */
<div className="w-14 h-14 bg-primary border-4 border-foreground 
  flex items-center justify-center rotate-3">
  <Icon size={28} strokeWidth={3} className="text-primary-foreground" />
</div>
```

### 6.5 Icons by Feature

| Feature | Icons Used |
|---------|------------|
| Navigation | `Menu`, `X`, `ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight` |
| Header | `Menu`, `Inbox` |
| Home | `Home`, `Calendar`, `Clock`, `AlertCircle`, `ArrowRight` |
| Events | `Calendar`, `Clock`, `MapPin`, `Users`, `Bell`, `Share2`, `Check` |
| Transport | `Ship`, `Bus`, `Anchor`, `Phone`, `Clock`, `MapPin` |
| Inbox | `Inbox`, `Bell`, `Send`, `MessageSquare`, `AlertCircle` |
| Feedback | `MessageSquare`, `Lightbulb`, `ThumbsUp`, `ThumbsDown` |
| Click-Fix | `Camera`, `MapPin`, `AlertTriangle`, `X`, `Check` |
| Settings | `Settings`, `Globe`, `Check` |
| States | `Loader2`, `AlertTriangle`, `AlertCircle`, `FileQuestion` |
| Menu | `Home`, `Calendar`, `Clock`, `MessageSquare`, `AlertTriangle`, `Leaf`, `Fish`, `Info`, `Settings` |

---

## 7. CORE COMPONENTS

### 7.1 Button

**File:** `src/components/ui/button.tsx`

#### Base Style
```tsx
"inline-flex items-center justify-center gap-2 
 whitespace-nowrap text-sm font-semibold font-display 
 ring-offset-background transition-all 
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
 disabled:pointer-events-none disabled:opacity-50 
 border-2 border-foreground"
```

#### Variants

| Variant | Style |
|---------|-------|
| `default` | `bg-primary text-primary-foreground shadow-neo` + neo-hover |
| `destructive` | `bg-destructive text-destructive-foreground shadow-neo` + neo-hover |
| `outline` | `bg-background hover:bg-muted shadow-neo` + neo-hover |
| `secondary` | `bg-secondary text-secondary-foreground shadow-neo` + neo-hover |
| `accent` | `bg-accent text-accent-foreground shadow-neo` + neo-hover |
| `ghost` | `border-transparent hover:bg-muted hover:border-foreground` |
| `link` | `text-primary underline-offset-4 hover:underline border-transparent` |

#### Sizes

| Size | Style |
|------|-------|
| `default` | `h-11 px-5 py-2` |
| `sm` | `h-9 px-4 text-xs` |
| `lg` | `h-12 px-8 text-base` |
| `xl` | `h-14 px-10 text-lg` |
| `icon` | `h-11 w-11` |

#### Neo Hover Animation
```tsx
"hover:translate-x-[-2px] hover:translate-y-[-2px] 
 hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
 active:translate-x-[2px] active:translate-y-[2px] 
 active:shadow-none"
```

#### CTA Button Pattern (Full-width with external shadow)
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
    BUTTON TEXT
  </Button>
</div>
```

---

### 7.2 Badge

**File:** `src/components/ui/badge.tsx`

#### Base Style
```tsx
"inline-flex items-center border-2 border-foreground 
 px-3 py-1 text-xs font-bold font-display uppercase tracking-wide"
```

#### Variants

| Variant | Style |
|---------|-------|
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

### 7.3 Card

**File:** `src/components/ui/card.tsx`

#### Base Style
```tsx
"border-2 border-foreground bg-card text-card-foreground"
```

#### Variants

| Variant | Style |
|---------|-------|
| `default` | `shadow-neo` |
| `flat` | (no shadow) |
| `elevated` | `shadow-neo-lg` |
| `accent` | `bg-accent shadow-neo` |
| `primary` | `bg-primary text-primary-foreground shadow-neo` |
| `secondary` | `bg-secondary text-secondary-foreground shadow-neo` |

#### Interactive Mode
```tsx
interactive={true}
// Adds:
"transition-all cursor-pointer 
 hover:translate-x-[-2px] hover:translate-y-[-2px] 
 hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
 active:translate-x-[2px] active:translate-y-[2px] 
 active:shadow-none"
```

#### Card Sub-components

| Component | Padding | Typography |
|-----------|---------|------------|
| CardHeader | `p-5` | Container |
| CardTitle | – | `text-xl font-bold font-display` |
| CardDescription | – | `text-sm text-muted-foreground font-body` |
| CardContent | `p-5 pt-0` | Container |
| CardFooter | `p-5 pt-0` | `flex items-center` |

---

## 8. LAYOUT COMPONENTS

### 8.1 MobileFrame

**File:** `src/components/layout/MobileFrame.tsx`

```tsx
<div className="min-h-screen bg-background">
  <div className="mx-auto max-w-md">
    {children}
  </div>
</div>
```

- `min-h-screen` – Full viewport height minimum
- `max-w-md` – 448px max width (mobile)
- `mx-auto` – Centered horizontally

---

### 8.2 AppHeader

**File:** `src/components/layout/AppHeader.tsx`

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
<button className="relative flex h-12 w-12 items-center justify-center 
  border-3 border-foreground bg-primary text-primary-foreground ..."
  style={{ borderWidth: "3px" }}>
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

### 8.3 MainMenu

**File:** `src/components/layout/MainMenu.tsx`

#### Structure
1. **Backdrop** – `fixed inset-0 z-40 bg-foreground/60`
2. **Panel** – `fixed left-0 top-0 z-50 h-full w-[300px] max-w-[88vw]`
3. **Header** – `bg-primary` with title and close button
4. **Items** – Scrollable list of navigation items
5. **Footer** – Version info

#### Menu Item
```tsx
<div className="relative">
  <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 
    ${isActive ? 'bg-primary' : 'bg-foreground/20'}`} />
  <button className={`relative flex w-full items-center gap-3 
    border-2 border-foreground p-3 text-left transition-transform 
    hover:translate-x-[-1px] hover:translate-y-[-1px] 
    active:translate-x-1 active:translate-y-1 
    ${isActive ? "bg-accent" : "bg-background"}`}>
    {/* Icon box */}
    <div className={`flex h-10 w-10 items-center justify-center 
      border-2 border-foreground ${item.color} shrink-0`}>
      <item.icon className="h-5 w-5 text-foreground" strokeWidth={2} />
    </div>
    {/* Label */}
    <span className="flex-1 font-display text-sm font-bold uppercase tracking-tight">
      {label}
    </span>
    <ArrowRight className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
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

---

## 9. FORM COMPONENTS

### 9.1 Input

**File:** `src/components/ui/input.tsx`

```tsx
"flex h-11 w-full border-2 border-foreground bg-background 
 px-4 py-2 text-base font-body ring-offset-background shadow-neo 
 placeholder:text-muted-foreground 
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
 disabled:cursor-not-allowed disabled:opacity-50 
 transition-shadow focus:shadow-neo-primary"
```

#### Heavy Border Variant (in forms)
```tsx
className="border-4 border-foreground font-body bg-background 
  focus:ring-0 focus:border-foreground"
```

---

### 9.2 Textarea

**File:** `src/components/ui/textarea.tsx`

```tsx
"flex min-h-[120px] w-full border-2 border-foreground bg-background 
 px-4 py-3 text-base font-body ring-offset-background shadow-neo 
 placeholder:text-muted-foreground 
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
 disabled:cursor-not-allowed disabled:opacity-50 
 transition-shadow focus:shadow-neo-primary resize-none"
```

---

### 9.3 Form Section Label

```tsx
<h2 className="font-display font-bold text-xs text-muted-foreground mb-3 
  uppercase tracking-widest border-b-2 border-foreground pb-2">
  1. Vrsta poruke <span className="text-destructive">*</span>
</h2>
```

---

### 9.4 Character Counter

```tsx
<p className={`font-body text-xs mt-2 
  ${count >= minRequired ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
  {count}/{minRequired} znakova (minimum)
</p>
```

---

### 9.5 Option Selector Grid

```tsx
<div className="grid grid-cols-2 gap-3">
  {options.map((option) => (
    <div className="relative">
      <div className={`absolute inset-0 translate-x-2 translate-y-2 
        ${isSelected ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
      <button className={`relative w-full border-4 border-foreground p-4 
        flex flex-col items-center gap-2 transition-all 
        hover:translate-x-[-2px] hover:translate-y-[-2px] 
        active:translate-x-1 active:translate-y-1 
        ${isSelected ? option.color : "bg-background"}`}>
        <Icon size={28} strokeWidth={2.5} 
          className={isSelected ? "text-white" : "text-foreground"} />
        <span className={`font-display font-bold text-xs 
          ${isSelected ? "text-white" : "text-foreground"}`}>
          {option.label}
        </span>
      </button>
    </div>
  ))}
</div>
```

---

### 9.6 Photo Upload Grid

```tsx
<div className="grid grid-cols-3 gap-3">
  {photos.map((photo, index) => (
    <div className="relative aspect-square bg-muted border-4 border-foreground 
      flex items-center justify-center">
      {/* Photo or placeholder */}
      <Camera size={24} className="text-muted-foreground" />
      {/* Delete button */}
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
    hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]">
    <Camera size={28} strokeWidth={2} className="text-muted-foreground" />
    <span className="font-display text-[10px] font-bold text-muted-foreground">
      DODAJ
    </span>
  </button>
</div>
```

---

## 10. STATE COMPONENTS

**File:** `src/components/ui/states.tsx`

### 10.1 LoadingState

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

---

### 10.2 ErrorState

```tsx
<div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
  {/* Icon with offset shadow */}
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
  <div className="relative mt-6">
    <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
    <Button className="relative border-3 border-foreground font-display uppercase">
      {retryLabel}
    </Button>
  </div>
</div>
```

---

### 10.3 EmptyState

Variants: `inbox`, `events`, `transport`, `generic`

```tsx
const emptyStateColors = {
  inbox: "bg-primary",
  events: "bg-accent",
  transport: "bg-secondary",
  generic: "bg-muted",
};

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

---

### 10.4 RateLimitWarning

**Normal State:**
```tsx
<div className="border-t-2 border-foreground pt-4">
  <p className="font-body text-xs text-center text-muted-foreground">
    Preostalo poruka danas: <span className="font-bold">{remaining}/{max}</span>
  </p>
</div>
```

**Low State (remaining <= 1):**
```tsx
className="text-destructive"
```

**Exhausted State (remaining === 0):**
```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-destructive" />
  <div className="relative border-4 border-foreground bg-destructive/10 p-4">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={2.5} />
      <div>
        <p className="font-display font-bold text-sm uppercase">Dnevni limit dosegnut</p>
        <p className="font-body text-xs text-muted-foreground">...</p>
      </div>
    </div>
  </div>
</div>
```

---

## 11. LIST PATTERNS

### 11.1 Standard List Item with Shadow

```tsx
<div className="relative">
  <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 
    ${isActive ? 'bg-primary' : 'bg-foreground/20'}`} />
  <button className={`relative flex w-full items-center gap-3 
    border-2 border-foreground p-3 text-left transition-transform 
    hover:translate-x-[-1px] hover:translate-y-[-1px] 
    active:translate-x-1 active:translate-y-1 
    ${isActive ? "bg-accent" : "bg-background"}`}>
    {/* Icon box */}
    <div className="flex h-12 w-12 items-center justify-center 
      border-2 border-foreground bg-{color} shrink-0">
      <Icon className="h-6 w-6" strokeWidth={2.5} />
    </div>
    {/* Content */}
    <div className="flex-1 min-w-0">
      <h4 className="font-display text-sm font-bold uppercase tracking-tight truncate">
        {title}
      </h4>
      <p className="font-body text-xs text-muted-foreground">{subtitle}</p>
    </div>
    {/* Meta / Arrow */}
    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={2} />
  </button>
</div>
```

---

### 11.2 Inbox Message Item

```tsx
<button className={`flex gap-4 border-b-3 border-foreground p-4 text-left 
  transition-all hover:bg-muted 
  ${!isRead ? "bg-accent/20" : "bg-background"}`}
  style={{ borderBottomWidth: "3px" }}>
  {/* Type icon */}
  <div className={`flex h-12 w-12 shrink-0 items-center justify-center 
    border-3 border-foreground ${typeColor}`} 
    style={{ borderWidth: "3px" }}>
    <Icon className="h-6 w-6" strokeWidth={2.5} />
  </div>
  {/* Content */}
  <div className="flex-1 overflow-hidden">
    <div className="flex items-start justify-between gap-2">
      <h4 className={`font-display text-sm uppercase truncate 
        ${!isRead ? "font-bold" : "font-medium"}`}>
        {title}
      </h4>
      {!isRead && <Badge variant="destructive">New</Badge>}
    </div>
    <p className="mt-1 truncate font-body text-xs text-muted-foreground">{preview}</p>
    <p className="mt-2 font-body text-[10px] font-bold uppercase tracking-wider 
      text-muted-foreground">
      {date} • {time}
    </p>
  </div>
  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2.5} />
</button>
```

**Type Colors:**
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

### 11.3 Event List Item

```tsx
<div className="relative">
  <div className={`absolute inset-0 translate-x-1.5 translate-y-1.5 
    ${index === 0 ? 'bg-primary' : 'bg-foreground/20'}`} />
  <button className={`relative flex items-center gap-3 border-2 border-foreground 
    p-3 text-left w-full transition-transform ...
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

---

### 11.4 Departure List Item

```tsx
<div className={`flex items-center gap-4 p-3 
  ${index !== last ? 'border-b-2 border-foreground' : ''}`}>
  {/* Time box */}
  <div className={`w-16 h-10 border-3 border-foreground 
    flex items-center justify-center ${typeColor}`}
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
    border-2 border-foreground ${typeColor}/20`}>
    {typeLabel}
  </span>
</div>
```

---

## 12. CARD PATTERNS

### 12.1 Transport Line Card

```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <button className="relative w-full bg-background border-4 border-foreground p-0 text-left 
    transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] 
    active:translate-x-1 active:translate-y-1">
    {/* Title bar */}
    <div className={`w-full px-4 py-3 border-b-4 border-foreground 
      flex items-center justify-between ${headerColor}`}>
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
          {stops.length} stops
        </span>
      </div>
      <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
        {stops.join(" → ")}
      </p>
    </div>
  </button>
</div>
```

---

### 12.2 Category Card (Home Grid)

```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 bg-foreground" />
  <button className={`relative flex flex-col items-center justify-center gap-2 
    border-2 border-foreground ${color} ${textColor} p-5 w-full
    transition-transform 
    hover:translate-x-[-1px] hover:translate-y-[-1px] 
    active:translate-x-1 active:translate-y-1`}>
    <Icon className="h-7 w-7" strokeWidth={2} />
    <span className="font-display text-sm font-bold uppercase">{label}</span>
  </button>
</div>
```

---

### 12.3 Contact Card

```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary" />
  <button className="relative w-full bg-background border-4 border-foreground p-4 text-left 
    transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] 
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

### 12.4 Settings Card

```tsx
<Card variant="flat" className="border-4 border-foreground p-4">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 bg-primary border-2 border-foreground 
      flex items-center justify-center">
      <Icon size={20} strokeWidth={2.5} className="text-primary-foreground" />
    </div>
    <div>
      <h3 className="font-display font-bold uppercase">{title}</h3>
      <p className="font-body text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  {/* Options grid */}
</Card>
```

---

### 12.5 Mode Selection Card (Onboarding)

```tsx
<Card variant="flat" className={`border-4 border-foreground shadow-neo neo-hover p-0 overflow-hidden 
  cursor-pointer ${isSelected ? "ring-4 ring-offset-2 ring-foreground" : ""}`}>
  {/* Header with color */}
  <div className={`${mode.color} p-4 flex items-center gap-4`}>
    <div className="w-14 h-14 bg-white/20 border-4 border-foreground 
      flex items-center justify-center">
      <Icon size={28} strokeWidth={2.5} className="text-white" />
    </div>
    <div className="flex-1">
      <h2 className="font-display font-bold text-xl text-white">{mode.title}</h2>
      <p className="font-body text-sm text-white/80">{mode.description}</p>
    </div>
    {isSelected && (
      <div className="w-8 h-8 bg-white border-2 border-foreground flex items-center justify-center">
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

---

## 13. PAGE HEADERS

### 13.1 Greeting Block (Home)

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

---

### 13.2 Section Header with Icon

```tsx
<section className="border-b-4 border-foreground bg-{color} p-5">
  <div className="flex items-center gap-4">
    <div className="w-14 h-14 bg-background border-4 border-foreground 
      flex items-center justify-center -rotate-3">
      <Icon size={28} strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="font-display text-2xl font-bold uppercase text-{foreground}">
        {title}
      </h1>
      <p className="font-body text-xs uppercase tracking-widest text-{foreground}/80">
        {subtitle}
      </p>
    </div>
  </div>
</section>
```

**Page Colors:**
- Events: `bg-primary`
- Sea Transport: `bg-primary`
- Road Transport: `bg-secondary`
- Feedback: `bg-lavender`
- Click-Fix: `bg-orange`

---

### 13.3 Section Label

```tsx
<h2 className="font-display font-bold text-xs uppercase tracking-widest 
  text-muted-foreground mb-4 border-b-2 border-foreground pb-2">
  {label}
</h2>
```

---

## 14. NAVIGATION PATTERNS

### 14.1 Tab Bar

```tsx
<div className="flex border-b-4 border-foreground">
  <button className={`flex flex-1 items-center justify-center gap-2 
    border-r-3 border-foreground p-4 
    font-display text-sm font-bold uppercase tracking-wide 
    ${isActive ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
    style={{ borderRightWidth: "3px" }}>
    <Icon className="h-5 w-5" strokeWidth={2.5} />
    {label}
  </button>
  <button className={`flex flex-1 items-center justify-center gap-2 p-4 
    font-display text-sm font-bold uppercase tracking-wide 
    ${isActive ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
    <Icon className="h-5 w-5" strokeWidth={2.5} />
    {label}
  </button>
</div>
```

---

### 14.2 Month Navigation

```tsx
<div className="flex items-center justify-between mb-4">
  <button className="flex h-11 w-11 items-center justify-center 
    border-3 border-foreground bg-background 
    transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] 
    hover:shadow-[4px_4px_0_0_hsl(var(--foreground))] 
    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
    style={{ borderWidth: "3px" }}>
    <ChevronLeft className="h-6 w-6" strokeWidth={3} />
  </button>
  <h3 className="font-display text-lg font-bold uppercase tracking-wide">
    {month} {year}
  </h3>
  <button>...</button>
</div>
```

---

### 14.3 Progress Indicator (Onboarding)

```tsx
<div className="flex gap-2">
  <div className="flex-1 h-2 bg-foreground border-2 border-foreground" />
  <div className="flex-1 h-2 bg-foreground border-2 border-foreground" />
</div>
<p className="font-body text-xs text-muted-foreground text-center mt-2">
  KORAK 2 OD 2
</p>
```

---

### 14.4 Fixed Bottom Actions

```tsx
<div className="fixed bottom-0 left-0 right-0 mx-auto max-w-md 
  flex gap-3 border-t-4 border-foreground bg-background p-4">
  <Button variant="outline" size="lg" className="flex-1 uppercase">
    <Icon /> {label1}
  </Button>
  <Button variant="accent" size="lg" className="flex-1 uppercase">
    <Icon /> {label2}
  </Button>
</div>
```

---

## 15. BANNERS & NOTIFICATIONS

### 15.1 Alert Banner

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
  <Badge variant="destructive" className="uppercase border-2 border-foreground">
    New
  </Badge>
</button>
```

---

### 15.2 Emergency Header (Inbox Detail)

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

---

### 15.3 Active Period Box

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

---

### 15.4 Warning Dialog

```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-foreground" />
  <div className="relative bg-accent border-4 border-foreground p-4">
    <p className="font-display font-bold mb-2 uppercase">{title}</p>
    <p className="font-body text-sm mb-4">{message}</p>
    <div className="flex gap-3">
      <Button className="flex-1 border-3 border-foreground font-display 
        bg-background text-foreground hover:bg-muted">
        {cancelLabel}
      </Button>
      <Button className="flex-1 bg-foreground text-background 
        border-3 border-foreground font-display">
        {confirmLabel}
      </Button>
    </div>
  </div>
</div>
```

---

## 16. CALENDAR & DATE PATTERNS

### 16.1 Week Days Header

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

---

### 16.2 Calendar Day Cell

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

---

### 16.3 Date Box (Inline)

```tsx
<div className="flex h-12 w-12 flex-col items-center justify-center 
  border-2 border-foreground bg-primary text-primary-foreground shrink-0">
  <span className="font-display text-lg font-bold leading-none">{day}</span>
  <span className="font-body text-[10px] uppercase">{month}</span>
</div>
```

---

### 16.4 Empty Day State

```tsx
<div className="border-3 border-dashed border-muted-foreground p-8 text-center" 
  style={{ borderWidth: "3px" }}>
  <p className="font-display text-sm uppercase text-muted-foreground">
    No events for this day
  </p>
</div>
```

---

## 17. INTERACTIVE PATTERNS

### 17.1 Neobrutalist Hover Effect (Standard)

```tsx
className="transition-all 
  hover:translate-x-[-2px] hover:translate-y-[-2px] 
  hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] 
  active:translate-x-[2px] active:translate-y-[2px] 
  active:shadow-none"
```

---

### 17.2 Subtler Hover (Smaller Elements)

```tsx
className="transition-transform 
  hover:translate-x-[-1px] hover:translate-y-[-1px] 
  active:translate-x-1 active:translate-y-1"
```

---

### 17.3 Close Button Pattern

```tsx
<div className="relative">
  <div className="absolute inset-0 translate-x-1 translate-y-1 bg-foreground" />
  <button className="relative flex h-10 w-10 items-center justify-center 
    border-2 border-foreground bg-background 
    transition-transform hover:translate-x-[-1px] hover:translate-y-[-1px] 
    active:translate-x-0.5 active:translate-y-0.5">
    <X className="h-5 w-5" strokeWidth={2} />
  </button>
</div>
```

---

### 17.4 Selection Indicator

```tsx
{isSelected && (
  <div className="w-8 h-8 bg-white border-2 border-foreground flex items-center justify-center">
    <Check size={20} strokeWidth={3} />
  </div>
)}
```

---

## 18. CONFIRMATION & SUCCESS PATTERNS

### 18.1 Confirmation Screen

```tsx
<div className="min-h-screen flex flex-col items-center justify-center p-8">
  {/* Success icon */}
  <div className="w-24 h-24 bg-secondary border-4 border-foreground shadow-neo-lg 
    flex items-center justify-center mb-8">
    <Check size={48} strokeWidth={3} className="text-secondary-foreground" />
  </div>
  {/* Title */}
  <h1 className="font-display font-bold text-3xl text-center mb-4">
    {title.toUpperCase()}
  </h1>
  {/* Description */}
  <p className="font-body text-muted-foreground text-center mb-8">
    {description}
  </p>
  {/* Action button */}
  <Button size="lg" className="bg-primary text-primary-foreground 
    border-4 border-foreground shadow-neo font-display text-lg py-6 px-8">
    <Home size={24} strokeWidth={2.5} className="mr-3" />
    {actionLabel.toUpperCase()}
  </Button>
</div>
```

---

### 18.2 Admin Reply Box

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

## 19. PAGE SPECIFICATIONS

### 19.1 Onboarding Splash

**Sections:**
1. Hero with logo mark (layered boxes)
2. Title "MOJVIS"
3. Tagline box (inverted colors)
4. Language selection buttons (2-column grid)

**Key Elements:**
- Background pattern: 45deg diagonal stripes
- Logo: Primary box + MapPin icon + decorative boxes
- Tagline: `bg-foreground text-background`

---

### 19.2 Home Page

**Sections:**
1. Alert banner (if emergency)
2. Greeting block (`bg-primary`)
3. Category grid (2x2)
4. Section label "Upcoming Events"
5. Event list (3 items)
6. CTA block "Share Your Thoughts"

---

### 19.3 Events Calendar Page

**Sections:**
1. Calendar header (`bg-primary`)
2. Month navigation
3. Week days header
4. Calendar grid (7 columns)
5. Selected day events list
6. Empty day state (if no events)

---

### 19.4 Inbox Page

**Sections:**
1. Tab bar (Received / Sent)
2. Message list
3. Empty state (if no messages)

---

### 19.5 Transport Sea Page

**Sections:**
1. Section header with Ship icon (`bg-primary`)
2. Section label "Lines"
3. Line cards (Ferry + Catamaran)
4. Section label "Today's Departures"
5. Departure list
6. Contact card

---

### 19.6 Feedback Page

**Sections:**
1. Section header with MessageSquare icon (`bg-lavender`)
2. Form section 1: Type selector (4 options)
3. Form section 2: Textarea
4. Rate limit warning
5. Submit CTA button

**Feedback Types:**
- Idea → `Lightbulb` → `bg-accent`
- Suggestion → `MessageSquare` → `bg-primary`
- Criticism → `ThumbsDown` → `bg-destructive`
- Praise → `ThumbsUp` → `bg-secondary`

---

### 19.7 Click-Fix Page

**Sections:**
1. Section header with MapPin icon (`bg-orange`)
2. Location selector / selected state
3. Photo upload grid
4. Description textarea with character counter
5. Submit button

---

### 19.8 Settings Page

**Sections:**
1. Language setting card
2. User mode setting card
3. Each with option buttons

---

## 20. ANIMATIONS & TRANSITIONS

### 20.1 Keyframes (tailwind.config.ts)

```tsx
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" },
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" },
  },
  "slide-in-right": {
    from: { transform: "translateX(100%)" },
    to: { transform: "translateX(0)" },
  },
  "slide-out-right": {
    from: { transform: "translateX(0)" },
    to: { transform: "translateX(100%)" },
  },
  "fade-in": {
    from: { opacity: "0" },
    to: { opacity: "1" },
  },
  "bounce-in": {
    "0%": { transform: "scale(0.95)", opacity: "0" },
    "50%": { transform: "scale(1.02)" },
    "100%": { transform: "scale(1)", opacity: "1" },
  },
}
```

### 20.2 Animation Classes

```tsx
animation: {
  "accordion-down": "accordion-down 0.2s ease-out",
  "accordion-up": "accordion-up 0.2s ease-out",
  "slide-in-right": "slide-in-right 0.3s ease-out",
  "slide-out-right": "slide-out-right 0.3s ease-out",
  "fade-in": "fade-in 0.2s ease-out",
  "bounce-in": "bounce-in 0.3s ease-out",
}
```

### 20.3 Common Transitions

```tsx
/* Standard transition */
"transition-all"

/* Transform only */
"transition-transform"

/* Color transitions */
"transition-colors"

/* Shadow transitions */
"transition-shadow"

/* Duration: 100ms for hover, 200-300ms for larger animations */
```

### 20.4 Loading Animations

```tsx
/* Pulse */
<div className="animate-pulse" />

/* Spin */
<Loader2 className="animate-spin" />
```

---

## 21. UTILITY CLASSES

### 21.1 Custom Utilities (index.css)

```css
.neo-border {
  border: var(--border-width) solid hsl(var(--border));
}

.neo-border-heavy {
  border: var(--border-heavy) solid hsl(var(--border));
}

.neo-shadow {
  box-shadow: var(--shadow-offset) var(--shadow-offset) 0 0 hsl(var(--border));
}

.neo-shadow-lg {
  box-shadow: var(--shadow-offset-lg) var(--shadow-offset-lg) 0 0 hsl(var(--border));
}

.neo-shadow-primary {
  box-shadow: var(--shadow-offset) var(--shadow-offset) 0 0 hsl(var(--primary));
}

.neo-shadow-accent {
  box-shadow: var(--shadow-offset) var(--shadow-offset) 0 0 hsl(var(--accent));
}

.neo-shadow-secondary {
  box-shadow: var(--shadow-offset) var(--shadow-offset) 0 0 hsl(var(--secondary));
}

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

.font-display {
  font-family: var(--font-display);
}

.font-body {
  font-family: var(--font-body);
}
```

---

## 22. QUICK REFERENCE

### Colors at a Glance

| Color | HSL | Tailwind | Usage |
|-------|-----|----------|-------|
| Background | 45 30% 96% | `bg-background` | Page backgrounds |
| Foreground | 220 20% 10% | `text-foreground`, `border-foreground` | Text, borders |
| Primary | 210 80% 45% | `bg-primary` | Main actions, headers |
| Secondary | 160 45% 38% | `bg-secondary` | Transport, success |
| Accent | 45 92% 55% | `bg-accent` | Highlights, menu |
| Destructive | 12 55% 50% | `bg-destructive` | Errors, delete |
| Muted | 45 15% 90% | `bg-muted` | Disabled, backgrounds |
| Lavender | 270 35% 70% | `bg-lavender` | Feedback |
| Orange | 25 85% 55% | `bg-orange` | Click-Fix |
| Teal | 180 45% 42% | `bg-teal` | Catamaran |

### Typography Quick Reference

| Style | Classes |
|-------|---------|
| Page title | `font-display text-2xl font-bold uppercase tracking-tight` |
| Section label | `font-display text-xs font-bold uppercase tracking-widest text-muted-foreground` |
| Body text | `font-body text-base` |
| Meta text | `font-body text-[10px] uppercase tracking-wider text-muted-foreground` |
| Button label | `font-display font-bold uppercase` |

### Spacing Quick Reference

| Context | Value |
|---------|-------|
| Page padding | `p-5` (20px) |
| Section gap | `gap-4` (16px) |
| List item padding | `p-3` (12px) |
| Card padding | `p-5` (20px) |
| Icon box size | `h-12 w-12` (48px) |
| Header height | `h-16` (64px) |

### Shadow Quick Reference

| Type | Class/Pattern |
|------|---------------|
| Standard | `shadow-neo` (4px 4px) |
| Large | `shadow-neo-lg` (6px 6px) |
| External | `translate-x-2 translate-y-2 bg-foreground` |
| Hover expanded | `shadow-[6px_6px_0_0_hsl(var(--foreground))]` |

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial comprehensive documentation |

---

*This document excludes all V2 pages and components. For V2 specifications, see the V2 Design System document.*
