/**
 * FaunaSpeciesCard Component Tests
 *
 * Tests for fauna species card rendering, language switching,
 * and expand/collapse behavior.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FaunaSpeciesCard } from '../FaunaSpeciesCard';
import type { FaunaSpecies, BilingualText } from '../../../../data/faunaContent';

// Mock wikiThumb utility
jest.mock('../../../../utils/wikiThumb', () => ({
  wikiThumb: (url: string, size?: number) => `${url}?thumb=${size || 400}`,
}));

describe('FaunaSpeciesCard', () => {
  const mockCriticalTag: BilingualText = {
    hr: 'Najviša razina zaštite',
    en: 'Highest level of protection',
  };

  const mockSpecies: FaunaSpecies = {
    id: 'fauna-1',
    title: {
      hr: 'Bjeloglavi sup',
      en: 'Griffon Vulture',
    },
    latin: 'Gyps fulvus',
    description: {
      hr: 'Velika ptica grabljivica koja gnijezdi na liticama otoka Visa.',
      en: 'Large bird of prey nesting on the cliffs of Vis Island.',
    },
    howToRecognize: {
      hr: 'Prepoznatljiv po bijeloj glavi i širokim krilima.',
      en: 'Recognizable by white head and wide wings.',
    },
    habitat: {
      hr: 'Stjenovite litice i planinska područja.',
      en: 'Rocky cliffs and mountainous areas.',
    },
    notes: {
      hr: 'Može letjeti više od 6 sati bez odmora.',
      en: 'Can fly for more than 6 hours without rest.',
    },
    legalBasis: {
      hr: 'Zakon o zaštiti prirode (NN 80/13)',
      en: 'Nature Protection Act (OG 80/13)',
    },
    images: [
      {
        url: 'https://example.com/vulture1.jpg',
        author: 'John Doe',
        license: 'CC BY-SA 4.0',
      },
      {
        url: 'https://example.com/vulture2.jpg',
        author: 'Jane Smith',
        license: 'CC BY 3.0',
      },
    ],
  };

  const mockCriticalSpecies: FaunaSpecies = {
    ...mockSpecies,
    id: 'fauna-2',
    priority: 'critical',
    title: {
      hr: 'Primorska gušterica',
      en: 'Dalmatian Wall Lizard',
    },
    latin: 'Podarcis melisellensis',
  };

  const mockSpeciesNoImages: FaunaSpecies = {
    ...mockSpecies,
    id: 'fauna-3',
    images: [],
  };

  const defaultProps = {
    species: mockSpecies,
    language: 'hr' as const,
    criticalTag: mockCriticalTag,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('collapsed state', () => {
    it('should render species title in Croatian', () => {
      const { getByText } = render(<FaunaSpeciesCard {...defaultProps} />);

      expect(getByText('Bjeloglavi sup')).toBeTruthy();
    });

    it('should render species title in English', () => {
      const { getByText } = render(
        <FaunaSpeciesCard {...defaultProps} language="en" />
      );

      expect(getByText('Griffon Vulture')).toBeTruthy();
    });

    it('should render latin name', () => {
      const { getByText } = render(<FaunaSpeciesCard {...defaultProps} />);

      expect(getByText('Gyps fulvus')).toBeTruthy();
    });

    it('should render chevron-down icon when collapsed', () => {
      const { getByTestId } = render(<FaunaSpeciesCard {...defaultProps} />);

      expect(getByTestId('icon-chevron-down')).toBeTruthy();
    });

    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<FaunaSpeciesCard {...defaultProps} />);

      expect(getByLabelText('Bjeloglavi sup, Gyps fulvus')).toBeTruthy();
    });
  });

  describe('critical species', () => {
    it('should render critical tag for critical species in Croatian', () => {
      const { getByText } = render(
        <FaunaSpeciesCard
          {...defaultProps}
          species={mockCriticalSpecies}
        />
      );

      expect(getByText('Najviša razina zaštite')).toBeTruthy();
    });

    it('should render critical tag for critical species in English', () => {
      const { getByText } = render(
        <FaunaSpeciesCard
          {...defaultProps}
          species={mockCriticalSpecies}
          language="en"
        />
      );

      expect(getByText('Highest level of protection')).toBeTruthy();
    });

    it('should not render critical tag for non-critical species', () => {
      const { queryByText } = render(<FaunaSpeciesCard {...defaultProps} />);

      expect(queryByText('Najviša razina zaštite')).toBeNull();
      expect(queryByText('Highest level of protection')).toBeNull();
    });
  });

  describe('expand/collapse', () => {
    it('should show chevron-up icon when expanded', () => {
      const { getByTestId, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      // Press to expand
      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      expect(getByTestId('icon-chevron-up')).toBeTruthy();
    });

    it('should show description when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      // Description should not be visible initially
      expect(() => getByText('Velika ptica grabljivica koja gnijezdi na liticama otoka Visa.')).toThrow();

      // Expand
      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      // Now description should be visible
      expect(getByText('Velika ptica grabljivica koja gnijezdi na liticama otoka Visa.')).toBeTruthy();
    });

    it('should show howToRecognize section when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      expect(getByText('Kako prepoznati')).toBeTruthy();
      expect(getByText('Prepoznatljiv po bijeloj glavi i širokim krilima.')).toBeTruthy();
    });

    it('should show habitat section when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      expect(getByText('Stanište')).toBeTruthy();
      expect(getByText('Stjenovite litice i planinska područja.')).toBeTruthy();
    });

    it('should show legal basis when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      expect(getByText('Zakon o zaštiti prirode (NN 80/13)')).toBeTruthy();
    });

    it('should collapse when pressed again', () => {
      const { getByTestId, getByLabelText, queryByText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      // Expand
      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));
      expect(getByTestId('icon-chevron-up')).toBeTruthy();

      // Collapse
      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));
      expect(getByTestId('icon-chevron-down')).toBeTruthy();

      // Description should not be visible
      expect(queryByText('Velika ptica grabljivica koja gnijezdi na liticama otoka Visa.')).toBeNull();
    });
  });

  describe('language switching', () => {
    it('should show English section labels when language is en', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} language="en" />
      );

      fireEvent.press(getByLabelText('Griffon Vulture, Gyps fulvus'));

      expect(getByText('How to recognize')).toBeTruthy();
      expect(getByText('Habitat')).toBeTruthy();
    });

    it('should show English description when language is en', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} language="en" />
      );

      fireEvent.press(getByLabelText('Griffon Vulture, Gyps fulvus'));

      expect(getByText('Large bird of prey nesting on the cliffs of Vis Island.')).toBeTruthy();
    });
  });

  describe('no images', () => {
    it('should show placeholder when no images available', () => {
      const { getByText, getByLabelText, getByTestId } = render(
        <FaunaSpeciesCard
          {...defaultProps}
          species={mockSpeciesNoImages}
        />
      );

      // Expand to see gallery
      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      expect(getByText('Slika nije dostupna')).toBeTruthy();
      expect(getByTestId('icon-camera')).toBeTruthy();
    });

    it('should show English placeholder text when language is en', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard
          {...defaultProps}
          species={mockSpeciesNoImages}
          language="en"
        />
      );

      fireEvent.press(getByLabelText('Griffon Vulture, Gyps fulvus'));

      expect(getByText('Image not available')).toBeTruthy();
    });
  });

  describe('image gallery', () => {
    it('should show gallery navigation for multiple images', () => {
      const { getByLabelText, getByTestId } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      // Should have left and right chevrons
      expect(getByTestId('icon-chevron-left')).toBeTruthy();
      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });

    it('should show image attribution when available', () => {
      const { getByText, getByLabelText } = render(
        <FaunaSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Bjeloglavi sup, Gyps fulvus'));

      expect(getByText('John Doe (CC BY-SA 4.0)')).toBeTruthy();
    });
  });
});
