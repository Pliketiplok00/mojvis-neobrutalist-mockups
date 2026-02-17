/**
 * SentListItem Component Tests
 *
 * Tests for sent item (feedback/click-fix) list rendering.
 * Note: Status badges were removed in the UI redesign.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SentListItem } from '../SentListItem';
import type { CombinedSentItem } from '../../../../hooks/useSentItems';

// Mock formatDateShort
jest.mock('../../../../utils/dateFormat', () => ({
  formatDateShort: () => '15/02/2026',
}));

describe('SentListItem', () => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'inbox.photoCount': 'fotografija',
    };
    return translations[key] || key;
  };

  const mockFeedbackItem: CombinedSentItem = {
    id: 'fb-1',
    type: 'feedback',
    subject: 'Feedback Subject',
    status: 'pending',
    status_label: 'Na čekanju',
    created_at: '2026-02-15T10:00:00Z',
  };

  const mockClickFixItem: CombinedSentItem = {
    id: 'cf-1',
    type: 'click_fix',
    subject: 'Road Problem Report',
    status: 'in_progress',
    status_label: 'U tijeku',
    photo_count: 3,
    created_at: '2026-02-15T12:00:00Z',
  };

  const defaultProps = {
    item: mockFeedbackItem,
    onPress: jest.fn(),
    t: mockT,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render item subject', () => {
      const { getByText } = render(<SentListItem {...defaultProps} />);

      expect(getByText('Feedback Subject')).toBeTruthy();
    });

    it('should render formatted date', () => {
      const { getByText } = render(<SentListItem {...defaultProps} />);

      expect(getByText('15/02/2026')).toBeTruthy();
    });

    it('should render chevron-right icon', () => {
      const { getByTestId } = render(<SentListItem {...defaultProps} />);

      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });
  });

  describe('feedback items', () => {
    it('should render send icon for feedback', () => {
      const { getByTestId } = render(<SentListItem {...defaultProps} />);

      expect(getByTestId('icon-send')).toBeTruthy();
    });

    it('should not render photo count for feedback', () => {
      const { queryByText } = render(<SentListItem {...defaultProps} />);

      expect(queryByText(/fotografija/)).toBeNull();
    });
  });

  describe('click-fix items', () => {
    it('should render camera icon for click-fix', () => {
      const { getByTestId } = render(
        <SentListItem {...defaultProps} item={mockClickFixItem} />
      );

      expect(getByTestId('icon-camera')).toBeTruthy();
    });

    it('should render photo count for click-fix with photos', () => {
      const { getByText } = render(
        <SentListItem {...defaultProps} item={mockClickFixItem} />
      );

      expect(getByText('3 fotografija')).toBeTruthy();
    });

    it('should not render photo count when photo_count is 0', () => {
      const itemWithNoPhotos = { ...mockClickFixItem, photo_count: 0 };
      const { queryByText } = render(
        <SentListItem {...defaultProps} item={itemWithNoPhotos} />
      );

      expect(queryByText(/fotografija/)).toBeNull();
    });

    it('should not render photo count when photo_count is undefined', () => {
      const itemWithNoPhotoCount = { ...mockClickFixItem, photo_count: undefined };
      const { queryByText } = render(
        <SentListItem {...defaultProps} item={itemWithNoPhotoCount} />
      );

      expect(queryByText(/fotografija/)).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onPress when item is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <SentListItem {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('Feedback Subject'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('translation', () => {
    it('should use t function for photo count', () => {
      const customT = jest.fn((key: string) => `translated_${key}`);
      render(<SentListItem {...defaultProps} item={mockClickFixItem} t={customT} />);

      expect(customT).toHaveBeenCalledWith('inbox.photoCount');
    });
  });
});
