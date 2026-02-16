/**
 * useEventDetail Hook Tests
 *
 * Tests for event detail fetching and subscription management.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useEventDetail } from '../useEventDetail';

// Mock the API
jest.mock('../../services/api', () => ({
  eventsApi: {
    getEvent: jest.fn(),
    getSubscriptionStatus: jest.fn(),
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
  },
}));

// Mock useTranslations
const mockT = (key: string) => key;
jest.mock('../../i18n', () => ({
  useTranslations: () => ({
    t: mockT,
    language: 'hr',
  }),
}));


import { eventsApi } from '../../services/api';

const mockEvent = {
  id: 'event-1',
  title: 'Festival Mediteranskog Filma',
  description: 'Filmski festival',
  start_datetime: '2026-03-15T19:00:00Z',
  end_datetime: '2026-03-15T23:00:00Z',
  location: 'Kino Vis',
  organizer: 'Turistička zajednica',
  is_all_day: false,
  image_url: 'https://example.com/image.jpg',
};

describe('useEventDetail', () => {
  const eventId = 'event-1';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (eventsApi.getEvent as jest.Mock).mockResolvedValue(mockEvent);
    (eventsApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
      subscribed: false,
    });
    (eventsApi.subscribe as jest.Mock).mockResolvedValue({ success: true });
    (eventsApi.unsubscribe as jest.Mock).mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should fetch event details on mount', async () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(eventsApi.getEvent).toHaveBeenCalledWith('event-1', 'hr');
    });

    it('should fetch subscription status on mount', async () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(eventsApi.getSubscriptionStatus).toHaveBeenCalledWith('event-1');
    });

    it('should set event data after fetch', async () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.event).not.toBeNull();
      });

      expect(result.current.event?.title).toBe('Festival Mediteranskog Filma');
      expect(result.current.event?.location).toBe('Kino Vis');
    });

    it('should set subscribed status after fetch', async () => {
      (eventsApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
        subscribed: true,
      });

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.subscribed).toBe(true);
      });
    });
  });

  describe('loading state', () => {
    it('should start with loading true', () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false after fetch completes', async () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('should set error when event fetch fails', async () => {
      (eventsApi.getEvent as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.error).toBe('eventDetail.error');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.event).toBeNull();
    });

    it('should silently fail when subscription status fetch fails', async () => {
      (eventsApi.getSubscriptionStatus as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.event).not.toBeNull();
      });

      // Should still show event, subscribed defaults to false
      expect(result.current.subscribed).toBe(false);
    });
  });

  describe('toggleReminder - subscribe', () => {
    it('should call subscribe API when toggling on', async () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleReminder(true);
      });

      expect(eventsApi.subscribe).toHaveBeenCalledWith('event-1');
    });

    it('should set subscribed to true after successful subscribe', async () => {
      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subscribed).toBe(false);

      await act(async () => {
        await result.current.toggleReminder(true);
      });

      expect(result.current.subscribed).toBe(true);
    });

    it('should set subscribing to true during subscribe', async () => {
      let resolveSubscribe: () => void;
      const subscribePromise = new Promise<{ success: boolean }>((resolve) => {
        resolveSubscribe = () => resolve({ success: true });
      });
      (eventsApi.subscribe as jest.Mock).mockReturnValue(subscribePromise);

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.toggleReminder(true);
      });

      expect(result.current.subscribing).toBe(true);

      await act(async () => {
        resolveSubscribe!();
        await subscribePromise;
      });

      expect(result.current.subscribing).toBe(false);
    });
  });

  describe('toggleReminder - unsubscribe', () => {
    it('should call unsubscribe API when toggling off', async () => {
      (eventsApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
        subscribed: true,
      });

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.subscribed).toBe(true);
      });

      await act(async () => {
        await result.current.toggleReminder(false);
      });

      expect(eventsApi.unsubscribe).toHaveBeenCalledWith('event-1');
    });

    it('should set subscribed to false after successful unsubscribe', async () => {
      (eventsApi.getSubscriptionStatus as jest.Mock).mockResolvedValue({
        subscribed: true,
      });

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.subscribed).toBe(true);
      });

      await act(async () => {
        await result.current.toggleReminder(false);
      });

      expect(result.current.subscribed).toBe(false);
    });
  });

  describe('toggleReminder - error handling', () => {
    it('should log error on subscribe error', async () => {
      (eventsApi.subscribe as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleReminder(true);
      });

      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });

    it('should not change subscribed state on error', async () => {
      (eventsApi.subscribe as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subscribed).toBe(false);

      await act(async () => {
        await result.current.toggleReminder(true);
      });

      // Should remain false due to error
      expect(result.current.subscribed).toBe(false);
    });

    it('should set subscribing to false after error', async () => {
      (eventsApi.subscribe as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useEventDetail({ eventId }));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.toggleReminder(true);
      });

      expect(result.current.subscribing).toBe(false);
    });
  });
});
