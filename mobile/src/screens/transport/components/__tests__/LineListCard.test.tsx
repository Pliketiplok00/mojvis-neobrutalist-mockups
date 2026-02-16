/**
 * LineListCard Component Tests
 *
 * Tests for transport line card rendering.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LineListCard } from '../LineListCard';
import type { LineListItem } from '../../../../types/transport';

describe('LineListCard', () => {
  const mockLine: LineListItem = {
    id: 'line-612',
    line_number: '612',
    name: 'Linija 612',
    origin: 'Split',
    destination: 'Vis',
    stops_count: 3,
    stops_summary: 'Split - Vis (direktna)',
    typical_duration_minutes: 150,
    subtype: 'CATAMARAN',
  };

  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'transport.stations': 'postaja',
      'transport.seasonal': 'Sezonska',
    };
    return translations[key] || key;
  };

  const mockOnPress = jest.fn();

  const defaultProps = {
    line: mockLine,
    transportType: 'sea' as const,
    headerBackground: '#FFE500',
    iconName: 'ship' as const,
    title: 'Split → Vis',
    t: mockT,
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render line title', () => {
      const { getByText } = render(<LineListCard {...defaultProps} />);

      expect(getByText('Split → Vis')).toBeTruthy();
    });

    it('should render stops summary', () => {
      const { getByText } = render(<LineListCard {...defaultProps} />);

      expect(getByText('Split - Vis (direktna)')).toBeTruthy();
    });

    it('should render stops count and duration', () => {
      const { getByText } = render(<LineListCard {...defaultProps} />);

      // formatDuration(150) = "2h 30min"
      expect(getByText(/3 postaja/)).toBeTruthy();
      expect(getByText(/2h 30min/)).toBeTruthy();
    });

    it('should render ship icon for sea transport', () => {
      const { getByTestId } = render(<LineListCard {...defaultProps} />);

      expect(getByTestId('icon-ship')).toBeTruthy();
    });

    it('should render bus icon for road transport', () => {
      const { getByTestId } = render(
        <LineListCard {...defaultProps} transportType="road" iconName="bus" />
      );

      expect(getByTestId('icon-bus')).toBeTruthy();
    });

    it('should render chevron-right icon', () => {
      const { getByTestId } = render(<LineListCard {...defaultProps} />);

      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });

    it('should render subtype badge when present', () => {
      const { getByText } = render(<LineListCard {...defaultProps} />);

      expect(getByText('CATAMARAN')).toBeTruthy();
    });

    it('should not render subtype badge when line has no subtype', () => {
      const lineWithoutSubtype: LineListItem = { ...mockLine, subtype: null };
      const { queryByText } = render(
        <LineListCard {...defaultProps} line={lineWithoutSubtype} />
      );

      expect(queryByText('CATAMARAN')).toBeNull();
    });
  });

  describe('seasonal badge', () => {
    it('should render seasonal badge when showSeasonalBadge is true', () => {
      const { getAllByText } = render(
        <LineListCard
          {...defaultProps}
          showSeasonalBadge={true}
          seasonalText="Ljeto 2026"
        />
      );

      // Seasonal text may appear in both subtitle and badge for sea transport
      const elements = getAllByText('Ljeto 2026');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should use default seasonal text when seasonalText not provided', () => {
      const { getByText } = render(
        <LineListCard {...defaultProps} showSeasonalBadge={true} />
      );

      expect(getByText('Sezonska')).toBeTruthy();
    });

    it('should not render seasonal badge when showSeasonalBadge is false', () => {
      const { queryByText } = render(
        <LineListCard {...defaultProps} showSeasonalBadge={false} />
      );

      expect(queryByText('Sezonska')).toBeNull();
    });
  });

  describe('sea vs road transport differences', () => {
    it('should render header subtitle for sea transport with seasonal badge', () => {
      const { getAllByText } = render(
        <LineListCard
          {...defaultProps}
          transportType="sea"
          showSeasonalBadge={true}
          seasonalText="Ljeto 2026"
        />
      );

      // Sea transport shows seasonal text in subtitle and/or badge
      const elements = getAllByText('Ljeto 2026');
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('duration formatting', () => {
    it('should show duration when typical_duration_minutes is set', () => {
      const { getByText } = render(<LineListCard {...defaultProps} />);

      expect(getByText(/2h 30min/)).toBeTruthy();
    });

    it('should not show duration when typical_duration_minutes is 0', () => {
      const lineNoDuration = { ...mockLine, typical_duration_minutes: 0 };
      const { queryByText } = render(
        <LineListCard {...defaultProps} line={lineNoDuration} />
      );

      expect(queryByText(/2h/)).toBeNull();
    });

    it('should not show duration when typical_duration_minutes is null', () => {
      const lineNoDuration = { ...mockLine, typical_duration_minutes: null };
      const { queryByText } = render(
        <LineListCard {...defaultProps} line={lineNoDuration} />
      );

      // Should not contain duration format like "2h 30min"
      expect(queryByText(/\dh \d+min/)).toBeNull();
    });
  });

  describe('interaction', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(<LineListCard {...defaultProps} />);

      fireEvent.press(getByText('Split → Vis'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});
