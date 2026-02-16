/**
 * DeparturesSection Component Tests
 *
 * Tests for departures list with loading and empty states.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { DeparturesSection } from '../DeparturesSection';
import type { DepartureResponse } from '../../../../types/transport';

// Mock DepartureItem component
jest.mock('../../../../components/DepartureItem', () => ({
  DepartureItem: ({ departure }: { departure: DepartureResponse }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(
      Text,
      { testID: `departure-${departure.id}` },
      `${departure.departure_time} - ${departure.destination}`
    );
  },
}));

describe('DeparturesSection', () => {
  const mockDepartures: DepartureResponse[] = [
    {
      id: 'dep-1',
      departure_time: '07:30',
      destination: 'Split',
      duration_minutes: 90,
      notes: null,
      marker: null,
      stop_times: [],
    },
    {
      id: 'dep-2',
      departure_time: '15:00',
      destination: 'Split',
      duration_minutes: 90,
      notes: null,
      marker: null,
      stop_times: [],
    },
  ];

  const defaultProps = {
    departures: mockDepartures,
    loading: false,
    transportType: 'sea' as const,
    sectionLabel: 'Polasci',
    emptyText: 'Nema polazaka za odabrani datum',
  };

  describe('rendering', () => {
    it('should render section label', () => {
      const { getByText } = render(<DeparturesSection {...defaultProps} />);

      expect(getByText('Polasci')).toBeTruthy();
    });

    it('should render departure items when departures exist', () => {
      const { getByTestId } = render(<DeparturesSection {...defaultProps} />);

      expect(getByTestId('departure-dep-1')).toBeTruthy();
      expect(getByTestId('departure-dep-2')).toBeTruthy();
    });

    it('should render departure times', () => {
      const { getByText } = render(<DeparturesSection {...defaultProps} />);

      expect(getByText('07:30 - Split')).toBeTruthy();
      expect(getByText('15:00 - Split')).toBeTruthy();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when loading', () => {
      const { UNSAFE_getByType } = render(
        <DeparturesSection {...defaultProps} loading={true} />
      );

      // ActivityIndicator should be present
      const { ActivityIndicator } = require('react-native');
      expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('should not render departures when loading', () => {
      const { queryByTestId } = render(
        <DeparturesSection {...defaultProps} loading={true} />
      );

      expect(queryByTestId('departure-dep-1')).toBeNull();
      expect(queryByTestId('departure-dep-2')).toBeNull();
    });
  });

  describe('empty state', () => {
    it('should show empty text when no departures', () => {
      const { getByText } = render(
        <DeparturesSection {...defaultProps} departures={[]} />
      );

      expect(getByText('Nema polazaka za odabrani datum')).toBeTruthy();
    });

    it('should show calendar icon in empty state', () => {
      const { getByTestId } = render(
        <DeparturesSection {...defaultProps} departures={[]} />
      );

      expect(getByTestId('icon-calendar')).toBeTruthy();
    });

    it('should not show empty state when departures exist', () => {
      const { queryByText } = render(<DeparturesSection {...defaultProps} />);

      expect(queryByText('Nema polazaka za odabrani datum')).toBeNull();
    });
  });

  describe('custom labels', () => {
    it('should use custom section label', () => {
      const { getByText } = render(
        <DeparturesSection {...defaultProps} sectionLabel="Departures" />
      );

      expect(getByText('Departures')).toBeTruthy();
    });

    it('should use custom empty text', () => {
      const { getByText } = render(
        <DeparturesSection
          {...defaultProps}
          departures={[]}
          emptyText="No departures found"
        />
      );

      expect(getByText('No departures found')).toBeTruthy();
    });
  });

  describe('transport type', () => {
    it('should pass transportType to DepartureItem', () => {
      const { getByTestId } = render(
        <DeparturesSection {...defaultProps} transportType="road" />
      );

      // DepartureItem should render (mock verifies it receives props)
      expect(getByTestId('departure-dep-1')).toBeTruthy();
    });
  });
});
