# MOJ VIS – Fonts & Icons Specification

Complete specification of typography and iconography used in the project.

---

## FONTS

### Primary Font: Space Grotesk
**Package:** `@fontsource/space-grotesk` (v5.2.10)

**Purpose:** Display typography - headings, titles, labels, navigation

**Weights Loaded:**
- 400 (Regular)
- 500 (Medium)
- 700 (Bold)

**Tailwind Class:** `font-display`

**CSS Variable:** `font-family: 'Space Grotesk', system-ui, sans-serif`

**Usage Examples:**
```tsx
// Headings
<h1 className="font-display text-2xl font-bold">Title</h1>

// Navigation items
<span className="font-display text-sm font-semibold uppercase tracking-wider">Menu Item</span>

// Buttons
<button className="font-display font-bold">Click Me</button>
```

---

### Secondary Font: Space Mono
**Package:** `@fontsource/space-mono` (v5.2.9)

**Purpose:** Body text, descriptions, data, timestamps

**Weights Loaded:**
- 400 (Regular)
- 700 (Bold)

**Tailwind Class:** `font-body`

**CSS Variable:** `font-family: 'Space Mono', monospace`

**Usage Examples:**
```tsx
// Body text
<p className="font-body text-sm">Description text here</p>

// Timestamps
<span className="font-body text-xs text-muted-foreground">12:30</span>

// Data/Numbers
<span className="font-body tabular-nums">1,234</span>
```

---

### Font Import (src/main.tsx)
```tsx
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
```

### Tailwind Configuration (tailwind.config.ts)
```ts
fontFamily: {
  display: ["Space Grotesk", "system-ui", "sans-serif"],
  body: ["Space Mono", "monospace"],
}
```

---

## TYPOGRAPHY SCALE

| Element | Font | Size | Weight | Tracking | Case |
|---------|------|------|--------|----------|------|
| Page Title | display | text-2xl (24px) | bold (700) | tight | normal |
| Section Header | display | text-xl (20px) | bold (700) | tight | UPPERCASE |
| Card Title | display | text-lg (18px) | bold (700) | normal | normal |
| Menu Item | display | text-sm (14px) | semibold (600) | wider | UPPERCASE |
| Button Label | display | text-sm (14px) | bold (700) | normal | normal |
| Body Text | body | text-sm (14px) | normal (400) | normal | normal |
| Caption/Meta | body | text-xs (12px) | normal (400) | normal | normal |
| Badge | display | text-xs (12px) | bold (700) | normal | normal |

---

## ICONS

### Icon Library: Lucide React
**Package:** `lucide-react` (v0.462.0)

**Style:** Outline icons with configurable stroke width

**Default Settings:**
- Size: 24px (h-6 w-6)
- Stroke Width: 2
- Color: currentColor

---

### Icon Variants by Context

#### Navigation Icons (Header/Menu)
```tsx
// Hamburger menu
<Menu className="h-6 w-6" strokeWidth={3} />

// Close button
<X className="h-5 w-5" strokeWidth={2} />

// Inbox
<Inbox className="h-6 w-6" strokeWidth={2.5} />

// Back arrow
<ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
```

#### Menu Section Icons
```tsx
// Home
<Home className="h-5 w-5" strokeWidth={2} />

// Calendar/Events
<Calendar className="h-5 w-5" strokeWidth={2} />

// Transport
<Ship className="h-5 w-5" strokeWidth={2} />
<Bus className="h-5 w-5" strokeWidth={2} />

// Feedback
<MessageSquare className="h-5 w-5" strokeWidth={2} />

// Click & Fix
<Wrench className="h-5 w-5" strokeWidth={2} />

// Settings
<Settings className="h-5 w-5" strokeWidth={2} />

// Info pages
<Info className="h-5 w-5" strokeWidth={2} />
<Leaf className="h-5 w-5" strokeWidth={2} />
<Bird className="h-5 w-5" strokeWidth={2} />
```

#### Content Icons
```tsx
// Location
<MapPin className="h-4 w-4" strokeWidth={2} />

// Time
<Clock className="h-4 w-4" strokeWidth={2} />

// External link
<ExternalLink className="h-4 w-4" strokeWidth={2} />

// Chevrons
<ChevronRight className="h-5 w-5" strokeWidth={2} />
<ChevronDown className="h-5 w-5" strokeWidth={2} />

// Check
<Check className="h-5 w-5" strokeWidth={2.5} />
<CheckCircle className="h-6 w-6" strokeWidth={2} />

// Camera (for image upload)
<Camera className="h-8 w-8" strokeWidth={1.5} />

// Send
<Send className="h-5 w-5" strokeWidth={2} />
```

