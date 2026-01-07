# MOJ VIS — STYLE GUIDE

## Design Philosophy

**Neobrutalist Mediterranean** — A design language that combines the bold, raw aesthetic of neobrutalism with the warm, earthy tones of the Mediterranean. Structure is visible, not hidden. Every element has clear boundaries and purpose.

---

## Color Palette

### Primary Colors (HSL Values)

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `198 93% 40%` | `198 93% 50%` | Primary actions, links, key UI elements |
| `--secondary` | `82 60% 45%` | `82 60% 55%` | Secondary actions, success states |
| `--accent` | `45 100% 51%` | `45 100% 55%` | Highlights, attention-grabbing elements |

### Extended Mediterranean Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--terracotta` | `15 65% 55%` | `15 65% 60%` | Warm accents, decorative |
| `--lavender` | `270 50% 70%` | `270 50% 75%` | Soft accents, backgrounds |
| `--orange` | `25 95% 55%` | `25 95% 60%` | Warning states, highlights |
| `--teal` | `175 60% 40%` | `175 60% 50%` | Info states, transport |
| `--pink` | `350 60% 65%` | `350 60% 70%` | Soft accents, decorative |

### Semantic Colors

| Token | Usage |
|-------|-------|
| `--background` | Page backgrounds |
| `--foreground` | Primary text |
| `--muted` | Subdued backgrounds, disabled states |
| `--muted-foreground` | Secondary text, placeholders |
| `--destructive` | Errors, dangerous actions, alerts |
| `--border` | All borders, dividers |
| `--card` | Card backgrounds |
| `--popover` | Dropdown/modal backgrounds |

---

## Typography

### Font Families

| Family | Token | Usage |
|--------|-------|-------|
| **Space Grotesk** | `font-display` | Headlines, titles, buttons, labels |
| **Space Mono** | `font-body` | Body text, descriptions, form inputs |

### Font Sizes (Tailwind Classes)

| Element | Class | Weight |
|---------|-------|--------|
| Page title | `text-xl` | `font-bold` |
| Section header | `text-lg` | `font-bold` |
| Card title | `text-base` | `font-bold` |
| Body text | `text-sm` | `font-normal` |
| Caption/meta | `text-xs` | `font-medium` |

### Usage Rules

- All headings use `font-display` (Space Grotesk)
- Body text uses `font-body` (Space Mono)
- Never mix fonts within a single text block
- Uppercase sparingly — only for labels and badges

---

## Borders

### Border Width

| Variant | Width | Usage |
|---------|-------|-------|
| Standard | `2px` | Cards, buttons, inputs, containers |
| Heavy | `3px` | Hero elements, primary CTAs |
| Light | `1px` | Dividers, subtle separations |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | `0px` | Default — sharp corners for neobrutalism |
| `rounded-sm` | `0px` | Small elements |
| `rounded-md` | `0px` | Medium elements |
| `rounded-lg` | `0px` | Large elements |

**Rule:** All corners are sharp (0px radius) to maintain neobrutalist aesthetic.

### Border Color

Always use `border-border` for consistency. Never use arbitrary colors.

---

## Shadows

### Neobrutalist Shadow System

| Class | Offset | Usage |
|-------|--------|-------|
| `shadow-neo` | `4px 4px 0 0` | Standard cards, buttons |
| `shadow-neo-lg` | `6px 6px 0 0` | Large/hero elements |
| `shadow-neo-primary` | `4px 4px 0 0` (primary color) | Primary action buttons |
| `shadow-neo-accent` | `4px 4px 0 0` (accent color) | Highlighted elements |
| `shadow-neo-secondary` | `4px 4px 0 0` (secondary color) | Secondary elements |

### CSS Custom Classes

```css
.neo-shadow {
  box-shadow: 3px 3px 0 0 hsl(var(--border));
}

.neo-shadow-sm {
  box-shadow: 2px 2px 0 0 hsl(var(--border));
}

.neo-shadow-primary {
  box-shadow: 3px 3px 0 0 hsl(var(--primary));
}

.neo-shadow-accent {
  box-shadow: 3px 3px 0 0 hsl(var(--accent));
}
```

### Shadow Rules

- Shadows are always solid (no blur)
- Offset is always down-right
- Shadow color matches border or semantic color
- Hover states may increase shadow offset by 1px

---

## Spacing

### Container Padding

