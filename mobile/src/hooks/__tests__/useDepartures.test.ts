/**
 * useDepartures Hook Tests
 *
 * Tests for departures fetching and direction management.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDepartures } from '../useDepartures';

// Mock the API
jest.mock('../../services/api', () => ({
  transportApi: {
    getDepartures: jest.fn(),
  },
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { transportApi } from '../../services/api';

const mockDepartures = {
  departures: [
    {
      id: 1,
      departure_time: '07:30',
      arrival_time: '09:00',
      operator: 'Jadrolinija',
    },
    {
      id: 2,
      departure_time: '15:00',
      arrival_time: '16:30',
      operator: 'Jadrolinija',
    },
  ],
  direction: 0,
  date: '2026-02-15',
};

interface UseDeparturesTestProps {
  lineId: string;
  transportType: 'road' | 'sea';
  selectedDate: string;
  language: 'hr' | 'en';
  enabled: boolean;
}

describe('useDepartures', () => {
  const defaultProps: UseDeparturesTestProps = {
    lineId: '602',
    transportType: 'sea',
    selectedDate: '2026-02-15',
    language: 'hr',
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (transportApi.getDepartures as jest.Mock).mockResolvedValue(mockDepartures);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should not fetch when disabled', () => {
      const { result } = renderHook(() =>
        useDepartures({ ...defaultProps, enabled: false })
      );

      expect(result.current.departuresLoading).toBe(false);
      expect(transportApi.getDepartures).not.toHaveBeenCalled();
      expect(result.current.departures).toBeNull();
    });

    it('should initialize with direction 0', () => {
      const { result } = renderHook(() =>
        useDepartures({ ...defaultProps, enabled: false })
      );

      expect(result.current.selectedDirection).toBe(0);
    });
  });

  describe('fetching', () => {
    it('should fetch departures when enabled', async () => {
      const { result } = renderHook(() => useDepartures(defaultProps));

      await waitFor(() => {
        expect(result.current.departures).not.toBeNull();
      });

      expect(transportApi.getDepartures).toHaveBeenCalledWith(
        'sea',
        '602',
        '2026-02-15',
        0, // direction
        'hr'
      );
      expect(result.current.departures).toEqual(mockDepartures);
    });

    it('should set loading state while fetching', () => {
      const { result } = renderHook(() => useDepartures(defaultProps));

      // Initial loading when enabled
      expect(result.current.departuresLoading).toBe(true);
    });

    it('should handle API error silently', async () => {
      (transportApi.getDepartures as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useDepartures(defaultProps));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      expect(result.current.departures).toBeNull();
    });
  });

  describe('direction changes', () => {
    it('should allow setting direction', async () => {
      const { result } = renderHook(() => useDepartures(defaultProps));

      await waitFor(() => {
        expect(result.current.departures).not.toBeNull();
      });

      act(() => {
        result.current.setSelectedDirection(1);
      });

      expect(result.current.selectedDirection).toBe(1);
    });

    it('should refetch when direction changes', async () => {
      const { result } = renderHook(() => useDepartures(defaultProps));

      await waitFor(() => {
        expect(result.current.departures).not.toBeNull();
      });

      expect(transportApi.getDepartures).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.setSelectedDirection(1);
      });

      await waitFor(() => {
        expect(transportApi.getDepartures).toHaveBeenCalledTimes(2);
      });

      expect(transportApi.getDepartures).toHaveBeenLastCalledWith(
        'sea',
        '602',
        '2026-02-15',
        1, // new direction
        'hr'
      );
    });
  });

  describe('props changes', () => {
    it('should refetch when selectedDate changes', async () => {
      const { result, rerender } = renderHook(
        (props: UseDeparturesTestProps) => useDepartures(props),
        { initialProps: defaultProps }
      );

      await waitFor(() => {
        expect(result.current.departures).not.toBeNull();
      });

      expect(transportApi.getDepartures).toHaveBeenCalledTimes(1);

      rerender({ ...defaultProps, selectedDate: '2026-02-16' });

      await waitFor(() => {
        expect(transportApi.getDepartures).toHaveBeenCalledTimes(2);
      });

      expect(transportApi.getDepartures).toHaveBeenLastCalledWith(
        'sea',
        '602',
        '2026-02-16',
        0,
        'hr'
      );
    });

    it('should fetch when enabled changes from false to true', async () => {
      const { result, rerender } = renderHook(
        (props: UseDeparturesTestProps) => useDepartures(props),
        { initialProps: { ...defaultProps, enabled: false } }
      );

      expect(transportApi.getDepartures).not.toHaveBeenCalled();

      rerender({ ...defaultProps, enabled: true });

      await waitFor(() => {
        expect(result.current.departures).not.toBeNull();
      });

      expect(transportApi.getDepartures).toHaveBeenCalledTimes(1);
    });

    it('should refetch when language changes', async () => {
      const { result, rerender } = renderHook(
        (props: UseDeparturesTestProps) => useDepartures(props),
        { initialProps: defaultProps }
      );

      await waitFor(() => {
        expect(result.current.departures).not.toBeNull();
      });

      rerender({ ...defaultProps, language: 'en' });

      await waitFor(() => {
        expect(transportApi.getDepartures).toHaveBeenCalledTimes(2);
      });

      expect(transportApi.getDepartures).toHaveBeenLastCalledWith(
        'sea',
        '602',
        '2026-02-15',
        0,
        'en'
      );
    });
  });
});
