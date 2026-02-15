/**
 * useEvents Hook Tests
 *
 * Tests for events, event dates, and banners fetching.
 */

// Unmock dateFormat since useEvents uses formatDateISO
jest.unmock('../../utils/dateFormat');

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useEvents } from '../useEvents';

// Mock the API
jest.mock('../../services/api', () => ({
  eventsApi: {
    getEvents: jest.fn(),
    getEventDates: jest.fn(),
  },
  inboxApi: {
    getActiveBanners: jest.fn(),
  },
}));

// Mock useUserContext - return stable object
const mockUserContext = {
  deviceId: 'test-device',
  language: 'hr',
  municipality: 'vis',
};
jest.mock('../useUserContext', () => ({
  useUserContext: () => mockUserContext,
}));

// Mock useTranslations - return stable functions
const mockT = (key: string) => key;
jest.mock('../../i18n', () => ({
  useTranslations: () => ({
    t: mockT,
    language: 'hr',
  }),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { eventsApi, inboxApi } from '../../services/api';

const mockEvents = [
  {
    id: '1',
    title: 'Event 1',
    start_datetime: '2026-02-15T10:00:00Z',
    is_all_day: false,
    location: 'Vis',
  },
  {
    id: '2',
    title: 'Event 2',
    start_datetime: '2026-02-15T14:00:00Z',
    is_all_day: true,
    location: 'Komiža',
  },
];

const mockEventDates = ['2026-02-15', '2026-02-20', '2026-02-25'];

const mockBanners = [
  {
    id: 'b1',
    title_hr: 'Banner 1',
    is_urgent: true,
  },
];

describe('useEvents', () => {
  const selectedDate = new Date(2026, 1, 15); // Feb 15, 2026

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (eventsApi.getEvents as jest.Mock).mockResolvedValue({
      events: mockEvents,
    });
    (eventsApi.getEventDates as jest.Mock).mockResolvedValue({
      dates: mockEventDates,
    });
    (inboxApi.getActiveBanners as jest.Mock).mockResolvedValue({
      banners: mockBanners,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should fetch events, event dates, and banners on mount', async () => {
      const { result } = renderHook(() => useEvents({ selectedDate }));

      // Wait for events to be populated (indicates loading completed)
      await waitFor(() => {
        expect(result.current.events).toHaveLength(2);
      });

      expect(eventsApi.getEvents).toHaveBeenCalled();
      expect(eventsApi.getEventDates).toHaveBeenCalled();
      expect(inboxApi.getActiveBanners).toHaveBeenCalled();
    });

    it('should set events after fetch', async () => {
      const { result } = renderHook(() => useEvents({ selectedDate }));

      await waitFor(() => {
        expect(result.current.events).toHaveLength(2);
      });

      expect(result.current.events[0].id).toBe('1');
      expect(result.current.error).toBeNull();
    });

    it('should set event dates as Set', async () => {
      const { result } = renderHook(() => useEvents({ selectedDate }));

      await waitFor(() => {
        expect(result.current.eventDates.size).toBe(3);
      });

      expect(result.current.eventDates.has('2026-02-15')).toBe(true);
      expect(result.current.eventDates.has('2026-02-20')).toBe(true);
      expect(result.current.eventDates.has('2026-02-25')).toBe(true);
    });

    it('should set banners after fetch', async () => {
      const { result } = renderHook(() => useEvents({ selectedDate }));

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(1);
      });

      expect(result.current.banners[0].id).toBe('b1');
    });
  });

  describe('fetchEventsForDate', () => {
    it('should fetch events for a new date', async () => {
      const { result } = renderHook(() => useEvents({ selectedDate }));

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.events).toHaveLength(2);
      });

      const newDate = new Date(2026, 1, 20);

      act(() => {
        result.current.fetchEventsForDate(newDate);
      });

      // Wait for fetch to complete
      await waitFor(() => {
        expect(eventsApi.getEvents).toHaveBeenCalledWith(
          1,
          50,
          '2026-02-20',
          'hr'
        );
      });
    });

    it('should handle error when fetching events', async () => {
      (eventsApi.getEvents as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEvents({ selectedDate }));

      // Wait for error to be set
      await waitFor(() => {
        expect(result.current.error).toBe('events.error');
      });

      expect(result.current.events).toHaveLength(0);
    });
  });

  describe('fetchEventDatesForMonth', () => {
    it('should fetch event dates for a new month', async () => {
      const { result } = renderHook(() => useEvents({ selectedDate }));

      await waitFor(() => {
        expect(result.current.eventDates.size).toBe(3);
      });

      // Fetch for March 2026
      act(() => {
        result.current.fetchEventDatesForMonth(2026, 3);
      });

      await waitFor(() => {
        expect(eventsApi.getEventDates).toHaveBeenCalledWith(2026, 3);
      });
    });

    it('should handle error when fetching event dates silently', async () => {
      (eventsApi.getEventDates as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEvents({ selectedDate }));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Should not set error state for eventDates failure
      // (error state is only for main events fetch)
      expect(result.current.eventDates.size).toBe(0);
    });
  });

  describe('banners', () => {
    it('should handle banner fetch error silently', async () => {
      (inboxApi.getActiveBanners as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEvents({ selectedDate }));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      expect(result.current.banners).toHaveLength(0);
    });
  });
});
