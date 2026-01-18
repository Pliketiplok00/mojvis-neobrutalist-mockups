# MOJ VIS Design Mirror

Static HTML/CSS mirror of the MOJ VIS mobile app screens for design iteration.

## How to Open

Simply open the file in your browser:

```bash
open design-mirror/index.html
```

Or double-click `index.html` in Finder/Explorer.

No build step required - these are pure static files.

## Structure

```
design-mirror/
├── index.html              # Navigation hub
├── README.md               # This file
├── css/
│   ├── skin.base.css       # Design tokens (colors, spacing, typography)
│   ├── components.css      # Reusable UI components
│   └── layout.css          # Structural patterns
└── screens/
    ├── ui-inventory.html   # Component showcase
    ├── home.html + .css    # Main landing screen
    ├── transport-sea.html + .css    # Ferry departures
    ├── transport-road.html + .css   # Bus departures
    ├── events.html + .css           # Event listings
    ├── event-detail.html + .css     # Single event view
    ├── clickfix-form.html + .css    # Issue report form
    └── settings.html + .css         # App preferences
```

## Editing Workflow

### 1. Design Tokens (`css/skin.base.css`)

Edit this file to change global design values:

- **Colors**: `--color-primary`, `--color-background`, `--color-text-*`, etc.
- **Spacing**: `--spacing-xs` through `--spacing-xxxl`
- **Typography**: `--font-display`, `--font-body`, `--font-size-*`
- **Borders**: `--border-width-*`, `--border-radius-*`
- **Shadows**: `--shadow-offset`, `--shadow-color`

Example:
```css
:root {
  --color-primary: #2563eb;  /* Change brand color */
  --shadow-offset: 6px;       /* Bigger poster shadow */
}
```

### 2. Components (`css/components.css`)

Edit this file to change reusable UI patterns:

- **Poster Card**: `.poster-card`, `.poster-card__shadow`, `.poster-card__content`
- **Buttons**: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn-poster`
- **Badges**: `.badge`, `.badge--sea`, `.badge--road`
- **List Rows**: `.list-row`, `.list-row__time-slab`, `.list-row__content`
- **Date Badge**: `.date-badge`, `.date-badge__day`, `.date-badge__month`
- **Inputs**: `.input`, `.textarea`, `.input-group`
- **Header**: `.header`, `.header__title`, `.header__icon`

All components use CSS variables - no hardcoded colors.

### 3. Layout (`css/layout.css`)

Edit this file to change structural patterns:

- **Screen container**: `.screen` (max-width, centering)
- **Main content**: `.main`, `.main--flush`
- **Sections**: `.section`, `.section-label`
- **Grids**: `.grid-2`, `.quick-actions`
- **Flex utilities**: `.flex`, `.gap-*`, `.items-center`
- **Spacing utilities**: `.mt-*`, `.mb-*`, `.p-*`

### 4. Per-Screen Overrides (`screens/*.css`)

Each screen has its own CSS file for local customizations:

- `home.css` - Home screen specifics
- `transport-sea.css` - Sea transport specifics
- `transport-road.css` - Road transport specifics
- `events.css` - Events list specifics
- `event-detail.css` - Event detail specifics
- `clickfix-form.css` - Form specifics
- `settings.css` - Settings specifics

Example override:
```css
/* transport-sea.css */
.screen--transport-sea .list-row__time-slab {
  background-color: var(--color-primary);
}
```

## CSS Loading Order

Each screen HTML loads stylesheets in this order:

1. `../css/skin.base.css` - Tokens (lowest priority)
2. `../css/components.css` - Components
3. `../css/layout.css` - Layout
4. `./<screen>.css` - Screen overrides (highest priority)

This ensures screen-specific styles can override component defaults.

## Body Classes

Each screen body has the class pattern:

```html
<body class="screen screen--<screen-name>">
```

Use these for screen-specific targeting:

- `.screen--home`
- `.screen--transport-sea`
- `.screen--transport-road`
- `.screen--events`
- `.screen--event-detail`
- `.screen--clickfix-form`
- `.screen--settings`

## Design DNA

This design system follows neobrutalist poster style:

- **Sharp corners**: `border-radius: 0` (no rounded corners)
- **Thick borders**: 2-4px borders in dark color
- **Offset shadows**: 4px diagonal shadow layer behind cards
- **Bold typography**: Display font for headings, mono for body
- **High contrast**: Dark text on light backgrounds
- **Flat colors**: No gradients, solid colors only

## Tips

1. Start with `ui-inventory.html` to see all components
2. Edit `skin.base.css` first for global changes
3. Use browser DevTools to experiment before saving
4. Screen CSS files are for exceptions, not complete redesigns
5. Keep all colors in CSS variables - never hardcode hex values
