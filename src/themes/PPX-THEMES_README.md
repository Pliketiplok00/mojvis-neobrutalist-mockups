# MOJ VIS Theme System

## Quick Start

### Apply a theme with one click (in code):
```tsx
import { applyTheme } from '@/themes';

// Apply the original theme
applyTheme('neobrutalist-mediterranean');

// Apply an alternative theme
applyTheme('your-new-theme');
```

### Initialize on app start:
```tsx
import { initializeTheme } from '@/themes';

// In App.tsx or main.tsx
initializeTheme(); // Loads saved theme from localStorage
```

---

## Creating a New Theme

1. **Copy the template:**
   ```bash
   cp src/themes/neobrutalist-mediterranean.ts src/themes/your-theme-name.ts
   ```

2. **Edit the new file:**
   - Change `name`, `displayName`, `description`
   - Modify all color values (HSL format without `hsl()` wrapper)
   - Adjust `design` tokens if needed

3. **Register in index.ts:**
   ```ts
   import { yourThemeName } from './your-theme-name';
   
   export const themes: Record<string, Theme> = {
     'neobrutalist-mediterranean': neobrutalistMediterranean,
     'your-theme-name': yourThemeName, // Add here
   };
   ```

---

## Theme Structure

```ts
{
  name: 'theme-id',           // URL-safe identifier
  displayName: 'Theme Name',  // Human-readable name
  description: 'Short desc',  // For theme picker UI
  
  colors: {
    // Core (required)
    background: 'H S% L%',
    foreground: 'H S% L%',
    primary: 'H S% L%',
    'primary-foreground': 'H S% L%',
    // ... all semantic tokens
  },
  
  design: {
    radius: '0px',        // Border radius
    borderWidth: '3px',   // Border thickness
    shadowStyle: 'neo',   // Shadow preset
  },
  
  fonts: {
    display: 'Font Name',
    body: 'Font Name',
  },
}
```

---

## Available Themes

| ID | Name | Description |
|----|------|-------------|
| `neobrutalist-mediterranean` | Neobrutalist Mediterranean | Bold borders, flat colors, Mediterranean warmth |

---

## Color Format

All colors use HSL values **without** the `hsl()` wrapper:
```ts
// ✓ Correct
primary: '199 89% 48%'

// ✗ Wrong
primary: 'hsl(199, 89%, 48%)'
primary: '#00a8e8'
```

This allows Tailwind to add opacity modifiers like `bg-primary/50`.

---

## Tips for Alternative Themes

### Minimal changes (same structure, different colors):
- Keep the same `design` tokens
- Only change `colors`

### Soft/rounded variant:
```ts
design: {
  radius: '12px',
  borderWidth: '1px',
  shadowStyle: 'soft',
}
```

### Dark mode variant:
- Swap background/foreground values
- Adjust muted colors for dark backgrounds
- Ensure contrast ratios meet WCAG AA

---

## Version History

- **v1.0** (Jan 2026): Initial theme system with Neobrutalist Mediterranean