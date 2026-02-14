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
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { DepartureItem } from '../../components/DepartureItem';
import { H1, H2, Label, Meta, Body } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { LoadingState, ErrorState } from '../../ui/States';
import { Badge } from '../../ui/Badge';
import { skin } from '../../ui/skin';
import { useUserContext } from '../../hooks/useUserContext';
import { useDatePicker } from '../../hooks/useDatePicker';
import { useTranslations } from '../../i18n';
import { inboxApi, transportApi } from '../../services/api';
import { formatDateISO, formatDisplayDate, formatDayWithDate } from '../../utils/dateFormat';
import { formatLineTitle, formatDuration } from '../../utils/transportFormat';
import type { InboxMessage } from '../../types/inbox';
import type {
  TransportType,
  LineDetailResponse,
  DeparturesListResponse,
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

  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [lineDetailData, setLineDetailData] = useState<LineDetailResponse | null>(null);
  const [departures, setDepartures] = useState<DeparturesListResponse | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [departuresLoading, setDeparturesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date picker hook
  const {
    selectedDate,
    isDatePickerOpen,
    openDatePicker,
    closeDatePicker,
    handleDateChange,
    adjustDate,
  } = useDatePicker();

  // Get transport-type-specific colors
  const headerBackground = transportType === 'sea'
    ? lineDetail.headerBackgroundSea
    : lineDetail.headerBackgroundRoad;
  const timeBlockBackground = transportType === 'sea'
    ? lineDetail.timeBlockBackgroundSea
    : lineDetail.timeBlockBackgroundRoad;

  // Fetch line detail and banners
  const fetchLineDetail = useCallback(async () => {
    setError(null);
    try {
      const [detail, bannersRes] = await Promise.all([
        transportApi.getLine(transportType, lineId, language),
        inboxApi.getActiveBanners(userContext, 'transport'),
      ]);
      setLineDetailData(detail);
      setBanners(bannersRes.banners);
    } catch (err) {
      console.error('[LineDetail] Error fetching line:', err);
      setError(t('transport.lineDetail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lineId, transportType, userContext, t, language]);

  // Fetch departures for selected date and direction
  const fetchDepartures = useCallback(async () => {
    setDeparturesLoading(true);
    try {
      const deps = await transportApi.getDepartures(
        transportType,
        lineId,
        selectedDate,
        selectedDirection,
        language
      );
      setDepartures(deps);
    } catch (err) {
      console.error('[LineDetail] Error fetching departures:', err);
    } finally {
      setDeparturesLoading(false);
    }
  }, [lineId, transportType, selectedDate, selectedDirection, language]);

  useEffect(() => {
    void fetchLineDetail();
  }, [fetchLineDetail]);

  useEffect(() => {
    if (lineDetailData) {
      void fetchDepartures();
    }
  }, [lineDetailData, fetchDepartures]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchLineDetail();
  }, [fetchLineDetail]);

  // Get routes for direction toggle
  const routes: RouteInfo[] = lineDetailData?.routes || [];
  const currentRoute = routes.find((r) => r.direction === selectedDirection);
  // Direction 0 route for canonical header title (matches list view)
  const dir0Route = routes.find((r) => r.direction === 0);

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

  if (error || !lineDetailData) {
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

        {/* Date Selector Card with Offset Shadow */}
        <View style={styles.dateSelectorContainer}>
          <View style={styles.dateSelectorShadow} />
          <View style={styles.dateSelector}>
            <TouchableOpacity
              style={styles.dateArrow}
              onPress={() => adjustDate(-1)}
              accessibilityLabel={t('common.back')}
            >
              <Icon name="chevron-left" size="md" colorToken="textPrimary" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateInfo}
              onPress={openDatePicker}
              accessibilityLabel={t('transport.lineDetail.selectDate')}
              accessibilityRole="button"
            >
              <Label style={styles.dateText}>
                {formatDayWithDate(new Date(selectedDate), language)}
              </Label>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateArrow}
              onPress={() => adjustDate(1)}
              accessibilityLabel="Next day"
            >
              <Icon name="chevron-right" size="md" colorToken="textPrimary" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Direction Toggle Tabs */}
        {routes.length > 1 && (
          <View style={styles.directionContainer}>
            <Label style={styles.sectionLabel}>{t('transport.lineDetail.direction')}</Label>
            <View style={styles.directionTabsWrapper}>
              <View style={styles.directionTabsShadow} />
              <View style={styles.directionTabs}>
                {routes.map((route) => {
                  const isActive = selectedDirection === route.direction;
                  return (
                    <TouchableOpacity
                      key={route.id}
                      style={[
                        styles.directionTab,
                        isActive && [
                          styles.directionTabActive,
                          { backgroundColor: headerBackground },
                        ],
                        route.direction === 1 && styles.directionTabRight,
                      ]}
                      onPress={() => setSelectedDirection(route.direction)}
                    >
                      <Label
                        style={[
                          styles.directionTabText,
                          isActive && styles.directionTabTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {route.direction_label}
                      </Label>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

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
        {lineDetailData.contacts.length > 0 && (
          <View style={styles.section}>
            <Label style={styles.sectionLabel}>{t('transport.lineDetail.contacts')}</Label>
            {lineDetailData.contacts.map((contact, index) => (
              <View key={`${contact.operator}-${index}`} style={styles.contactCardWrapper}>
                <View style={styles.contactCardShadow} />
                <View style={styles.contactCard}>
                  <Label style={styles.contactOperator}>{contact.operator}</Label>
                  {contact.phone && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={() => handlePhonePress(contact.phone!)}
                    >
                      <View style={styles.contactIconBox}>
                        <Icon name="phone" size="sm" colorToken="textPrimary" />
                      </View>
                      <Label style={styles.contactLink}>{contact.phone}</Label>
                    </TouchableOpacity>
                  )}
                  {contact.email && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={() => handleEmailPress(contact.email!)}
                    >
                      <View style={styles.contactIconBox}>
                        <Icon name="mail" size="sm" colorToken="textPrimary" />
                      </View>
                      <Label style={styles.contactLink}>{contact.email}</Label>
                    </TouchableOpacity>
                  )}
                  {contact.website && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={() => handleWebsitePress(contact.website!)}
                    >
                      <View style={styles.contactIconBox}>
                        <Icon name="globe" size="sm" colorToken="textPrimary" />
                      </View>
                      <Label style={styles.contactLink}>{contact.website}</Label>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Date Picker - Platform-specific rendering */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={isDatePickerOpen}
          transparent
          animationType="slide"
          onRequestClose={closeDatePicker}
        >
          <View style={styles.datePickerModalOverlay}>
            <View style={styles.datePickerModalContent}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={closeDatePicker}>
                  <Label style={styles.datePickerCancel}>
                    {t('common.cancel')}
                  </Label>
                </TouchableOpacity>
                <Label style={styles.datePickerTitle}>
                  {t('transport.lineDetail.selectDate')}
                </Label>
                <TouchableOpacity onPress={closeDatePicker}>
                  <Label style={styles.datePickerDone}>
                    {t('common.done')}
                  </Label>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={new Date(selectedDate)}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.datePickerIOS}
              />
            </View>
          </View>
        </Modal>
      ) : (
        isDatePickerOpen && (
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
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

  // Date Selector with Offset Shadow
  dateSelectorContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    position: 'relative',
  },
  dateSelectorShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lineDetail.dateSelectorBackground,
    borderWidth: lineDetail.dateSelectorBorderWidth,
    borderColor: lineDetail.dateSelectorBorderColor,
    borderRadius: lineDetail.dateSelectorRadius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dateArrow: {
    width: 36,
    height: 36,
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

  // Direction Toggle Tabs
  directionContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  directionTabsWrapper: {
    position: 'relative',
    marginTop: spacing.sm,
  },
  directionTabsShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  directionTabs: {
    flexDirection: 'row',
    borderWidth: lineDetail.directionTabBorderWidth,
    borderColor: lineDetail.directionTabBorderColor,
    borderRadius: lineDetail.directionTabRadius,
    overflow: 'hidden',
  },
  directionTab: {
    flex: 1,
    paddingVertical: lineDetail.directionTabPadding,
    paddingHorizontal: spacing.sm,
    backgroundColor: lineDetail.directionTabInactiveBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionTabRight: {
    borderLeftWidth: lineDetail.directionTabBorderWidth,
    borderLeftColor: lineDetail.directionTabBorderColor,
  },
  directionTabActive: {
    // backgroundColor set dynamically
  },
  directionTabText: {
    color: lineDetail.directionTabInactiveText,
    textAlign: 'center',
  },
  directionTabTextActive: {
    color: lineDetail.directionTabActiveText,
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

  // Contact Card with Offset Shadow
  contactCardWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  contactCardShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  contactCard: {
    backgroundColor: lineDetail.contactCardBackground,
    borderWidth: lineDetail.contactCardBorderWidth,
    borderColor: lineDetail.contactCardBorderColor,
    borderRadius: lineDetail.contactCardRadius,
    padding: lineDetail.contactCardPadding,
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
  contactIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactLink: {
    flex: 1,
    color: colors.link,
  },

  // Date Picker Modal (iOS)
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: colors.background,
    borderTopWidth: lineDetail.dateSelectorBorderWidth,
    borderTopColor: lineDetail.dateSelectorBorderColor,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: borders.widthThin,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  datePickerTitle: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  datePickerCancel: {
    color: colors.textSecondary,
  },
  datePickerDone: {
    color: colors.link,
  },
  datePickerIOS: {
    height: 216,
    backgroundColor: colors.background,
  },
});

export default LineDetailScreen;
