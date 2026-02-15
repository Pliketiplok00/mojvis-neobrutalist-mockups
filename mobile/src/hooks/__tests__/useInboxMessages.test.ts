/**
 * useInboxMessages Hook Tests
 *
 * Tests for inbox messages fetching and filtering.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useInboxMessages } from '../useInboxMessages';

// Mock the API
jest.mock('../../services/api', () => ({
  inboxApi: {
    getMessages: jest.fn(),
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

// Mock useUnread context - return stable function
const mockRegisterMessages = jest.fn();
jest.mock('../../contexts/UnreadContext', () => ({
  useUnread: () => ({
    registerMessages: mockRegisterMessages,
  }),
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

import { inboxApi } from '../../services/api';

const mockMessages = [
  {
    id: '1',
    title_hr: 'Poruka 1',
    title_en: 'Message 1',
    tags: ['promet'],
    is_urgent: false,
  },
  {
    id: '2',
    title_hr: 'Poruka 2',
    title_en: 'Message 2',
    tags: ['kultura'],
    is_urgent: false,
  },
  {
    id: '3',
    title_hr: 'Hitna poruka',
    title_en: 'Urgent message',
    tags: ['opcenito'],
    is_urgent: true,
  },
];

describe('useInboxMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (inboxApi.getMessages as jest.Mock).mockResolvedValue({
      messages: mockMessages,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetching', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useInboxMessages());

      expect(result.current.loading).toBe(true);
      expect(result.current.messages).toHaveLength(0);
    });

    it('should fetch messages on mount', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      expect(result.current.error).toBeNull();
      expect(inboxApi.getMessages).toHaveBeenCalledTimes(1);
    });

    it('should handle API error', async () => {
      (inboxApi.getMessages as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.error).toBe('inbox.error.loading');
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should refresh messages', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      expect(inboxApi.getMessages).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(inboxApi.getMessages).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('tag filtering', () => {
    it('should return all messages when no tags selected', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      expect(result.current.selectedTags).toHaveLength(0);
      expect(result.current.filteredMessages).toHaveLength(3);
    });

    it('should filter messages by single tag', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      act(() => {
        result.current.toggleTag('promet');
      });

      expect(result.current.selectedTags).toContain('promet');
      expect(result.current.filteredMessages).toHaveLength(1);
      expect(result.current.filteredMessages[0].id).toBe('1');
    });

    it('should filter messages by multiple tags (OR logic)', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      act(() => {
        result.current.toggleTag('promet');
        result.current.toggleTag('kultura');
      });

      expect(result.current.selectedTags).toHaveLength(2);
      expect(result.current.filteredMessages).toHaveLength(2);
    });

    it('should toggle tag off when clicked again', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      act(() => {
        result.current.toggleTag('promet');
      });
      expect(result.current.selectedTags).toContain('promet');

      act(() => {
        result.current.toggleTag('promet');
      });
      expect(result.current.selectedTags).not.toContain('promet');
    });

    it('should clear all tags', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      act(() => {
        result.current.toggleTag('promet');
        result.current.toggleTag('kultura');
      });
      expect(result.current.selectedTags).toHaveLength(2);

      act(() => {
        result.current.clearTags();
      });
      expect(result.current.selectedTags).toHaveLength(0);
      expect(result.current.filteredMessages).toHaveLength(3);
    });

    it('should filter urgent messages with hitno tag', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      act(() => {
        result.current.toggleTag('hitno');
      });

      expect(result.current.filteredMessages).toHaveLength(1);
      expect(result.current.filteredMessages[0].is_urgent).toBe(true);
    });
  });

  describe('availableTags', () => {
    it('should include vis tag for vis municipality', async () => {
      const { result } = renderHook(() => useInboxMessages());

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });

      expect(result.current.availableTags).toContain('promet');
      expect(result.current.availableTags).toContain('kultura');
      expect(result.current.availableTags).toContain('opcenito');
      expect(result.current.availableTags).toContain('hitno');
      expect(result.current.availableTags).toContain('vis');
    });
  });
});
