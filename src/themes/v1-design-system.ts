/**
 * MOJ VIS V1 Design System - Complete TypeScript Definition
 * Neobrutalist Mediterranean Theme
 * 
 * This file contains the complete design system as an exportable object.
 * Use this to maintain consistency across all components.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ColorPalette {
  /** HSL value without hsl() wrapper, e.g., "45 30% 96%" */
  value: string;
  /** Human-readable description */
  description: string;
  /** Usage guidelines */
  usage: string[];
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
}

export interface SpacingScale {
  [key: string]: string;
}

export interface ShadowStyle {
  value: string;
  description: string;
}

export interface BorderStyle {
  width: string;
  style: string;
  color: string;
}

export interface ComponentVariant {
  base: string;
  hover?: string;
  active?: string;
  disabled?: string;
  focus?: string;
}

export interface ButtonVariants {
  primary: ComponentVariant;
  secondary: ComponentVariant;
  outline: ComponentVariant;
  ghost: ComponentVariant;
  destructive: ComponentVariant;
  link: ComponentVariant;
}

export interface BadgeVariants {
  default: ComponentVariant;
  secondary: ComponentVariant;
  outline: ComponentVariant;
  destructive: ComponentVariant;
  accent: ComponentVariant;
  muted: ComponentVariant;
}

export interface StateIndicators {
  loading: { class: string; description: string };
  empty: { class: string; description: string };
  error: { class: string; description: string };
  success: { class: string; description: string };
}

export interface IconConfig {
  defaultSize: number;
  strokeWidth: number;
  sizes: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    bounce: string;
    smooth: string;
  };
  transitions: {
    hover: string;
    press: string;
    fade: string;
  };
}

export interface LayoutConfig {
  mobileFrame: {
    maxWidth: string;
    aspectRatio: string;
    borderRadius: string;
  };
  header: {
    height: string;
    padding: string;
  };
  content: {
    padding: string;
    gap: string;
  };
  menu: {
    itemHeight: string;
    gap: string;
  };
}

export interface V1DesignSystem {
  name: string;
  displayName: string;
  description: string;
  version: string;
  
  colors: {
    core: Record<string, ColorPalette>;
    extended: Record<string, ColorPalette>;
    semantic: Record<string, ColorPalette>;
    sidebar: Record<string, ColorPalette>;
  };
  
  typography: {
    fonts: {
      display: string;
      body: string;
    };
    styles: Record<string, TypographyStyle>;
  };
  
  spacing: SpacingScale;
  
  borders: {
    width: Record<string, string>;
    radius: Record<string, string>;
    styles: Record<string, BorderStyle>;
  };
  
  shadows: Record<string, ShadowStyle>;
  
  components: {
    button: {
      sizes: Record<string, string>;
      variants: ButtonVariants;
    };
    badge: {
      variants: BadgeVariants;
    };
    card: {
      base: string;
      interactive: string;
    };
    input: {
      base: string;
      focus: string;
      error: string;
    };
    states: StateIndicators;
  };
  
  icons: IconConfig;
  animations: AnimationConfig;
  layout: LayoutConfig;
  
  utilities: {
    classes: Record<string, string>;
  };
}

// ============================================================================
// V1 DESIGN SYSTEM DEFINITION
// ============================================================================

