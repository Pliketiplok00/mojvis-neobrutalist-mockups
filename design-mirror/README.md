# MOJ VIS Design Mirror

Static HTML/CSS mirror of the MOJ VIS mobile app screens for design iteration.

## How to Open

Simply open the file in your browser:

```bash
open design-mirror/index.html
```

Or double-click `index.html` in Finder/Explorer.

No build step required - these are pure static files with local fonts and icons.

## Structure

```
design-mirror/
├── index.html              # Navigation hub (13 screens)
├── README.md               # This file
├── assets/
│   ├── fonts/              # Local web fonts
│   │   ├── SpaceGrotesk-Regular.woff2
│   │   ├── SpaceGrotesk-Medium.woff2
│   │   ├── SpaceGrotesk-Bold.woff2
│   │   ├── SpaceMono-Regular.woff2
│   │   └── SpaceMono-Bold.woff2
│   └── icons/
│       └── lucide/         # Lucide SVG icons
│           ├── menu.svg
│           ├── home.svg
│           ├── calendar.svg
│           └── ... (26 icons)
├── css/
│   ├── skin.base.css       # Design tokens ONLY
│   ├── typography.css      # @font-face & text styles
│   ├── icons.css           # Icon sizing & utilities
│   ├── components.css      # Reusable UI components
│   └── layout.css          # Structural patterns
└── screens/
    ├── ui-inventory.html   # Component showcase
    ├── home.html + .css    # Main landing screen
    ├── menu.html + .css    # App navigation menu
    ├── transport-sea.html + .css    # Ferry departures
    ├── transport-road.html + .css   # Bus departures
    ├── events.html + .css           # Event listings
    ├── event-detail.html + .css     # Single event view
    ├── flora.html + .css            # Island plant life
    ├── fauna.html + .css            # Island wildlife
    ├── info.html + .css             # Contacts & about
    ├── inbox.html + .css            # Notifications
    ├── feedback.html + .css         # Send feedback
    ├── clickfix-form.html + .css    # Issue report form
    └── settings.html + .css         # App preferences
```

## Editing Workflow

### 1. Design Tokens (`css/skin.base.css`)

This file contains ONLY CSS custom properties (tokens). No selectors, no rules.

- **Colors**: `--color-primary`, `--color-background`, `--color-text-*`, etc.
- **Spacing**: `--spacing-xs` through `--spacing-xxxl`
- **Typography**: `--font-display`, `--font-body`, `--font-size-*`
- **Borders**: `--border-width-*`, `--border-radius-*`
- **Shadows**: `--shadow-offset`, `--shadow-color`
- **Icons**: `--icon-size-*`, `--icon-stroke-*`

Example:
```css
:root {
  --color-primary: #2563eb;  /* Change brand color */
  --shadow-offset: 6px;       /* Bigger poster shadow */
}
```

### 2. Typography (`css/typography.css`)

Contains `@font-face` declarations and text utility classes:

- **Fonts**: Space Grotesk (display), Space Mono (body)
- **Headings**: `.text-h1` through `.text-h4`
- **Body text**: `.text-body`, `.text-body-lg`, `.text-meta`
- **Button text**: `.text-button`
- **Colors**: `.text-primary`, `.text-secondary`, `.text-muted`

### 3. Icons (`css/icons.css`)

Icon utility classes for Lucide SVG icons:

- **Sizes**: `.icon-sm`, `.icon-md`, `.icon-lg`, `.icon-xl`
- **Stroke weights**: `.icon-stroke-light`, `.icon-stroke-regular`, `.icon-stroke-strong`
- **Colors**: `.icon-primary`, `.icon-muted`, `.icon-white`

Usage in HTML:
```html
<span class="icon icon-lg">
  <img src="../assets/icons/lucide/home.svg" alt="">
</span>
```

### 4. Components (`css/components.css`)

Edit this file to change reusable UI patterns:

- **Poster Card**: `.poster-card`, `.poster-card__shadow`, `.poster-card__content`
- **Buttons**: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn-poster`
- **Badges**: `.badge`, `.badge--sea`, `.badge--road`
- **List Rows**: `.list-row`, `.list-row__time-slab`, `.list-row__content`
- **Date Badge**: `.date-badge`, `.date-badge__day`, `.date-badge__month`
- **Inputs**: `.input`, `.textarea`, `.input-group`
- **Header**: `.header`, `.header__title`, `.header__icon`

All components use CSS variables - no hardcoded colors.

### 5. Layout (`css/layout.css`)

Edit this file to change structural patterns:

- **Screen container**: `.screen` (max-width, centering)
- **Main content**: `.main`, `.main--flush`
- **Sections**: `.section`, `.section-label`
- **Grids**: `.grid-2`, `.quick-actions`
- **Flex utilities**: `.flex`, `.gap-*`, `.items-center`
- **Spacing utilities**: `.mt-*`, `.mb-*`, `.p-*`

### 6. Per-Screen Overrides (`screens/*.css`)

Each screen has its own CSS file for local customizations:

- `home.css` - Home screen specifics
- `menu.css` - Navigation menu
- `transport-sea.css` - Sea transport specifics
- `transport-road.css` - Road transport specifics
- `events.css` - Events list specifics
- `event-detail.css` - Event detail specifics
- `flora.css` - Flora listing
- `fauna.css` - Fauna listing
- `info.css` - Information page
- `inbox.css` - Notifications inbox
- `feedback.css` - Feedback form
- `clickfix-form.css` - Issue report form
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
2. `../css/typography.css` - Fonts & text styles
3. `../css/icons.css` - Icon utilities
4. `../css/components.css` - Components
5. `../css/layout.css` - Layout patterns
6. `./<screen>.css` - Screen overrides (highest priority)

This ensures screen-specific styles can override component defaults.

## Body Classes

Each screen body has the class pattern:

```html
<body class="screen screen--<screen-name>">
```

Available screen classes:
- `.screen--home`
- `.screen--menu`
- `.screen--transport-sea`
- `.screen--transport-road`
- `.screen--events`
- `.screen--event-detail`
- `.screen--flora`
- `.screen--fauna`
- `.screen--info`
- `.screen--inbox`
- `.screen--feedback`
- `.screen--clickfix-form`
- `.screen--settings`

## Available Icons

The following Lucide icons are included in `assets/icons/lucide/`:

- **Navigation**: menu, home, chevron-left, chevron-right, chevron-up, chevron-down, x
- **Transport**: bus, ship, anchor
- **Nature**: leaf, flower, fish
- **Actions**: calendar, clock, map-pin, user, settings, wrench
- **Communication**: inbox, mail, mail-open, message-circle, phone, send, bell
- **Media**: camera, image, share
- **Status**: info, alert-triangle, check, globe
- **Documents**: file-text

## Design DNA

This design system follows neobrutalist poster style:

- **Sharp corners**: `border-radius: 0` (no rounded corners)
- **Thick borders**: 2-4px borders in dark color
- **Offset shadows**: 4px diagonal shadow layer behind cards
- **Bold typography**: Space Grotesk for headings, Space Mono for body
- **High contrast**: Dark text on light backgrounds
- **Flat colors**: No gradients, solid colors only

## Tips

1. Start with `ui-inventory.html` to see all components
2. Edit `skin.base.css` first for global token changes
3. Use browser DevTools to experiment before saving
4. Screen CSS files are for exceptions, not complete redesigns
5. Keep all colors in CSS variables - never hardcode hex values
6. All fonts and icons load locally - no CDN dependencies
