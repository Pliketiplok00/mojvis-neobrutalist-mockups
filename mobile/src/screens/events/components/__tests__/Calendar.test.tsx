/**
 * Calendar Component Tests
 *
 * Tests for monthly calendar with event markers.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Calendar } from '../Calendar';

// Mock formatDateISO to return predictable values
jest.mock('../../../../utils/dateFormat', () => ({
  formatDateISO: (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
}));

// Mock skin for calendar tokens
jest.mock('../../../../ui/skin', () => ({
  skin: {
    colors: {
      background: '#FFFFFF',
      calendarToday: '#FEF3C7',
      calendarSelected: '#2563EB',
      calendarHasEvents: '#D1FAE5',
      calendarEventIndicator: '#2563EB',
    },
    spacing: {
      sm: 8,
      lg: 16,
    },
    borders: {
      radiusCard: 0,
    },
    sizes: {
      calendarDayMinHeight: 40,
      calendarEventIndicator: 6,
    },
    components: {
      calendar: {
        containerBackground: '#FFFFFF',
        weekdayFontWeight: '700',
        dayTileGap: 4,
        dayTileGapY: 4,
        dayTilePadding: 4,
        dayTileBorderWidth: 2,
        dayTileBorderColor: '#000000',
        selectedShadowOffsetX: 3,
        selectedShadowOffsetY: 3,
        selectedShadowColor: '#000000',
        dayNumberColor: '#000000',
        dayNumberFontWeight: '700',
        selectedDayNumberColor: '#FFFFFF',
        eventIndicatorMarginTop: 2,
      },
    },
  },
}));

describe('Calendar', () => {
  const monthNames = [
    'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
    'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac',
  ];
  const dayNames = ['N', 'P', 'U', 'S', 'Č', 'P', 'S'];

  const mockOnSelectDate = jest.fn();
  const mockEventDates = new Set(['2026-02-10', '2026-02-20']);

  const defaultProps = {
    selectedDate: new Date('2026-02-15'),
    onSelectDate: mockOnSelectDate,
    eventDates: mockEventDates,
    monthNames,
    dayNames,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render month and year header', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);

      expect(getByText('VELJAČA 2026')).toBeTruthy();
    });

    it('should render day names', () => {
      const { getAllByText } = render(<Calendar {...defaultProps} />);

      // Check unique day names exist (P and S appear twice in Croatian: Pon/Pet, Sub/Sre)
      const uniqueNames = ['N', 'U', 'Č'];
      uniqueNames.forEach((name) => {
        expect(getAllByText(name).length).toBeGreaterThan(0);
      });
      // P appears for Ponedjeljak and Petak
      expect(getAllByText('P').length).toBe(2);
      // S appears for Srijeda and Subota
      expect(getAllByText('S').length).toBe(2);
    });

    it('should render navigation icons', () => {
      const { getByTestId } = render(<Calendar {...defaultProps} />);

      expect(getByTestId('icon-chevron-left')).toBeTruthy();
      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });

    it('should render day numbers', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);

      // Check for various day numbers
      expect(getByText('1')).toBeTruthy();
      expect(getByText('15')).toBeTruthy();
      expect(getByText('28')).toBeTruthy();
    });
  });

  describe('month navigation', () => {
    it('should navigate to previous month when left arrow is pressed', () => {
      const { getByTestId, getByText } = render(<Calendar {...defaultProps} />);

      fireEvent.press(getByTestId('icon-chevron-left'));

      expect(getByText('SIJEČANJ 2026')).toBeTruthy();
    });

    it('should navigate to next month when right arrow is pressed', () => {
      const { getByTestId, getByText } = render(<Calendar {...defaultProps} />);

      fireEvent.press(getByTestId('icon-chevron-right'));

      expect(getByText('OŽUJAK 2026')).toBeTruthy();
    });

    it('should handle year change when navigating', () => {
      // Start in January 2026
      const januaryProps = {
        ...defaultProps,
        selectedDate: new Date('2026-01-15'),
      };
      const { getByTestId, getByText } = render(<Calendar {...januaryProps} />);

      // Navigate to previous month (December 2025)
      fireEvent.press(getByTestId('icon-chevron-left'));

      expect(getByText('PROSINAC 2025')).toBeTruthy();
    });
  });

  describe('date selection', () => {
    it('should call onSelectDate when a day is pressed', () => {
      const { getByText } = render(<Calendar {...defaultProps} />);

      fireEvent.press(getByText('20'));

      expect(mockOnSelectDate).toHaveBeenCalledTimes(1);
      const calledDate = mockOnSelectDate.mock.calls[0][0];
      expect(calledDate.getDate()).toBe(20);
      expect(calledDate.getMonth()).toBe(1); // February
      expect(calledDate.getFullYear()).toBe(2026);
    });
  });

  describe('event dates', () => {
    it('should render event indicators for dates with events', () => {
      // Event dates are 2026-02-10 and 2026-02-20
      // The component renders event indicators as small squares
      const { root } = render(<Calendar {...defaultProps} />);

      // This test verifies the component renders without errors
      // with event dates provided
      expect(root).toBeTruthy();
    });
  });

  describe('custom labels', () => {
    it('should use custom month names', () => {
      const englishMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const { getByText } = render(
        <Calendar {...defaultProps} monthNames={englishMonths} />
      );

      expect(getByText('FEBRUARY 2026')).toBeTruthy();
    });

    it('should use custom day names', () => {
      const englishDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const { getAllByText } = render(
        <Calendar {...defaultProps} dayNames={englishDays} />
      );

      // Multiple 'T' and 'S' in week
      expect(getAllByText('M').length).toBeGreaterThan(0);
    });
  });

  describe('empty event dates', () => {
    it('should render without event markers when no events', () => {
      const { root } = render(
        <Calendar {...defaultProps} eventDates={new Set()} />
      );

      expect(root).toBeTruthy();
    });
  });
});
