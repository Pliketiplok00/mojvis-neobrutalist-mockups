/**
 * Sea Transport Screen
 *
 * Shows sea transport lines (ferries, catamarans) with active banners.
 * Phase 4: Full lines list with today's departures and contacts.
 *
 * Banner placement rules (per spec):
 * - ONLY pomorski_promet OR hitno tags
 * - NO opcenito, kultura, or municipal-only messages
 *
 * Sections:
 * - Header: Poster-style header with icon box
 * - A: Lines list (heavy poster cards with type icon + boxed chevron)
 * - B: Today's departures (stacked set with dividers)
 *
 * Phase 4E: Poster polish - display typography, section rules, grey rows,
 *           neobrut press states with transform offset.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import type { IconName } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { useUserContext } from '../../hooks/useUserContext';
import { useTranslations } from '../../i18n';
import { inboxApi, transportApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { LineListItem, TodayDepartureItem, DayType } from '../../types/transport';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, borders, typography, components } = skin;
const overviewHeader = components.transport.overviewHeader;
const sectionHeader = components.transport.sectionHeader;
const listTokens = components.transport.list;

/**
 * Format time string (HH:MM or HH:MM:SS) to HH:MM display format
 * Fixes the bug where time breaks into two lines
 */
function formatTime(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Map sea transport subtype to icon name
 * - KATAMARAN -> anchor (fast vessel)
 * - TRAJEKT -> ship (ferry)
 * - Default -> ship
 */
function getSeaTypeIcon(subtype: string | null): IconName {
  if (!subtype) return 'ship';
  const lower = subtype.toLowerCase();
  if (lower.includes('katamaran')) return 'anchor';
  if (lower.includes('trajekt')) return 'ship';
  return 'ship';
}

export function SeaTransportScreen(): React.JSX.Element {
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
        transportApi.getLines('sea'),
        transportApi.getTodaysDepartures('sea'),
      ]);

      setBanners(bannersRes.banners);
      setLines(linesRes.lines);
      setTodaysDepartures(todayRes.departures);
      setDayType(todayRes.day_type);
      setIsHoliday(todayRes.is_holiday);
    } catch (err) {
      console.error('[SeaTransport] Error fetching data:', err);
      setError(t('transport.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userContext, t]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData();
  }, [fetchData]);

  const handleLinePress = (lineId: string) => {
    navigation.navigate('SeaLineDetail', { lineId });
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

  const visibleDepartures = todaysDepartures.slice(0, 10);

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
        {/* Full-bleed Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Poster Header Slab */}
        <View style={styles.headerSlab}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconBox}>
              <Icon name="ship" size="lg" colorToken="textPrimary" />
            </View>
            <View style={styles.headerTextContainer}>
              <H1 style={styles.headerTitle}>{t('transport.sea.title')}</H1>
              {dayType && (
                <Meta style={styles.headerMeta}>
                  {DAY_TYPE_LABELS[dayType]}
                  {isHoliday && ` (${t('transport.holiday')})`}
                </Meta>
              )}
            </View>
          </View>
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
              <Pressable
                key={line.id}
                onPress={() => handleLinePress(line.id)}
                style={({ pressed }) => [
                  styles.lineCardWrapper,
                  pressed && styles.lineCardPressed,
                ]}
              >
                {/* Shadow layer */}
                <View style={styles.lineCardShadow} />
                {/* Main card */}
                <View style={styles.lineCard}>
                  <View style={styles.lineCardBody}>
                    {/* Left content */}
                    <View style={styles.lineCardContent}>
                      {/* Title row: name + type icon */}
                      <View style={styles.lineTitleRow}>
                        <Label style={styles.lineName} numberOfLines={2}>
                          {line.name}
                        </Label>
                        {line.subtype && (
                          <View style={styles.lineTypeIconBox}>
                            <Icon
                              name={getSeaTypeIcon(line.subtype)}
                              size="xs"
                              colorToken="textPrimary"
                            />
                          </View>
                        )}
                      </View>
                      {/* Stops summary */}
                      <Meta numberOfLines={1} style={styles.lineStops}>
                        {line.stops_summary}
                      </Meta>
                      {/* Meta row */}
                      <Meta style={styles.lineMeta} numberOfLines={1}>
                        {line.stops_count} {t('transport.stations')}
                        {line.typical_duration_minutes
                          ? ` • ${formatDuration(line.typical_duration_minutes)}`
                          : ''}
                      </Meta>
                    </View>
                    {/* Boxed chevron */}
                    <View style={styles.lineCardChevronBox}>
                      <Icon name="chevron-right" size="sm" colorToken="textPrimary" />
                    </View>
                  </View>
                </View>
              </Pressable>
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
            <View style={styles.todaySetWrapper}>
              {/* Shadow layer */}
              <View style={styles.todaySetShadow} />
              {/* Main container */}
              <View style={styles.todaySet}>
                {visibleDepartures.map((dep, index) => (
                  <Pressable
                    key={`${dep.line_id}-${dep.departure_time}-${index}`}
                    style={({ pressed }) => [
                      styles.todayRow,
                      index > 0 && styles.todayRowWithDivider,
                      pressed && styles.todayRowPressed,
                    ]}
                    onPress={() => handleLinePress(dep.line_id)}
                  >
                    {/* Time block */}
                    <View style={styles.todayTimeBlock}>
                      <Label style={styles.todayTime} numberOfLines={1}>
                        {formatTime(dep.departure_time)}
                      </Label>
                    </View>
                    {/* Info */}
                    <View style={styles.todayInfo}>
                      <Label style={styles.todayLineName} numberOfLines={1}>
                        {dep.line_name}
                      </Label>
                      <Meta style={styles.todayDirection} numberOfLines={1}>
                        {dep.direction_label}
                      </Meta>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
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

  // Full-bleed banners (no horizontal padding)
  bannerSection: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },

  // Poster Header Slab (full-bleed, colored background)
  headerSlab: {
    backgroundColor: overviewHeader.backgroundSea,
    padding: overviewHeader.padding,
    borderBottomWidth: overviewHeader.borderBottomWidth,
    borderBottomColor: overviewHeader.borderBottomColor,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: overviewHeader.iconBoxSize,
    height: overviewHeader.iconBoxSize,
    backgroundColor: overviewHeader.iconBoxBackground,
    borderWidth: overviewHeader.iconBoxBorderWidth,
    borderColor: overviewHeader.iconBoxBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: overviewHeader.iconBoxGap,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: overviewHeader.titleColor,
  },
  headerMeta: {
    color: overviewHeader.subtitleColor,
    marginTop: spacing.xs,
  },

  section: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    marginBottom: sectionHeader.marginBottom,
    paddingBottom: sectionHeader.paddingBottom,
    borderBottomWidth: sectionHeader.borderBottomWidth,
    borderBottomColor: sectionHeader.borderBottomColor,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.warningBackground,
    alignItems: 'center',
    borderWidth: borders.widthThin,
    borderColor: colors.border,
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
    alignItems: 'center',
    borderWidth: borders.widthThin,
    borderColor: colors.border,
  },

  // Line card (heavy poster-style with shadow + boxed chevron)
  lineCardWrapper: {
    position: 'relative',
    marginBottom: listTokens.lineCardGap,
  },
  lineCardShadow: {
    position: 'absolute',
    top: listTokens.lineCardShadowOffsetY,
    left: listTokens.lineCardShadowOffsetX,
    right: -listTokens.lineCardShadowOffsetX,
    bottom: -listTokens.lineCardShadowOffsetY,
    backgroundColor: listTokens.lineCardShadowColor,
  },
  lineCard: {
    backgroundColor: listTokens.lineCardBackground,
    borderWidth: listTokens.lineCardBorderWidth,
    borderColor: listTokens.lineCardBorderColor,
    borderRadius: listTokens.lineCardRadius,
    padding: listTokens.lineCardPadding,
  },
  lineCardPressed: {
    transform: [
      { translateX: listTokens.lineCardPressedOffsetX },
      { translateY: listTokens.lineCardPressedOffsetY },
    ],
  },
  lineCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lineCardContent: {
    flex: 1,
  },
  lineTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: listTokens.lineCardTitleGap,
  },
  lineName: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.display.semiBold,
    fontSize: typography.fontSize.lg,
    marginRight: listTokens.lineCardTitleGap,
  },
  lineTypeIconBox: {
    width: listTokens.lineCardTypeIconBoxSize,
    height: listTokens.lineCardTypeIconBoxSize,
    backgroundColor: listTokens.lineCardTypeIconBoxBackground,
    borderWidth: listTokens.lineCardTypeIconBoxBorderWidth,
    borderColor: listTokens.lineCardTypeIconBoxBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineStops: {
    marginBottom: listTokens.lineCardStopsGap,
    color: colors.textSecondary,
  },
  lineMeta: {
    color: colors.textSecondary,
    marginTop: listTokens.lineCardMetaGap,
  },
  lineCardChevronBox: {
    width: listTokens.lineCardChevronBoxSize,
    height: listTokens.lineCardChevronBoxSize,
    backgroundColor: listTokens.lineCardChevronBoxBackground,
    borderWidth: listTokens.lineCardChevronBoxBorderWidth,
    borderColor: listTokens.lineCardChevronBoxBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: listTokens.lineCardChevronGap,
  },

  // Today's departures (stacked set with dividers)
  todaySetWrapper: {
    position: 'relative',
  },
  todaySetShadow: {
    position: 'absolute',
    top: listTokens.todaySetShadowOffsetY,
    left: listTokens.todaySetShadowOffsetX,
    right: -listTokens.todaySetShadowOffsetX,
    bottom: -listTokens.todaySetShadowOffsetY,
    backgroundColor: listTokens.todaySetShadowColor,
  },
  todaySet: {
    backgroundColor: listTokens.todaySetBackground,
    borderWidth: listTokens.todaySetBorderWidth,
    borderColor: listTokens.todaySetBorderColor,
    borderRadius: listTokens.todaySetRadius,
    overflow: 'hidden',
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: listTokens.todayRowBackground,
  },
  todayRowWithDivider: {
    borderTopWidth: listTokens.todayRowDividerWidth,
    borderTopColor: listTokens.todayRowDividerColor,
  },
  todayRowPressed: {
    transform: [
      { translateX: listTokens.todayRowPressedOffsetX },
      { translateY: listTokens.todayRowPressedOffsetY },
    ],
  },
  todayTimeBlock: {
    width: listTokens.todayTimeBlockWidth,
    backgroundColor: listTokens.todayTimeBlockBackground,
    borderRightWidth: listTokens.todayTimeBlockBorderWidth,
    borderRightColor: listTokens.todayTimeBlockBorderColor,
    paddingVertical: listTokens.todayRowPadding,
    paddingHorizontal: listTokens.todayTimeBlockPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTime: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  todayInfo: {
    flex: 1,
    paddingVertical: listTokens.todayRowPadding,
    paddingHorizontal: spacing.md,
  },
  todayLineName: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  todayDirection: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default SeaTransportScreen;
