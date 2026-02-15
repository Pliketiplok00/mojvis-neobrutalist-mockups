/**
 * useSentItems Hook Tests
 *
 * Tests for sent items (feedback + click-fix) fetching.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSentItems } from '../useSentItems';

// Mock the API
jest.mock('../../services/api', () => ({
  feedbackApi: {
    getSentItems: jest.fn(),
  },
  clickFixApi: {
    getSentItems: jest.fn(),
  },
}));

// Mock useUserContext - return stable object
const mockUserContext = {
  deviceId: 'test-device',
  language: 'hr',
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

import { feedbackApi, clickFixApi } from '../../services/api';

const mockFeedbackItems = [
  {
    id: 'fb-1',
    subject: 'Feedback 1',
    status: 'pending',
    status_label: 'Na čekanju',
    created_at: '2026-02-15T10:00:00Z',
  },
  {
    id: 'fb-2',
    subject: 'Feedback 2',
    status: 'resolved',
    status_label: 'Riješeno',
    created_at: '2026-02-14T10:00:00Z',
  },
];

const mockClickFixItems = [
  {
    id: 'cf-1',
    subject: 'Click Fix 1',
    status: 'in_progress',
    status_label: 'U tijeku',
    photo_count: 2,
    created_at: '2026-02-15T12:00:00Z', // Most recent
  },
];

describe('useSentItems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (feedbackApi.getSentItems as jest.Mock).mockResolvedValue({
      items: mockFeedbackItems,
    });
    (clickFixApi.getSentItems as jest.Mock).mockResolvedValue({
      items: mockClickFixItems,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetching', () => {
    it('should not fetch when disabled', () => {
      const { result } = renderHook(() => useSentItems({ enabled: false }));

      // Initial state with disabled - no fetch happens
      expect(result.current.loading).toBe(false);
      expect(feedbackApi.getSentItems).not.toHaveBeenCalled();
      expect(clickFixApi.getSentItems).not.toHaveBeenCalled();
      expect(result.current.sentItems).toHaveLength(0);
    });

    it('should fetch both feedback and click-fix items on mount', async () => {
      const { result } = renderHook(() => useSentItems());

      await waitFor(() => {
        expect(result.current.sentItems).toHaveLength(3);
      });

      expect(feedbackApi.getSentItems).toHaveBeenCalledTimes(1);
      expect(clickFixApi.getSentItems).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeNull();
    });

    it('should combine and sort items by date (newest first)', async () => {
      const { result } = renderHook(() => useSentItems());

      await waitFor(() => {
        expect(result.current.sentItems).toHaveLength(3);
      });

      // Click-fix item from 12:00 should be first
      expect(result.current.sentItems[0].id).toBe('cf-1');
      expect(result.current.sentItems[0].type).toBe('click_fix');

      // Feedback from 10:00 should be second
      expect(result.current.sentItems[1].id).toBe('fb-1');
      expect(result.current.sentItems[1].type).toBe('feedback');

      // Feedback from 2026-02-14 should be last
      expect(result.current.sentItems[2].id).toBe('fb-2');
    });

    it('should include photo_count for click-fix items', async () => {
      const { result } = renderHook(() => useSentItems());

      await waitFor(() => {
        expect(result.current.sentItems).toHaveLength(3);
      });

      const clickFixItem = result.current.sentItems.find(
        (item) => item.type === 'click_fix'
      );
      expect(clickFixItem?.photo_count).toBe(2);
    });

    it('should handle API error', async () => {
      (feedbackApi.getSentItems as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useSentItems());

      await waitFor(() => {
        expect(result.current.error).toBe('inbox.error.loadingSent');
      });

      expect(result.current.sentItems).toHaveLength(0);
    });
  });

  describe('refresh', () => {
    it('should refresh items', async () => {
      const { result } = renderHook(() => useSentItems());

      await waitFor(() => {
        expect(result.current.sentItems).toHaveLength(3);
      });

      expect(feedbackApi.getSentItems).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(feedbackApi.getSentItems).toHaveBeenCalledTimes(2);
      });

      expect(clickFixApi.getSentItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('enabled option', () => {
    it('should fetch when enabled changes from false to true', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) => useSentItems({ enabled }),
        { initialProps: { enabled: false } }
      );

      expect(feedbackApi.getSentItems).not.toHaveBeenCalled();

      rerender({ enabled: true });

      await waitFor(() => {
        expect(result.current.sentItems).toHaveLength(3);
      });

      expect(feedbackApi.getSentItems).toHaveBeenCalledTimes(1);
    });
  });
});
