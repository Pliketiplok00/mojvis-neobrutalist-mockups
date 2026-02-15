/**
 * useDatePicker Hook Tests
 *
 * Tests for date picker state management hook.
 */

// Unmock dateFormat since useDatePicker uses formatDateISO
jest.unmock('../../utils/dateFormat');

import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { useDatePicker } from '../useDatePicker';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('useDatePicker', () => {
  beforeEach(() => {
    // Reset Platform to iOS before each test
    (Platform as { OS: string }).OS = 'ios';
  });

  describe('initialization', () => {
    it('should initialize with today date by default', () => {
      const { result } = renderHook(() => useDatePicker());

      // Today in YYYY-MM-DD format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const expectedDate = `${year}-${month}-${day}`;

      expect(result.current.selectedDate).toBe(expectedDate);
      expect(result.current.isDatePickerOpen).toBe(false);
    });

    it('should initialize with custom date', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-03-15' })
      );

      expect(result.current.selectedDate).toBe('2026-03-15');
      expect(result.current.isDatePickerOpen).toBe(false);
    });
  });

  describe('openDatePicker / closeDatePicker', () => {
    it('should open date picker', () => {
      const { result } = renderHook(() => useDatePicker());

      expect(result.current.isDatePickerOpen).toBe(false);

      act(() => {
        result.current.openDatePicker();
      });

      expect(result.current.isDatePickerOpen).toBe(true);
    });

    it('should close date picker', () => {
      const { result } = renderHook(() => useDatePicker());

      act(() => {
        result.current.openDatePicker();
      });
      expect(result.current.isDatePickerOpen).toBe(true);

      act(() => {
        result.current.closeDatePicker();
      });
      expect(result.current.isDatePickerOpen).toBe(false);
    });
  });

  describe('adjustDate', () => {
    it('should adjust date forward by 1 day', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-02-15' })
      );

      act(() => {
        result.current.adjustDate(1);
      });

      expect(result.current.selectedDate).toBe('2026-02-16');
    });

    it('should adjust date backward by 1 day', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-02-15' })
      );

      act(() => {
        result.current.adjustDate(-1);
      });

      expect(result.current.selectedDate).toBe('2026-02-14');
    });

    it('should handle month boundary (forward)', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-02-28' })
      );

      act(() => {
        result.current.adjustDate(1);
      });

      expect(result.current.selectedDate).toBe('2026-03-01');
    });

    it('should handle month boundary (backward)', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-03-01' })
      );

      act(() => {
        result.current.adjustDate(-1);
      });

      expect(result.current.selectedDate).toBe('2026-02-28');
    });

    it('should handle year boundary', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-12-31' })
      );

      act(() => {
        result.current.adjustDate(1);
      });

      expect(result.current.selectedDate).toBe('2027-01-01');
    });

    it('should adjust by multiple days', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-02-15' })
      );

      act(() => {
        result.current.adjustDate(7);
      });

      expect(result.current.selectedDate).toBe('2026-02-22');
    });
  });

  describe('setSelectedDate', () => {
    it('should set date directly', () => {
      const { result } = renderHook(() => useDatePicker());

      act(() => {
        result.current.setSelectedDate('2026-12-25');
      });

      expect(result.current.selectedDate).toBe('2026-12-25');
    });
  });

  describe('handleDateChange', () => {
    it('should update date on "set" event (iOS)', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-02-15' })
      );

      act(() => {
        result.current.openDatePicker();
      });

      act(() => {
        result.current.handleDateChange(
          { type: 'set' },
          new Date(2026, 5, 20) // June 20, 2026
        );
      });

      expect(result.current.selectedDate).toBe('2026-06-20');
      // iOS doesn't auto-close
      expect(result.current.isDatePickerOpen).toBe(true);
    });

    it('should not update date on "dismissed" event', () => {
      const { result } = renderHook(() =>
        useDatePicker({ initialDate: '2026-02-15' })
      );

      act(() => {
        result.current.handleDateChange(
          { type: 'dismissed' },
          new Date(2026, 5, 20)
        );
      });

      expect(result.current.selectedDate).toBe('2026-02-15');
    });

    it('should close picker on Android regardless of event type', () => {
      (Platform as { OS: string }).OS = 'android';

      const { result } = renderHook(() => useDatePicker());

      act(() => {
        result.current.openDatePicker();
      });
      expect(result.current.isDatePickerOpen).toBe(true);

      act(() => {
        result.current.handleDateChange({ type: 'dismissed' });
      });

      expect(result.current.isDatePickerOpen).toBe(false);
    });
  });
});
