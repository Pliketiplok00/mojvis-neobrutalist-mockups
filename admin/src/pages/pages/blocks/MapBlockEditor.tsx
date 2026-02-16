/**
 * Map Block Editor
 *
 * Editor for map/location blocks in static pages.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ChangeEvent } from 'react';
import type { MapBlockContent } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';

interface MapBlockEditorProps {
  content: MapBlockContent;
  onContentChange: (content: MapBlockContent) => void;
}

/**
 * Map Block Editor component
 */
export function MapBlockEditor({
  content,
  onContentChange,
}: MapBlockEditorProps) {
  // Parse lat/lng from content, handle both number and string cases
  const latValue = typeof content.lat === 'number' ? content.lat.toString() : (content.lat || '0');
  const lngValue = typeof content.lng === 'number' ? content.lng.toString() : (content.lng || '0');
  const zoomValue = typeof content.zoom === 'number' ? content.zoom : 14;

  // Validation helpers
  const isValidLat = (val: string): boolean => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -90 && num <= 90;
  };

  const isValidLng = (val: string): boolean => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= -180 && num <= 180;
  };

  const isValidZoom = (val: number): boolean => {
    return val >= 1 && val <= 20;
  };

  const handleLatChange = (val: string) => {
    const num = parseFloat(val);
    onContentChange({
      ...content,
      lat: isNaN(num) ? 0 : num,
    });
  };

  const handleLngChange = (val: string) => {
    const num = parseFloat(val);
    onContentChange({
      ...content,
      lng: isNaN(num) ? 0 : num,
    });
  };

  const handleZoomChange = (val: number) => {
    const clampedVal = Math.max(1, Math.min(20, val));
    onContentChange({
      ...content,
      zoom: clampedVal,
    });
  };

  const latError = !isValidLat(latValue);
  const lngError = !isValidLng(lngValue);
  const zoomError = !isValidZoom(zoomValue);

  // Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps?q=${content.lat},${content.lng}`;

  return (
    <div style={styles.blockContent}>
      {/* Coordinates section */}
      <div style={styles.mapCoordinatesSection}>
        <div style={styles.fieldRow}>
          <div style={styles.field}>
            <label style={styles.label}>
              Latitude (lat) *
              {latError && <span style={styles.fieldError}> (vrijednost -90 do 90)</span>}
            </label>
            <input
              type="text"
              value={latValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleLatChange(e.target.value)}
              style={{
                ...styles.input,
                ...(latError ? styles.inputError : {}),
              }}
              placeholder="43.0615"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>
              Longitude (lng) *
              {lngError && <span style={styles.fieldError}> (vrijednost -180 do 180)</span>}
            </label>
            <input
              type="text"
              value={lngValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleLngChange(e.target.value)}
              style={{
                ...styles.input,
                ...(lngError ? styles.inputError : {}),
              }}
              placeholder="16.1915"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>
              Zoom *
              {zoomError && <span style={styles.fieldError}> (vrijednost 1-20)</span>}
            </label>
            <input
              type="number"
              value={zoomValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleZoomChange(parseInt(e.target.value, 10) || 14)}
              style={{
                ...styles.input,
                ...(zoomError ? styles.inputError : {}),
              }}
              min={1}
              max={20}
              placeholder="14"
            />
          </div>
        </div>

        {/* Google Maps link */}
        {content.lat !== 0 || content.lng !== 0 ? (
          <div style={styles.mapLinkContainer}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.mapLink}
            >
              Otvori u Google Maps →
            </a>
          </div>
        ) : null}
      </div>

      {/* Title (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Naslov (HR)</label>
          <input
            type="text"
            value={content.title_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, title_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Naslov lokacije na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Naslov (EN)</label>
          <input
            type="text"
            value={content.title_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, title_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Location title in English"
          />
        </div>
      </div>

      {/* Address (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Adresa (HR)</label>
          <input
            type="text"
            value={content.address_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, address_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Adresa lokacije na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Adresa (EN)</label>
          <input
            type="text"
            value={content.address_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onContentChange({ ...content, address_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Location address in English"
          />
        </div>
      </div>

      {/* Note (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Napomena (HR)</label>
          <textarea
            value={content.note_hr || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onContentChange({ ...content, note_hr: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Dodatne informacije o lokaciji..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Napomena (EN)</label>
          <textarea
            value={content.note_en || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onContentChange({ ...content, note_en: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Additional location information..."
          />
        </div>
      </div>
    </div>
  );
}
