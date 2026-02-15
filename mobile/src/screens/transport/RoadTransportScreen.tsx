/**
 * Road Transport Screen
 *
 * Shows road transport lines with active banners.
 * Phase 4: Full lines list with today's departures and contacts.
 *
 * Banner placement rules (per spec):
 * - ONLY promet OR hitno tags
 * - NO opcenito, kultura, or municipal-only messages
 *
 * Sections:
 * - Header: Poster-style header with icon box
 * - A: Lines list (2-part poster cards: colored header slab + white body)
 * - B: Today's departures (stacked set with green time blocks)
 *
 * Phase 4F: Aligned with LineDetail poster system - colored time blocks,
 *           2-part line cards with header slab + icon.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { Button } from '../../ui/Button';
import { H1, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import type { IconName } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { useTransportOverview } from '../../hooks/useTransportOverview';
import { useTranslations } from '../../i18n';
import type { DayType } from '../../types/transport';
import type { MainStackParamList } from '../../navigation/types';
import { LineListCard } from './components/LineListCard';
import { TodayDeparturesSection } from './components/TodayDeparturesSection';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, borders, components } = skin;
const overviewHeader = components.transport.overviewHeader;
const listTokens = components.transport.list;

/**
 * Map road transport subtype to icon name
 * Road transport is always bus-based
 */
function getRoadTypeIcon(_subtype: string | null): IconName {
  return 'bus';
}

export function RoadTransportScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslations();

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
  } = useTransportOverview({ transportType: 'road' });

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
    navigation.navigate('RoadLineDetail', { lineId });
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
              <Icon name="bus" size="lg" colorToken="primaryText" />
            </View>
            <View style={styles.headerTextContainer}>
              <H1 style={styles.headerTitle}>{t('transport.road.title')}</H1>
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
                transportType="road"
                headerBackground={listTokens.lineCardHeaderBackgroundRoad}
                iconName={getRoadTypeIcon(line.subtype)}
                title={line.name}
                t={t}
                onPress={() => handleLinePress(line.id)}
              />
            ))
          )}
        </View>

        {/* Section B: Today's Departures */}
        <TodayDeparturesSection
          departures={todaysDepartures}
          sectionLabel={t('transport.todaysDepartures')}
          emptyText={t('transport.noDepartures')}
          timeBlockBackground={listTokens.todayTimeBlockBackgroundRoad}
          onDeparturePress={handleLinePress}
        />
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

  // Poster Header Slab (full-bleed, colored background - ROAD: green)
  headerSlab: {
    backgroundColor: overviewHeader.backgroundRoad,
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
});

export default RoadTransportScreen;
