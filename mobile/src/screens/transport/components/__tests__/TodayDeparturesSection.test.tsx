/**
 * TodayDeparturesSection Component Tests
 *
 * Tests for today's departures list rendering.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TodayDeparturesSection } from '../TodayDeparturesSection';
import type { TodayDepartureItem, LineListItem } from '../../../../types/transport';

describe('TodayDeparturesSection', () => {
  // Test with duration from departure (new API)
  const mockDepartures: TodayDepartureItem[] = [
    {
      line_id: 'line-1',
      departure_time: '08:30:00',
      direction_label: 'Vis → Split',
      line_name: 'Linija 612',
      route_id: 'route-1',
      destination: 'Split',
      marker: null,
      typical_duration_minutes: 140,
    },
    {
      line_id: 'line-2',
      departure_time: '10:15:00',
      direction_label: 'Split → Vis',
      line_name: 'Linija 612',
      route_id: 'route-2',
      destination: 'Vis',
      marker: null,
      typical_duration_minutes: 140,
    },
    {
      line_id: 'line-3',
      departure_time: '14:00:00',
      direction_label: 'Komiža → Vis',
      line_name: 'Linija 659',
      route_id: 'route-3',
      destination: 'Vis',
      marker: '*',
      typical_duration_minutes: 30,
    },
  ];

  // Fallback lines for duration lookup (old API compatibility)
  const mockLines: LineListItem[] = [
    {
      id: 'line-1',
      line_number: '612',
      name: 'Vis - Split',
      subtype: 'TRAJEKT',
      origin: 'Vis',
      destination: 'Split',
      stops_summary: 'Vis → Split',
      stops_count: 2,
      typical_duration_minutes: 140,
    },
  ];

  const mockOnDeparturePress = jest.fn();

  const defaultProps = {
    departures: mockDepartures,
    lines: mockLines,
    sectionLabel: 'POLASCI DANAS',
    emptyText: 'Nema polazaka danas',
    timeBlockBackground: '#4ECDC4',
    onDeparturePress: mockOnDeparturePress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section label', () => {
      const { getByText } = render(<TodayDeparturesSection {...defaultProps} />);

      expect(getByText('POLASCI DANAS')).toBeTruthy();
    });

    it('should render all departure times', () => {
      const { getByText } = render(<TodayDeparturesSection {...defaultProps} />);

      expect(getByText('08:30')).toBeTruthy();
      expect(getByText('10:15')).toBeTruthy();
      expect(getByText('14:00')).toBeTruthy();
    });

    it('should render all direction labels', () => {
      const { getByText } = render(<TodayDeparturesSection {...defaultProps} />);

      expect(getByText('Vis → Split')).toBeTruthy();
      expect(getByText('Split → Vis')).toBeTruthy();
      expect(getByText('Komiža → Vis')).toBeTruthy();
    });

    it('should format time correctly (remove seconds)', () => {
      const departuresWithSeconds: TodayDepartureItem[] = [
        {
          line_id: 'line-1',
          departure_time: '08:30:45',
          direction_label: 'Test',
          line_name: 'Test Line',
          route_id: 'route-1',
          destination: 'Test Dest',
          marker: null,
          typical_duration_minutes: null,
        },
      ];

      const { getByText } = render(
        <TodayDeparturesSection
          {...defaultProps}
          departures={departuresWithSeconds}
        />
      );

      expect(getByText('08:30')).toBeTruthy();
    });

    it('should render duration when departure has typical_duration_minutes', () => {
      const { getAllByText, getByText } = render(<TodayDeparturesSection {...defaultProps} />);

      // line-1 and line-2 both have 140 minutes = 2h 20min
      expect(getAllByText('2h 20min').length).toBe(2);
      // line-3 has 30 minutes
      expect(getByText('30 min')).toBeTruthy();
    });

    it('should not render duration when typical_duration_minutes is null and no fallback', () => {
      const departuresWithNullDuration: TodayDepartureItem[] = [
        {
          line_id: 'no-match-line',
          departure_time: '08:30:00',
          direction_label: 'Komiža → Biševo',
          line_name: 'Linija 612',
          route_id: 'route-1',
          destination: 'Biševo',
          marker: null,
          typical_duration_minutes: null,
        },
      ];

      const { queryByText } = render(
        <TodayDeparturesSection
          {...defaultProps}
          departures={departuresWithNullDuration}
          lines={[]} // No fallback lines
        />
      );

      // No duration text should be rendered
      expect(queryByText('min')).toBeNull();
    });

    it('should use fallback from lines when departure has no duration', () => {
      const departuresWithoutDuration: TodayDepartureItem[] = [
        {
          line_id: 'line-1',
          departure_time: '08:30:00',
          direction_label: 'Vis → Split',
          line_name: 'Linija 612',
          route_id: 'route-1',
          destination: 'Split',
          marker: null,
          typical_duration_minutes: null, // No duration from API
        },
      ];

      const fallbackLines: LineListItem[] = [
        {
          id: 'line-1',
          line_number: '612',
          name: 'Vis - Split',
          subtype: 'TRAJEKT',
          origin: 'Vis',
          destination: 'Split',
          stops_summary: 'Vis → Split',
          stops_count: 2,
          typical_duration_minutes: 140, // Duration from lines
        },
      ];

      const { getByText } = render(
        <TodayDeparturesSection
          {...defaultProps}
          departures={departuresWithoutDuration}
          lines={fallbackLines}
        />
      );

      // Should use duration from fallback lines
      expect(getByText('2h 20min')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should render empty text when no departures', () => {
      const { getByText } = render(
        <TodayDeparturesSection {...defaultProps} departures={[]} />
      );

      expect(getByText('Nema polazaka danas')).toBeTruthy();
    });

    it('should not render departure rows when empty', () => {
      const { queryByText } = render(
        <TodayDeparturesSection {...defaultProps} departures={[]} />
      );

      expect(queryByText('08:30')).toBeNull();
    });
  });

  describe('limit to 10 departures', () => {
    it('should only show first 10 departures', () => {
      const manyDepartures: TodayDepartureItem[] = Array.from(
        { length: 15 },
        (_, i) => ({
          line_id: `line-${i}`,
          departure_time: `${(8 + i).toString().padStart(2, '0')}:00:00`,
          direction_label: `Direction ${i}`,
          line_name: `Line ${i}`,
          route_id: `route-${i}`,
          destination: `Dest ${i}`,
          marker: null,
          typical_duration_minutes: null,
        })
      );

      const { getByText, queryByText } = render(
        <TodayDeparturesSection {...defaultProps} departures={manyDepartures} lines={[]} />
      );

      // First 10 should be visible
      expect(getByText('08:00')).toBeTruthy();
      expect(getByText('17:00')).toBeTruthy();

      // 11th and beyond should not be visible
      expect(queryByText('18:00')).toBeNull();
      expect(queryByText('22:00')).toBeNull();
    });
  });

  describe('subtype badge', () => {
    it('should render subtype badge when departure has subtype', () => {
      const departuresWithSubtype = [
        {
          line_id: 'line-1',
          departure_time: '08:30:00',
          direction_label: 'Test',
          line_name: 'Test',
          route_id: 'route-1',
          destination: 'Test',
          marker: null,
          typical_duration_minutes: null,
          subtype: 'CATAMARAN',
        } as TodayDepartureItem & { subtype: string },
      ];

      const { getByText } = render(
        <TodayDeparturesSection
          {...defaultProps}
          departures={departuresWithSubtype as unknown as TodayDepartureItem[]}
          lines={[]}
        />
      );

      expect(getByText('CATAMARAN')).toBeTruthy();
    });

    it('should not render subtype badge when departure has no subtype', () => {
      const { queryByText } = render(
        <TodayDeparturesSection {...defaultProps} />
      );

      expect(queryByText('CATAMARAN')).toBeNull();
      expect(queryByText('FERRY')).toBeNull();
    });
  });

  describe('interaction', () => {
    it('should call onDeparturePress with line_id when row is pressed', () => {
      const { getByText } = render(<TodayDeparturesSection {...defaultProps} />);

      fireEvent.press(getByText('Vis → Split'));
      expect(mockOnDeparturePress).toHaveBeenCalledWith('line-1');
    });

    it('should call onDeparturePress for each row with correct line_id', () => {
      const { getByText } = render(<TodayDeparturesSection {...defaultProps} />);

      fireEvent.press(getByText('Split → Vis'));
      expect(mockOnDeparturePress).toHaveBeenCalledWith('line-2');

      fireEvent.press(getByText('Komiža → Vis'));
      expect(mockOnDeparturePress).toHaveBeenCalledWith('line-3');
    });
  });

  describe('styling', () => {
    it('should use provided timeBlockBackground color', () => {
      // This test verifies the prop is passed - actual styling is visual
      const { getByText } = render(
        <TodayDeparturesSection
          {...defaultProps}
          timeBlockBackground="#FF6B6B"
        />
      );

      // Component renders without error with custom color
      expect(getByText('08:30')).toBeTruthy();
    });
  });
});
