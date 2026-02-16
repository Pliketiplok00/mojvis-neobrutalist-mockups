/**
 * CategoryGrid Component Tests
 *
 * Tests for category grid rendering and navigation.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryGrid } from '../CategoryGrid';
import type { CategoryItem } from '../CategoryGrid';

describe('CategoryGrid', () => {
  const mockCategories: CategoryItem[] = [
    {
      key: 'events',
      icon: 'calendar',
      backgroundColor: '#FFE500',
      textColor: '#1A1A1A',
      route: 'Events',
    },
    {
      key: 'transport',
      icon: 'ship',
      backgroundColor: '#4ECDC4',
      textColor: '#1A1A1A',
      route: 'TransportHub',
    },
    {
      key: 'info',
      icon: 'info',
      backgroundColor: '#FF6B6B',
      textColor: '#1A1A1A',
      route: 'StaticPage',
    },
    {
      key: 'contacts',
      icon: 'phone',
      backgroundColor: '#95E1D3',
      textColor: '#1A1A1A',
      route: 'StaticPage',
    },
  ];

  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'home.categoryLabels.events': 'Događaji',
      'home.categoryLabels.transport': 'Transport',
      'home.categoryLabels.info': 'Informacije',
      'home.categoryLabels.contacts': 'Kontakti',
    };
    return translations[key] || key;
  };

  const mockOnCategoryPress = jest.fn();

  const defaultProps = {
    categories: mockCategories,
    sectionTitle: 'BRZI PRISTUP',
    onCategoryPress: mockOnCategoryPress,
    t: mockT,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section title', () => {
      const { getByText } = render(<CategoryGrid {...defaultProps} />);

      expect(getByText('BRZI PRISTUP')).toBeTruthy();
    });

    it('should render all category labels', () => {
      const { getByText } = render(<CategoryGrid {...defaultProps} />);

      expect(getByText('DOGAĐAJI')).toBeTruthy();
      expect(getByText('TRANSPORT')).toBeTruthy();
      expect(getByText('INFORMACIJE')).toBeTruthy();
      expect(getByText('KONTAKTI')).toBeTruthy();
    });

    it('should render calendar icon for events', () => {
      const { getByTestId } = render(<CategoryGrid {...defaultProps} />);

      expect(getByTestId('icon-calendar')).toBeTruthy();
    });

    it('should render ship icon for transport', () => {
      const { getByTestId } = render(<CategoryGrid {...defaultProps} />);

      expect(getByTestId('icon-ship')).toBeTruthy();
    });

    it('should render info icon for info', () => {
      const { getByTestId } = render(<CategoryGrid {...defaultProps} />);

      expect(getByTestId('icon-info')).toBeTruthy();
    });

    it('should render phone icon for contacts', () => {
      const { getByTestId } = render(<CategoryGrid {...defaultProps} />);

      expect(getByTestId('icon-phone')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('should call onCategoryPress with category when events tile is pressed', () => {
      const { getByText } = render(<CategoryGrid {...defaultProps} />);

      fireEvent.press(getByText('DOGAĐAJI'));
      expect(mockOnCategoryPress).toHaveBeenCalledWith(mockCategories[0]);
    });

    it('should call onCategoryPress with category when transport tile is pressed', () => {
      const { getByText } = render(<CategoryGrid {...defaultProps} />);

      fireEvent.press(getByText('TRANSPORT'));
      expect(mockOnCategoryPress).toHaveBeenCalledWith(mockCategories[1]);
    });

    it('should call onCategoryPress with category when info tile is pressed', () => {
      const { getByText } = render(<CategoryGrid {...defaultProps} />);

      fireEvent.press(getByText('INFORMACIJE'));
      expect(mockOnCategoryPress).toHaveBeenCalledWith(mockCategories[2]);
    });

    it('should call onCategoryPress with category when contacts tile is pressed', () => {
      const { getByText } = render(<CategoryGrid {...defaultProps} />);

      fireEvent.press(getByText('KONTAKTI'));
      expect(mockOnCategoryPress).toHaveBeenCalledWith(mockCategories[3]);
    });
  });

  describe('translation', () => {
    it('should use translation function for category labels', () => {
      const customT = jest.fn((key: string) => `translated_${key}`);

      render(
        <CategoryGrid
          {...defaultProps}
          t={customT}
        />
      );

      expect(customT).toHaveBeenCalledWith('home.categoryLabels.events');
      expect(customT).toHaveBeenCalledWith('home.categoryLabels.transport');
      expect(customT).toHaveBeenCalledWith('home.categoryLabels.info');
      expect(customT).toHaveBeenCalledWith('home.categoryLabels.contacts');
    });

    it('should uppercase category labels', () => {
      const lowerCaseT = (key: string) => {
        const translations: Record<string, string> = {
          'home.categoryLabels.events': 'events',
        };
        return translations[key] || key;
      };

      const { getByText } = render(
        <CategoryGrid
          {...defaultProps}
          categories={[mockCategories[0]]}
          t={lowerCaseT}
        />
      );

      expect(getByText('EVENTS')).toBeTruthy();
    });
  });

  describe('empty state', () => {
    it('should render section title even with no categories', () => {
      const { getByText } = render(
        <CategoryGrid {...defaultProps} categories={[]} />
      );

      expect(getByText('BRZI PRISTUP')).toBeTruthy();
    });
  });

  describe('single category', () => {
    it('should render correctly with single category', () => {
      const { getByText, getByTestId } = render(
        <CategoryGrid
          {...defaultProps}
          categories={[mockCategories[0]]}
        />
      );

      expect(getByText('DOGAĐAJI')).toBeTruthy();
      expect(getByTestId('icon-calendar')).toBeTruthy();
    });
  });
});
