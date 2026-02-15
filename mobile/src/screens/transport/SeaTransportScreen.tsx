/**
 * Sea Transport Screen
 *
 * Shows sea transport lines (ferries, catamarans) with active banners.
 * Phase 4: Full lines list with today's departures and contacts.
 *
 * Banner placement rules (per spec):
 * - ONLY promet OR hitno tags
 * - NO opcenito, kultura, or municipal-only messages
 *
 * Sections:
 * - Header: Poster-style header with icon box
 * - A: Lines list (2-part poster cards: colored header slab + white body)
 * - B: Today's departures (stacked set with blue time blocks)
 *
 * Phase 4F: Aligned with LineDetail poster system - colored time blocks,
 *           2-part line cards with header slab + icon.
 */

import React from 'react';
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
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { H1, H2, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import type { IconName } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { useTransportOverview } from '../../hooks/useTransportOverview';
import { useTranslations } from '../../i18n';
import type { InboxMessage } from '../../types/inbox';
import type { LineListItem, TodayDepartureItem, DayType } from '../../types/transport';
import type { MainStackParamList } from '../../navigation/types';
import { formatDayWithDate } from '../../utils/dateFormat';
import { formatLineTitle } from '../../utils/transportFormat';
import { LineListCard } from './components/LineListCard';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, borders, components } = skin;
const overviewHeader = components.transport.overviewHeader;
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

/**
 * Get header background color for sea transport line cards
 * All sea lines use teal background
 */
function getSeaHeaderBackground(): string {
  return listTokens.lineCardHeaderBackgroundSeaCatamaran;
}

export function SeaTransportScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t, language } = useTranslations();

  const {
    banners,
    lines,
    todaysDepartures,
    dayType,
    isHoliday,
    loading,
    refreshing,
    error,
    handleRefresh,
  } = useTransportOverview({ transportType: 'sea' });

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

  const handleLinePress = (lineId: string) => {
    navigation.navigate('SeaLineDetail', { lineId });
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
              <Icon name="ship" size="lg" colorToken="primaryText" />
            </View>
            <View style={styles.headerTextContainer}>
              <H1 style={styles.headerTitle}>{t('transport.sea.title')}</H1>
              <Meta style={styles.headerMeta}>
                {formatDayWithDate(new Date(), language)}
                {isHoliday && ` (${t('transport.holiday')})`}
              </Meta>
            </View>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Label style={styles.errorText}>{error ? t(error) : ''}</Label>
            <Button onPress={handleRefresh} style={styles.retryButton}>
              {t('common.retry')}
            </Button>
          </View>
        )}

        {/* Section A: Lines List */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>{t('transport.lines')}</Label>
          {lines.length === 0 ? (
            <View style={styles.emptyState}>
              <Label>{t('transport.noLines')}</Label>
            </View>
          ) : (
            lines.map((line) => (
              <LineListCard
                key={line.id}
                line={line}
                transportType="sea"
                headerBackground={getSeaHeaderBackground()}
                iconName={getSeaTypeIcon(line.subtype)}
                title={formatLineTitle(line.line_number, line.origin, line.destination)}
                t={t}
                onPress={() => handleLinePress(line.id)}
                showSeasonalBadge={line.line_number === '659'}
                seasonalText={t('transport.seasonal')}
              />
            ))
          )}
        </View>

        {/* Section B: Today's Departures */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>{t('transport.todaysDepartures')}</Label>
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
                    {/* Time block - blue like LineDetail */}
                    <View style={styles.todayTimeBlock}>
                      <H2 style={styles.todayTime}>
                        {formatTime(dep.departure_time)}
                      </H2>
                    </View>
                    {/* Info - direction only, line name hidden per spec */}
                    <View style={styles.todayInfo}>
                      <Label style={styles.todayLineName} numberOfLines={1}>
                        {dep.direction_label}
                      </Label>
                    </View>
                    {/* Subtype badge - cast needed until TodayDepartureItem type updated */}
                    {(dep as unknown as { subtype?: string }).subtype && (
                      <Badge variant="transport" size="compact" style={styles.todaySubtypeBadge}>
                        {(dep as unknown as { subtype: string }).subtype}
                      </Badge>
                    )}
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
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
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
    backgroundColor: listTokens.todayTimeBlockBackgroundSea, // Blue like LineDetail
    borderRightWidth: listTokens.todayTimeBlockBorderWidth,
    borderRightColor: listTokens.todayTimeBlockBorderColor,
    paddingVertical: listTokens.todayTimeBlockPadding,
    paddingHorizontal: listTokens.todayTimeBlockPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTime: {
    color: listTokens.todayTimeBlockTextColor, // White text on blue
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
  // Position-only: Badge component handles appearance
  todaySubtypeBadge: {
    alignSelf: 'center',
    marginRight: spacing.md,
  },
});

export default SeaTransportScreen;
