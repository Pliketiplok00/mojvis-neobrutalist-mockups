/**
 * DeparturesSection Component
 *
 * Displays departures list with loading and empty states.
 * Each departure rendered via DepartureItem component.
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Label, Body } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { DepartureItem } from '../../../components/DepartureItem';
import { skin } from '../../../ui/skin';
import type { DepartureResponse, TransportType } from '../../../types/transport';

const { colors, spacing, borders, components } = skin;
const lineDetail = components.transport.lineDetail;

interface DeparturesSectionProps {
  departures: DepartureResponse[];
  loading: boolean;
  transportType: TransportType;
  sectionLabel: string;
  emptyText: string;
}

/**
 * Departures list with loading and empty states
 * Renders DepartureItem for each departure
 */
export function DeparturesSection({
  departures,
  loading,
  transportType,
  sectionLabel,
  emptyText,
}: DeparturesSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Label style={styles.sectionLabel}>{sectionLabel}</Label>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
        </View>
      ) : departures.length > 0 ? (
        <View style={styles.departuresList}>
          {departures.map((dep) => (
            <DepartureItem
              key={dep.id}
              departure={dep}
              transportType={transportType}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="calendar" size="lg" colorToken="textMuted" />
          <Body style={styles.emptyStateText}>{emptyText}</Body>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  departuresList: {
    gap: lineDetail.departureRowGap,
  },
  emptyState: {
    padding: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: borders.widthThin,
    borderColor: colors.borderMuted,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
