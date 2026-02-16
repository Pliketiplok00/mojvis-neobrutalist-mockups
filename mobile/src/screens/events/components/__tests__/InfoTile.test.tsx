/**
 * InfoTile Component Tests
 *
 * Tests for event info tile rendering.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoTile } from '../InfoTile';

describe('InfoTile', () => {
  const defaultProps = {
    icon: 'clock' as const,
    value: 'Petak, 15. ožujka 2026.',
  };

  describe('rendering', () => {
    it('should render primary value', () => {
      const { getByText } = render(<InfoTile {...defaultProps} />);

      expect(getByText('Petak, 15. ožujka 2026.')).toBeTruthy();
    });

    it('should render clock icon', () => {
      const { getByTestId } = render(<InfoTile {...defaultProps} />);

      expect(getByTestId('icon-clock')).toBeTruthy();
    });

    it('should render map-pin icon', () => {
      const { getByTestId } = render(
        <InfoTile icon="map-pin" value="Kino Vis" />
      );

      expect(getByTestId('icon-map-pin')).toBeTruthy();
    });

    it('should render user icon', () => {
      const { getByTestId } = render(
        <InfoTile icon="user" value="Turistička zajednica" />
      );

      expect(getByTestId('icon-user')).toBeTruthy();
    });
  });

  describe('secondary value', () => {
    it('should render secondary value when provided', () => {
      const { getByText } = render(
        <InfoTile
          {...defaultProps}
          secondaryValue="19:00 - 23:00"
        />
      );

      expect(getByText('19:00 - 23:00')).toBeTruthy();
    });

    it('should not render secondary value when not provided', () => {
      const { queryByText } = render(<InfoTile {...defaultProps} />);

      // Should not have any time range text
      expect(queryByText('19:00')).toBeNull();
    });

    it('should render both primary and secondary values together', () => {
      const { getByText } = render(
        <InfoTile
          icon="clock"
          value="Petak, 15. ožujka"
          secondaryValue="Cijeli dan"
        />
      );

      expect(getByText('Petak, 15. ožujka')).toBeTruthy();
      expect(getByText('Cijeli dan')).toBeTruthy();
    });
  });

  describe('icon variations', () => {
    it('should render correctly for date/time info', () => {
      const { getByTestId, getByText } = render(
        <InfoTile
          icon="clock"
          value="Nedjelja, 20. srpnja 2026."
          secondaryValue="21:00 - 00:00"
        />
      );

      expect(getByTestId('icon-clock')).toBeTruthy();
      expect(getByText('Nedjelja, 20. srpnja 2026.')).toBeTruthy();
      expect(getByText('21:00 - 00:00')).toBeTruthy();
    });

    it('should render correctly for location info', () => {
      const { getByTestId, getByText } = render(
        <InfoTile icon="map-pin" value="Riva Vis, centar grada" />
      );

      expect(getByTestId('icon-map-pin')).toBeTruthy();
      expect(getByText('Riva Vis, centar grada')).toBeTruthy();
    });

    it('should render correctly for organizer info', () => {
      const { getByTestId, getByText } = render(
        <InfoTile icon="user" value="Grad Vis" />
      );

      expect(getByTestId('icon-user')).toBeTruthy();
      expect(getByText('Grad Vis')).toBeTruthy();
    });
  });

  describe('long text handling', () => {
    it('should handle long value text', () => {
      const longValue = 'Ovo je jako jako jako jako jako dugačka lokacija koja ima puno teksta i trebala bi se prikazati u cijelosti';

      const { getByText } = render(
        <InfoTile icon="map-pin" value={longValue} />
      );

      expect(getByText(longValue)).toBeTruthy();
    });

    it('should handle long secondary value text', () => {
      const longSecondary = 'Od 19:00 do 23:00 s mogućnošću produljenja do ponoći ako vrijeme dozvoljava';

      const { getByText } = render(
        <InfoTile
          icon="clock"
          value="Petak"
          secondaryValue={longSecondary}
        />
      );

      expect(getByText(longSecondary)).toBeTruthy();
    });
  });

  describe('all-day events', () => {
    it('should display all-day text in secondary value', () => {
      const { getByText } = render(
        <InfoTile
          icon="clock"
          value="Subota, 15. kolovoza"
          secondaryValue="Cijeli dan"
        />
      );

      expect(getByText('Cijeli dan')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should render all content for screen readers', () => {
      const { getByText, getByTestId } = render(
        <InfoTile
          icon="clock"
          value="Datum događaja"
          secondaryValue="Vrijeme događaja"
        />
      );

      // All elements should be present and accessible
      expect(getByTestId('icon-clock')).toBeTruthy();
      expect(getByText('Datum događaja')).toBeTruthy();
      expect(getByText('Vrijeme događaja')).toBeTruthy();
    });
  });
});
