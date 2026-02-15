/**
 * EventItem Component Tests
 *
 * Tests for event card rendering and navigation.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventItem } from '../EventItem';
import type { Event } from '../../../../types/event';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('EventItem', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Festival Mediteranskog Filma',
    description: 'Filmski festival na otoku Visu',
    start_datetime: '2026-03-15T19:00:00Z',
    end_datetime: '2026-03-15T23:00:00Z',
    location: 'Kino Vis',
    organizer: 'Turistička zajednica',
    is_all_day: false,
    image_url: null,
    created_at: '2026-02-01T10:00:00Z',
  };

  const defaultProps = {
    event: mockEvent,
    allDayText: 'Cijeli dan',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render event title', () => {
      const { getByText } = render(<EventItem {...defaultProps} />);

      expect(getByText('Festival Mediteranskog Filma')).toBeTruthy();
    });

    it('should render event time', () => {
      const { getByText } = render(<EventItem {...defaultProps} />);

      // formatEventTime is mocked to return '10:00' for non-all-day events
      expect(getByText('10:00')).toBeTruthy();
    });

    it('should render event location when provided', () => {
      const { getByText } = render(<EventItem {...defaultProps} />);

      expect(getByText('Kino Vis')).toBeTruthy();
    });

    it('should not render location row when location is null', () => {
      const eventWithoutLocation = { ...mockEvent, location: null };
      const { queryByText, getByTestId, queryAllByTestId } = render(
        <EventItem event={eventWithoutLocation} allDayText="Cijeli dan" />
      );

      // Location should not be in the output
      expect(queryByText('Kino Vis')).toBeNull();
      // Should only have clock and chevron-right icons, not map-pin
      const mapPinIcons = queryAllByTestId('icon-map-pin');
      expect(mapPinIcons).toHaveLength(0);
    });

    it('should render clock icon', () => {
      const { getByTestId } = render(<EventItem {...defaultProps} />);

      expect(getByTestId('icon-clock')).toBeTruthy();
    });

    it('should render map-pin icon when location exists', () => {
      const { getByTestId } = render(<EventItem {...defaultProps} />);

      expect(getByTestId('icon-map-pin')).toBeTruthy();
    });

    it('should render chevron-right icon', () => {
      const { getByTestId } = render(<EventItem {...defaultProps} />);

      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });
  });

  describe('all-day events', () => {
    it('should display allDayText for all-day events', () => {
      const allDayEvent = { ...mockEvent, is_all_day: true };
      const { getByText } = render(
        <EventItem event={allDayEvent} allDayText="Cijeli dan" />
      );

      // formatEventTime mock returns allDayText for all-day events
      expect(getByText('Cijeli dan')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to EventDetail on press', () => {
      const { getByText } = render(<EventItem {...defaultProps} />);

      fireEvent.press(getByText('Festival Mediteranskog Filma'));
      expect(mockNavigate).toHaveBeenCalledWith('EventDetail', { eventId: 'event-1' });
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should pass correct eventId when navigating', () => {
      const differentEvent = { ...mockEvent, id: 'event-xyz' };
      const { getByText } = render(
        <EventItem event={differentEvent} allDayText="Cijeli dan" />
      );

      fireEvent.press(getByText('Festival Mediteranskog Filma'));
      expect(mockNavigate).toHaveBeenCalledWith('EventDetail', { eventId: 'event-xyz' });
    });
  });

  describe('text truncation', () => {
    it('should limit title to 2 lines', () => {
      const longTitleEvent = {
        ...mockEvent,
        title: 'Ovo je jako jako jako jako jako jako dugačak naslov koji bi trebao biti skraćen na dvije linije',
      };
      const { getByText } = render(
        <EventItem event={longTitleEvent} allDayText="Cijeli dan" />
      );

      const titleElement = getByText(longTitleEvent.title);
      expect(titleElement.props.numberOfLines).toBe(2);
    });

    it('should limit location to 1 line', () => {
      const longLocationEvent = {
        ...mockEvent,
        location: 'Kino Vis, Ulica Svetog Jurja 15, Grad Vis, Otok Vis, Hrvatska',
      };
      const { getByText } = render(
        <EventItem event={longLocationEvent} allDayText="Cijeli dan" />
      );

      const locationElement = getByText(longLocationEvent.location);
      expect(locationElement.props.numberOfLines).toBe(1);
    });
  });
});
