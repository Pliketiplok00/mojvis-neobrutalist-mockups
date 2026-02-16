/**
 * Media Block Editor
 *
 * Editor for media (image/video) blocks in static pages.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ChangeEvent } from 'react';
import type { MediaBlockContent } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';

interface MediaBlockEditorProps {
  content: MediaBlockContent;
  onContentChange: (content: MediaBlockContent) => void;
}

/**
 * Media Block Editor component
 */
export function MediaBlockEditor({
  content,
  onContentChange,
}: MediaBlockEditorProps) {
  const isValidUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const isImageUrl = (url: string) => {
    const lower = url.toLowerCase();
    return lower.endsWith('.png') || lower.endsWith('.jpg') ||
           lower.endsWith('.jpeg') || lower.endsWith('.webp') ||
           lower.endsWith('.gif');
  };

  const missingUrl = !content.url.trim();
  const urlError = content.url.trim() && !isValidUrl(content.url);
  const showImagePreview = content.url && isValidUrl(content.url) && isImageUrl(content.url);

  return (
    <div style={styles.blockContent}>
      {/* URL (required) */}
      <div style={styles.field}>
        <label style={styles.label}>
          URL medija *
          {missingUrl && <span style={styles.fieldError}> (obavezno)</span>}
          {urlError && <span style={styles.fieldError}> (mora poceti s http:// ili https://)</span>}
        </label>
        <input
          type="text"
          value={content.url}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onContentChange({ ...content, url: e.target.value })
          }
          style={{
            ...styles.input,
            ...((missingUrl || urlError) ? styles.inputError : {}),
          }}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Preview */}
      {content.url && isValidUrl(content.url) && (
        <div style={styles.mediaPreview}>
          {showImagePreview ? (
            <img
              src={content.url}
              alt={content.alt_hr || 'Preview'}
              style={styles.mediaPreviewImage}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div style={styles.mediaPreviewLink}>
              <span style={styles.mediaPreviewLabel}>Link preview:</span>
              <span style={styles.mediaPreviewUrl}>{content.url}</span>
            </div>
          )}
        </div>
      )}

      {/* Alt text (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Alt tekst (HR)</label>
          <input
            type="text"
            value={content.alt_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, alt_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Opis slike za pristupacnost"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Alt tekst (EN)</label>
          <input
            type="text"
            value={content.alt_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, alt_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Image description for accessibility"
          />
        </div>
      </div>

      {/* Caption (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Potpis (HR)</label>
          <input
            type="text"
            value={content.caption_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, caption_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Potpis ispod slike"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Potpis (EN)</label>
          <input
            type="text"
            value={content.caption_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, caption_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Caption below image"
          />
        </div>
      </div>

      {/* Credit (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Kredit (HR)</label>
          <input
            type="text"
            value={content.credit_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, credit_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Foto: Geopark Vis"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Kredit (EN)</label>
          <input
            type="text"
            value={content.credit_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, credit_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Photo: Geopark Vis"
          />
        </div>
      </div>
    </div>
  );
}
