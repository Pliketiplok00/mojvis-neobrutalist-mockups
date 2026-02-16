/**
 * FloraSpeciesCard Component Tests
 *
 * Tests for flora species card rendering, language switching,
 * and expand/collapse behavior.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FloraSpeciesCard } from '../FloraSpeciesCard';
import type { FloraSpecies, BilingualText } from '../../../../data/floraContent';

// Mock wikiThumb utility
jest.mock('../../../../utils/wikiThumb', () => ({
  wikiThumb: (url: string, size?: number) => `${url}?thumb=${size || 400}`,
}));

describe('FloraSpeciesCard', () => {
  const mockCriticalTag: BilingualText = {
    hr: 'Najviša razina zaštite',
    en: 'Highest level of protection',
  };

  const mockSpecies: FloraSpecies = {
    id: 'flora-1',
    title: {
      hr: 'Viška zvončika',
      en: 'Vis Bellflower',
    },
    latin: 'Campanula portenschlagiana',
    description: {
      hr: 'Endemična biljka otoka Visa koja raste na stjenovitim liticama.',
      en: 'Endemic plant of Vis Island growing on rocky cliffs.',
    },
    howToRecognize: {
      hr: 'Prepoznatljiva po plavim zvonastim cvjetovima.',
      en: 'Recognizable by blue bell-shaped flowers.',
    },
    habitat: {
      hr: 'Stjenovita staništa i pukotine u stijenama.',
      en: 'Rocky habitats and crevices in stones.',
    },
    notes: {
      hr: 'Cvjeta od svibnja do srpnja.',
      en: 'Blooms from May to July.',
    },
    legalBasis: {
      hr: 'Zakon o zaštiti prirode (NN 80/13)',
      en: 'Nature Protection Act (OG 80/13)',
    },
    images: [
      {
        url: 'https://example.com/bellflower1.jpg',
        author: 'Ana Horvat',
        license: 'CC BY-SA 4.0',
      },
      {
        url: 'https://example.com/bellflower2.jpg',
        author: 'Marko Babić',
        license: 'CC BY 3.0',
      },
    ],
  };

  const mockCriticalSpecies: FloraSpecies = {
    ...mockSpecies,
    id: 'flora-2',
    priority: 'critical',
    title: {
      hr: 'Viški karanfil',
      en: 'Vis Carnation',
    },
    latin: 'Dianthus vissensis',
  };

  const mockSpeciesNoImages: FloraSpecies = {
    ...mockSpecies,
    id: 'flora-3',
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
      const { getByText } = render(<FloraSpeciesCard {...defaultProps} />);

      expect(getByText('Viška zvončika')).toBeTruthy();
    });

    it('should render species title in English', () => {
      const { getByText } = render(
        <FloraSpeciesCard {...defaultProps} language="en" />
      );

      expect(getByText('Vis Bellflower')).toBeTruthy();
    });

    it('should render latin name', () => {
      const { getByText } = render(<FloraSpeciesCard {...defaultProps} />);

      expect(getByText('Campanula portenschlagiana')).toBeTruthy();
    });

    it('should render chevron-down icon when collapsed', () => {
      const { getByTestId } = render(<FloraSpeciesCard {...defaultProps} />);

      expect(getByTestId('icon-chevron-down')).toBeTruthy();
    });

    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<FloraSpeciesCard {...defaultProps} />);

      expect(getByLabelText('Viška zvončika, Campanula portenschlagiana')).toBeTruthy();
    });
  });

  describe('critical species', () => {
    it('should render critical tag for critical species in Croatian', () => {
      const { getByText } = render(
        <FloraSpeciesCard
          {...defaultProps}
          species={mockCriticalSpecies}
        />
      );

      expect(getByText('Najviša razina zaštite')).toBeTruthy();
    });

    it('should render critical tag for critical species in English', () => {
      const { getByText } = render(
        <FloraSpeciesCard
          {...defaultProps}
          species={mockCriticalSpecies}
          language="en"
        />
      );

      expect(getByText('Highest level of protection')).toBeTruthy();
    });

    it('should not render critical tag for non-critical species', () => {
      const { queryByText } = render(<FloraSpeciesCard {...defaultProps} />);

      expect(queryByText('Najviša razina zaštite')).toBeNull();
      expect(queryByText('Highest level of protection')).toBeNull();
    });
  });

  describe('expand/collapse', () => {
    it('should show chevron-up icon when expanded', () => {
      const { getByTestId, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      // Press to expand
      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      expect(getByTestId('icon-chevron-up')).toBeTruthy();
    });

    it('should show description when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      // Description should not be visible initially
      expect(() => getByText('Endemična biljka otoka Visa koja raste na stjenovitim liticama.')).toThrow();

      // Expand
      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      // Now description should be visible
      expect(getByText('Endemična biljka otoka Visa koja raste na stjenovitim liticama.')).toBeTruthy();
    });

    it('should show howToRecognize section when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      expect(getByText('Kako prepoznati')).toBeTruthy();
      expect(getByText('Prepoznatljiva po plavim zvonastim cvjetovima.')).toBeTruthy();
    });

    it('should show habitat section when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      expect(getByText('Stanište')).toBeTruthy();
      expect(getByText('Stjenovita staništa i pukotine u stijenama.')).toBeTruthy();
    });

    it('should show legal basis when expanded', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      expect(getByText('Zakon o zaštiti prirode (NN 80/13)')).toBeTruthy();
    });

    it('should collapse when pressed again', () => {
      const { getByTestId, getByLabelText, queryByText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      // Expand
      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));
      expect(getByTestId('icon-chevron-up')).toBeTruthy();

      // Collapse
      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));
      expect(getByTestId('icon-chevron-down')).toBeTruthy();

      // Description should not be visible
      expect(queryByText('Endemična biljka otoka Visa koja raste na stjenovitim liticama.')).toBeNull();
    });
  });

  describe('language switching', () => {
    it('should show English section labels when language is en', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} language="en" />
      );

      fireEvent.press(getByLabelText('Vis Bellflower, Campanula portenschlagiana'));

      expect(getByText('How to recognize')).toBeTruthy();
      expect(getByText('Habitat')).toBeTruthy();
    });

    it('should show English description when language is en', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} language="en" />
      );

      fireEvent.press(getByLabelText('Vis Bellflower, Campanula portenschlagiana'));

      expect(getByText('Endemic plant of Vis Island growing on rocky cliffs.')).toBeTruthy();
    });
  });

  describe('no images', () => {
    it('should show placeholder when no images available', () => {
      const { getByText, getByLabelText, getByTestId } = render(
        <FloraSpeciesCard
          {...defaultProps}
          species={mockSpeciesNoImages}
        />
      );

      // Expand to see gallery
      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      expect(getByText('Slika nije dostupna')).toBeTruthy();
      expect(getByTestId('icon-camera')).toBeTruthy();
    });

    it('should show English placeholder text when language is en', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard
          {...defaultProps}
          species={mockSpeciesNoImages}
          language="en"
        />
      );

      fireEvent.press(getByLabelText('Vis Bellflower, Campanula portenschlagiana'));

      expect(getByText('Image not available')).toBeTruthy();
    });
  });

  describe('image gallery', () => {
    it('should show gallery navigation for multiple images', () => {
      const { getByLabelText, getByTestId } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      // Should have left and right chevrons
      expect(getByTestId('icon-chevron-left')).toBeTruthy();
      expect(getByTestId('icon-chevron-right')).toBeTruthy();
    });

    it('should show image attribution when available', () => {
      const { getByText, getByLabelText } = render(
        <FloraSpeciesCard {...defaultProps} />
      );

      fireEvent.press(getByLabelText('Viška zvončika, Campanula portenschlagiana'));

      expect(getByText('Ana Horvat (CC BY-SA 4.0)')).toBeTruthy();
    });
  });
});
