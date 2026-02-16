/**
 * useHomeData Hook Tests
 *
 * Tests for home screen data fetching (banners and events).
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useHomeData } from '../useHomeData';

// Mock the API
jest.mock('../../services/api', () => ({
  inboxApi: {
    getActiveBanners: jest.fn(),
  },
  eventsApi: {
    getEvents: jest.fn(),
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

import { inboxApi, eventsApi } from '../../services/api';

const mockBanners = [
  { id: 'b1', title_hr: 'Home Banner', is_urgent: false },
  { id: 'b2', title_hr: 'Important Notice', is_urgent: true },
];

// Create events with dates in the future (relative to test)
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

const mockEvents = [
  {
    id: 'event-1',
    title: 'Festival',
    start_datetime: tomorrow.toISOString(),
    location: 'Vis',
  },
  {
    id: 'event-2',
    title: 'Concert',
    start_datetime: nextWeek.toISOString(),
    location: 'Komiža',
  },
  {
    id: 'event-past',
    title: 'Past Event',
    start_datetime: lastWeek.toISOString(),
    location: 'Vis',
  },
];

describe('useHomeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (inboxApi.getActiveBanners as jest.Mock).mockResolvedValue({
      banners: mockBanners,
    });
    (eventsApi.getEvents as jest.Mock).mockResolvedValue({
      events: mockEvents,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should fetch banners on mount', async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(2);
      });

      expect(inboxApi.getActiveBanners).toHaveBeenCalledWith(
        mockUserContext,
        'home'
      );
    });

    it('should fetch events on mount', async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(eventsApi.getEvents).toHaveBeenCalled();
      });

      expect(eventsApi.getEvents).toHaveBeenCalledWith(
        1,
        20,
        undefined,
        'hr'
      );
    });

    it('should set banners after fetch', async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(2);
      });

      expect(result.current.banners[0].id).toBe('b1');
      expect(result.current.banners[1].id).toBe('b2');
    });
  });

  describe('events filtering', () => {
    it('should filter out past events', async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.upcomingEvents.length).toBeGreaterThan(0);
      });

      // Should only have future events, not the past event
      const eventIds = result.current.upcomingEvents.map(e => e.id);
      expect(eventIds).not.toContain('event-past');
    });

    it('should include upcoming events', async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.upcomingEvents.length).toBeGreaterThan(0);
      });

      const eventIds = result.current.upcomingEvents.map(e => e.id);
      expect(eventIds).toContain('event-1');
      expect(eventIds).toContain('event-2');
    });

    it('should limit to 3 upcoming events', async () => {
      // Mock more than 3 future events
      const manyEvents = [
        { id: 'e1', title: 'E1', start_datetime: tomorrow.toISOString(), location: 'A' },
        { id: 'e2', title: 'E2', start_datetime: tomorrow.toISOString(), location: 'B' },
        { id: 'e3', title: 'E3', start_datetime: tomorrow.toISOString(), location: 'C' },
        { id: 'e4', title: 'E4', start_datetime: tomorrow.toISOString(), location: 'D' },
        { id: 'e5', title: 'E5', start_datetime: tomorrow.toISOString(), location: 'E' },
      ];
      (eventsApi.getEvents as jest.Mock).mockResolvedValue({ events: manyEvents });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.upcomingEvents).toHaveLength(3);
      });
    });
  });

  describe('error handling', () => {
    it('should silently fail when banners fetch fails', async () => {
      (inboxApi.getActiveBanners as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Banners should be empty, not throw
      expect(result.current.banners).toHaveLength(0);
    });

    it('should silently fail when events fetch fails', async () => {
      (eventsApi.getEvents as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(console.error).toHaveBeenCalled();
      });

      // Events should be empty, not throw
      expect(result.current.upcomingEvents).toHaveLength(0);
    });
  });

  describe('refresh', () => {
    it('should refetch data when refresh is called', async () => {
      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(2);
      });

      // Clear mock counts after initial load
      jest.clearAllMocks();

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(inboxApi.getActiveBanners).toHaveBeenCalledTimes(1);
      });

      expect(eventsApi.getEvents).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty states', () => {
    it('should handle empty banners response', async () => {
      (inboxApi.getActiveBanners as jest.Mock).mockResolvedValue({
        banners: [],
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(0);
      });
    });

    it('should handle empty events response', async () => {
      (eventsApi.getEvents as jest.Mock).mockResolvedValue({
        events: [],
      });

      const { result } = renderHook(() => useHomeData());

      await waitFor(() => {
        expect(result.current.upcomingEvents).toHaveLength(0);
      });
    });
  });
});
