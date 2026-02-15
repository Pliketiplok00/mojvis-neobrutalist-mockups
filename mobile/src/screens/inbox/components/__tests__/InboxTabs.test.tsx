/**
 * InboxTabs Component Tests
 *
 * Tests for tab rendering and interaction.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InboxTabs } from '../InboxTabs';

describe('InboxTabs', () => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'inbox.tabs.received': 'Primljeno',
      'inbox.tabs.sent': 'Poslano',
    };
    return translations[key] || key;
  };

  const defaultProps = {
    activeTab: 'received' as const,
    onTabChange: jest.fn(),
    t: mockT,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render both tabs', () => {
      const { getByText } = render(<InboxTabs {...defaultProps} />);

      expect(getByText('Primljeno')).toBeTruthy();
      expect(getByText('Poslano')).toBeTruthy();
    });

    it('should render inbox icon for received tab', () => {
      const { getByTestId } = render(<InboxTabs {...defaultProps} />);

      expect(getByTestId('icon-inbox')).toBeTruthy();
    });

    it('should render send icon for sent tab', () => {
      const { getByTestId } = render(<InboxTabs {...defaultProps} />);

      expect(getByTestId('icon-send')).toBeTruthy();
    });
  });

  describe('active state', () => {
    it('should show received tab as active when activeTab is received', () => {
      const { getByText } = render(
        <InboxTabs {...defaultProps} activeTab="received" />
      );

      const receivedTab = getByText('Primljeno');
      expect(receivedTab).toBeTruthy();
    });

    it('should show sent tab as active when activeTab is sent', () => {
      const { getByText } = render(
        <InboxTabs {...defaultProps} activeTab="sent" />
      );

      const sentTab = getByText('Poslano');
      expect(sentTab).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onTabChange with sent when sent tab is pressed', () => {
      const onTabChange = jest.fn();
      const { getByText } = render(
        <InboxTabs {...defaultProps} onTabChange={onTabChange} />
      );

      fireEvent.press(getByText('Poslano'));
      expect(onTabChange).toHaveBeenCalledWith('sent');
      expect(onTabChange).toHaveBeenCalledTimes(1);
    });

    it('should call onTabChange with received when received tab is pressed', () => {
      const onTabChange = jest.fn();
      const { getByText } = render(
        <InboxTabs {...defaultProps} activeTab="sent" onTabChange={onTabChange} />
      );

      fireEvent.press(getByText('Primljeno'));
      expect(onTabChange).toHaveBeenCalledWith('received');
      expect(onTabChange).toHaveBeenCalledTimes(1);
    });

    it('should call onTabChange even when pressing already active tab', () => {
      const onTabChange = jest.fn();
      const { getByText } = render(
        <InboxTabs {...defaultProps} activeTab="received" onTabChange={onTabChange} />
      );

      fireEvent.press(getByText('Primljeno'));
      expect(onTabChange).toHaveBeenCalledWith('received');
    });
  });

  describe('translation', () => {
    it('should use t function for tab labels', () => {
      const customT = jest.fn((key: string) => `translated_${key}`);
      render(<InboxTabs {...defaultProps} t={customT} />);

      expect(customT).toHaveBeenCalledWith('inbox.tabs.received');
      expect(customT).toHaveBeenCalledWith('inbox.tabs.sent');
    });
  });
});
