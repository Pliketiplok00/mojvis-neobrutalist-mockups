/**
 * MOJ VIS Theme: Neobrutalist Mediterranean
 * 
 * Primary theme with bold borders, flat colors, and Mediterranean palette.
 * Created: January 2026
 */

export const neobrutalistMediterranean = {
  name: 'neobrutalist-mediterranean',
  displayName: 'Neobrutalist Mediterranean',
  description: 'Bold borders, flat colors, Mediterranean warmth',
  
  colors: {
    // Core palette
    background: '50 50% 98%',        // Warm off-white
    foreground: '220 20% 10%',       // Near-black
    
    // Primary - Mediterranean Blue
    primary: '199 89% 48%',
    'primary-foreground': '0 0% 100%',
    
    // Secondary - Warm Cream
    secondary: '45 30% 94%',
    'secondary-foreground': '220 20% 10%',
    
    // Accent - Terracotta
    accent: '16 80% 60%',
    'accent-foreground': '0 0% 100%',
    
    // Muted
    muted: '45 20% 90%',
    'muted-foreground': '220 10% 40%',
    
    // Destructive
    destructive: '0 84% 60%',
    'destructive-foreground': '0 0% 100%',
    
    // UI Elements
    card: '0 0% 100%',
    'card-foreground': '220 20% 10%',
    popover: '0 0% 100%',
    'popover-foreground': '220 20% 10%',
    border: '220 20% 10%',
    input: '220 20% 10%',
    ring: '199 89% 48%',
    
    // Extended Mediterranean palette
    terracotta: '16 80% 60%',
    lavender: '260 40% 70%',
    orange: '30 95% 55%',
    teal: '175 60% 45%',
    pink: '340 70% 65%',
    
    // Sidebar
    'sidebar-background': '45 30% 96%',
    'sidebar-foreground': '220 20% 10%',
    'sidebar-primary': '199 89% 48%',
    'sidebar-primary-foreground': '0 0% 100%',
    'sidebar-accent': '16 80% 60%',
    'sidebar-accent-foreground': '0 0% 100%',
    'sidebar-border': '220 20% 10%',
    'sidebar-ring': '199 89% 48%',
  },
  
  design: {
    radius: '0px',
    borderWidth: '3px',
    shadowStyle: 'neo',  // 4px 4px 0 0 hard shadow
  },
  
  fonts: {
    display: 'Space Grotesk',
    body: 'Space Mono',
  },
};

export type Theme = typeof neobrutalistMediterranean;