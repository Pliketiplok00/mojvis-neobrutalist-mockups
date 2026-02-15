/**
 * DatePickerModal Component Tests
 *
 * Tests for platform-specific date picker modal.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { DatePickerModal } from '../DatePickerModal';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ value, onChange, mode, display }: {
      value: Date;
      onChange: (event: { type: string }, date?: Date) => void;
      mode: string;
      display: string;
    }) => {
      return React.createElement(View, { testID: 'date-picker' }, [
        React.createElement(Text, { key: 'mode', testID: 'picker-mode' }, mode),
        React.createElement(Text, { key: 'display', testID: 'picker-display' }, display),
        React.createElement(Text, { key: 'value', testID: 'picker-value' }, value.toISOString()),
      ]);
    },
  };
});

describe('DatePickerModal', () => {
  const mockDate = new Date('2026-02-15T12:00:00Z');
  const mockOnDateChange = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    isVisible: true,
    selectedDate: mockDate,
    onDateChange: mockOnDateChange,
    onClose: mockOnClose,
    cancelText: 'Odustani',
    doneText: 'Gotovo',
    titleText: 'Odaberi datum',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS rendering', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('should render modal when visible', () => {
      const { getByText, getByTestId } = render(<DatePickerModal {...defaultProps} />);

      expect(getByText('Odustani')).toBeTruthy();
      expect(getByText('Gotovo')).toBeTruthy();
      expect(getByText('Odaberi datum')).toBeTruthy();
      expect(getByTestId('date-picker')).toBeTruthy();
    });

    it('should hide modal when not visible on iOS', () => {
      const { queryByTestId } = render(
        <DatePickerModal {...defaultProps} isVisible={false} />
      );

      // Modal with visible={false} doesn't render children in test environment
      expect(queryByTestId('date-picker')).toBeNull();
    });

    it('should render spinner display mode on iOS', () => {
      const { getByTestId } = render(<DatePickerModal {...defaultProps} />);

      expect(getByTestId('picker-display').children[0]).toBe('spinner');
    });

    it('should call onClose when cancel button is pressed', () => {
      const { getByText } = render(<DatePickerModal {...defaultProps} />);

      fireEvent.press(getByText('Odustani'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when done button is pressed', () => {
      const { getByText } = render(<DatePickerModal {...defaultProps} />);

      fireEvent.press(getByText('Gotovo'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should render date picker with date mode', () => {
      const { getByTestId } = render(<DatePickerModal {...defaultProps} />);

      expect(getByTestId('picker-mode').children[0]).toBe('date');
    });
  });

  describe('Android rendering', () => {
    beforeAll(() => {
      Platform.OS = 'android';
    });

    afterAll(() => {
      Platform.OS = 'ios'; // Reset to default
    });

    it('should render picker directly when visible on Android', () => {
      const { getByTestId, queryByText } = render(<DatePickerModal {...defaultProps} />);

      expect(getByTestId('date-picker')).toBeTruthy();
      // No modal header on Android
      expect(queryByText('Odustani')).toBeNull();
      expect(queryByText('Gotovo')).toBeNull();
    });

    it('should return null when not visible on Android', () => {
      const { queryByTestId } = render(
        <DatePickerModal {...defaultProps} isVisible={false} />
      );

      expect(queryByTestId('date-picker')).toBeNull();
    });

    it('should render default display mode on Android', () => {
      const { getByTestId } = render(<DatePickerModal {...defaultProps} />);

      expect(getByTestId('picker-display').children[0]).toBe('default');
    });
  });

  describe('custom labels', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('should use custom cancel text', () => {
      const { getByText } = render(
        <DatePickerModal {...defaultProps} cancelText="Cancel" />
      );

      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should use custom done text', () => {
      const { getByText } = render(
        <DatePickerModal {...defaultProps} doneText="Done" />
      );

      expect(getByText('Done')).toBeTruthy();
    });

    it('should use custom title text', () => {
      const { getByText } = render(
        <DatePickerModal {...defaultProps} titleText="Select Date" />
      );

      expect(getByText('Select Date')).toBeTruthy();
    });
  });
});
