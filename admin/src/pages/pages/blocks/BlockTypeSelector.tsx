/**
 * Block Type Selector
 *
 * Dropdown for selecting block type to add.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import { useState } from 'react';
import type { BlockType, ContentBlock } from '../../../types/static-page';
import { BLOCK_TYPE_LABELS, getAddableBlockTypes, canAddMapBlock } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';

interface BlockTypeSelectorProps {
  onSelect: (type: BlockType) => void;
  blocks: ContentBlock[];
}

/**
 * Block type selector dropdown
 */
export function BlockTypeSelector({
  onSelect,
  blocks,
}: BlockTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const addableTypes = getAddableBlockTypes();

  return (
    <div style={styles.dropdown}>
      <button
        type="button"
        style={styles.addBlockButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        + Dodaj blok
      </button>
      {isOpen && (
        <div style={styles.dropdownMenu}>
          {addableTypes.map((type) => {
            const disabled = type === 'map' && !canAddMapBlock(blocks);
            return (
              <button
                key={type}
                type="button"
                style={{
                  ...styles.dropdownItem,
                  ...(disabled ? styles.dropdownItemDisabled : {}),
                }}
                onClick={() => {
                  if (!disabled) {
                    onSelect(type);
                    setIsOpen(false);
                  }
                }}
                disabled={disabled}
              >
                {BLOCK_TYPE_LABELS[type]}
                {disabled && ' (max 1)'}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
