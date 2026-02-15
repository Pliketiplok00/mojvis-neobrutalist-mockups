/**
 * Calendar Component
 *
 * Monthly calendar with event date markers and neobrut styling.
 * Features sharp tiles, offset shadows on selection, and event indicators.
 *
 * Extracted from EventsScreen for reusability.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { H2, Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import { formatDateISO } from '../../../utils/dateFormat';

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  eventDates: Set<string>;
  monthNames: string[];
  dayNames: string[];
}

/**
 * Simple calendar component with neobrut styling
 */
export function Calendar({
  selectedDate,
  onSelectDate,
  eventDates,
  monthNames,
  dayNames,
}: CalendarProps): React.JSX.Element {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const renderDays = () => {
    const days: React.JSX.Element[] = [];
    const today = formatDateISO(new Date());
    const selected = formatDateISO(selectedDate);

    // Empty cells for days before first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayWrapper}>
          <View style={styles.dayEmpty} />
        </View>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateISO(date);
      const isToday = dateStr === today;
      const isSelected = dateStr === selected;
      const hasEvents = eventDates.has(dateStr);

      // V1 Poster: State priority: selected > today > hasEvents
      // All colored tiles (hasEvents, today, selected) get outlines
      // ONLY selected day gets neobrut offset shadow layer
      days.push(
        <View key={day} style={styles.dayWrapper}>
          {/* V1 Poster: Offset shadow layer ONLY for selected day */}
          {isSelected && <View style={styles.dayShadow} />}
          <TouchableOpacity
            style={[
              styles.day,
              // Fill + outline (priority: selected > today > hasEvents)
              // Each colored state includes its own outline
              hasEvents && !isSelected && !isToday && styles.dayHasEvents,
              isToday && !isSelected && styles.dayToday,
              isSelected && styles.daySelected,
            ]}
            onPress={() => onSelectDate(date)}
          >
            <Label
              style={[
                styles.dayText,
                isSelected && styles.dayTextSelected,
                isToday && !isSelected && styles.dayTextToday,
              ]}
            >
              {day}
            </Label>
            {/* V1 Poster: Show blue square indicator for days with events (except when selected) */}
            {hasEvents && !isSelected && <View style={styles.eventIndicator} />}
          </TouchableOpacity>
        </View>
      );
    }

    return days;
  };

  return (
    <View style={styles.container}>
      {/* V1 Poster: Month header with square nav buttons */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <Icon name="chevron-left" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
        <H2 style={styles.title}>
          {monthNames[month].toUpperCase()} {year}
        </H2>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Icon name="chevron-right" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
      </View>

      {/* Day names header */}
      <View style={styles.dayNames}>
        {dayNames.map((name) => (
          <Label key={name} style={styles.dayName}>
            {name}
          </Label>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>{renderDays()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // V1 Poster: Calendar container (transparent background per mockup)
  container: {
    backgroundColor: skin.components.calendar.containerBackground,
    margin: skin.spacing.lg,
    padding: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard, // Sharp: 0
    // No container border - only day tiles have outlines
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: skin.spacing.lg,
  },
  // V1 Poster: Square nav buttons (unboxed)
  navButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    // Inherited from H2 primitive
  },
  dayNames: {
    flexDirection: 'row',
    marginBottom: skin.spacing.sm,
  },
  // V1 Poster: Bold weekday labels
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontWeight: skin.components.calendar.weekdayFontWeight,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // V1 Poster: Gutters between tiles (not glued together)
    columnGap: skin.components.calendar.dayTileGap,
    rowGap: skin.components.calendar.dayTileGapY,
  },
  // V1 Poster: Wrapper for day tile + shadow layer
  dayWrapper: {
    // 7 columns with gaps - use flex basis to account for gaps
    flexBasis: '13%',
    flexGrow: 1,
    maxWidth: '14.28%',
    aspectRatio: 1,
    minHeight: skin.sizes.calendarDayMinHeight,
    position: 'relative',
  },
  // V1 Poster: Empty cell (no border, no fill)
  dayEmpty: {
    flex: 1,
  },
  // V1 Poster: Offset shadow layer for selected day (neobrut double-layer)
  dayShadow: {
    position: 'absolute',
    top: skin.components.calendar.selectedShadowOffsetY,
    left: skin.components.calendar.selectedShadowOffsetX,
    right: -skin.components.calendar.selectedShadowOffsetX,
    bottom: -skin.components.calendar.selectedShadowOffsetY,
    backgroundColor: skin.components.calendar.selectedShadowColor,
  },
  // V1 Poster: Calendar day tile (no outline by default, matches screen bg)
  day: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    // No border by default - only colored tiles (has-events/today/selected) get outline
    backgroundColor: skin.colors.background,
    padding: skin.components.calendar.dayTilePadding,
    // Ensure indicator is not clipped
    overflow: 'visible',
  },
  // V1 Poster: Yellow fill for today (with outline)
  dayToday: {
    backgroundColor: skin.colors.calendarToday,
    borderWidth: skin.components.calendar.dayTileBorderWidth,
    borderColor: skin.components.calendar.dayTileBorderColor,
  },
  // V1 Poster: Blue fill for selected (with outline)
  daySelected: {
    backgroundColor: skin.colors.calendarSelected,
    borderWidth: skin.components.calendar.dayTileBorderWidth,
    borderColor: skin.components.calendar.dayTileBorderColor,
  },
  // V1 Poster: Days with events get outline + green-ish fill
  dayHasEvents: {
    backgroundColor: skin.colors.calendarHasEvents,
    borderWidth: skin.components.calendar.dayTileBorderWidth,
    borderColor: skin.components.calendar.dayTileBorderColor,
  },
  // V1 Poster: Bold day numbers (all states)
  dayText: {
    color: skin.components.calendar.dayNumberColor,
    fontWeight: skin.components.calendar.dayNumberFontWeight,
  },
  // V1 Poster: Selected day = white text (same bold weight)
  dayTextSelected: {
    color: skin.components.calendar.selectedDayNumberColor,
  },
  // V1 Poster: Today tile text (same as default)
  dayTextToday: {
    color: skin.components.calendar.dayNumberColor,
  },
  // V1 Poster: Blue square indicator for days with events
  eventIndicator: {
    // Positioned below day number with gap
    marginTop: skin.components.calendar.eventIndicatorMarginTop,
    width: skin.sizes.calendarEventIndicator,
    height: skin.sizes.calendarEventIndicator,
    // Sharp square (no borderRadius)
    backgroundColor: skin.colors.calendarEventIndicator,
  },
});
