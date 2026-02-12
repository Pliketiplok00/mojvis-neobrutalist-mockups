/**
 * Mirror Line Detail Screen (Design Mirror)
 *
 * Shared visual renderer for transport line detail.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Header slab with icon box (ship/bus)
 * 2. Date selector card with offset shadow
 * 3. Direction toggle tabs
 * 4. Route info with stops count
 * 5. Departures list with expandable timeline
 * 6. Marker note
 * 7. Contact cards with offset shadow
 *
 * Rules:
 * - NO useNavigation import
 * - NO useRoute import
 * - NO API calls
 * - All actions are NO-OP (except local state for expand/direction)
 * - Skin tokens only
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { skin } from '../../ui/skin';
import { H1, H2, Label, Meta, Body } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import type { IconName } from '../../ui/Icon';
import type {
  TransportType,
  LineDetailResponse,
  DeparturesListResponse,
  DepartureResponse,
  RouteInfo,
  DayType,
} from '../../types/transport';
import {
  transportDetailLabels,
  formatDisplayDate,
  formatDuration,
} from '../fixtures/transportDetail';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { colors, spacing, borders, components, opacity } = skin;
const lineDetail = components.transport.lineDetail;

// ============================================================
// Types
// ============================================================

interface MirrorLineDetailScreenProps {
  transportType: TransportType;
  lineDetailData: LineDetailResponse;
  departuresData: DeparturesListResponse;
}

// ============================================================
// Helper Components
// ============================================================

/**
 * Parse time string (HH:MM or HH:MM:SS) to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours * 60 + minutes;
}

/**
 * Check if arrival crosses midnight relative to departure
 */
function isNextDay(departureTime: string, arrivalTime: string): boolean {
  const depMinutes = parseTimeToMinutes(departureTime);
  const arrMinutes = parseTimeToMinutes(arrivalTime);
  return arrMinutes < depMinutes;
}

/**
 * Format time for display (strip seconds if present)
 */
