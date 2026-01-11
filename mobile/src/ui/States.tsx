/**
 * State Primitives
 *
 * Consistent loading, empty, and error state displays.
 *
 * Phase 2: Consolidates duplicate patterns across screens.
 *
 * Usage:
 * - LoadingState: Full-screen loading with spinner and optional text
 * - EmptyState: Icon + title + optional subtitle for no-data states
 * - ErrorState: Icon + message + optional retry button for error states
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';
import { skin } from './skin';
import { Icon, type IconName } from './Icon';
import { H2, Body } from './Text';
import { Button } from './Button';

// ─────────────────────────────────────────────────────────────────────────────
// LoadingState
// ─────────────────────────────────────────────────────────────────────────────

interface LoadingStateProps {
  /** Optional custom loading message */
  message?: string;
  /** Optional additional style */
  style?: ViewStyle;
}

/**
 * Full-screen loading indicator with optional message.
 *
 * Displays a large spinner centered in the container with optional text below.
 */
export function LoadingState({ message, style }: LoadingStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size="large" color={skin.colors.textPrimary} />
      {message && <Body style={styles.loadingText}>{message}</Body>}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Icon name from lucide-react-native */
  icon: IconName;
  /** Main title text */
  title: string;
  /** Optional subtitle/description text */
  subtitle?: string;
  /** Optional additional style */
  style?: ViewStyle;
}

/**
 * Empty state display with icon, title, and optional subtitle.
 *
 * Used when a list or content area has no data to display.
 */
export function EmptyState({ icon, title, subtitle, style }: EmptyStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size="xl" colorToken="textMuted" />
      </View>
      <H2 style={styles.title}>{title}</H2>
      {subtitle && (
        <Body style={styles.subtitle}>{subtitle}</Body>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ErrorState
// ─────────────────────────────────────────────────────────────────────────────

interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Optional retry callback - if provided, shows retry button */
  onRetry?: () => void;
  /** Optional custom retry button label */
  retryLabel?: string;
  /** Optional additional style */
  style?: ViewStyle;
}

/**
 * Error state display with icon, message, and optional retry button.
 *
 * Used when an operation fails and user needs to be informed.
 */
export function ErrorState({
  message,
  onRetry,
  retryLabel,
  style,
}: ErrorStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name="alert-triangle" size="xl" colorToken="errorText" />
      </View>
      <Body style={styles.errorMessage}>{message}</Body>
      {onRetry && (
        <Button onPress={onRetry}>{retryLabel || 'Retry'}</Button>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: skin.spacing.xxl,
  },
  iconContainer: {
    marginBottom: skin.spacing.lg,
  },
  loadingText: {
    marginTop: skin.spacing.md,
    color: skin.colors.textMuted,
  },
  title: {
    marginBottom: skin.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: skin.colors.textMuted,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: skin.spacing.lg,
  },
});
