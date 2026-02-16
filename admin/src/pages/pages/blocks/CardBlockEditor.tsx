/**
 * Card Block Editor
 *
 * Editor for card list blocks in static pages.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ChangeEvent } from 'react';
import type { CardListBlockContent, CardItem } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';

interface CardListEditorProps {
  content: CardListBlockContent;
  onContentChange: (content: CardListBlockContent) => void;
}

/**
 * Card List Editor component
 */
export function CardListEditor({
  content,
  onContentChange,
}: CardListEditorProps) {
  const cards = content.cards || [];

  const generateId = () => `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddCard = () => {
    const newCard: CardItem = {
      id: generateId(),
      image_url: null,
      title_hr: '',
      title_en: '',
      description_hr: null,
      description_en: null,
      meta_hr: null,
      meta_en: null,
      link_type: null,
      link_target: null,
    };
    onContentChange({ cards: [...cards, newCard] });
  };

  const handleRemoveCard = (cardId: string) => {
    onContentChange({ cards: cards.filter((c) => c.id !== cardId) });
  };

  const handleCardChange = (cardId: string, updates: Partial<CardItem>) => {
    onContentChange({
      cards: cards.map((c) =>
        c.id === cardId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleMoveCard = (cardId: string, direction: 'up' | 'down') => {
    const currentIndex = cards.findIndex((c) => c.id === cardId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= cards.length) return;

    const newCards = [...cards];
    [newCards[currentIndex], newCards[targetIndex]] = [newCards[targetIndex], newCards[currentIndex]];
    onContentChange({ cards: newCards });
  };

  return (
    <div style={styles.blockContent}>
      {cards.length === 0 && (
        <div style={styles.emptyList}>
          Nema kartica. Dodajte prvu karticu.
        </div>
      )}

      {cards.map((card, index) => (
        <CardItemEditor
          key={card.id}
          card={card}
          index={index}
          totalCards={cards.length}
          onChange={(updates) => handleCardChange(card.id, updates)}
          onRemove={() => handleRemoveCard(card.id)}
          onMoveUp={() => handleMoveCard(card.id, 'up')}
          onMoveDown={() => handleMoveCard(card.id, 'down')}
        />
      ))}

      <button
        type="button"
        style={styles.addCardButton}
        onClick={handleAddCard}
      >
        + Dodaj karticu
      </button>
    </div>
  );
}

interface CardItemEditorProps {
  card: CardItem;
  index: number;
  totalCards: number;
  onChange: (updates: Partial<CardItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * Card Item Editor component
 */
function CardItemEditor({
  card,
  index,
  totalCards,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: CardItemEditorProps) {
  const missingTitleHr = !card.title_hr.trim();
  const missingTitleEn = !card.title_en.trim();
  const urlError = card.link_type === 'external' && card.link_target &&
    !card.link_target.startsWith('http://') && !card.link_target.startsWith('https://');

  const handleLinkTypeChange = (newType: CardItem['link_type']) => {
    onChange({
      link_type: newType,
      link_target: newType ? '' : null,
    });
  };

  return (
    <div style={styles.cardItem}>
      {/* Header with index and actions */}
      <div style={styles.cardItemHeader}>
        <span style={styles.cardItemIndex}>Kartica #{index + 1}</span>
        <div style={styles.cardItemActions}>
          <button
            type="button"
            style={styles.cardReorderBtn}
            onClick={onMoveUp}
            disabled={index === 0}
            title="Pomakni gore"
          >
            ↑
          </button>
          <button
            type="button"
            style={styles.cardReorderBtn}
            onClick={onMoveDown}
            disabled={index === totalCards - 1}
            title="Pomakni dolje"
          >
            ↓
          </button>
          <button
            type="button"
            style={styles.cardRemoveBtn}
            onClick={onRemove}
            title="Ukloni karticu"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Title (required) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>
            Naslov (HR) *
            {missingTitleHr && <span style={styles.fieldError}> (obavezno)</span>}
          </label>
          <input
            type="text"
            value={card.title_hr}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ title_hr: e.target.value })
            }
            style={{
              ...styles.input,
              ...(missingTitleHr ? styles.inputError : {}),
            }}
            placeholder="Naslov kartice na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Naslov (EN) *
            {missingTitleEn && <span style={styles.fieldError}> (obavezno)</span>}
          </label>
          <input
            type="text"
            value={card.title_en}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ title_en: e.target.value })
            }
            style={{
              ...styles.input,
              ...(missingTitleEn ? styles.inputError : {}),
            }}
            placeholder="Card title in English"
          />
        </div>
      </div>

      {/* Description (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Opis (HR)</label>
          <textarea
            value={card.description_hr || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ description_hr: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Opis kartice na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Opis (EN)</label>
          <textarea
            value={card.description_en || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ description_en: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Card description in English"
          />
        </div>
      </div>

      {/* Meta (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Meta tekst (HR)</label>
          <input
            type="text"
            value={card.meta_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ meta_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Npr: Novo, Popularno..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Meta tekst (EN)</label>
          <input
            type="text"
            value={card.meta_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ meta_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="E.g.: New, Popular..."
          />
        </div>
      </div>

      {/* Image URL (optional) */}
      <div style={styles.field}>
        <label style={styles.label}>URL slike</label>
        <input
          type="text"
          value={card.image_url || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange({ image_url: e.target.value || null })
          }
          style={styles.input}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Link type and target */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Tip linka</label>
          <select
            value={card.link_type || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleLinkTypeChange(e.target.value as CardItem['link_type'] || null)
            }
            style={styles.select}
          >
            <option value="">Bez linka</option>
            <option value="external">Vanjski link</option>
            <option value="page">Stranica</option>
            <option value="event">Događaj</option>
            <option value="inbox">Poruka</option>
          </select>
        </div>
        {card.link_type && (
          <div style={styles.field}>
            <label style={styles.label}>
              {card.link_type === 'external' ? 'URL' : 'ID/Slug cilja'}
              {urlError && <span style={styles.fieldError}> (mora poceti s http:// ili https://)</span>}
            </label>
            <input
              type="text"
              value={card.link_target || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange({ link_target: e.target.value || null })
              }
              style={{
                ...styles.input,
                ...(urlError ? styles.inputError : {}),
              }}
              placeholder={card.link_type === 'external' ? 'https://example.com' : 'slug-ili-id'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
