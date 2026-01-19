/**
 * Mirror Road Transport Screen
 *
 * Dev-only mirror of RoadTransportScreen.
 * Uses fixture data instead of API calls.
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Badge } from '../../ui/Badge';
import { H1, H2, Label, Meta } from '../../ui/Text';
import { Icon } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import {
  roadLinesFixture,
  roadTodayDeparturesFixture,
  fixtureDayType,
  fixtureIsHoliday,
} from '../fixtures/transport';
import type { MainStackParamList } from '../../navigation/types';
import type { DayType } from '../../types/transport';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const { colors, spacing, borders, components } = skin;
const overviewHeader = components.transport.overviewHeader;
const listTokens = components.transport.list;

const DAY_TYPE_LABELS: Record<DayType, string> = {
  MON: 'Ponedjeljak',
  TUE: 'Utorak',
  WED: 'Srijeda',
  THU: 'Cetvrtak',
  FRI: 'Petak',
  SAT: 'Subota',
  SUN: 'Nedjelja',
  PRAZNIK: 'Praznik',
};

function formatTime(time: string): string {
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function MirrorTransportRoadScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  // No-op for mirror - just for visual testing
  const handleLinePress = (lineId: string) => {
    console.log('[MirrorTransportRoad] Line pressed:', lineId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Simple Header with back button */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="chevron-left" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
        <Label style={styles.headerBarLabel}>Mirror: Road Transport</Label>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Poster Header Slab */}
        <View style={styles.headerSlab}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconBox}>
              <Icon name="bus" size="lg" colorToken="textPrimary" />
            </View>
            <View style={styles.headerTextContainer}>
              <H1 style={styles.headerTitle}>Cestovni prijevoz</H1>
              <Meta style={styles.headerMeta}>
                {DAY_TYPE_LABELS[fixtureDayType]}
                {fixtureIsHoliday && ' (Praznik)'}
              </Meta>
            </View>
          </View>
        </View>

        {/* Section A: Lines List */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>LINIJE</Label>
          {roadLinesFixture.map((line) => (
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
              {/* Main card - 2-part structure */}
              <View style={styles.lineCard}>
                {/* TOP: Colored header slab with icon + title + badge */}
                <View style={styles.lineCardHeader}>
                  <View style={styles.lineCardHeaderIconBox}>
                    <Icon name="bus" size="md" colorToken="textPrimary" />
                  </View>
                  <H2 style={styles.lineCardHeaderTitle} numberOfLines={2}>
                    {line.name}
                  </H2>
                  {line.subtype && (
                    <Badge variant="transport" size="compact" style={styles.lineSubtypeBadge}>
                      {line.subtype}
                    </Badge>
                  )}
                </View>
                {/* BOTTOM: White body with meta + chevron */}
                <View style={styles.lineCardBody}>
                  <View style={styles.lineCardContent}>
                    <Meta numberOfLines={1} style={styles.lineStops}>
                      {line.stops_summary}
                    </Meta>
                    <Meta style={styles.lineMeta} numberOfLines={1}>
                      {line.stops_count} stanica
                      {line.typical_duration_minutes
                        ? ` • ${formatDuration(line.typical_duration_minutes)}`
                        : ''}
                    </Meta>
                  </View>
                  <View style={styles.lineCardChevronBox}>
                    <Icon name="chevron-right" size="sm" colorToken="textPrimary" />
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Section B: Today's Departures */}
        <View style={styles.section}>
          <Label style={styles.sectionLabel}>DANAS POLASCI</Label>
          <View style={styles.todaySetWrapper}>
            {/* Shadow layer */}
            <View style={styles.todaySetShadow} />
            {/* Main container */}
            <View style={styles.todaySet}>
              {roadTodayDeparturesFixture.map((dep, index) => (
                <Pressable
                  key={`${dep.line_id}-${dep.departure_time}-${index}`}
                  style={({ pressed }) => [
                    styles.todayRow,
                    index > 0 && styles.todayRowWithDivider,
                    pressed && styles.todayRowPressed,
                  ]}
                  onPress={() => handleLinePress(dep.line_id)}
                >
                  {/* Time block - green */}
                  <View style={styles.todayTimeBlock}>
                    <H2 style={styles.todayTime}>
                      {formatTime(dep.departure_time)}
                    </H2>
                  </View>
                  {/* Info */}
                  <View style={styles.todayInfo}>
                    <Label style={styles.todayLineName} numberOfLines={1}>
                      {dep.direction_label}
                    </Label>
                  </View>
                  {/* Subtype badge */}
                  {dep.subtype && (
                    <Badge variant="transport" size="compact" style={styles.todaySubtypeBadge}>
                      {dep.subtype}
                    </Badge>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundTertiary,
    borderBottomWidth: borders.widthThin,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerBarLabel: {
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },

  // Poster Header Slab (GREEN for road)
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
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },

  // Line card (GREEN header for road)
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
    borderWidth: listTokens.lineCardBorderWidth,
    borderColor: listTokens.lineCardBorderColor,
    borderRadius: listTokens.lineCardRadius,
    overflow: 'hidden',
  },
  lineCardPressed: {
    transform: [
      { translateX: listTokens.lineCardPressedOffsetX },
      { translateY: listTokens.lineCardPressedOffsetY },
    ],
  },
  lineCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: listTokens.lineCardHeaderPadding,
    backgroundColor: listTokens.lineCardHeaderBackgroundRoad, // GREEN
  },
  lineCardHeaderIconBox: {
    width: listTokens.lineCardHeaderIconBoxSize,
    height: listTokens.lineCardHeaderIconBoxSize,
    backgroundColor: listTokens.lineCardHeaderIconBoxBackground,
    borderWidth: listTokens.lineCardHeaderIconBoxBorderWidth,
    borderColor: listTokens.lineCardHeaderIconBoxBorderColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: listTokens.lineCardHeaderIconGap,
  },
  lineCardHeaderTitle: {
    flex: 1,
    color: listTokens.lineCardHeaderTitleColor,
  },
  lineSubtypeBadge: {
    marginLeft: spacing.sm,
  },
  lineCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: listTokens.lineCardBodyBackground,
    padding: listTokens.lineCardBodyPadding,
    borderTopWidth: listTokens.lineCardBodyBorderTopWidth,
    borderTopColor: listTokens.lineCardBodyBorderColor,
  },
  lineCardContent: {
    flex: 1,
  },
  lineStops: {
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

  // Today's departures (GREEN time blocks for road)
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
    backgroundColor: listTokens.todayTimeBlockBackgroundRoad, // GREEN
    borderRightWidth: listTokens.todayTimeBlockBorderWidth,
    borderRightColor: listTokens.todayTimeBlockBorderColor,
    paddingVertical: listTokens.todayTimeBlockPadding,
    paddingHorizontal: listTokens.todayTimeBlockPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayTime: {
    color: listTokens.todayTimeBlockTextColor,
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
  todaySubtypeBadge: {
    alignSelf: 'center',
    marginRight: spacing.md,
  },
});

export default MirrorTransportRoadScreen;
