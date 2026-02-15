/**
 * useLineDetail Hook Tests
 *
 * Tests for line detail and banners fetching.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLineDetail } from '../useLineDetail';

// Mock the API
jest.mock('../../services/api', () => ({
  transportApi: {
    getLine: jest.fn(),
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

// Mock Platform
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { transportApi, inboxApi } from '../../services/api';

const mockLineDetail = {
  id: 1,
  line_number: 602,
  name_hr: 'Trajekt Vis-Split',
  name_en: 'Ferry Vis-Split',
  transport_type: 'sea',
  routes: [
    { direction: 0, origin_name_hr: 'Vis', destination_name_hr: 'Split' },
    { direction: 1, origin_name_hr: 'Split', destination_name_hr: 'Vis' },
  ],
  contacts: [
    { name: 'Jadrolinija', phone: '+385123456' },
  ],
};

const mockBanners = [
  {
    id: 'b1',
    title_hr: 'Transport Banner',
    is_urgent: false,
  },
];

interface UseLineDetailTestProps {
  lineId: string;
  transportType: 'road' | 'sea';
  language: 'hr' | 'en';
}

describe('useLineDetail', () => {
  const defaultProps: UseLineDetailTestProps = {
    lineId: '602',
    transportType: 'sea',
    language: 'hr',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (transportApi.getLine as jest.Mock).mockResolvedValue(mockLineDetail);
    (inboxApi.getActiveBanners as jest.Mock).mockResolvedValue({
      banners: mockBanners,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should start with loading state', () => {
      const { result } = renderHook(() => useLineDetail(defaultProps));

      expect(result.current.loading).toBe(true);
      expect(result.current.lineDetailData).toBeNull();
    });

    it('should fetch line detail and banners on mount', async () => {
      const { result } = renderHook(() => useLineDetail(defaultProps));

      await waitFor(() => {
        expect(result.current.lineDetailData).not.toBeNull();
      });

      expect(transportApi.getLine).toHaveBeenCalledWith(
        'sea',
        '602',
        'hr'
      );
      expect(inboxApi.getActiveBanners).toHaveBeenCalled();
    });

    it('should set line detail data after fetch', async () => {
      const { result } = renderHook(() => useLineDetail(defaultProps));

      await waitFor(() => {
        expect(result.current.lineDetailData).not.toBeNull();
      });

      expect(result.current.lineDetailData?.line_number).toBe(602);
      expect(result.current.lineDetailData?.routes).toHaveLength(2);
      expect(result.current.error).toBe(false);
    });

    it('should set banners after fetch', async () => {
      const { result } = renderHook(() => useLineDetail(defaultProps));

      await waitFor(() => {
        expect(result.current.banners).toHaveLength(1);
      });

      expect(result.current.banners[0].id).toBe('b1');
    });
  });

  describe('error handling', () => {
    it('should set error state on API failure', async () => {
      (transportApi.getLine as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useLineDetail(defaultProps));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(true);
      expect(result.current.lineDetailData).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should refresh data', async () => {
      const { result } = renderHook(() => useLineDetail(defaultProps));

      await waitFor(() => {
        expect(result.current.lineDetailData).not.toBeNull();
      });

      expect(transportApi.getLine).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(transportApi.getLine).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('props changes', () => {
    it('should refetch when lineId changes', async () => {
      const { result, rerender } = renderHook(
        (props: UseLineDetailTestProps) => useLineDetail(props),
        { initialProps: defaultProps }
      );

      await waitFor(() => {
        expect(result.current.lineDetailData).not.toBeNull();
      });

      expect(transportApi.getLine).toHaveBeenCalledTimes(1);

      rerender({ ...defaultProps, lineId: '603' });

      await waitFor(() => {
        expect(transportApi.getLine).toHaveBeenCalledTimes(2);
      });

      expect(transportApi.getLine).toHaveBeenLastCalledWith(
        'sea',
        '603',
        'hr'
      );
    });

    it('should refetch when language changes', async () => {
      const { result, rerender } = renderHook(
        (props: UseLineDetailTestProps) => useLineDetail(props),
        { initialProps: defaultProps }
      );

      await waitFor(() => {
        expect(result.current.lineDetailData).not.toBeNull();
      });

      rerender({ ...defaultProps, language: 'en' });

      await waitFor(() => {
        expect(transportApi.getLine).toHaveBeenCalledTimes(2);
      });

      expect(transportApi.getLine).toHaveBeenLastCalledWith(
        'sea',
        '602',
        'en'
      );
    });
  });
});
