/**
 * Road Transport Screen
 *
 * Shows road transport lines with active banners.
 * Phase 4: Full lines list with today's departures and contacts.
 *
 * Banner placement rules (per spec):
 * - ONLY cestovni_promet OR hitno tags
 * - NO opcenito, kultura, or municipal-only messages
 *
 * Sections:
 * - A: Lines list
 * - B: Today's departures (aggregated)
 * - C: (Contacts shown in line detail)
 *
 * Phase 3B: Migrated to skin primitives (100% skin-adopted).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi, transportApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { LineListItem, TodayDepartureItem, DayType } from '../../types/transport';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, typography } = skin;

export function RoadTransportScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslations();
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [lines, setLines] = useState<LineListItem[]>([]);
  const [todaysDepartures, setTodaysDepartures] = useState<TodayDepartureItem[]>([]);
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userContext = useUserContext();

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

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [bannersRes, linesRes, todayRes] = await Promise.all([
        inboxApi.getActiveBanners(userContext, 'transport'),
        transportApi.getLines('road'),
        transportApi.getTodaysDepartures('road'),
      ]);

      setBanners(bannersRes.banners);
      setLines(linesRes.lines);
      setTodaysDepartures(todayRes.departures);
      setDayType(todayRes.day_type);
      setIsHoliday(todayRes.is_holiday);
    } catch (err) {
      console.error('[RoadTransport] Error fetching data:', err);
      setError(t('transport.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userContext]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData();
  }, [fetchData]);

  const handleLinePress = (lineId: string) => {
    navigation.navigate('RoadLineDetail', { lineId });
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          <Label style={styles.loadingText}>{t('transport.loading')}</Label>
        </View>
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
        {/* Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Title */}
        <View style={styles.titleSection}>
          <H1>{t('transport.road.title')}</H1>
          {dayType && (
            <Meta style={styles.dayInfo}>
              {DAY_TYPE_LABELS[dayType]}
              {isHoliday && ` (${t('transport.holiday')})`}
            </Meta>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Label style={styles.errorText}>{error}</Label>
            <Button onPress={handleRefresh} style={styles.retryButton}>
              {t('common.retry')}
            </Button>
          </View>
        )}

        {/* Section A: Lines List */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>{t('transport.lines')}</H2>
          {lines.length === 0 ? (
            <View style={styles.emptyState}>
              <Label>{t('transport.noLines')}</Label>
            </View>
          ) : (
            lines.map((line) => (
              <Card
                key={line.id}
                onPress={() => handleLinePress(line.id)}
                style={styles.lineCard}
              >
                <View style={styles.lineHeader}>
                  <Label style={styles.lineName} numberOfLines={2}>
                    {line.name}
                  </Label>
                  {line.subtype && (
                    <Badge variant="default">{line.subtype}</Badge>
                  )}
                </View>
                <Meta numberOfLines={1} style={styles.lineStops}>
                  {line.stops_summary}
                </Meta>
                <View style={styles.lineFooter}>
                  <Meta>
                    {line.stops_count} {t('transport.stations')}
                    {line.typical_duration_minutes
                      ? ` • ${formatDuration(line.typical_duration_minutes)}`
                      : ''}
                  </Meta>
                  <Icon name="chevron-right" size="sm" stroke="regular" colorToken="chevron" />
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Section B: Today's Departures */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>{t('transport.todaysDepartures')}</H2>
          {todaysDepartures.length === 0 ? (
            <View style={styles.emptyState}>
              <Label>{t('transport.noDepartures')}</Label>
            </View>
          ) : (
            todaysDepartures.slice(0, 10).map((dep, index) => (
              <TouchableOpacity
                key={`${dep.line_id}-${dep.departure_time}-${index}`}
                style={styles.departureCard}
                onPress={() => handleLinePress(dep.line_id)}
                activeOpacity={0.7}
              >
                <Label style={styles.departureTime}>{dep.departure_time}</Label>
                <View style={styles.departureInfo}>
                  <Label style={styles.departureLine} numberOfLines={1}>
                    {dep.line_name}
                  </Label>
                  <Meta numberOfLines={1}>
                    {dep.direction_label}
                  </Meta>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  bannerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  titleSection: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  dayInfo: {
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.warningBackground,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: colors.textPrimary,
  },
  retryButton: {
    marginTop: spacing.md,
  },
  emptyState: {
    padding: spacing.xxl,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  lineCard: {
    marginBottom: spacing.md,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  lineName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.body.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  lineStops: {
    marginBottom: spacing.sm,
  },
  lineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  departureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  departureTime: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.body.bold,
    color: colors.textPrimary,
    width: 60,
  },
  departureInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  departureLine: {
    color: colors.textPrimary,
  },
});

export default RoadTransportScreen;
