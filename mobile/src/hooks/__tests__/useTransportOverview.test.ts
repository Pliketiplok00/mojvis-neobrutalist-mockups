/**
 * useTransportOverview Hook Tests
 *
 * Tests for shared transport overview data fetching.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useTransportOverview } from '../useTransportOverview';

// Mock the API
jest.mock('../../services/api', () => ({
  inboxApi: {
    getActiveBanners: jest.fn(),
  },
  transportApi: {
    getLines: jest.fn(),
    getTodaysDepartures: jest.fn(),
  },
}));

// Mock useUserContext
const mockUserContext = {
  deviceId: 'test-device',
  language: 'hr',
  municipality: 'vis',
};
jest.mock('../useUserContext', () => ({
  useUserContext: () => mockUserContext,
}));

import { inboxApi, transportApi } from '../../services/api';

const mockBanners = [
  { id: 'b1', title_hr: 'Transport Alert', is_urgent: true },
];

const mockLines = [
  {
    id: 'line-1',
    line_number: '612',
    origin: 'Split',
    destination: 'Vis',
    stops_count: 3,
    stops_summary: 'Split - Vis',
    typical_duration_minutes: 150,
  },
];

const mockTodaysDepartures = [
  {
    line_id: 'line-1',
    departure_time: '08:30:00',
    direction_label: 'Vis → Split',
  },
  {
    line_id: 'line-1',
    departure_time: '16:00:00',
    direction_label: 'Split → Vis',
  },
];

describe('useTransportOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (inboxApi.getActiveBanners as jest.Mock).mockResolvedValue({
      banners: mockBanners,
    });
    (transportApi.getLines as jest.Mock).mockResolvedValue({
      lines: mockLines,
    });
    (transportApi.getTodaysDepartures as jest.Mock).mockResolvedValue({
      departures: mockTodaysDepartures,
      day_type: 'MON',
      is_holiday: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should fetch banners, lines, and departures on mount for sea transport', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(inboxApi.getActiveBanners).toHaveBeenCalledWith(
        mockUserContext,
        'transport'
      );
      expect(transportApi.getLines).toHaveBeenCalledWith('sea', 'hr');
      expect(transportApi.getTodaysDepartures).toHaveBeenCalledWith(
        'sea',
        undefined,
        'hr'
      );
    });

    it('should fetch for road transport type', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'road' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(transportApi.getLines).toHaveBeenCalledWith('road', 'hr');
      expect(transportApi.getTodaysDepartures).toHaveBeenCalledWith(
        'road',
        undefined,
        'hr'
      );
    });

    it('should set banners after fetch', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(1);
      });

      expect(result.current.banners[0].id).toBe('b1');
    });

    it('should set lines after fetch', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.lines).toHaveLength(1);
      });

      expect(result.current.lines[0].id).toBe('line-1');
      expect(result.current.lines[0].line_number).toBe('612');
    });

    it('should set todaysDepartures after fetch', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.todaysDepartures).toHaveLength(2);
      });

      expect(result.current.todaysDepartures[0].departure_time).toBe('08:30:00');
    });

    it('should set dayType and isHoliday after fetch', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.dayType).toBe('MON');
      });

      expect(result.current.isHoliday).toBe(false);
    });
  });

  describe('loading state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after fetch completes', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should set error when API call fails', async () => {
      (transportApi.getLines as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.error).toBe('transport.error');
      });

      expect(result.current.loading).toBe(false);
    });

    it('should log error to console', async () => {
      (transportApi.getLines as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      renderHook(() => useTransportOverview({ transportType: 'sea' }));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('handleRefresh', () => {
    it('should set refreshing to true when called', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleRefresh();
      });

      expect(result.current.refreshing).toBe(true);
    });

    it('should refetch data when handleRefresh is called', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear mock counts after initial load
      jest.clearAllMocks();

      act(() => {
        result.current.handleRefresh();
      });

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });

      expect(transportApi.getLines).toHaveBeenCalledTimes(1);
      expect(transportApi.getTodaysDepartures).toHaveBeenCalledTimes(1);
    });

    it('should set refreshing to false after refresh completes', async () => {
      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.handleRefresh();
      });

      await waitFor(() => {
        expect(result.current.refreshing).toBe(false);
      });
    });
  });

  describe('holiday handling', () => {
    it('should set isHoliday true when API returns is_holiday', async () => {
      (transportApi.getTodaysDepartures as jest.Mock).mockResolvedValue({
        departures: mockTodaysDepartures,
        day_type: 'SUN',
        is_holiday: true,
      });

      const { result } = renderHook(() =>
        useTransportOverview({ transportType: 'sea' })
      );

      await waitFor(() => {
        expect(result.current.isHoliday).toBe(true);
      });

      expect(result.current.dayType).toBe('SUN');
    });
  });
});
