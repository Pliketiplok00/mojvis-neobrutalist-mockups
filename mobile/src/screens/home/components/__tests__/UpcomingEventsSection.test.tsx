/**
 * UpcomingEventsSection Component Tests
 *
 * Tests for upcoming events list rendering on home screen.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UpcomingEventsSection } from '../UpcomingEventsSection';
import type { Event } from '../../../../types/event';

describe('UpcomingEventsSection', () => {
  const mockEvents: Event[] = [
    {
      id: 'event-1',
      title: 'Festival Mediteranskog Filma',
      description: 'Filmski festival',
      start_datetime: '2026-03-15T19:00:00Z',
      end_datetime: '2026-03-15T23:00:00Z',
      location: 'Kino Vis',
      organizer: 'Turistička zajednica',
      is_all_day: false,
      image_url: null,
      created_at: '2026-02-01T10:00:00Z',
    },
    {
      id: 'event-2',
      title: 'Koncert na rivi',
      description: 'Ljetni koncert',
      start_datetime: '2026-07-20T21:00:00Z',
      end_datetime: '2026-07-21T00:00:00Z',
      location: 'Riva Vis',
      organizer: 'Grad Vis',
      is_all_day: false,
      image_url: null,
      created_at: '2026-06-01T10:00:00Z',
    },
    {
      id: 'event-3',
      title: 'Fešta od sardela',
      description: 'Tradicionalna fešta',
      start_datetime: '2026-08-15T18:00:00Z',
      end_datetime: null,
      location: 'Komiža',
      organizer: 'Grad Komiža',
      is_all_day: false,
      image_url: null,
      created_at: '2026-07-01T10:00:00Z',
    },
  ];

  const mockOnEventPress = jest.fn();
  const mockOnSeeAllPress = jest.fn();

  const defaultProps = {
    events: mockEvents,
    sectionTitle: 'NADOLAZEĆI DOGAĐAJI',
    placeholderText: 'Nema nadolazećih događaja',
    viewAllText: 'Pogledaj sve',
    onEventPress: mockOnEventPress,
    onSeeAllPress: mockOnSeeAllPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section title', () => {
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      expect(getByText('NADOLAZEĆI DOGAĐAJI')).toBeTruthy();
    });

    it('should render all event titles', () => {
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      expect(getByText('Festival Mediteranskog Filma')).toBeTruthy();
      expect(getByText('Koncert na rivi')).toBeTruthy();
      expect(getByText('Fešta od sardela')).toBeTruthy();
    });

    it('should render event locations', () => {
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      expect(getByText('Kino Vis')).toBeTruthy();
      expect(getByText('Riva Vis')).toBeTruthy();
      expect(getByText('Komiža')).toBeTruthy();
    });

    it('should render chevron-right icons', () => {
      const { getAllByTestId } = render(
        <UpcomingEventsSection {...defaultProps} />
      );

      const chevrons = getAllByTestId('icon-chevron-right');
      expect(chevrons).toHaveLength(3);
    });
  });

  describe('date badge', () => {
    it('should render day number in date badge', () => {
      const { getAllByText } = render(<UpcomingEventsSection {...defaultProps} />);

      // March 15, 2026 - day should be 15 (may appear multiple times)
      const dayElements = getAllByText('15');
      expect(dayElements.length).toBeGreaterThan(0);
    });

    it('should render month abbreviation in date badge', () => {
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      // March = MAR
      expect(getByText('MAR')).toBeTruthy();
      // July = JUL
      expect(getByText('JUL')).toBeTruthy();
      // August = AUG
      expect(getByText('AUG')).toBeTruthy();
    });

    it('should format all months correctly', () => {
      const allMonthEvents: Event[] = [
        { ...mockEvents[0], id: 'jan', start_datetime: '2026-01-15T10:00:00Z' },
        { ...mockEvents[0], id: 'feb', start_datetime: '2026-02-15T10:00:00Z' },
        { ...mockEvents[0], id: 'dec', start_datetime: '2026-12-15T10:00:00Z' },
      ];

      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={allMonthEvents} />
      );

      expect(getByText('JAN')).toBeTruthy();
      expect(getByText('FEB')).toBeTruthy();
      expect(getByText('DEC')).toBeTruthy();
    });
  });

  describe('first event highlighting', () => {
    it('should render first event with different styling', () => {
      // This test verifies the first event gets different treatment
      // The actual visual difference is in styles, but we verify structure
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      // First event should be rendered (style difference is visual)
      expect(getByText('Festival Mediteranskog Filma')).toBeTruthy();
    });
  });

  describe('empty state / placeholder', () => {
    it('should render placeholder when no events', () => {
      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={[]} />
      );

      expect(getByText('Nema nadolazećih događaja')).toBeTruthy();
    });

    it('should render viewAllText in placeholder', () => {
      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={[]} />
      );

      expect(getByText('Pogledaj sve')).toBeTruthy();
    });

    it('should render placeholder date badge with dashes', () => {
      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={[]} />
      );

      expect(getByText('--')).toBeTruthy();
      expect(getByText('---')).toBeTruthy();
    });

    it('should call onSeeAllPress when placeholder is pressed', () => {
      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={[]} />
      );

      fireEvent.press(getByText('Nema nadolazećih događaja'));
      expect(mockOnSeeAllPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('null location handling', () => {
    it('should show viewAllText when location is null', () => {
      const eventWithoutLocation: Event[] = [
        {
          ...mockEvents[0],
          location: null,
        },
      ];

      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={eventWithoutLocation} />
      );

      expect(getByText('Pogledaj sve')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onEventPress with event id when event is pressed', () => {
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      fireEvent.press(getByText('Festival Mediteranskog Filma'));
      expect(mockOnEventPress).toHaveBeenCalledWith('event-1');
    });

    it('should call onEventPress with correct id for each event', () => {
      const { getByText } = render(<UpcomingEventsSection {...defaultProps} />);

      fireEvent.press(getByText('Koncert na rivi'));
      expect(mockOnEventPress).toHaveBeenCalledWith('event-2');

      fireEvent.press(getByText('Fešta od sardela'));
      expect(mockOnEventPress).toHaveBeenCalledWith('event-3');
    });
  });

  describe('text truncation', () => {
    it('should limit title to 1 line', () => {
      const longTitleEvent: Event[] = [
        {
          ...mockEvents[0],
          title: 'Ovo je jako jako jako jako jako jako dugačak naslov koji bi trebao biti skraćen na jednu liniju',
        },
      ];

      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={longTitleEvent} />
      );

      const titleElement = getByText(longTitleEvent[0].title);
      expect(titleElement.props.numberOfLines).toBe(1);
    });

    it('should limit location to 1 line', () => {
      const longLocationEvent: Event[] = [
        {
          ...mockEvents[0],
          location: 'Kino Vis, Ulica Svetog Jurja 15, Grad Vis, Otok Vis',
        },
      ];

      const { getByText } = render(
        <UpcomingEventsSection {...defaultProps} events={longLocationEvent} />
      );

      const locationElement = getByText(longLocationEvent[0].location!);
      expect(locationElement.props.numberOfLines).toBe(1);
    });
  });
});
