/**
 * Link List Block Editor
 *
 * Editor for link list blocks in static pages.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ChangeEvent } from 'react';
import type { LinkListBlockContent, LinkItem } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';

interface LinkListEditorProps {
  content: LinkListBlockContent;
  onContentChange: (content: LinkListBlockContent) => void;
}

/**
 * Link List Editor component
 */
export function LinkListEditor({
  content,
  onContentChange,
}: LinkListEditorProps) {
  const links = content.links || [];

  const generateId = () => `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddLink = () => {
    const newLink: LinkItem = {
      id: generateId(),
      title_hr: '',
      title_en: '',
      link_type: 'external',
      link_target: '',
    };
    onContentChange({ links: [...links, newLink] });
  };

  const handleRemoveLink = (linkId: string) => {
    onContentChange({ links: links.filter((l) => l.id !== linkId) });
  };

  const handleLinkChange = (linkId: string, field: keyof LinkItem, value: string) => {
    onContentChange({
      links: links.map((l) =>
        l.id === linkId ? { ...l, [field]: value } : l
      ),
    });
  };

  const handleMoveLink = (linkId: string, direction: 'up' | 'down') => {
    const currentIndex = links.findIndex((l) => l.id === linkId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    [newLinks[currentIndex], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[currentIndex]];
    onContentChange({ links: newLinks });
  };

  const isValidUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  return (
    <div style={styles.blockContent}>
      {links.length === 0 && (
        <div style={styles.emptyList}>
          Nema linkova. Dodajte prvi link.
        </div>
      )}

      {links.map((link, index) => {
        const urlError = link.link_target && !isValidUrl(link.link_target);
        const missingHr = !link.title_hr.trim();
        const missingEn = !link.title_en.trim();
        const missingUrl = !link.link_target.trim();

        return (
          <div key={link.id} style={styles.linkItem}>
            <div style={styles.linkItemHeader}>
              <span style={styles.linkItemIndex}>#{index + 1}</span>
              <div style={styles.linkItemActions}>
                <button
                  type="button"
                  style={styles.linkReorderBtn}
                  onClick={() => handleMoveLink(link.id, 'up')}
                  disabled={index === 0}
                  title="Pomakni gore"
                >
                  ↑
                </button>
                <button
                  type="button"
                  style={styles.linkReorderBtn}
                  onClick={() => handleMoveLink(link.id, 'down')}
                  disabled={index === links.length - 1}
                  title="Pomakni dolje"
                >
                  ↓
                </button>
                <button
                  type="button"
                  style={styles.linkRemoveBtn}
                  onClick={() => handleRemoveLink(link.id)}
                  title="Ukloni link"
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Naslov (HR) *
                  {missingHr && <span style={styles.fieldError}> (obavezno)</span>}
                </label>
                <input
                  type="text"
                  value={link.title_hr}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleLinkChange(link.id, 'title_hr', e.target.value)
                  }
                  style={{
                    ...styles.input,
                    ...(missingHr ? styles.inputError : {}),
                  }}
                  placeholder="Naslov linka na hrvatskom"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>
                  Naslov (EN) *
                  {missingEn && <span style={styles.fieldError}> (obavezno)</span>}
                </label>
                <input
                  type="text"
                  value={link.title_en}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleLinkChange(link.id, 'title_en', e.target.value)
                  }
                  style={{
                    ...styles.input,
                    ...(missingEn ? styles.inputError : {}),
                  }}
                  placeholder="Link title in English"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                URL *
                {missingUrl && <span style={styles.fieldError}> (obavezno)</span>}
                {urlError && <span style={styles.fieldError}> (mora poceti s http:// ili https://)</span>}
              </label>
              <input
                type="text"
                value={link.link_target}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleLinkChange(link.id, 'link_target', e.target.value)
                }
                style={{
                  ...styles.input,
                  ...((missingUrl || urlError) ? styles.inputError : {}),
                }}
                placeholder="https://example.com"
              />
            </div>
          </div>
        );
      })}

      <button
        type="button"
        style={styles.addLinkButton}
        onClick={handleAddLink}
      >
        + Dodaj link
      </button>
    </div>
  );
}
