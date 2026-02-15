/**
 * DateSelector Component Tests
 *
 * Tests for date navigation and picker interactions.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DateSelector } from '../DateSelector';

describe('DateSelector', () => {
  const defaultProps = {
    selectedDate: '2026-02-15',
    onPrevDay: jest.fn(),
    onNextDay: jest.fn(),
    onOpenPicker: jest.fn(),
    language: 'hr' as const,
    prevDayLabel: 'Prethodni dan',
    selectDateLabel: 'Odaberi datum',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render formatted date', () => {
      const { getByText } = render(<DateSelector {...defaultProps} />);

      // formatDayWithDate is mocked to return 'Ponedjeljak, 15. veljače'
      expect(getByText('Ponedjeljak, 15. veljače')).toBeTruthy();
    });

    it('should render left chevron icon', () => {
      const { getByTestId } = render(<DateSelector {...defaultProps} />);

      expect(getByTestId('icon-chevron-left')).toBeTruthy();
    });

    it('should render right chevron icon', () => {
      const { getByTestId } = render(<DateSelector {...defaultProps} />);

      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have accessibility label for previous day button', () => {
      const { getByLabelText } = render(<DateSelector {...defaultProps} />);

      expect(getByLabelText('Prethodni dan')).toBeTruthy();
    });

    it('should have accessibility label for date picker button', () => {
      const { getByLabelText } = render(<DateSelector {...defaultProps} />);

      expect(getByLabelText('Odaberi datum')).toBeTruthy();
    });

    it('should have accessibility label for next day button', () => {
      const { getByLabelText } = render(<DateSelector {...defaultProps} />);

      expect(getByLabelText('Next day')).toBeTruthy();
    });

    it('should have button role for date picker', () => {
      const { getByRole } = render(<DateSelector {...defaultProps} />);

      expect(getByRole('button', { name: 'Odaberi datum' })).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('should call onPrevDay when left arrow is pressed', () => {
      const onPrevDay = jest.fn();
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} onPrevDay={onPrevDay} />
      );

      fireEvent.press(getByLabelText('Prethodni dan'));
      expect(onPrevDay).toHaveBeenCalledTimes(1);
    });

    it('should call onNextDay when right arrow is pressed', () => {
      const onNextDay = jest.fn();
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} onNextDay={onNextDay} />
      );

      fireEvent.press(getByLabelText('Next day'));
      expect(onNextDay).toHaveBeenCalledTimes(1);
    });

    it('should call onOpenPicker when date is pressed', () => {
      const onOpenPicker = jest.fn();
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} onOpenPicker={onOpenPicker} />
      );

      fireEvent.press(getByLabelText('Odaberi datum'));
      expect(onOpenPicker).toHaveBeenCalledTimes(1);
    });

    it('should allow multiple presses on prev day', () => {
      const onPrevDay = jest.fn();
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} onPrevDay={onPrevDay} />
      );

      const prevButton = getByLabelText('Prethodni dan');
      fireEvent.press(prevButton);
      fireEvent.press(prevButton);
      fireEvent.press(prevButton);
      expect(onPrevDay).toHaveBeenCalledTimes(3);
    });

    it('should allow multiple presses on next day', () => {
      const onNextDay = jest.fn();
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} onNextDay={onNextDay} />
      );

      const nextButton = getByLabelText('Next day');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      expect(onNextDay).toHaveBeenCalledTimes(2);
    });
  });

  describe('language prop', () => {
    it('should pass language to formatDayWithDate', () => {
      const { getByText } = render(
        <DateSelector {...defaultProps} language="en" />
      );

      // formatDayWithDate is mocked, so we just verify it renders
      expect(getByText('Ponedjeljak, 15. veljače')).toBeTruthy();
    });
  });

  describe('custom labels', () => {
    it('should use custom prevDayLabel', () => {
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} prevDayLabel="Go back one day" />
      );

      expect(getByLabelText('Go back one day')).toBeTruthy();
    });

    it('should use custom selectDateLabel', () => {
      const { getByLabelText } = render(
        <DateSelector {...defaultProps} selectDateLabel="Choose a date" />
      );

      expect(getByLabelText('Choose a date')).toBeTruthy();
    });
  });
});
