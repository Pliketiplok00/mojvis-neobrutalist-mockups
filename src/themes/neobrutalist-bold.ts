/**
 * Neobrutalist BOLD Theme
 * 
 * Second interpretation of neobrutalist Mediterranean style.
 * More aggressive, darker contrasts, bolder shadows.
 * 
 * Key differences from v1:
 * - Darker primary (deep ocean blue)
 * - Warmer background (aged paper)
 * - Thicker borders (4px base)
 * - Larger shadow offsets
 * - More saturated accent colors
 */

export const neobrutalistBold = {
  name: 'neobrutalist-bold',
  displayName: 'Neobrutalist BOLD',
  description: 'Aggressive neobrutalist with deeper colors and bolder shadows',
  
  colors: {
    // Deep aged paper background
    background: '40 25% 92%',
    foreground: '220 30% 8%',
    
    // Primary - Deep Ocean Blue
    primary: '220 85% 35%',
    'primary-foreground': '0 0% 100%',
    
    // Secondary - Forest Green
    secondary: '150 55% 28%',
    'secondary-foreground': '0 0% 100%',
    
    // Accent - Marigold Yellow
    accent: '38 95% 50%',
    'accent-foreground': '220 30% 8%',
    
    muted: '40 12% 85%',
    'muted-foreground': '220 15% 45%',
    
    // Rust Red
    destructive: '8 65% 42%',
    'destructive-foreground': '0 0% 100%',
    
    // UI Elements
    card: '40 20% 95%',
    'card-foreground': '220 30% 8%',
    popover: '40 20% 95%',
    'popover-foreground': '220 30% 8%',
    border: '220 30% 8%',
    input: '40 20% 95%',
    ring: '220 85% 35%',
    
    // Extended palette - more saturated
    terracotta: '15 60% 45%',
    lavender: '280 40% 65%',
    orange: '28 90% 50%',
    teal: '175 55% 35%',
    pink: '345 55% 60%',
    
    // Sidebar - inverted
    'sidebar-background': '220 30% 8%',
    'sidebar-foreground': '40 25% 92%',
    'sidebar-primary': '38 95% 50%',
    'sidebar-primary-foreground': '220 30% 8%',
    'sidebar-accent': '220 85% 35%',
    'sidebar-accent-foreground': '0 0% 100%',
    'sidebar-border': '40 25% 92%',
    'sidebar-ring': '38 95% 50%',
  },
  
  design: {
    radius: '0px',
    borderWidth: '4px',
    shadowStyle: 'neo-bold',  // 6px 6px 0 0 hard shadow
  },
  
  fonts: {
    display: 'Space Grotesk',
    body: 'Space Mono',
  },
};

export type ThemeBold = typeof neobrutalistBold;
