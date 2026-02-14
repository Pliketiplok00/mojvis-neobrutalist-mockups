/**
 * Line Detail Screen
 *
 * Displays full details for a transport line.
 * Shared component for both Road and Sea transport.
 *
 * V1 Poster Style:
 * - Colored header slab with icon box
 * - Poster-style date selector card with offset shadow
 * - Direction toggle tabs with sharp corners
 * - Departure rows with colored time block
 * - Expandable timeline with (+1 day) indicator
 * - Contact cards with offset shadow
 *
 * Phase 3D: 100% skin-tokenized.
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
import { BannerList } from '../../components/Banner';
import { DepartureItem } from '../../components/DepartureItem';
import { ContactsSection } from './components/ContactsSection';
import { DatePickerModal } from './components/DatePickerModal';
import { DateSelector } from './components/DateSelector';
import { DirectionTabs } from './components/DirectionTabs';
import { H1, H2, Label, Meta, Body } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { LoadingState, ErrorState } from '../../ui/States';
import { Badge } from '../../ui/Badge';
import { skin } from '../../ui/skin';
import { useDatePicker } from '../../hooks/useDatePicker';
import { useDepartures } from '../../hooks/useDepartures';
import { useLineDetail } from '../../hooks/useLineDetail';
import { useTranslations } from '../../i18n';
import { formatLineTitle, formatDuration } from '../../utils/transportFormat';
import type { InboxMessage } from '../../types/inbox';
import type {
  TransportType,
  RouteInfo,
  DayType,
} from '../../types/transport';
import { CARRIER_TICKET_URLS, SEA_LINE_CARRIERS } from '../../constants/carriers';

interface LineDetailScreenProps {
  lineId: string;
  transportType: TransportType;
}

const { colors, spacing, borders, components } = skin;
const lineDetail = components.transport.lineDetail;
const listTokens = components.transport.list;
const { note } = components.transport;

export function LineDetailScreen({
  lineId,
  transportType,
}: LineDetailScreenProps): React.JSX.Element {
  const { t, language } = useTranslations();

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

  // Line detail hook
  const {
    lineDetailData,
    banners,
    loading,
    error,
    refreshing,
    refresh,
  } = useLineDetail({ lineId, transportType, language });

  // Date picker hook
  const {
    selectedDate,
    isDatePickerOpen,
    openDatePicker,
    closeDatePicker,
    handleDateChange,
    adjustDate,
  } = useDatePicker();

  // Departures hook
  const {
    departures,
    departuresLoading,
    selectedDirection,
    setSelectedDirection,
  } = useDepartures({
    lineId,
    transportType,
    selectedDate,
    language,
    enabled: !!lineDetailData,
  });

  // Get transport-type-specific colors
  const headerBackground = transportType === 'sea'
    ? lineDetail.headerBackgroundSea
    : lineDetail.headerBackgroundRoad;
  const timeBlockBackground = transportType === 'sea'
    ? lineDetail.timeBlockBackgroundSea
    : lineDetail.timeBlockBackgroundRoad;

  // Get routes for direction toggle
  const routes: RouteInfo[] = lineDetailData?.routes || [];
  const currentRoute = routes.find((r) => r.direction === selectedDirection);
  // Direction 0 route for canonical header title (matches list view)
  const dir0Route = routes.find((r) => r.direction === 0);

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

  if (error || !lineDetailData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <ErrorState
          message={error ? t('transport.lineDetail.error') : t('transport.lineDetail.notFound')}
          onRetry={refresh}
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
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* Full-bleed Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Poster Header Slab */}
        <View style={[styles.headerSlab, { backgroundColor: headerBackground }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconBox}>
              <Icon
                name={transportType === 'sea' ? 'ship' : 'bus'}
                size="lg"
                colorToken="primaryText"
              />
            </View>
            <View style={styles.headerTextContainer}>
              <H1 style={styles.headerTitle}>
                {formatLineTitle(
                  lineDetailData.line_number,
                  dir0Route?.origin ?? '',
                  dir0Route?.destination ?? ''
                )}
              </H1>
              <View style={styles.headerMetaRow}>
                {/* Subtype as meta only for road transport (sea shows it as badge) */}
                {transportType !== 'sea' && lineDetailData.subtype && (
                  <Meta style={styles.headerMeta}>{lineDetailData.subtype}</Meta>
                )}
                {currentRoute?.typical_duration_minutes && (
                  <Meta style={styles.headerMeta}>
                    {formatDuration(currentRoute.typical_duration_minutes)}
                  </Meta>
                )}
              </View>
            </View>
            {/* Badge stack: subtype + seasonal (right-aligned, sea only) */}
            {transportType === 'sea' && (lineDetailData.subtype || lineDetailData.line_number === '659') && (
              <View style={styles.headerBadgeStack}>
                {lineDetailData.subtype && (
                  <Badge variant="transport" size="large">
                    {lineDetailData.subtype}
                  </Badge>
                )}
                {lineDetailData.line_number === '659' && (
                  <Badge
                    variant="transport"
                    size="large"
                    backgroundColor={listTokens.lineCardHeaderBackgroundHighlight}
                    textColor={colors.textPrimary}
                  >
                    {t('transport.seasonal')}
                  </Badge>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Date Selector Card */}
        <DateSelector
          selectedDate={selectedDate}
          onPrevDay={() => adjustDate(-1)}
          onNextDay={() => adjustDate(1)}
          onOpenPicker={openDatePicker}
          language={language}
          prevDayLabel={t('common.back')}
          selectDateLabel={t('transport.lineDetail.selectDate')}
        />

        {/* Direction Toggle Tabs */}
        <DirectionTabs
          routes={routes}
          selectedDirection={selectedDirection}
          onSelectDirection={setSelectedDirection}
          activeBackgroundColor={headerBackground}
          sectionLabel={t('transport.lineDetail.direction')}
        />

        {/* Route Info */}
        {currentRoute && (
          <View style={styles.routeInfo}>
            <View style={styles.routeStops}>
              <Icon name="map-pin" size="sm" colorToken="textSecondary" />
              <Body style={styles.routeStopsText}>
                {currentRoute.stops.length} {t('transport.stations')}
              </Body>
            </View>
          </View>
        )}

        {/* Section Divider */}
        <View style={styles.sectionDivider} />

        {/* Departures Section */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>{t('transport.lineDetail.departures')}</Label>
          {departuresLoading ? (
            <View style={styles.departuresLoading}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
            </View>
          ) : departures && departures.departures.length > 0 ? (
            <>
              <View style={styles.departuresList}>
                {departures.departures.map((dep) => (
                  <DepartureItem
                    key={dep.id}
                    departure={dep}
                    transportType={transportType}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar" size="lg" colorToken="textMuted" />
              <Body style={styles.emptyStateText}>
                {t('transport.lineDetail.noDeparturesForDate')}
              </Body>
            </View>
          )}
        </View>

        {/* Carrier Ticket Info Box - Always shown */}
        {(() => {
          // Determine carrier info: prefer sea line mapping, fall back to contacts
          const seaCarrier = lineDetailData.line_number
            ? SEA_LINE_CARRIERS[lineDetailData.line_number]
            : undefined;
          const contactOperator = lineDetailData.contacts[0]?.operator;
          const contactTicketUrl = contactOperator
            ? CARRIER_TICKET_URLS[contactOperator]
            : undefined;

          // Resolve carrier name and ticket URL
          const carrierName = seaCarrier?.name ?? contactOperator ?? null;
          const ticketUrl = seaCarrier?.ticketUrl ?? contactTicketUrl ?? null;
          const isBoardingOnly = seaCarrier && seaCarrier.ticketUrl === null;

          // Determine body text
          let bodyText: string;
          if (isBoardingOnly) {
            bodyText = t('transport.lineDetail.tickets.boardingOnlyBody');
          } else if (ticketUrl) {
            bodyText = t('transport.lineDetail.tickets.body');
          } else {
            bodyText = t('transport.lineDetail.tickets.fallbackBody');
          }

          return (
            <View style={styles.ticketBoxContainer}>
              <View style={styles.ticketBox}>
                <Meta style={styles.ticketBoxTitle}>
                  {t('transport.lineDetail.tickets.title')}
                </Meta>
                <Body style={styles.ticketBoxBody}>{bodyText}</Body>
                {carrierName && ticketUrl && (
                  <TouchableOpacity
                    style={styles.ticketBoxLink}
                    onPress={() => handleWebsitePress(ticketUrl)}
                  >
                    <Icon name="globe" size="sm" colorToken="link" />
                    <Label style={styles.ticketBoxLinkText}>{carrierName}</Label>
                  </TouchableOpacity>
                )}
                {carrierName && !ticketUrl && (
                  <View style={styles.ticketBoxCarrierPlain}>
                    <Label style={styles.ticketBoxCarrierText}>{carrierName}</Label>
                  </View>
                )}
              </View>
            </View>
          );
        })()}

        {/* Section Divider */}
        {lineDetailData.contacts.length > 0 && <View style={styles.sectionDivider} />}

        {/* Contacts Section */}
        <ContactsSection
          contacts={lineDetailData.contacts}
          sectionLabel={t('transport.lineDetail.contacts')}
        />
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        isVisible={isDatePickerOpen}
        selectedDate={new Date(selectedDate)}
        onDateChange={handleDateChange}
        onClose={closeDatePicker}
        cancelText={t('common.cancel')}
        doneText={t('common.done')}
        titleText={t('transport.lineDetail.selectDate')}
      />
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

  // Full-bleed banners (no horizontal padding)
  bannerSection: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },

  // Poster Header Slab
  headerSlab: {
    padding: lineDetail.headerPadding,
    borderBottomWidth: lineDetail.headerBorderWidth,
    borderBottomColor: lineDetail.headerBorderColor,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: lineDetail.headerIconBoxSize,
    height: lineDetail.headerIconBoxSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: lineDetail.headerTitleColor,
  },
  headerMetaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  headerMeta: {
    color: lineDetail.headerMetaColor,
  },
  // Badge stack (right side of header, sea only)
  headerBadgeStack: {
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginLeft: spacing.md,
  },

  // Route Info
  routeInfo: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  routeStops: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeStopsText: {
    color: colors.textSecondary,
  },

  // Section Divider
  sectionDivider: {
    height: lineDetail.sectionDividerWidth,
    backgroundColor: lineDetail.sectionDividerColor,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },

  // Section
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  // Departures
  departuresLoading: {
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

  // Carrier Ticket Info Box
  ticketBoxContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  ticketBox: {
    borderWidth: note.noteBorderWidth,
    borderColor: note.noteBorderColor,
    backgroundColor: note.noteBackground,
    borderRadius: note.noteRadius,
    padding: note.notePadding,
  },
  ticketBoxTitle: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  ticketBoxBody: {
    color: note.noteTextColor,
    marginBottom: spacing.md,
  },
  ticketBoxLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ticketBoxLinkText: {
    color: colors.link,
  },
  ticketBoxCarrierPlain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketBoxCarrierText: {
    color: colors.textSecondary,
  },
});

export default LineDetailScreen;
