/**
 * DatePickerModal Component
 *
 * Platform-specific date picker:
 * - iOS: Modal with spinner picker and header buttons
 * - Android: Native date picker dialog
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Label } from '../../../ui/Text';
import { skin } from '../../../ui/skin';

const { colors, spacing, borders, components } = skin;
const lineDetail = components.transport.lineDetail;

interface DatePickerModalProps {
  isVisible: boolean;
  selectedDate: Date;
  onDateChange: (event: { type: string }, date?: Date) => void;
  onClose: () => void;
  cancelText: string;
  doneText: string;
  titleText: string;
}

/**
 * Modal wrapper for DateTimePicker
 * Handles platform-specific rendering automatically
 */
export function DatePickerModal({
  isVisible,
  selectedDate,
  onDateChange,
  onClose,
  cancelText,
  doneText,
  titleText,
}: DatePickerModalProps): React.JSX.Element | null {
  // Android: render native picker when visible
  if (Platform.OS === 'android') {
    if (!isVisible) return null;
    return (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={onDateChange}
      />
    );
  }

  // iOS: render modal with header and spinner picker
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Label style={styles.cancelText}>{cancelText}</Label>
            </TouchableOpacity>
            <Label style={styles.titleText}>{titleText}</Label>
            <TouchableOpacity onPress={onClose}>
              <Label style={styles.doneText}>{doneText}</Label>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            style={styles.picker}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopWidth: lineDetail.dateSelectorBorderWidth,
    borderTopColor: lineDetail.dateSelectorBorderColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: borders.widthThin,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  titleText: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
  },
  doneText: {
    color: colors.link,
  },
  picker: {
    height: 216,
    backgroundColor: colors.background,
  },
});
