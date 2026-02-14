/**
 * useDatePicker Hook
 *
 * Manages date picker state and interactions.
 * Extracted from LineDetailScreen for reusability.
 */

import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { formatDateISO } from '../utils/dateFormat';

interface UseDatePickerOptions {
  initialDate?: string;
}

interface UseDatePickerReturn {
  selectedDate: string;
  isDatePickerOpen: boolean;
  openDatePicker: () => void;
  closeDatePicker: () => void;
  handleDateChange: (event: { type: string }, date?: Date) => void;
  adjustDate: (days: number) => void;
  setSelectedDate: (date: string) => void;
}

/**
 * Hook for managing date picker state and interactions
 *
 * @param options.initialDate - Initial date in YYYY-MM-DD format (defaults to today)
 */
export function useDatePicker(options: UseDatePickerOptions = {}): UseDatePickerReturn {
  const { initialDate = formatDateISO(new Date()) } = options;

  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const openDatePicker = useCallback(() => {
    setIsDatePickerOpen(true);
  }, []);

  const closeDatePicker = useCallback(() => {
    setIsDatePickerOpen(false);
  }, []);

  const handleDateChange = useCallback((event: { type: string }, date?: Date) => {
    // On Android, dismiss events also call this handler
    if (Platform.OS === 'android') {
      setIsDatePickerOpen(false);
    }
    if (event.type === 'set' && date) {
      const newDateString = formatDateISO(date);
      setSelectedDate(newDateString);
    }
  }, []);

  const adjustDate = useCallback((days: number) => {
    setSelectedDate((current) => {
      const date = new Date(current);
      date.setDate(date.getDate() + days);
      return formatDateISO(date);
    });
  }, []);

  return {
    selectedDate,
    isDatePickerOpen,
    openDatePicker,
    closeDatePicker,
    handleDateChange,
    adjustDate,
    setSelectedDate,
  };
}