function formatTime(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Mirror Departure Item - expandable row with timeline
 */
function MirrorDepartureItem({
  departure,
  transportType,
}: {
  departure: DepartureResponse;
  transportType: TransportType;
}): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const hasStopTimes = departure.stop_times.length > 0;
  const departureTimeFormatted = formatTime(departure.departure_time);

  // Get transport-type-specific colors
  const timeBlockBackground =
    transportType === 'sea'
      ? lineDetail.timeBlockBackgroundSea
      : lineDetail.timeBlockBackgroundRoad;

  return (
    <View style={styles.departureWrapper}>
      {/* Offset Shadow Layer */}
      <View style={styles.departureShadow} />

      {/* Main Card */}
      <Pressable
        style={({ pressed }) => [
          styles.departureContainer,
          hasStopTimes && pressed && styles.departureContainerPressed,
        ]}
        onPress={hasStopTimes ? toggleExpanded : undefined}
      >
        {/* Header Row */}
        <View style={styles.departureHeader}>
          {/* Time Block */}
          <View style={[styles.timeBlock, { backgroundColor: timeBlockBackground }]}>
            <H2 style={styles.departureTime}>
              {departureTimeFormatted}
              {departure.marker ? ` ${departure.marker}` : ''}
            </H2>
          </View>

          {/* Info Section */}
          <View style={styles.departureInfoSection}>
            <Label style={styles.departureDestination} numberOfLines={1}>
              {departure.destination}
            </Label>
            <View style={styles.departureMetaRow}>
              {departure.duration_minutes && (
                <Meta style={styles.departureDuration}>
                  {formatDuration(departure.duration_minutes)}
                </Meta>
              )}
              {hasStopTimes && departure.stop_times.length > 2 && (
                <Meta style={styles.departureStopsCount}>
                  {departure.stop_times.length} {transportDetailLabels.stations}
                </Meta>
              )}
            </View>
          </View>

          {/* Expand Chevron */}
          {hasStopTimes && (
            <View style={styles.expandIconContainer}>
              <Icon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size="md"
                colorToken="textPrimary"
              />
            </View>
          )}
        </View>

        {/* Notes Badge */}
        {departure.notes && (
          <View style={styles.notesBadge}>
            <Meta style={styles.notesText}>{departure.notes}</Meta>
          </View>
        )}

        {/* Expanded Timeline */}
        {expanded && hasStopTimes && (
          <View style={styles.timeline}>
            {departure.stop_times.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === departure.stop_times.length - 1;
              const arrivalTimeFormatted = formatTime(stop.arrival_time);
              const showNextDay =
                !isFirst && isNextDay(departure.departure_time, stop.arrival_time);

              return (
                <View key={`${stop.stop_name}-${index}`} style={styles.timelineItem}>
                  {/* Timeline Indicator (dot + line) */}
                  <View style={styles.timelineIndicator}>
                    <View
                      style={[
                        styles.timelineDot,
                        (isFirst || isLast) && styles.timelineDotEndpoint,
                      ]}
                    />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  {/* Stop Info */}
                  <View style={styles.stopInfo}>
                    <View style={styles.stopTimeContainer}>
                      <Label style={styles.stopTime}>{arrivalTimeFormatted}</Label>
                      {showNextDay && (
                        <Meta style={styles.nextDayIndicator}>(+1 dan)</Meta>
                      )}
                    </View>
                    <Body style={styles.stopName} numberOfLines={1}>
                      {stop.stop_name}
                    </Body>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Pressable>
    </View>
  );
}

// ============================================================
// Main Component
// ============================================================

export function MirrorLineDetailScreen({
  transportType,
  lineDetailData,
  departuresData,
}: MirrorLineDetailScreenProps): React.JSX.Element {
  const [selectedDirection, setSelectedDirection] = useState<number>(
    departuresData.direction
  );

  // Get routes for direction toggle
  const routes: RouteInfo[] = lineDetailData.routes || [];
  const currentRoute = routes.find((r) => r.direction === selectedDirection);

  // Get transport-type-specific colors
  const headerBackground =
    transportType === 'sea'
      ? lineDetail.headerBackgroundSea
      : lineDetail.headerBackgroundRoad;

  const iconName: IconName = transportType === 'sea' ? 'ship' : 'bus';

  // NO-OP date navigation handlers
  const handlePrevDay = (): void => {
    // Intentionally empty - mirror screens don't change data
  };

  const handleNextDay = (): void => {
    // Intentionally empty - mirror screens don't change data
  };

  const handleDatePress = (): void => {
    // Intentionally empty - mirror screens don't open date picker
  };

  // NO-OP contact handlers
  const handlePhonePress = (): void => {
    // Intentionally empty
  };

  const handleEmailPress = (): void => {
    // Intentionally empty
  };

  const handleWebsitePress = (): void => {
    // Intentionally empty
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Mirror header - simplified, no GlobalHeader */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>
          {transportType === 'sea' ? 'SeaLineDetail' : 'RoadLineDetail'} Mirror
        </H2>
        <Meta style={styles.mirrorHeaderMeta}>
          fixture: {transportType}LineDetailFixture
        </Meta>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Poster Header Slab */}
        <View style={[styles.headerSlab, { backgroundColor: headerBackground }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconBox}>
              <Icon name={iconName} size="lg" colorToken="textPrimary" />
            </View>
            <View style={styles.headerTextContainer}>
              <H1 style={styles.headerTitle}>{lineDetailData.name}</H1>
              <View style={styles.headerMetaRow}>
                {lineDetailData.subtype && (
                  <Meta style={styles.headerMeta}>{lineDetailData.subtype}</Meta>
                )}
                {currentRoute?.typical_duration_minutes && (
                  <Meta style={styles.headerMeta}>
                    {formatDuration(currentRoute.typical_duration_minutes)}
                  </Meta>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Date Selector Card with Offset Shadow */}
        <View style={styles.dateSelectorContainer}>
          <View style={styles.dateSelectorShadow} />
          <View style={styles.dateSelector}>
            <TouchableOpacity style={styles.dateArrow} onPress={handlePrevDay}>
              <Icon name="chevron-left" size="md" colorToken="textPrimary" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateInfo} onPress={handleDatePress}>
              <Label style={styles.dateSelectorLabel}>
                {transportDetailLabels.dateSelector.label}
              </Label>
              <H2 style={styles.dateText}>
                {formatDisplayDate(departuresData.date)}
              </H2>
              <Meta style={styles.dayTypeText}>
                {transportDetailLabels.dayTypes[departuresData.day_type]}
                {departuresData.is_holiday &&
                  ` (${transportDetailLabels.holiday})`}
              </Meta>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateArrow} onPress={handleNextDay}>
              <Icon name="chevron-right" size="md" colorToken="textPrimary" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Direction Toggle Tabs */}
        {routes.length > 1 && (
          <View style={styles.directionContainer}>
            <Label style={styles.sectionLabel}>
              {transportDetailLabels.sections.direction}
            </Label>
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
                {currentRoute.stops.length} {transportDetailLabels.stations}
              </Body>
            </View>
          </View>
        )}

        {/* Section Divider */}
        <View style={styles.sectionDivider} />

        {/* Departures Section */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>
            {transportDetailLabels.sections.departures}
          </Label>
          {departuresData.departures.length > 0 ? (
            <>
              <View style={styles.departuresList}>
                {departuresData.departures.map((dep) => (
                  <MirrorDepartureItem
                    key={dep.id}
                    departure={dep}
                    transportType={transportType}
                  />
                ))}
              </View>
              {/* Marker Note (displayed below departures list) */}
              {departuresData.marker_note && (
                <View style={styles.markerNoteContainer}>
                  <Meta style={styles.markerNoteText}>
                    {departuresData.marker_note}
                  </Meta>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="calendar" size="lg" colorToken="textMuted" />
              <Body style={styles.emptyStateText}>
                {transportDetailLabels.empty.subtitle}
              </Body>
            </View>
          )}
        </View>

        {/* Section Divider */}
        {lineDetailData.contacts.length > 0 && (
          <View style={styles.sectionDivider} />
        )}

        {/* Contacts Section */}
        {lineDetailData.contacts.length > 0 && (
          <View style={styles.section}>
            <Label style={styles.sectionLabel}>
              {transportDetailLabels.sections.contacts}
            </Label>
            {lineDetailData.contacts.map((contact, index) => (
              <View
                key={`${contact.operator}-${index}`}
                style={styles.contactCardWrapper}
              >
                <View style={styles.contactCardShadow} />
                <View style={styles.contactCard}>
                  <Label style={styles.contactOperator}>{contact.operator}</Label>
                  {contact.phone && (
                    <TouchableOpacity
                      style={styles.contactRow}
                      onPress={handlePhonePress}
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
                      onPress={handleEmailPress}
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
                      onPress={handleWebsitePress}
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
    </SafeAreaView>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mirrorHeader: {
    padding: spacing.lg,
    borderBottomWidth: borders.widthHeavy,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundTertiary,
  },
  mirrorHeaderTitle: {
    marginBottom: spacing.xs,
  },
  mirrorHeaderMeta: {
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
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
    backgroundColor: lineDetail.headerIconBoxBackground,
    borderWidth: lineDetail.headerIconBoxBorderWidth,
    borderColor: lineDetail.headerIconBoxBorderColor,
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
    padding: lineDetail.dateSelectorPadding,
  },
  dateArrow: {
    width: lineDetail.dateSelectorArrowSize,
    height: lineDetail.dateSelectorArrowSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateSelectorLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  dateText: {
    color: colors.textPrimary,
  },
  dayTypeText: {
    marginTop: spacing.xs,
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
  departuresList: {
    gap: lineDetail.departureRowGap,
  },
  markerNoteContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  markerNoteText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
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

  // Departure Item
  departureWrapper: {
    position: 'relative',
  },
  departureShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  departureContainer: {
    backgroundColor: lineDetail.departureRowBackground,
    borderWidth: lineDetail.departureRowBorderWidth,
    borderColor: lineDetail.departureRowBorderColor,
    borderRadius: lineDetail.departureRowRadius,
    overflow: 'hidden',
  },
  departureContainerPressed: {
    opacity: opacity.muted,
  },
  departureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBlock: {
    width: lineDetail.timeBlockWidth,
    paddingVertical: lineDetail.timeBlockPadding,
    paddingHorizontal: lineDetail.timeBlockPadding,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: lineDetail.timeBlockBorderWidth,
    borderRightColor: lineDetail.timeBlockBorderColor,
  },
  departureTime: {
    color: lineDetail.timeBlockTextColor,
  },
  departureInfoSection: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: lineDetail.departureRowPadding,
  },
  departureDestination: {
    color: colors.textPrimary,
  },
  departureMetaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  departureDuration: {
    color: colors.textSecondary,
  },
  departureStopsCount: {
    color: colors.textSecondary,
  },
  expandIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesBadge: {
    backgroundColor: lineDetail.notesBadgeBackground,
    paddingHorizontal: lineDetail.notesBadgePadding,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  notesText: {
    color: colors.textPrimary,
  },

  // Timeline (expanded)
  timeline: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: borders.widthThin,
    borderTopColor: colors.borderLight,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 40,
    paddingTop: spacing.md,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: lineDetail.timelineDotSize,
    height: lineDetail.timelineDotSize,
    borderRadius: lineDetail.timelineDotSize / 2,
    backgroundColor: lineDetail.timelineDotColor,
  },
  timelineDotEndpoint: {
    width: lineDetail.timelineDotSizeEndpoint,
    height: lineDetail.timelineDotSizeEndpoint,
    borderRadius: lineDetail.timelineDotSizeEndpoint / 2,
    backgroundColor: lineDetail.timelineDotEndpointColor,
  },
  timelineLine: {
    width: lineDetail.timelineLineWidth,
    flex: 1,
    backgroundColor: lineDetail.timelineLineColor,
    marginTop: spacing.xs,
  },
  stopInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: spacing.sm,
  },
  stopTimeContainer: {
    width: lineDetail.timelineStopTimeWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stopTime: {
    color: colors.textPrimary,
  },
  nextDayIndicator: {
    color: colors.warningText,
    backgroundColor: colors.warningBackground,
    paddingHorizontal: spacing.xs,
  },
  stopName: {
    flex: 1,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
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
    backgroundColor: colors.backgroundSecondary,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactLink: {
    flex: 1,
    color: colors.link,
  },
});

export default MirrorLineDetailScreen;
