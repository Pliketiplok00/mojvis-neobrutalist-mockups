/**
 * Block Editor
 *
 * Wrapper component for individual blocks with controls.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ContentBlock } from '../../../types/static-page';
import { BLOCK_TYPE_LABELS, canEditBlockContent } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';
import { BlockContentEditor } from './BlockContentEditor';

interface BlockEditorProps {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  onContentChange: (content: ContentBlock['content']) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleStructureLock: () => void;
  onToggleContentLock: () => void;
}

/**
 * Block editor component
 */
export function BlockEditor({
  block,
  index,
  totalBlocks,
  onContentChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onToggleStructureLock,
  onToggleContentLock,
}: BlockEditorProps) {
  // All admins have full edit capabilities (supervisor role removed)
  const canEdit = canEditBlockContent(block, true);
  const canReorder = !block.structure_locked;

  return (
    <div style={styles.blockCard}>
      <div style={styles.blockHeader}>
        <span style={styles.blockIndex}>#{index + 1}</span>
        <span style={styles.blockType}>{BLOCK_TYPE_LABELS[block.type]}</span>
        {/* Lock toggles - all admins can manage locks */}
        <div style={styles.lockToggles}>
          <label style={styles.lockToggle} title="Zaključaj strukturu (onemogući brisanje/premještanje)">
            <input
              type="checkbox"
              checked={block.structure_locked}
              onChange={onToggleStructureLock}
              style={styles.lockCheckbox}
            />
            <span style={styles.lockToggleLabel}>Zaključaj strukturu</span>
          </label>
          <label style={styles.lockToggle} title="Zaključaj sadržaj (onemogući uređivanje)">
            <input
              type="checkbox"
              checked={block.content_locked}
              onChange={onToggleContentLock}
              style={styles.lockCheckbox}
            />
            <span style={styles.lockToggleLabel}>Zaključaj sadržaj</span>
          </label>
        </div>
        {/* Reorder buttons - supervisor only, respects structure lock */}
        {canReorder && (
          <div style={styles.reorderButtons}>
            <button
              type="button"
              style={styles.reorderButton}
              onClick={onMoveUp}
              disabled={index === 0}
              title="Pomakni gore"
            >
              ↑
            </button>
            <button
              type="button"
              style={styles.reorderButton}
              onClick={onMoveDown}
              disabled={index === totalBlocks - 1}
              title="Pomakni dolje"
            >
              ↓
            </button>
          </div>
        )}
        {!block.structure_locked && (
          <button
            type="button"
            style={styles.removeBlockButton}
            onClick={onRemove}
          >
            Ukloni
          </button>
        )}
      </div>

      {block.type === 'notice' ? (
        <div style={styles.noticeInfo}>
          Obavijest blokovi su automatski generirani od strane sustava.
        </div>
      ) : !canEdit ? (
        <div style={styles.lockedInfo}>
          Ovaj blok je zakljucan. Samo supervisor moze uredivati.
        </div>
      ) : (
        <BlockContentEditor
          block={block}
          onContentChange={onContentChange}
        />
      )}
    </div>
  );
}
