/**
 * Micro Primitives
 *
 * Phase 3: Small, reusable UI building blocks.
 *
 * Primitives:
 * - NotificationBadge: Positioned count badge for icons
 * - Hairline: Thin horizontal divider line
 * - Dot: Small circular indicator (unread, status)
 * - IconBox: Container for centering icons with consistent sizing
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { skin } from './skin';
import { Meta } from './Text';

// ─────────────────────────────────────────────────────────────────────────────
// NotificationBadge
// ─────────────────────────────────────────────────────────────────────────────

interface NotificationBadgeProps {
  /** Count to display (shows 99+ if over 99) */
  count: number;
  /** Optional additional style */
  style?: ViewStyle;
}

/**
 * Positioned notification count badge.
 *
 * Used for showing unread counts on icons (e.g., inbox badge).
 * Designed to be positioned absolutely within a parent container.
 */
export function NotificationBadge({ count, style }: NotificationBadgeProps): React.JSX.Element | null {
  if (count <= 0) return null;

  return (
    <View style={[styles.notificationBadge, style]}>
      <Meta style={styles.notificationBadgeText}>
        {count > 99 ? '99+' : count}
      </Meta>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hairline
// ─────────────────────────────────────────────────────────────────────────────

interface HairlineProps {
  /** Color token for the line (defaults to borderLight) */
  color?: string;
  /** Optional additional style */
  style?: ViewStyle;
}

/**
 * Thin horizontal divider line.
 *
 * Uses skin.borders.widthHairline for consistent 1px line across the app.
 */
export function Hairline({ color, style }: HairlineProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.hairline,
        color ? { backgroundColor: color } : undefined,
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dot
// ─────────────────────────────────────────────────────────────────────────────

type DotSize = 'sm' | 'md';

interface DotProps {
  /** Size preset: 'sm' (6px) or 'md' (10px, default) */
  size?: DotSize;
  /** Color token for the dot (defaults to unreadIndicator) */
  color?: string;
  /** Optional additional style */
  style?: ViewStyle;
}

const DOT_SIZES: Record<DotSize, number> = {
  sm: 6,
  md: 10,
};

/**
 * Small circular indicator dot.
 *
 * Used for unread indicators, status dots, and list markers.
 */
export function Dot({ size = 'md', color, style }: DotProps): React.JSX.Element {
  const dotSize = DOT_SIZES[size];
  return (
    <View
      style={[
        styles.dot,
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: color || skin.colors.unreadIndicator,
        },
        style,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IconBox
// ─────────────────────────────────────────────────────────────────────────────

type IconBoxSize = 'sm' | 'md' | 'lg';

interface IconBoxProps {
  /** Size preset for the container */
  size?: IconBoxSize;
  /** Children (typically an Icon component) */
  children: React.ReactNode;
  /** Optional additional style */
  style?: ViewStyle;
}

const ICON_BOX_SIZES: Record<IconBoxSize, number> = {
  sm: 24,
  md: 32,
  lg: 44,
};

/**
 * Container for centering icons with consistent sizing.
 *
 * Provides predictable touch targets and alignment for icon buttons.
 */
export function IconBox({ size = 'md', children, style }: IconBoxProps): React.JSX.Element {
  const boxSize = ICON_BOX_SIZES[size];
  return (
    <View
      style={[
        styles.iconBox,
        {
          width: boxSize,
          height: boxSize,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: skin.colors.urgent,
    borderRadius: skin.borders.radiusSharp,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: skin.spacing.xs,
  },
  notificationBadgeText: {
    color: skin.colors.urgentText,
  },
  hairline: {
    height: skin.borders.widthHairline,
    backgroundColor: skin.colors.borderLight,
  },
  dot: {
    // Dynamic styles applied inline
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
