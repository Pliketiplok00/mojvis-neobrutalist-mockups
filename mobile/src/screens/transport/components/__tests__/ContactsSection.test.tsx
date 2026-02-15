/**
 * ContactsSection Component Tests
 *
 * Tests for carrier contact information display.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContactsSection } from '../ContactsSection';
import type { ContactInfo } from '../../../../types/transport';

// Get the mocked Linking from react-native
const mockOpenURL = jest.fn();
jest.spyOn(require('react-native').Linking, 'openURL').mockImplementation(mockOpenURL);

describe('ContactsSection', () => {
  const mockContacts: ContactInfo[] = [
    {
      operator: 'Jadrolinija',
      phone: '+385 21 338 333',
      email: 'info@jadrolinija.hr',
      website: 'www.jadrolinija.hr',
    },
    {
      operator: 'Krilo',
      phone: '+385 21 645 476',
      email: null,
      website: null,
    },
  ];

  const defaultProps = {
    contacts: mockContacts,
    sectionLabel: 'Kontakt',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section label', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      expect(getByText('Kontakt')).toBeTruthy();
    });

    it('should render operator names', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      expect(getByText('Jadrolinija')).toBeTruthy();
      expect(getByText('Krilo')).toBeTruthy();
    });

    it('should render phone number when provided', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      expect(getByText('+385 21 338 333')).toBeTruthy();
    });

    it('should render email when provided', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      expect(getByText('info@jadrolinija.hr')).toBeTruthy();
    });

    it('should render website when provided', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      expect(getByText('www.jadrolinija.hr')).toBeTruthy();
    });

    it('should render phone icon', () => {
      const { getAllByTestId } = render(<ContactsSection {...defaultProps} />);

      const phoneIcons = getAllByTestId('icon-phone');
      expect(phoneIcons.length).toBeGreaterThan(0);
    });

    it('should render mail icon when email exists', () => {
      const { getByTestId } = render(<ContactsSection {...defaultProps} />);

      expect(getByTestId('icon-mail')).toBeTruthy();
    });

    it('should render globe icon when website exists', () => {
      const { getByTestId } = render(<ContactsSection {...defaultProps} />);

      expect(getByTestId('icon-globe')).toBeTruthy();
    });

    it('should return null when contacts array is empty', () => {
      const { queryByText } = render(
        <ContactsSection contacts={[]} sectionLabel="Kontakt" />
      );

      expect(queryByText('Kontakt')).toBeNull();
    });

    it('should return null when contacts is undefined', () => {
      const { queryByText } = render(
        <ContactsSection contacts={undefined as unknown as ContactInfo[]} sectionLabel="Kontakt" />
      );

      expect(queryByText('Kontakt')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should open phone dialer when phone is pressed', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      fireEvent.press(getByText('+385 21 338 333'));
      expect(mockOpenURL).toHaveBeenCalledWith('tel:+385 21 338 333');
    });

    it('should open email client when email is pressed', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      fireEvent.press(getByText('info@jadrolinija.hr'));
      expect(mockOpenURL).toHaveBeenCalledWith('mailto:info@jadrolinija.hr');
    });

    it('should open browser when website is pressed', () => {
      const { getByText } = render(<ContactsSection {...defaultProps} />);

      fireEvent.press(getByText('www.jadrolinija.hr'));
      expect(mockOpenURL).toHaveBeenCalledWith('https://www.jadrolinija.hr');
    });

    it('should handle website with https prefix', () => {
      const contactsWithHttps: ContactInfo[] = [
        {
          operator: 'Test',
          phone: null,
          email: null,
          website: 'https://example.com',
        },
      ];

      const { getByText } = render(
        <ContactsSection contacts={contactsWithHttps} sectionLabel="Kontakt" />
      );

      fireEvent.press(getByText('https://example.com'));
      expect(mockOpenURL).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('custom labels', () => {
    it('should use custom section label', () => {
      const { getByText } = render(
        <ContactsSection {...defaultProps} sectionLabel="Contact Info" />
      );

      expect(getByText('Contact Info')).toBeTruthy();
    });
  });
});
