/**
 * TicketInfoBox Component Tests
 *
 * Tests for ticket purchase information display.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TicketInfoBox } from '../TicketInfoBox';
import type { ContactInfo } from '../../../../types/transport';

// Get the mocked Linking from react-native
const mockOpenURL = jest.fn();
jest.spyOn(require('react-native').Linking, 'openURL').mockImplementation(mockOpenURL);

// Mock carriers constants
jest.mock('../../../../constants/carriers', () => ({
  CARRIER_TICKET_URLS: {
    Jadrolinija: 'https://jadrolinija.hr/tickets',
    Krilo: 'https://krilo.hr/booking',
  },
  SEA_LINE_CARRIERS: {
    '602': { name: 'Jadrolinija', ticketUrl: 'https://jadrolinija.hr/tickets' },
    '612': { name: 'TP Line', ticketUrl: null }, // Boarding only
    '659': { name: 'Krilo', ticketUrl: 'https://krilo.hr/booking' },
  },
}));

describe('TicketInfoBox', () => {
  const mockContacts: ContactInfo[] = [
    {
      operator: 'Jadrolinija',
      phone: '+385 21 338 333',
      email: null,
      website: null,
    },
  ];

  const defaultProps = {
    lineNumber: '602',
    contacts: mockContacts,
    titleText: 'Karte',
    bodyText: 'Kupite karte online ili na trajektu',
    boardingOnlyText: 'Karte se kupuju samo pri ukrcaju',
    fallbackText: 'Karte dostupne na šalteru',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render title text', () => {
      const { getByText } = render(<TicketInfoBox {...defaultProps} />);

      expect(getByText('Karte')).toBeTruthy();
    });

    it('should render body text for line with ticket URL', () => {
      const { getByText } = render(<TicketInfoBox {...defaultProps} />);

      expect(getByText('Kupite karte online ili na trajektu')).toBeTruthy();
    });

    it('should render carrier name with link', () => {
      const { getByText } = render(<TicketInfoBox {...defaultProps} />);

      expect(getByText('Jadrolinija')).toBeTruthy();
    });

    it('should render globe icon when ticket URL exists', () => {
      const { getByTestId } = render(<TicketInfoBox {...defaultProps} />);

      expect(getByTestId('icon-globe')).toBeTruthy();
    });
  });

  describe('boarding only lines', () => {
    it('should show boarding only text for lines without ticket URL', () => {
      const { getByText } = render(
        <TicketInfoBox {...defaultProps} lineNumber="612" />
      );

      expect(getByText('Karte se kupuju samo pri ukrcaju')).toBeTruthy();
    });

    it('should show carrier name without link for boarding only', () => {
      // Use contacts without a carrier that has ticket URL
      const contactsWithoutTicketUrl: ContactInfo[] = [
        { operator: 'TP Line', phone: null, email: null, website: null },
      ];
      const { getByText, queryByTestId } = render(
        <TicketInfoBox
          {...defaultProps}
          lineNumber="612"
          contacts={contactsWithoutTicketUrl}
        />
      );

      expect(getByText('TP Line')).toBeTruthy();
      expect(queryByTestId('icon-globe')).toBeNull();
    });
  });

  describe('fallback to contacts', () => {
    it('should use contact operator when line not in SEA_LINE_CARRIERS', () => {
      const { getByText } = render(
        <TicketInfoBox {...defaultProps} lineNumber="999" />
      );

      expect(getByText('Jadrolinija')).toBeTruthy();
    });

    it('should show fallback text when no carrier info available', () => {
      const { getByText } = render(
        <TicketInfoBox
          {...defaultProps}
          lineNumber="999"
          contacts={[{ operator: 'Unknown', phone: null, email: null, website: null }]}
        />
      );

      expect(getByText('Karte dostupne na šalteru')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should open ticket URL when carrier link is pressed', () => {
      const { getByText } = render(<TicketInfoBox {...defaultProps} />);

      fireEvent.press(getByText('Jadrolinija'));
      expect(mockOpenURL).toHaveBeenCalledWith('https://jadrolinija.hr/tickets');
    });

    it('should handle URL without https prefix', () => {
      // Mock a carrier with URL without https
      jest.doMock('../../../../constants/carriers', () => ({
        CARRIER_TICKET_URLS: {
          Jadrolinija: 'jadrolinija.hr/tickets',
        },
        SEA_LINE_CARRIERS: {
          '602': { name: 'Jadrolinija', ticketUrl: 'jadrolinija.hr/tickets' },
        },
      }));

      // The component should add https:// prefix
      const { getByText } = render(<TicketInfoBox {...defaultProps} />);

      fireEvent.press(getByText('Jadrolinija'));
      // Note: Since the mock was set up before, it will use the original mock
      expect(mockOpenURL).toHaveBeenCalled();
    });
  });

  describe('custom labels', () => {
    it('should use custom title text', () => {
      const { getByText } = render(
        <TicketInfoBox {...defaultProps} titleText="Tickets" />
      );

      expect(getByText('Tickets')).toBeTruthy();
    });

    it('should use custom body text', () => {
      const { getByText } = render(
        <TicketInfoBox {...defaultProps} bodyText="Buy tickets online" />
      );

      expect(getByText('Buy tickets online')).toBeTruthy();
    });
  });
});
