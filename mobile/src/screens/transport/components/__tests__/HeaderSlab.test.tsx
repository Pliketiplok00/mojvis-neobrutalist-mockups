/**
 * HeaderSlab Component Tests
 *
 * Tests for transport line header display.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { HeaderSlab } from '../HeaderSlab';

// Mock Badge component
jest.mock('../../../../ui/Badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(
      Text,
      { testID: `badge-${variant}` },
      children
    );
  },
}));

// Mock transportFormat utilities
jest.mock('../../../../utils/transportFormat', () => ({
  formatLineTitle: (lineNumber: string | null, origin: string, destination: string) =>
    lineNumber ? `${lineNumber}: ${origin} - ${destination}` : `${origin} - ${destination}`,
  formatDuration: (minutes: number) =>
    minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes}min`,
}));

describe('HeaderSlab', () => {
  const defaultProps = {
    transportType: 'sea' as const,
    lineNumber: '602',
    origin: 'Vis',
    destination: 'Split',
    subtype: 'Trajekt',
    durationMinutes: 140,
    backgroundColor: '#2563EB',
  };

  describe('rendering', () => {
    it('should render formatted line title', () => {
      const { getByText } = render(<HeaderSlab {...defaultProps} />);

      expect(getByText('602: Vis - Split')).toBeTruthy();
    });

    it('should render ship icon for sea transport', () => {
      const { getByTestId } = render(<HeaderSlab {...defaultProps} />);

      expect(getByTestId('icon-ship')).toBeTruthy();
    });

    it('should render bus icon for road transport', () => {
      const { getByTestId } = render(
        <HeaderSlab {...defaultProps} transportType="road" />
      );

      expect(getByTestId('icon-bus')).toBeTruthy();
    });

    it('should render formatted duration', () => {
      const { getByText } = render(<HeaderSlab {...defaultProps} />);

      expect(getByText('2h 20min')).toBeTruthy();
    });
  });

  describe('sea transport badges', () => {
    it('should render subtype badge for sea transport', () => {
      const { getByTestId, getByText } = render(<HeaderSlab {...defaultProps} />);

      expect(getByTestId('badge-transport')).toBeTruthy();
      expect(getByText('Trajekt')).toBeTruthy();
    });

    it('should render seasonal badge for line 659', () => {
      const { getAllByTestId, getByText } = render(
        <HeaderSlab
          {...defaultProps}
          lineNumber="659"
          seasonalLabel="Sezonska"
        />
      );

      const badges = getAllByTestId('badge-transport');
      expect(badges.length).toBe(2); // subtype + seasonal
      expect(getByText('Sezonska')).toBeTruthy();
    });

    it('should not render seasonal badge for non-659 lines', () => {
      const { queryByText } = render(
        <HeaderSlab
          {...defaultProps}
          lineNumber="602"
          seasonalLabel="Sezonska"
        />
      );

      expect(queryByText('Sezonska')).toBeNull();
    });
  });

  describe('road transport meta', () => {
    it('should render subtype as meta for road transport', () => {
      const { getByText, queryByTestId } = render(
        <HeaderSlab {...defaultProps} transportType="road" subtype="Intercity" />
      );

      expect(getByText('Intercity')).toBeTruthy();
      // Should not render as badge
      expect(queryByTestId('badge-transport')).toBeNull();
    });
  });

  describe('optional fields', () => {
    it('should handle null lineNumber', () => {
      const { getByText } = render(
        <HeaderSlab {...defaultProps} lineNumber={null} />
      );

      expect(getByText('Vis - Split')).toBeTruthy();
    });

    it('should handle null subtype', () => {
      const { queryByTestId } = render(
        <HeaderSlab {...defaultProps} subtype={null} />
      );

      // No badge should be rendered when subtype is null
      expect(queryByTestId('badge-transport')).toBeNull();
    });

    it('should handle null durationMinutes', () => {
      const { queryByText } = render(
        <HeaderSlab {...defaultProps} durationMinutes={null} />
      );

      // Duration should not appear
      expect(queryByText('2h 20min')).toBeNull();
    });
  });

  describe('duration formatting', () => {
    it('should format short durations correctly', () => {
      const { getByText } = render(
        <HeaderSlab {...defaultProps} durationMinutes={45} />
      );

      expect(getByText('45min')).toBeTruthy();
    });

    it('should format hour durations correctly', () => {
      const { getByText } = render(
        <HeaderSlab {...defaultProps} durationMinutes={90} />
      );

      expect(getByText('1h 30min')).toBeTruthy();
    });
  });
});
