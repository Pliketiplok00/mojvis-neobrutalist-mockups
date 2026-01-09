/**
 * MOJ VIS Theme System
 * 
 * Export all available themes and utilities for switching.
 */

import { neobrutalistMediterranean, type Theme } from './neobrutalist-mediterranean';

// Registry of all available themes
export const themes: Record<string, Theme> = {
  'neobrutalist-mediterranean': neobrutalistMediterranean,
};

// Default theme
export const defaultTheme = 'neobrutalist-mediterranean';

/**
 * Apply a theme to the document
 */
export function applyTheme(themeName: string): void {
  const theme = themes[themeName];
  if (!theme) {
    console.warn(`Theme "${themeName}" not found. Using default.`);
    return applyTheme(defaultTheme);
  }
  
  const root = document.documentElement;
  
  // Apply all color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
  
  // Apply design tokens
  root.style.setProperty('--radius', theme.design.radius);
  
  // Store current theme in localStorage
  localStorage.setItem('mojvis-theme', themeName);
  
  console.log(`✓ Theme "${theme.displayName}" applied`);
}

/**
 * Get the currently active theme name
 */
export function getCurrentTheme(): string {
  return localStorage.getItem('mojvis-theme') || defaultTheme;
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const savedTheme = getCurrentTheme();
  applyTheme(savedTheme);
}

/**
 * Get list of available themes for UI
 */
export function getAvailableThemes(): Array<{ id: string; name: string; description: string }> {
  return Object.entries(themes).map(([id, theme]) => ({
    id,
    name: theme.displayName,
    description: theme.description,
  }));
}

export type { Theme };
export { neobrutalistMediterranean };
