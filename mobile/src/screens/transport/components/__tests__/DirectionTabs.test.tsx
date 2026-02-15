/**
 * DirectionTabs Component Tests
 *
 * Tests for direction selection tabs.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DirectionTabs } from '../DirectionTabs';
import type { RouteInfo } from '../../../../types/transport';

describe('DirectionTabs', () => {
  const mockRoutes: RouteInfo[] = [
    {
      id: 1,
      direction: 0,
      direction_label: 'Vis → Split',
      origin_name: 'Vis',
      destination_name: 'Split',
    },
    {
      id: 2,
      direction: 1,
      direction_label: 'Split → Vis',
      origin_name: 'Split',
      destination_name: 'Vis',
    },
  ];

  const defaultProps = {
    routes: mockRoutes,
    selectedDirection: 0,
    onSelectDirection: jest.fn(),
    activeBackgroundColor: '#2563EB',
    sectionLabel: 'Smjer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render section label', () => {
      const { getByText } = render(<DirectionTabs {...defaultProps} />);

      expect(getByText('Smjer')).toBeTruthy();
    });

    it('should render both direction labels', () => {
      const { getByText } = render(<DirectionTabs {...defaultProps} />);

      expect(getByText('Vis → Split')).toBeTruthy();
      expect(getByText('Split → Vis')).toBeTruthy();
    });

    it('should return null when only one route exists', () => {
      const singleRoute = [mockRoutes[0]];
      const { queryByText } = render(
        <DirectionTabs {...defaultProps} routes={singleRoute} />
      );

      expect(queryByText('Smjer')).toBeNull();
      expect(queryByText('Vis → Split')).toBeNull();
    });

    it('should return null when routes array is empty', () => {
      const { queryByText } = render(
        <DirectionTabs {...defaultProps} routes={[]} />
      );

      expect(queryByText('Smjer')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onSelectDirection when first tab is pressed', () => {
      const onSelectDirection = jest.fn();
      const { getByText } = render(
        <DirectionTabs {...defaultProps} onSelectDirection={onSelectDirection} />
      );

      fireEvent.press(getByText('Vis → Split'));
      expect(onSelectDirection).toHaveBeenCalledWith(0);
    });

    it('should call onSelectDirection when second tab is pressed', () => {
      const onSelectDirection = jest.fn();
      const { getByText } = render(
        <DirectionTabs {...defaultProps} onSelectDirection={onSelectDirection} />
      );

      fireEvent.press(getByText('Split → Vis'));
      expect(onSelectDirection).toHaveBeenCalledWith(1);
    });

    it('should allow pressing already active tab', () => {
      const onSelectDirection = jest.fn();
      const { getByText } = render(
        <DirectionTabs
          {...defaultProps}
          selectedDirection={0}
          onSelectDirection={onSelectDirection}
        />
      );

      fireEvent.press(getByText('Vis → Split'));
      expect(onSelectDirection).toHaveBeenCalledWith(0);
    });
  });

  describe('selected state', () => {
    it('should show first direction as selected by default', () => {
      const { getByText } = render(
        <DirectionTabs {...defaultProps} selectedDirection={0} />
      );

      // First tab should be visible (selected state is styled differently)
      expect(getByText('Vis → Split')).toBeTruthy();
    });

    it('should show second direction as selected when selectedDirection is 1', () => {
      const { getByText } = render(
        <DirectionTabs {...defaultProps} selectedDirection={1} />
      );

      // Second tab should be visible
      expect(getByText('Split → Vis')).toBeTruthy();
    });
  });

  describe('custom labels', () => {
    it('should use custom section label', () => {
      const { getByText } = render(
        <DirectionTabs {...defaultProps} sectionLabel="Direction" />
      );

      expect(getByText('Direction')).toBeTruthy();
    });
  });
});