#### Status Icons
```tsx
// Success
<CheckCircle className="h-6 w-6 text-green-600" strokeWidth={2} />

// Error
<AlertCircle className="h-6 w-6 text-destructive" strokeWidth={2} />

// Warning
<AlertTriangle className="h-6 w-6 text-orange" strokeWidth={2} />

// Info
<Info className="h-6 w-6 text-primary" strokeWidth={2} />
```

---

### Complete Icon Inventory

#### Navigation & UI
| Icon | Component | Usage | Size | Stroke |
|------|-----------|-------|------|--------|
| Menu | `<Menu />` | Hamburger button | h-6 w-6 | 3 |
| X | `<X />` | Close button | h-5 w-5 | 2 |
| ArrowLeft | `<ArrowLeft />` | Back navigation | h-6 w-6 | 2.5 |
| ChevronRight | `<ChevronRight />` | List arrow | h-5 w-5 | 2 |
| ChevronDown | `<ChevronDown />` | Expand | h-5 w-5 | 2 |
| ExternalLink | `<ExternalLink />` | External links | h-4 w-4 | 2 |

#### Main Features
| Icon | Component | Usage | Size | Stroke |
|------|-----------|-------|------|--------|
| Home | `<Home />` | Home page | h-5 w-5 | 2 |
| Inbox | `<Inbox />` | Messages | h-6 w-6 | 2.5 |
| Calendar | `<Calendar />` | Events | h-5 w-5 | 2 |
| Ship | `<Ship />` | Ferry/Sea transport | h-5 w-5 | 2 |
| Bus | `<Bus />` | Bus/Road transport | h-5 w-5 | 2 |
| MessageSquare | `<MessageSquare />` | Feedback | h-5 w-5 | 2 |
| Wrench | `<Wrench />` | Click & Fix | h-5 w-5 | 2 |
| Settings | `<Settings />` | Settings | h-5 w-5 | 2 |

#### Content & Data
| Icon | Component | Usage | Size | Stroke |
|------|-----------|-------|------|--------|
| MapPin | `<MapPin />` | Location | h-4 w-4 | 2 |
| Clock | `<Clock />` | Time | h-4 w-4 | 2 |
| Info | `<Info />` | Information | h-5 w-5 | 2 |
| Leaf | `<Leaf />` | Flora | h-5 w-5 | 2 |
| Bird | `<Bird />` | Fauna | h-5 w-5 | 2 |

#### Actions
| Icon | Component | Usage | Size | Stroke |
|------|-----------|-------|------|--------|
| Camera | `<Camera />` | Photo upload | h-8 w-8 | 1.5 |
| Send | `<Send />` | Submit | h-5 w-5 | 2 |
| Check | `<Check />` | Confirm | h-5 w-5 | 2.5 |
| Plus | `<Plus />` | Add | h-5 w-5 | 2 |

#### Status
| Icon | Component | Usage | Size | Stroke |
|------|-----------|-------|------|--------|
| CheckCircle | `<CheckCircle />` | Success | h-6 w-6 | 2 |
| AlertCircle | `<AlertCircle />` | Error | h-6 w-6 | 2 |
| AlertTriangle | `<AlertTriangle />` | Warning | h-6 w-6 | 2 |

---

## USAGE GUIDELINES

### Font Pairing Rules
1. **Headings:** Always use `font-display` (Space Grotesk)
2. **Body copy:** Always use `font-body` (Space Mono)
3. **Buttons/Labels:** Use `font-display` with `font-bold`
4. **Data/Numbers:** Use `font-body` with `tabular-nums`

### Icon Usage Rules
1. **Stroke width 3:** Reserved for primary navigation (hamburger)
2. **Stroke width 2.5:** Important interactive elements (inbox, back)
3. **Stroke width 2:** Standard icons (default)
4. **Stroke width 1.5:** Large decorative icons (camera placeholder)

### Sizing Consistency
- Navigation icons: `h-6 w-6` (24px)
- Menu/list icons: `h-5 w-5` (20px)
- Inline/meta icons: `h-4 w-4` (16px)
- Large decorative: `h-8 w-8` or larger

### Color Application
- Icons inherit `currentColor` by default
- Use semantic colors for status icons
- Never use raw hex/rgb values - always use Tailwind tokens

---

## IMPORT EXAMPLE

```tsx
import {
  Menu,
  X,
  Home,
  Inbox,
  Calendar,
  Ship,
  Bus,
  MessageSquare,
  Wrench,
  Settings,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Clock,
  Camera,
  Send,
  Check,
  CheckCircle,
  AlertCircle,
  Info,
  Leaf,
  Bird,
  ExternalLink,
} from "lucide-react";
```
