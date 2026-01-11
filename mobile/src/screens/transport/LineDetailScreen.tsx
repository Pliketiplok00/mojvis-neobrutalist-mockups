/**
 * Line Detail Screen
 *
 * Displays full details for a transport line.
 * Shared component for both Road and Sea transport.
 *
 * Sections:
 * - Header: Line name, subtype
 * - Date selector: Single date (default today)
 * - Direction toggle: 0 or 1 (resolved via route)
 * - Departures list: Expandable with stop times
 * - Contacts: BY LINE
 *
 * Phase 3D: Migrated to skin primitives (100% skin-adopted).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { DepartureItem } from '../../components/DepartureItem';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { LoadingState, ErrorState } from '../../ui/States';
import { skin } from '../../ui/skin';
import { useTranslations } from '../../i18n';
import { transportApi } from '../../services/api';
import { formatDateISO, formatDisplayDate } from '../../utils/dateFormat';
import type {
  TransportType,
  LineDetailResponse,
  DeparturesListResponse,
  RouteInfo,
  DayType,
} from '../../types/transport';

interface LineDetailScreenProps {
  lineId: string;
  transportType: TransportType;
}

const { colors, spacing, typography, borders } = skin;

export function LineDetailScreen({
  lineId,
  transportType,
}: LineDetailScreenProps): React.JSX.Element {
  const { t } = useTranslations();

  const DAY_TYPE_LABELS: Record<DayType, string> = {
    MON: t('transport.dayTypes.MON'),
    TUE: t('transport.dayTypes.TUE'),
    WED: t('transport.dayTypes.WED'),
    THU: t('transport.dayTypes.THU'),
    FRI: t('transport.dayTypes.FRI'),
    SAT: t('transport.dayTypes.SAT'),
    SUN: t('transport.dayTypes.SUN'),
    PRAZNIK: t('transport.dayTypes.PRAZNIK'),
  };

  const [lineDetail, setLineDetail] = useState<LineDetailResponse | null>(null);
  const [departures, setDepartures] = useState<DeparturesListResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedDirection, setSelectedDirection] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [departuresLoading, setDeparturesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch line detail
  const fetchLineDetail = useCallback(async () => {
    setError(null);
    try {
      const detail = await transportApi.getLine(transportType, lineId);
      setLineDetail(detail);
    } catch (err) {
      console.error('[LineDetail] Error fetching line:', err);
      setError(t('transport.lineDetail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lineId, transportType]);

  // Fetch departures for selected date and direction
  const fetchDepartures = useCallback(async () => {
    setDeparturesLoading(true);
    try {
      const deps = await transportApi.getDepartures(
        transportType,
        lineId,
        selectedDate,
        selectedDirection
      );
      setDepartures(deps);
    } catch (err) {
      console.error('[LineDetail] Error fetching departures:', err);
      // Don't set error - just show empty departures
    } finally {
      setDeparturesLoading(false);
    }
  }, [lineId, transportType, selectedDate, selectedDirection]);

  useEffect(() => {
    void fetchLineDetail();
  }, [fetchLineDetail]);

  useEffect(() => {
    if (lineDetail) {
      void fetchDepartures();
    }
  }, [lineDetail, fetchDepartures]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchLineDetail();
  }, [fetchLineDetail]);

  // Get routes for direction toggle
  const routes: RouteInfo[] = lineDetail?.routes || [];
  const currentRoute = routes.find((r) => r.direction === selectedDirection);

  // Date navigation
  const adjustDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatDateISO(date));
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsitePress = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <LoadingState message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  if (error || !lineDetail) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <ErrorState
          message={error || t('transport.lineDetail.notFound')}
          onRetry={handleRefresh}
          retryLabel={t('common.retry')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Line Header */}
        <View style={styles.headerSection}>
          <H1 style={styles.lineName}>{lineDetail.name}</H1>
          {lineDetail.subtype && (
            <Badge variant="default" style={styles.subtypeBadge}>{lineDetail.subtype}</Badge>
          )}
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => adjustDate(-1)}
          >
            <Icon name="chevron-left" size="md" colorToken="textPrimary" />
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Label style={styles.dateText}>{formatDisplayDate(selectedDate)}</Label>
            {departures && (
              <Meta>
                {DAY_TYPE_LABELS[departures.day_type]}
                {departures.is_holiday && ` (${t('transport.holiday')})`}
              </Meta>
            )}
          </View>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => adjustDate(1)}
          >
            <Icon name="chevron-right" size="md" colorToken="textPrimary" />
          </TouchableOpacity>
        </View>

        {/* Direction Toggle */}
        {routes.length > 1 && (
          <View style={styles.directionSection}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.directionButton,
                  selectedDirection === route.direction && styles.directionButtonActive,
                ]}
                onPress={() => setSelectedDirection(route.direction)}
              >
                <Label
                  style={[
                    styles.directionText,
                    selectedDirection === route.direction && styles.directionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {route.direction_label}
                </Label>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Route Info */}
        {currentRoute && (
          <View style={styles.routeInfo}>
            <Label style={styles.routeLabel}>
              {currentRoute.origin} → {currentRoute.destination}
            </Label>
            {currentRoute.typical_duration_minutes && (
              <Meta>
                Trajanje: {formatDuration(currentRoute.typical_duration_minutes)}
              </Meta>
            )}
          </View>
        )}

        {/* Departures */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Polasci</H2>
          {departuresLoading ? (
            <View style={styles.departuresLoading}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
            </View>
          ) : departures && departures.departures.length > 0 ? (
            departures.departures.map((dep) => (
              <DepartureItem key={dep.id} departure={dep} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Label>Nema polazaka za odabrani dan</Label>
            </View>
          )}
        </View>

        {/* Contacts */}
        {lineDetail.contacts.length > 0 && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>Kontakt</H2>
            {lineDetail.contacts.map((contact, index) => (
              <Card key={`${contact.operator}-${index}`} style={styles.contactCard}>
                <Label style={styles.contactOperator}>{contact.operator}</Label>
                {contact.phone && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handlePhonePress(contact.phone!)}
                  >
                    <View style={styles.contactIconContainer}>
                      <Icon name="phone" size="sm" colorToken="textSecondary" />
                    </View>
                    <Label style={styles.contactLink}>{contact.phone}</Label>
                  </TouchableOpacity>
                )}
                {contact.email && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handleEmailPress(contact.email!)}
                  >
                    <View style={styles.contactIconContainer}>
                      <Icon name="mail" size="sm" colorToken="textSecondary" />
                    </View>
                    <Label style={styles.contactLink}>{contact.email}</Label>
                  </TouchableOpacity>
                )}
                {contact.website && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handleWebsitePress(contact.website!)}
                  >
                    <View style={styles.contactIconContainer}>
                      <Icon name="globe" size="sm" colorToken="textSecondary" />
                    </View>
                    <Label style={styles.contactLink}>{contact.website}</Label>
                  </TouchableOpacity>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getTodayString(): string {
  const today = new Date();
  return formatDateISO(today);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  headerSection: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  lineName: {
    marginBottom: spacing.sm,
  },
  subtypeBadge: {
    alignSelf: 'flex-start',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: spacing.sm,
  },
  dateArrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    color: colors.textPrimary,
  },
  directionSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  directionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    borderWidth: borders.widthThin,
    borderColor: 'transparent',
  },
  directionButtonActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  directionText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  directionTextActive: {
    color: colors.primaryText,
  },
  routeInfo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  routeLabel: {
    color: colors.textPrimary,
  },
  section: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  departuresLoading: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  contactCard: {
    marginBottom: spacing.sm,
  },
  contactOperator: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactIconContainer: {
    width: 24,
    marginRight: spacing.sm,
  },
  contactLink: {
    flex: 1,
    color: colors.link,
  },
});

export default LineDetailScreen;
