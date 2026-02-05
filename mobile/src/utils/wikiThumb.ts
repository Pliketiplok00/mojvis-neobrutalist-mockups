/**
 * Convert a Wikimedia Commons original-file URL to a width-limited thumbnail.
 *
 * Input  : https://upload.wikimedia.org/wikipedia/commons/a/ab/File_Name.jpg
 * Output : https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File_Name.jpg/800px-File_Name.jpg
 *
 * Handles edge cases:
 * - Filenames with percent-encoded chars (%28, %2C, %C3%A9 …) — decoded then re-encoded.
 * - Spaces in filenames — normalized to underscores (Wikimedia canonical form).
 * - Already a /thumb/ URL — returned as-is (no double-transform).
 * - Non-Wikimedia URLs — returned unchanged.
 * - Output contains NO raw spaces.
 */

const WIKI_COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/';

export function wikiThumb(url: string, width = 800): string {
  if (!url.startsWith(WIKI_COMMONS)) return url;

  const rest = url.slice(WIKI_COMMONS.length);

  // Already a thumb URL — don't double-transform
  if (rest.startsWith('thumb/')) return url;

  // Split "a/ab/Encoded_Filename.jpg" into hashPath + encoded filename
  const segments = rest.split('/');
  const encodedFilename = segments.pop() ?? '';
  const hashPath = segments.join('/'); // e.g. "a/ab"

  // Decode → normalize spaces → re-encode for a clean, safe URL
  const decoded = decodeURIComponent(encodedFilename);
  const normalized = decoded.replace(/ /g, '_');

  // encodeURIComponent keeps  A-Z a-z 0-9 - _ . ! ~ * ' ( )  unencoded.
  // That matches what Wikimedia expects in path segments.
  const safeFilename = encodeURIComponent(normalized);

  return `${WIKI_COMMONS}thumb/${hashPath}/${encodedFilename}/${width}px-${safeFilename}`;
}
