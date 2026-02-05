/**
 * Convert a Wikimedia Commons URL to a width-limited thumbnail.
 *
 * Input  : https://upload.wikimedia.org/wikipedia/commons/a/ab/File_Name.jpg
 * Output : https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File_Name.jpg/800px-File_Name.jpg
 *
 * Handles edge cases:
 * - Filenames with percent-encoded chars (%28, %2C, %C3%A9 …) — decoded then re-encoded.
 * - Spaces in filenames — normalized to underscores (Wikimedia canonical form).
 * - Already a /thumb/ URL — re-thumbed at the requested width (no double-wrap).
 * - Non-Wikimedia URLs — returned unchanged.
 * - Double-encoded URLs (%2528 etc.) — detected and decoded properly.
 * - Malformed percent-encoding — handled gracefully (try/catch).
 * - Output contains NO raw spaces.
 */

const WIKI_COMMONS = 'https://upload.wikimedia.org/wikipedia/commons/';

/**
 * Safely decode a potentially percent-encoded (or double-encoded) string.
 * Falls back to the original string on malformed input.
 */
function safeDecode(s: string): string {
  let result = s;
  try {
    result = decodeURIComponent(result);
    // Check for double-encoding: if decoded result still has %XX patterns, decode once more
    if (/%[0-9A-Fa-f]{2}/.test(result)) {
      try {
        result = decodeURIComponent(result);
      } catch {
        // Single-encoded with literal % in result — keep the first decode
      }
    }
  } catch {
    // Malformed percent-encoding — use as-is
  }
  return result;
}

export function wikiThumb(url: string, width = 800): string {
  if (!url.startsWith(WIKI_COMMONS)) return url;

  const rest = url.slice(WIKI_COMMONS.length);

  // Already a thumb URL — re-thumb at the requested width
  if (rest.startsWith('thumb/')) {
    const parts = rest.slice('thumb/'.length).split('/');
    parts.pop(); // Remove existing "WIDTHpx-Filename.ext"
    const encodedFilename = parts.pop() ?? '';
    const hashPath = parts.join('/'); // e.g. "a/ab"

    const decoded = safeDecode(encodedFilename);
    const normalized = decoded.replace(/ /g, '_');
    const safeFilename = encodeURIComponent(normalized);

    return `${WIKI_COMMONS}thumb/${hashPath}/${encodedFilename}/${width}px-${safeFilename}`;
  }

  // Original-file URL: split "a/ab/Encoded_Filename.jpg" into hashPath + filename
  const segments = rest.split('/');
  const encodedFilename = segments.pop() ?? '';
  const hashPath = segments.join('/'); // e.g. "a/ab"

  // Decode → normalize spaces → re-encode for a clean, safe URL
  const decoded = safeDecode(encodedFilename);
  const normalized = decoded.replace(/ /g, '_');

  // encodeURIComponent keeps  A-Z a-z 0-9 - _ . ! ~ * ' ( )  unencoded.
  // That matches what Wikimedia expects in path segments.
  const safeFilename = encodeURIComponent(normalized);

  return `${WIKI_COMMONS}thumb/${hashPath}/${encodedFilename}/${width}px-${safeFilename}`;
}
