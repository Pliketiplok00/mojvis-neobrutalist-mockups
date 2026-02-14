/**
 * DateSelector Component
 *
 * Date navigation row with prev/next arrows and tappable date display.
 * Includes neobrutalist offset shadow effect.
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import { formatDayWithDate } from '../../../utils/dateFormat';

const { colors, spacing, components } = skin;
const lineDetail = components.transport.lineDetail;

interface DateSelectorProps {
  selectedDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenPicker: () => void;
  language: 'hr' | 'en';
  prevDayLabel: string;
  selectDateLabel: string;
}

/**
 * Date navigation card with offset shadow
 * Displays formatted date with prev/next navigation arrows
 */
export function DateSelector({
  selectedDate,
  onPrevDay,
  onNextDay,
  onOpenPicker,
  language,
  prevDayLabel,
  selectDateLabel,
}: DateSelectorProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.shadow} />
      <View style={styles.selector}>
        <TouchableOpacity
          style={styles.arrow}
          onPress={onPrevDay}
          accessibilityLabel={prevDayLabel}
        >
          <Icon name="chevron-left" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateInfo}
          onPress={onOpenPicker}
          accessibilityLabel={selectDateLabel}
          accessibilityRole="button"
        >
          <Label style={styles.dateText}>
            {formatDayWithDate(new Date(selectedDate), language)}
          </Label>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.arrow}
          onPress={onNextDay}
          accessibilityLabel="Next day"
        >
          <Icon name="chevron-right" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lineDetail.dateSelectorBackground,
    borderWidth: lineDetail.dateSelectorBorderWidth,
    borderColor: lineDetail.dateSelectorBorderColor,
    borderRadius: lineDetail.dateSelectorRadius,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  arrow: {
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
});