export const v1DesignSystem: V1DesignSystem = {
  name: 'neobrutalist-mediterranean',
  displayName: 'Neobrutalist Mediterranean',
  description: 'Bold, geometric forms with warm Mediterranean color palette',
  version: '1.0.0',

  // ==========================================================================
  // COLORS
  // ==========================================================================
  colors: {
    core: {
      background: {
        value: '45 30% 96%',
        description: 'Warm sand/cream - primary background',
        usage: ['Page backgrounds', 'Card backgrounds', 'Modal overlays'],
      },
      foreground: {
        value: '220 20% 10%',
        description: 'Near black - primary text',
        usage: ['Body text', 'Headings', 'Icons'],
      },
      primary: {
        value: '210 80% 45%',
        description: 'Mediterranean Blue - brand color',
        usage: ['Primary buttons', 'Links', 'Active states', 'Key actions'],
      },
      'primary-foreground': {
        value: '0 0% 100%',
        description: 'White - text on primary',
        usage: ['Text on primary buttons', 'Icons on primary backgrounds'],
      },
      secondary: {
        value: '160 45% 38%',
        description: 'Olive Green - secondary actions',
        usage: ['Secondary buttons', 'Success indicators', 'Nature elements'],
      },
      'secondary-foreground': {
        value: '0 0% 100%',
        description: 'White - text on secondary',
        usage: ['Text on secondary buttons'],
      },
      accent: {
        value: '45 92% 55%',
        description: 'Sun Yellow - highlights',
        usage: ['Highlights', 'Notifications', 'Important badges', 'Warnings'],
      },
      'accent-foreground': {
        value: '220 20% 10%',
        description: 'Dark text on accent',
        usage: ['Text on yellow backgrounds'],
      },
      muted: {
        value: '45 15% 90%',
        description: 'Muted background',
        usage: ['Disabled states', 'Subtle backgrounds', 'Dividers'],
      },
      'muted-foreground': {
        value: '220 10% 40%',
        description: 'Muted text',
        usage: ['Secondary text', 'Placeholders', 'Timestamps'],
      },
      destructive: {
        value: '12 55% 50%',
        description: 'Terracotta Red - errors/warnings',
        usage: ['Delete buttons', 'Error states', 'Urgent notifications'],
      },
      'destructive-foreground': {
        value: '0 0% 100%',
        description: 'White on destructive',
        usage: ['Text on destructive buttons'],
      },
    },

    extended: {
      terracotta: {
        value: '12 55% 50%',
        description: 'Warm terracotta',
        usage: ['Accent color', 'Mediterranean elements'],
      },
      lavender: {
        value: '270 35% 70%',
        description: 'Soft lavender',
        usage: ['Decorative elements', 'Subtle accents'],
      },
      orange: {
        value: '25 85% 55%',
        description: 'Warm orange',
        usage: ['Warnings', 'Attention elements'],
      },
      teal: {
        value: '180 45% 42%',
        description: 'Sea teal',
        usage: ['Info states', 'Sea transport elements'],
      },
      pink: {
        value: '350 50% 65%',
        description: 'Soft pink',
        usage: ['Decorative elements', 'Event categories'],
      },
    },

    semantic: {
      border: {
        value: '220 20% 10%',
        description: 'Pure black borders - neobrutalist signature',
        usage: ['All component borders', 'Dividers'],
      },
      input: {
        value: '45 25% 98%',
        description: 'Light input background',
        usage: ['Form inputs', 'Text areas'],
      },
      ring: {
        value: '210 80% 45%',
        description: 'Focus ring color',
        usage: ['Focus states', 'Keyboard navigation'],
      },
      card: {
        value: '45 25% 98%',
        description: 'Card background',
        usage: ['Card components', 'Elevated surfaces'],
      },
      'card-foreground': {
        value: '220 20% 10%',
        description: 'Card text',
        usage: ['Text within cards'],
      },
      popover: {
        value: '45 25% 98%',
        description: 'Popover background',
        usage: ['Dropdowns', 'Tooltips', 'Menus'],
      },
      'popover-foreground': {
        value: '220 20% 10%',
        description: 'Popover text',
        usage: ['Text in popovers'],
      },
    },

    sidebar: {
      'sidebar-background': {
        value: '45 30% 96%',
        description: 'Sidebar background',
        usage: ['Menu overlay', 'Navigation sidebar'],
      },
      'sidebar-foreground': {
        value: '220 20% 10%',
        description: 'Sidebar text',
        usage: ['Menu items', 'Sidebar navigation'],
      },
      'sidebar-primary': {
        value: '210 80% 45%',
        description: 'Sidebar primary',
        usage: ['Active menu items'],
      },
      'sidebar-primary-foreground': {
        value: '0 0% 100%',
        description: 'Sidebar primary text',
        usage: ['Text on active items'],
      },
      'sidebar-accent': {
        value: '45 92% 55%',
        description: 'Sidebar accent',
        usage: ['Highlighted items', 'Badges'],
      },
      'sidebar-accent-foreground': {
        value: '220 20% 10%',
        description: 'Sidebar accent text',
        usage: ['Text on highlighted items'],
      },
      'sidebar-border': {
        value: '220 20% 10%',
        description: 'Sidebar borders',
        usage: ['Dividers', 'Item borders'],
      },
      'sidebar-ring': {
        value: '210 80% 45%',
        description: 'Sidebar focus ring',
        usage: ['Focus states in sidebar'],
      },
    },
  },

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  typography: {
    fonts: {
      display: '"Space Grotesk", system-ui, sans-serif',
      body: '"Space Mono", monospace',
    },
    styles: {
      h1: {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
      },
      h2: {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '1.5rem',
        fontWeight: 700,
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
      },
      h3: {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '1.25rem',
        fontWeight: 700,
        lineHeight: '1.4',
      },
      h4: {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '1.125rem',
        fontWeight: 700,
        lineHeight: '1.4',
      },
      body: {
        fontFamily: '"Space Mono", monospace',
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.6',
      },
      bodyLarge: {
        fontFamily: '"Space Mono", monospace',
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: '1.6',
      },
      small: {
        fontFamily: '"Space Mono", monospace',
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1.5',
      },
      caption: {
        fontFamily: '"Space Mono", monospace',
        fontSize: '0.625rem',
        fontWeight: 400,
        lineHeight: '1.4',
        letterSpacing: '0.05em',
      },
      menuItem: {
        fontFamily: '"Space Grotesk", system-ui, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 600,
        lineHeight: '1',
        letterSpacing: '0.05em',
      },
    },
  },

  // ==========================================================================
  // SPACING
  // ==========================================================================
  spacing: {
    '0': '0',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
    '11': '2.75rem',
    '12': '3rem',
    '14': '3.5rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '28': '7rem',
    '32': '8rem',
  },

  // ==========================================================================
  // BORDERS
  // ==========================================================================
  borders: {
    width: {
      default: '2px',
      heavy: '3px',
      thick: '4px',
    },
    radius: {
      none: '0px',
      soft: '4px',
      sm: '2px',
    },
    styles: {
      default: {
        width: '2px',
        style: 'solid',
        color: 'hsl(var(--border))',
      },
      heavy: {
        width: '3px',
        style: 'solid',
        color: 'hsl(var(--border))',
      },
      thick: {
        width: '4px',
        style: 'solid',
        color: 'hsl(var(--border))',
      },
    },
  },

  // ==========================================================================
  // SHADOWS
  // ==========================================================================
  shadows: {
    neo: {
      value: '4px 4px 0 0 hsl(var(--border))',
      description: 'Standard neobrutalist shadow',
    },
    neoLg: {
      value: '6px 6px 0 0 hsl(var(--border))',
      description: 'Large neobrutalist shadow',
    },
    neoPrimary: {
      value: '4px 4px 0 0 hsl(var(--primary))',
      description: 'Primary color shadow',
    },
    neoAccent: {
      value: '4px 4px 0 0 hsl(var(--accent))',
      description: 'Accent color shadow',
    },
    neoSecondary: {
      value: '4px 4px 0 0 hsl(var(--secondary))',
      description: 'Secondary color shadow',
    },
    neoHover: {
      value: '6px 6px 0 0 hsl(var(--border))',
      description: 'Hover state shadow (expanded)',
    },
    neoActive: {
      value: '0 0 0 0 hsl(var(--border))',
      description: 'Active/pressed state shadow (collapsed)',
    },
  },

  // ==========================================================================
  // COMPONENTS
  // ==========================================================================
  components: {
    button: {
      sizes: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
      variants: {
        primary: {
          base: 'bg-primary text-primary-foreground border-2 border-border neo-shadow',
          hover: 'translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_0_hsl(var(--border))]',
          active: 'translate-x-[2px] translate-y-[2px] shadow-none',
          disabled: 'opacity-50 cursor-not-allowed',
          focus: 'ring-2 ring-ring ring-offset-2',
        },
        secondary: {
          base: 'bg-secondary text-secondary-foreground border-2 border-border neo-shadow',
          hover: 'translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_0_hsl(var(--border))]',
          active: 'translate-x-[2px] translate-y-[2px] shadow-none',
          disabled: 'opacity-50 cursor-not-allowed',
          focus: 'ring-2 ring-ring ring-offset-2',
        },
        outline: {
          base: 'bg-background text-foreground border-2 border-border neo-shadow',
          hover: 'translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_0_hsl(var(--border))]',
          active: 'translate-x-[2px] translate-y-[2px] shadow-none',
          disabled: 'opacity-50 cursor-not-allowed',
          focus: 'ring-2 ring-ring ring-offset-2',
        },
        ghost: {
          base: 'bg-transparent text-foreground',
          hover: 'bg-muted',
          active: 'bg-muted',
          disabled: 'opacity-50 cursor-not-allowed',
        },
        destructive: {
          base: 'bg-destructive text-destructive-foreground border-2 border-border neo-shadow',
          hover: 'translate-x-[-2px] translate-y-[-2px] shadow-[6px_6px_0_0_hsl(var(--border))]',
          active: 'translate-x-[2px] translate-y-[2px] shadow-none',
          disabled: 'opacity-50 cursor-not-allowed',
          focus: 'ring-2 ring-destructive ring-offset-2',
        },
        link: {
          base: 'text-primary underline-offset-4',
          hover: 'underline',
        },
      },
    },

    badge: {
      variants: {
        default: {
          base: 'bg-primary text-primary-foreground border border-border text-xs px-2 py-0.5',
        },
        secondary: {
          base: 'bg-secondary text-secondary-foreground border border-border text-xs px-2 py-0.5',
        },
        outline: {
          base: 'bg-transparent text-foreground border-2 border-border text-xs px-2 py-0.5',
        },
        destructive: {
          base: 'bg-destructive text-destructive-foreground border border-border text-xs px-2 py-0.5',
        },
        accent: {
          base: 'bg-accent text-accent-foreground border border-border text-xs px-2 py-0.5',
        },
        muted: {
          base: 'bg-muted text-muted-foreground text-xs px-2 py-0.5',
        },
      },
    },

    card: {
      base: 'bg-card border-2 border-border neo-shadow p-4',
      interactive: 'bg-card border-2 border-border neo-shadow p-4 neo-hover cursor-pointer',
    },

    input: {
      base: 'bg-input border-2 border-border px-3 py-2 text-sm font-body placeholder:text-muted-foreground',
      focus: 'ring-2 ring-ring ring-offset-2 outline-none',
      error: 'border-destructive ring-destructive',
    },

    states: {
      loading: {
        class: 'flex items-center justify-center p-8',
        description: 'Centered spinner with "Učitavanje..." text',
      },
      empty: {
        class: 'flex flex-col items-center justify-center p-8 text-muted-foreground',
        description: 'Centered icon + message',
      },
      error: {
        class: 'flex flex-col items-center justify-center p-8 text-destructive',
        description: 'Centered alert icon + error message + retry button',
      },
      success: {
        class: 'flex flex-col items-center justify-center p-8 text-secondary',
        description: 'Centered check icon + success message',
      },
    },
  },

  // ==========================================================================
  // ICONS
  // ==========================================================================
  icons: {
    defaultSize: 20,
    strokeWidth: 2,
    sizes: {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
    },
  },

  // ==========================================================================
  // ANIMATIONS
  // ==========================================================================
  animations: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'ease-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    transitions: {
      hover: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
      press: 'transform 0.05s ease-out',
      fade: 'opacity 0.2s ease-out',
    },
  },

  // ==========================================================================
  // LAYOUT
  // ==========================================================================
  layout: {
    mobileFrame: {
      maxWidth: '430px',
      aspectRatio: '9/19.5',
      borderRadius: '2.5rem',
    },
    header: {
      height: '56px',
      padding: '0.75rem 1rem',
    },
    content: {
      padding: '1rem',
      gap: '0.75rem',
    },
    menu: {
      itemHeight: '3.5rem',
      gap: '0.5rem',
    },
  },

  // ==========================================================================
  // UTILITY CLASSES
  // ==========================================================================
  utilities: {
    classes: {
      'neo-border': 'border-[2px] border-border',
      'neo-border-heavy': 'border-[3px] border-border',
      'neo-shadow': 'shadow-[4px_4px_0_0_hsl(var(--border))]',
      'neo-shadow-lg': 'shadow-[6px_6px_0_0_hsl(var(--border))]',
      'neo-shadow-primary': 'shadow-[4px_4px_0_0_hsl(var(--primary))]',
      'neo-shadow-accent': 'shadow-[4px_4px_0_0_hsl(var(--accent))]',
      'neo-shadow-secondary': 'shadow-[4px_4px_0_0_hsl(var(--secondary))]',
      'neo-hover': 'transition-transform duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_hsl(var(--border))] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
      'font-display': 'font-[var(--font-display)]',
      'font-body': 'font-[var(--font-body)]',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get HSL color value ready for CSS
 */
export function getColor(
  category: keyof V1DesignSystem['colors'],
  name: string
): string {
  const colorCategory = v1DesignSystem.colors[category];
  if (colorCategory && name in colorCategory) {
    return `hsl(${(colorCategory as Record<string, ColorPalette>)[name].value})`;
  }
  return '';
}

/**
 * Get typography style object
 */
export function getTypography(styleName: string): TypographyStyle | undefined {
  return v1DesignSystem.typography.styles[styleName];
}

/**
 * Get shadow CSS value
 */
export function getShadow(shadowName: keyof V1DesignSystem['shadows']): string {
  return v1DesignSystem.shadows[shadowName]?.value || '';
}

/**
 * Get component variant classes
 */
export function getButtonVariant(
  variant: keyof ButtonVariants,
  state: keyof ComponentVariant = 'base'
): string {
  return v1DesignSystem.components.button.variants[variant]?.[state] || '';
}

/**
 * Get badge variant classes
 */
export function getBadgeVariant(
  variant: keyof BadgeVariants
): string {
  return v1DesignSystem.components.badge.variants[variant]?.base || '';
}

/**
 * Generate CSS custom properties from theme
 */
export function generateCSSVariables(): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Core colors
  Object.entries(v1DesignSystem.colors.core).forEach(([key, color]) => {
    variables[`--${key}`] = color.value;
  });
  
  // Extended colors
  Object.entries(v1DesignSystem.colors.extended).forEach(([key, color]) => {
    variables[`--${key}`] = color.value;
  });
  
  // Semantic colors
  Object.entries(v1DesignSystem.colors.semantic).forEach(([key, color]) => {
    variables[`--${key}`] = color.value;
  });
  
  // Sidebar colors
  Object.entries(v1DesignSystem.colors.sidebar).forEach(([key, color]) => {
    variables[`--${key}`] = color.value;
  });
  
  // Design tokens
  variables['--border-width'] = v1DesignSystem.borders.width.default;
  variables['--border-heavy'] = v1DesignSystem.borders.width.heavy;
  variables['--radius'] = v1DesignSystem.borders.radius.none;
  variables['--radius-soft'] = v1DesignSystem.borders.radius.soft;
  variables['--shadow-offset'] = '4px';
  variables['--shadow-offset-lg'] = '6px';
  variables['--font-display'] = v1DesignSystem.typography.fonts.display;
  variables['--font-body'] = v1DesignSystem.typography.fonts.body;
  
  return variables;
}

/**
 * Apply theme to document root
 */
export function applyV1Theme(): void {
  const root = document.documentElement;
  const variables = generateCSSVariables();
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  console.log('✓ V1 Neobrutalist Mediterranean theme applied');
}

// Export default
export default v1DesignSystem;
