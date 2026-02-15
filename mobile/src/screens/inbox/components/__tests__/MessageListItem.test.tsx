/**
 * MessageListItem Component Tests
 *
 * Tests for inbox message list item rendering.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MessageListItem } from '../MessageListItem';
import type { InboxMessage } from '../../../../types/inbox';

// Mock formatDateShort
jest.mock('../../../../utils/dateFormat', () => ({
  formatDateShort: () => '15/02/2026',
}));

describe('MessageListItem', () => {
  const mockMessage: InboxMessage = {
    id: 'msg-1',
    title: 'Test Message Title',
    body: 'This is the message body preview text that should be displayed in the list item.',
    tags: ['promet'],
    active_from: null,
    active_to: null,
    created_at: '2026-02-15T10:00:00Z',
    is_urgent: false,
  };

  const defaultProps = {
    message: mockMessage,
    isUnread: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render message title', () => {
      const { getByText } = render(<MessageListItem {...defaultProps} />);

      expect(getByText('Test Message Title')).toBeTruthy();
    });

    it('should render message body preview', () => {
      const { getByText } = render(<MessageListItem {...defaultProps} />);

      expect(getByText(/This is the message body preview/)).toBeTruthy();
    });

    it('should render formatted date', () => {
      const { getByText } = render(<MessageListItem {...defaultProps} />);

      expect(getByText('15/02/2026')).toBeTruthy();
    });

    it('should render chevron-right icon', () => {
      const { getByTestId } = render(<MessageListItem {...defaultProps} />);

      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });
  });

  describe('tag icons', () => {
    it('should render traffic-cone icon for promet tag', () => {
      const { getByTestId } = render(<MessageListItem {...defaultProps} />);

      expect(getByTestId('icon-traffic-cone')).toBeTruthy();
    });

    it('should render shield-alert icon for urgent messages', () => {
      const urgentMessage = { ...mockMessage, is_urgent: true };
      const { getByTestId } = render(
        <MessageListItem {...defaultProps} message={urgentMessage} />
      );

      expect(getByTestId('icon-shield-alert')).toBeTruthy();
    });

    it('should render calendar-heart icon for kultura tag', () => {
      const cultureMessage = { ...mockMessage, tags: ['kultura'] as const };
      const { getByTestId } = render(
        <MessageListItem {...defaultProps} message={cultureMessage} />
      );

      expect(getByTestId('icon-calendar-heart')).toBeTruthy();
    });

    it('should render newspaper icon for opcenito tag', () => {
      const generalMessage = { ...mockMessage, tags: ['opcenito'] as const };
      const { getByTestId } = render(
        <MessageListItem {...defaultProps} message={generalMessage} />
      );

      expect(getByTestId('icon-newspaper')).toBeTruthy();
    });

    it('should render megaphone icon for vis tag', () => {
      const visMessage = { ...mockMessage, tags: ['vis'] as const };
      const { getByTestId } = render(
        <MessageListItem {...defaultProps} message={visMessage} />
      );

      expect(getByTestId('icon-megaphone')).toBeTruthy();
    });

    it('should render mail icon when no tags', () => {
      const noTagsMessage = { ...mockMessage, tags: [] };
      const { getByTestId } = render(
        <MessageListItem {...defaultProps} message={noTagsMessage} />
      );

      expect(getByTestId('icon-mail')).toBeTruthy();
    });

    it('should render multiple icons for multiple tags', () => {
      const multiTagMessage = { ...mockMessage, tags: ['promet', 'kultura'] as const };
      const { getByTestId } = render(
        <MessageListItem {...defaultProps} message={multiTagMessage} />
      );

      expect(getByTestId('icon-traffic-cone')).toBeTruthy();
      expect(getByTestId('icon-calendar-heart')).toBeTruthy();
    });
  });

  describe('unread state', () => {
    it('should show NEW badge when unread', () => {
      const { getByText } = render(
        <MessageListItem {...defaultProps} isUnread={true} />
      );

      expect(getByText('NEW')).toBeTruthy();
    });

    it('should not show NEW badge when read', () => {
      const { queryByText } = render(
        <MessageListItem {...defaultProps} isUnread={false} />
      );

      expect(queryByText('NEW')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onPress when item is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <MessageListItem {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('Test Message Title'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
