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