| Context | Padding |
|---------|---------|
| Page container | `p-4` (1rem) |
| Card content | `p-3` to `p-4` |
| Section gaps | `gap-4` to `gap-6` |
| List item padding | `p-3` |

### Margins

| Context | Margin |
|---------|--------|
| Section spacing | `mb-6` |
| Element groups | `mb-4` |
| Inline elements | `gap-2` to `gap-3` |

---

## Components

### Buttons

```
Primary Button:
- Background: bg-primary
- Text: text-primary-foreground
- Border: border-2 border-border
- Shadow: shadow-neo or shadow-neo-primary
- Hover: translate-y-[-1px], shadow increase
- Active: translate-y-[1px], shadow decrease
```

### Cards

```
Standard Card:
- Background: bg-card
- Border: border-2 border-border
- Shadow: shadow-neo (3px offset)
- Padding: p-3 to p-4
- No border radius (sharp corners)
```

### Inputs

```
Text Input:
- Background: bg-background
- Border: border-2 border-border
- Font: font-body
- Padding: p-3
- Focus: ring-2 ring-primary
```

### List Items

```
Navigational List Item:
- Background: bg-card
- Border: border-2 border-border
- Shadow: neo-shadow-sm (2px offset)
- Chevron: ChevronRight icon on right
- Hover: subtle background change
```

---

## Icons

### Icon Library

Use **Lucide React** for all icons.

### Icon Sizes

| Context | Size |
|---------|------|
| Navigation/header | `h-5 w-5` or `h-6 w-6` |
| List items | `h-4 w-4` or `h-5 w-5` |
| Category boxes | `h-6 w-6` to `h-8 w-8` |
| Inline with text | `h-4 w-4` |

### Icon Colors

- Primary icons: `text-primary`
- Muted icons: `text-muted-foreground`
- On colored backgrounds: `text-primary-foreground` or appropriate contrast

---

## Layout Patterns

### Page Structure

```
<MobileFrame>
  <div className="flex flex-col min-h-screen bg-background">
    <AppHeader ... />
    <main className="flex-1 overflow-auto p-4">
      {/* Page content */}
    </main>
  </div>
</MobileFrame>
```

### Grid Layouts

| Pattern | Class |
|---------|-------|
| 2-column grid | `grid grid-cols-2 gap-3` |
| 3-column grid | `grid grid-cols-3 gap-2` |
| Full-width list | `flex flex-col gap-3` |

---

## States

### Loading State

- Show skeleton or spinner
- Use `text-muted-foreground` for loading text
- Maintain layout structure

### Empty State

- Center content vertically
- Use muted icon (`h-12 w-12 text-muted-foreground`)
- Descriptive text in `text-muted-foreground`

### Error State

- Use `destructive` color for error indicators
- Clear error message
- Retry action if applicable

### Hover States

```css
.neo-hover {
  transition: all 0.15s ease;
}

.neo-hover:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 0 hsl(var(--border));
}

.neo-hover:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 0 hsl(var(--border));
}
```

---

## Animation

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | `150ms` | `ease` |
| Page transitions | `200ms` | `ease-out` |
| Accordion | `200ms` | `ease-out` |

### Available Animations

| Class | Effect |
|-------|--------|
| `animate-fade-in` | Fade in |
| `animate-bounce-in` | Scale bounce |
| `animate-slide-in-right` | Slide from right |

---

## Accessibility

### Color Contrast

- All text must meet WCAG AA standards
- Primary on background: ✓
- Foreground on muted: ✓
- Use `text-primary-foreground` on primary backgrounds

### Focus States

- All interactive elements must have visible focus
- Use `ring-2 ring-primary ring-offset-2`

### Touch Targets

- Minimum touch target: `44px × 44px`
- List items: full-width, minimum `48px` height

---

## Do's and Don'ts

### ✅ DO

- Use semantic color tokens (`bg-primary`, `text-foreground`)
- Maintain 2px borders consistently
- Use sharp corners (0 radius)
- Apply solid offset shadows
- Keep structure visible

### ❌ DON'T

- Use arbitrary colors (`bg-blue-500`, `text-gray-700`)
- Mix border widths randomly
- Add border radius
- Use blurred or soft shadows
- Over-decorate or hide structure

---

## File References

- **CSS Variables:** `src/index.css`
- **Tailwind Config:** `tailwind.config.ts`
- **UI Components:** `src/components/ui/`
- **Layout Components:** `src/components/layout/`
