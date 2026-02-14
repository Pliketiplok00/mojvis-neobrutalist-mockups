/**
 * Wiki Thumbnail Utility Tests
 *
 * Tests for converting Wikimedia Commons URLs to width-limited thumbnails.
 */

import { wikiThumb } from '../wikiThumb';

describe('wikiThumb', () => {
  const WIKI_COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/';

  describe('basic functionality', () => {
    it('should convert commons URL to thumbnail URL', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('/thumb/');
      expect(result).toContain('800px-');
      expect(result).toContain('Example.jpg');
    });

    it('should use default width of 800', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.jpg`;
      const result = wikiThumb(input);

      expect(result).toContain('800px-');
    });

    it('should accept custom width', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.jpg`;
      const result = wikiThumb(input, 400);

      expect(result).toContain('400px-');
    });
  });

  describe('non-wikimedia URLs', () => {
    it('should return non-wikimedia URLs unchanged', () => {
      const input = 'https://example.com/image.jpg';
      expect(wikiThumb(input)).toBe(input);
    });

    it('should return empty string unchanged', () => {
      expect(wikiThumb('')).toBe('');
    });

    it('should return other wikimedia domains unchanged', () => {
      const input = 'https://upload.wikimedia.org/wikipedia/en/a/ab/File.jpg';
      expect(wikiThumb(input)).toBe(input);
    });
  });

  describe('already-thumbnail URLs', () => {
    it('should re-thumbnail with new width', () => {
      const input = `${WIKI_COMMONS}thumb/a/ab/Example.jpg/400px-Example.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('800px-');
      expect(result).not.toContain('400px-');
    });

    it('should handle nested thumb paths correctly', () => {
      const input = `${WIKI_COMMONS}thumb/a/ab/Example.jpg/200px-Example.jpg`;
      const result = wikiThumb(input, 600);

      expect(result).toContain('/thumb/a/ab/');
      expect(result).toContain('600px-');
    });
  });

  describe('URL encoding edge cases', () => {
    it('should handle spaces in filenames (converted to underscores in output)', () => {
      const input = `${WIKI_COMMONS}a/ab/File%20Name.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('800px-');
      // The output filename should have underscores instead of spaces
      expect(result).toContain('800px-File_Name.jpg');
    });

    it('should handle percent-encoded characters', () => {
      const input = `${WIKI_COMMONS}a/ab/File%28test%29.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('/thumb/');
      expect(result).toContain('800px-');
    });

    it('should handle unicode characters', () => {
      const input = `${WIKI_COMMONS}a/ab/Caf%C3%A9.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('/thumb/');
      expect(result).toContain('800px-');
    });
  });

  describe('various file extensions', () => {
    it('should handle PNG files', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.png`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('800px-Example.png');
    });

    it('should handle SVG files', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.svg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('800px-Example.svg');
    });

    it('should handle JPEG files', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.jpeg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('800px-Example.jpeg');
    });
  });

  describe('hash path preservation', () => {
    it('should preserve single-letter hash path', () => {
      const input = `${WIKI_COMMONS}a/ab/Example.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('/thumb/a/ab/');
    });

    it('should preserve multi-character hash path', () => {
      const input = `${WIKI_COMMONS}f/f5/Example.jpg`;
      const result = wikiThumb(input, 800);

      expect(result).toContain('/thumb/f/f5/');
    });
  });
});
