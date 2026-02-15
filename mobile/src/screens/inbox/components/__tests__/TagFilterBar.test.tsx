/**
 * TagFilterBar Component Tests
 *
 * Tests for tag chip rendering and selection.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TagFilterBar } from '../TagFilterBar';
import type { InboxTag } from '../../../../types/inbox';

describe('TagFilterBar', () => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'inbox.tags.hitno': 'Hitno',
      'inbox.tags.promet': 'Promet',
      'inbox.tags.kultura': 'Kultura',
      'inbox.tags.opcenito': 'Općenito',
      'inbox.tags.vis': 'Vis',
      'inbox.tags.komiza': 'Komiža',
    };
    return translations[key] || key;
  };

  const allTags: InboxTag[] = ['hitno', 'promet', 'kultura', 'opcenito', 'vis', 'komiza'];

  const defaultProps = {
    availableTags: allTags,
    selectedTags: [] as InboxTag[],
    onToggleTag: jest.fn(),
    t: mockT,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all available tags', () => {
      const { getByText } = render(<TagFilterBar {...defaultProps} />);

      expect(getByText('Hitno')).toBeTruthy();
      expect(getByText('Promet')).toBeTruthy();
      expect(getByText('Kultura')).toBeTruthy();
      expect(getByText('Općenito')).toBeTruthy();
      expect(getByText('Vis')).toBeTruthy();
      expect(getByText('Komiža')).toBeTruthy();
    });

    it('should render subset of tags when not all available', () => {
      const { getByText, queryByText } = render(
        <TagFilterBar {...defaultProps} availableTags={['hitno', 'promet']} />
      );

      expect(getByText('Hitno')).toBeTruthy();
      expect(getByText('Promet')).toBeTruthy();
      expect(queryByText('Kultura')).toBeNull();
    });

    it('should render empty when no tags available', () => {
      const { queryByText } = render(
        <TagFilterBar {...defaultProps} availableTags={[]} />
      );

      expect(queryByText('Hitno')).toBeNull();
    });
  });

  describe('selection state', () => {
    it('should mark selected tags with accessibility state', () => {
      const { getByRole } = render(
        <TagFilterBar {...defaultProps} selectedTags={['hitno']} />
      );

      // Chip has accessibilityRole="button" and accessibilityState
      const urgentChip = getByRole('button', { name: 'Hitno' });
      expect(urgentChip.props.accessibilityState.selected).toBe(true);
    });

    it('should mark unselected tags as not selected', () => {
      const { getByRole } = render(
        <TagFilterBar {...defaultProps} selectedTags={['hitno']} />
      );

      const transportChip = getByRole('button', { name: 'Promet' });
      expect(transportChip.props.accessibilityState.selected).toBe(false);
    });

    it('should handle multiple selected tags', () => {
      const { getByRole } = render(
        <TagFilterBar {...defaultProps} selectedTags={['hitno', 'kultura']} />
      );

      const urgentChip = getByRole('button', { name: 'Hitno' });
      const cultureChip = getByRole('button', { name: 'Kultura' });

      expect(urgentChip.props.accessibilityState.selected).toBe(true);
      expect(cultureChip.props.accessibilityState.selected).toBe(true);
    });
  });

  describe('interactions', () => {
    it('should call onToggleTag when chip is pressed', () => {
      const onToggleTag = jest.fn();
      const { getByText } = render(
        <TagFilterBar {...defaultProps} onToggleTag={onToggleTag} />
      );

      fireEvent.press(getByText('Hitno'));
      expect(onToggleTag).toHaveBeenCalledWith('hitno');
      expect(onToggleTag).toHaveBeenCalledTimes(1);
    });

    it('should call onToggleTag with correct tag for each chip', () => {
      const onToggleTag = jest.fn();
      const { getByText } = render(
        <TagFilterBar {...defaultProps} onToggleTag={onToggleTag} />
      );

      fireEvent.press(getByText('Promet'));
      expect(onToggleTag).toHaveBeenCalledWith('promet');

      fireEvent.press(getByText('Kultura'));
      expect(onToggleTag).toHaveBeenCalledWith('kultura');

      expect(onToggleTag).toHaveBeenCalledTimes(2);
    });

    it('should toggle already selected tag when pressed', () => {
      const onToggleTag = jest.fn();
      const { getByText } = render(
        <TagFilterBar
          {...defaultProps}
          selectedTags={['hitno']}
          onToggleTag={onToggleTag}
        />
      );

      fireEvent.press(getByText('Hitno'));
      expect(onToggleTag).toHaveBeenCalledWith('hitno');
    });
  });

  describe('translation', () => {
    it('should use t function for tag labels', () => {
      const customT = jest.fn((key: string) => `translated_${key}`);
      render(<TagFilterBar {...defaultProps} t={customT} availableTags={['hitno']} />);

      expect(customT).toHaveBeenCalledWith('inbox.tags.hitno');
    });
  });
});
