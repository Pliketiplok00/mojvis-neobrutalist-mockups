/**
 * Block Content Editor
 *
 * Switch dispatcher for block type-specific editors.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ChangeEvent } from 'react';
import type {
  ContentBlock,
  TextBlockContent,
  HighlightBlockContent,
  LinkListBlockContent,
  ContactBlockContent,
  CardListBlockContent,
  MediaBlockContent,
  MapBlockContent,
} from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';
import { ContactBlockEditor } from './ContactBlockEditor';
import { CardListEditor } from './CardBlockEditor';
import { MapBlockEditor } from './MapBlockEditor';
import { LinkListEditor } from './LinkListBlockEditor';
import { MediaBlockEditor } from './MediaBlockEditor';

interface BlockContentEditorProps {
  block: ContentBlock;
  onContentChange: (content: ContentBlock['content']) => void;
}

/**
 * Content editor for each block type
 */
export function BlockContentEditor({
  block,
  onContentChange,
}: BlockContentEditorProps) {
  switch (block.type) {
    case 'text': {
      const content = block.content as TextBlockContent;
      return (
        <div style={styles.blockContent}>
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
              />
            </div>
          </div>
          <div style={styles.fieldRow}>
            <div style={styles.field}>
              <label style={styles.label}>Tekst (HR) *</label>
              <textarea
                value={content.body_hr}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  onContentChange({ ...content, body_hr: e.target.value })
                }
                style={styles.textarea}
                rows={4}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tekst (EN) *</label>
              <textarea
                value={content.body_en}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  onContentChange({ ...content, body_en: e.target.value })
                }
                style={styles.textarea}
                rows={4}
              />
            </div>
          </div>
        </div>
      );
    }

    case 'highlight': {
      const content = block.content as HighlightBlockContent;
      return (
        <div style={styles.blockContent}>
          <div style={styles.field}>
            <label style={styles.label}>Varijanta</label>
            <select
              value={content.variant}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                onContentChange({ ...content, variant: e.target.value as HighlightBlockContent['variant'] })
              }
              style={styles.select}
            >
              <option value="info">Info</option>
              <option value="warning">Upozorenje</option>
              <option value="success">Uspjeh</option>
            </select>
          </div>
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
              />
            </div>
          </div>
          <div style={styles.fieldRow}>
            <div style={styles.field}>
              <label style={styles.label}>Tekst (HR) *</label>
              <textarea
                value={content.body_hr}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  onContentChange({ ...content, body_hr: e.target.value })
                }
                style={styles.textarea}
                rows={3}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Tekst (EN) *</label>
              <textarea
                value={content.body_en}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  onContentChange({ ...content, body_en: e.target.value })
                }
                style={styles.textarea}
                rows={3}
              />
            </div>
          </div>
        </div>
      );
    }

    case 'link_list': {
      const content = block.content as LinkListBlockContent;
      return (
        <LinkListEditor
          content={content}
          onContentChange={onContentChange}
        />
      );
    }

    case 'contact': {
      const content = block.content as ContactBlockContent;
      return (
        <ContactBlockEditor
          content={content}
          onContentChange={onContentChange}
        />
      );
    }

    case 'card_list': {
      const content = block.content as CardListBlockContent;
      return (
        <CardListEditor
          content={content}
          onContentChange={onContentChange}
        />
      );
    }

    case 'media': {
      const content = block.content as MediaBlockContent;
      return (
        <MediaBlockEditor
          content={content}
          onContentChange={onContentChange}
        />
      );
    }

    case 'map': {
      const content = block.content as MapBlockContent;
      return (
        <MapBlockEditor
          content={content}
          onContentChange={onContentChange}
        />
      );
    }

    default:
      return (
        <div style={styles.blockContent}>
          <div style={styles.notImplementedInfo}>
            Nepoznat tip bloka.
          </div>
        </div>
      );
  }
}
