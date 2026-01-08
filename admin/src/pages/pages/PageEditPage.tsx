/**
 * Page Edit/Create Page (Admin CMS)
 *
 * Block-based CMS editor for static pages.
 * Phase 3: Static Content Pages
 *
 * Rules (per spec):
 * - Draft/publish workflow (supervisor publishes)
 * - HR and EN BOTH required for publish
 * - 8 block types ONLY
 * - Notice blocks are system-controlled (not editable)
 * - Per-block locking (structure + content)
 * - Admin can edit unlocked content
 * - Supervisor can modify structure, lock/unlock, publish
 */

import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminStaticPagesApi } from '../../services/api';
import type {
  StaticPageAdmin,
  PageHeader,
  ContentBlock,
  BlockType,
  TextBlockContent,
  HighlightBlockContent,
} from '../../types/static-page';
import {
  BLOCK_TYPE_LABELS,
  getAddableBlockTypes,
  canEditBlockContent,
  canAddMapBlock,
  isValidSlug,
} from '../../types/static-page';

export function PageEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSupervisor] = useState(true); // TODO: Get from auth context

  // Page data
  const [page, setPage] = useState<StaticPageAdmin | null>(null);

  // Form state for new page
  const [slug, setSlug] = useState('');
  const [header, setHeader] = useState<PageHeader>({
    type: 'simple',
    title_hr: '',
    title_en: '',
    subtitle_hr: null,
    subtitle_en: null,
    icon: null,
  });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // Load existing page
  useEffect(() => {
    if (!isNew && id) {
      void loadPage(id);
    }
  }, [id, isNew]);

  const loadPage = async (pageId: string) => {
    try {
      const loadedPage = await adminStaticPagesApi.getPage(pageId, isSupervisor ? 'supervisor' : 'admin');
      setPage(loadedPage);
      setSlug(loadedPage.slug);
      setHeader(loadedPage.draft_header);
      setBlocks(loadedPage.draft_blocks);
    } catch (err) {
      console.error('[Admin] Error loading page:', err);
      setError('Greska pri ucitavanju stranice.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic validation
    if (!header.title_hr.trim()) {
      setError('Naslov (HR) je obavezan.');
      return;
    }

    setSaving(true);

    try {
      if (isNew) {
        // Validate slug for new page
        if (!slug.trim() || !isValidSlug(slug)) {
          setError('Slug mora biti u formatu: male-slova-i-brojevi (bez razmaka).');
          setSaving(false);
          return;
        }

        const created = await adminStaticPagesApi.createPage({
          slug,
          header,
          blocks,
        });
        setSuccessMessage('Stranica kreirana kao draft.');
        // Navigate to edit mode
        navigate(`/pages/${created.id}`, { replace: true });
      } else if (id) {
        const updated = await adminStaticPagesApi.updateDraft(id, { header, blocks }, isSupervisor ? 'supervisor' : 'admin');
        setPage(updated);
        setBlocks(updated.draft_blocks);
        setSuccessMessage('Draft spremljen.');
      }
    } catch (err) {
      console.error('[Admin] Error saving draft:', err);
      setError('Greska pri spremanju drafta.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    setError(null);
    setSuccessMessage(null);

    try {
      const published = await adminStaticPagesApi.publishPage(id);
      setPage(published);
      setSuccessMessage('Stranica objavljena!');
    } catch (err: unknown) {
      console.error('[Admin] Error publishing:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('validation')) {
        setError('Validacija nije prosla. Provjerite da su svi HR i EN tekstovi ispunjeni.');
      } else {
        setError('Greska pri objavi stranice.');
      }
    }
  };

  const handleUnpublish = async () => {
    if (!id) return;
    setError(null);
    setSuccessMessage(null);

    try {
      const unpublished = await adminStaticPagesApi.unpublishPage(id);
      setPage(unpublished);
      setSuccessMessage('Stranica povucena iz objave.');
    } catch (err) {
      console.error('[Admin] Error unpublishing:', err);
      setError('Greska pri povlacenju stranice.');
    }
  };

  const handleAddBlock = async (type: BlockType) => {
    if (!id) return;
    setError(null);

    // Check map limit
    if (type === 'map' && !canAddMapBlock(blocks)) {
      setError('Maksimalno 1 karta po stranici.');
      return;
    }

    try {
      const defaultContent = getDefaultBlockContent(type);
      const updated = await adminStaticPagesApi.addBlock(id, {
        type,
        content: defaultContent,
      });
      setPage(updated);
      setBlocks(updated.draft_blocks);
    } catch (err) {
      console.error('[Admin] Error adding block:', err);
      setError('Greska pri dodavanju bloka.');
    }
  };

  const handleRemoveBlock = async (blockId: string) => {
    if (!id) return;
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.structure_locked) {
      setError('Ovaj blok je zakljucan.');
      return;
    }

    if (!confirm('Jeste li sigurni da zelite obrisati ovaj blok?')) {
      return;
    }

    try {
      const updated = await adminStaticPagesApi.removeBlock(id, blockId);
      setPage(updated);
      setBlocks(updated.draft_blocks);
    } catch (err) {
      console.error('[Admin] Error removing block:', err);
      setError('Greska pri brisanju bloka.');
    }
  };

  const handleBlockContentChange = (blockId: string, newContent: ContentBlock['content']) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, content: newContent } : b
      )
    );
  };

  /**
   * Move a block up or down in the order.
   * Re-normalizes order values to sequential integers (0, 1, 2, ...).
   */
  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      // Sort by current order first
      const sorted = [...prev].sort((a, b) =>
        (Number.isFinite(a.order) ? a.order : 1e9) -
        (Number.isFinite(b.order) ? b.order : 1e9)
      );
      const currentIndex = sorted.findIndex((b) => b.id === blockId);

      if (currentIndex === -1) return prev;

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Check bounds
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      // Swap positions in array
      [sorted[currentIndex], sorted[targetIndex]] = [sorted[targetIndex], sorted[currentIndex]];

      // Re-normalize order values to sequential integers
      return sorted.map((block, index) => ({
        ...block,
        order: index,
      }));
    });
  };

  // Sort blocks by order for rendering
  const sortedBlocks = [...blocks].sort((a, b) =>
    (Number.isFinite(a.order) ? a.order : 1e9) -
    (Number.isFinite(b.order) ? b.order : 1e9)
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.loading}>Ucitavanje...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isNew ? 'Nova stranica' : `Uredi: ${page?.slug || ''}`}
          </h1>
          <div style={styles.headerActions}>
            <button
              style={styles.cancelButton}
              onClick={() => navigate('/pages')}
            >
              Natrag
            </button>
            {!isNew && isSupervisor && page?.published_at && (
              <button
                style={styles.unpublishButton}
                onClick={() => void handleUnpublish()}
              >
                Povuci iz objave
              </button>
            )}
            {!isNew && isSupervisor && (
              <button
                style={styles.publishButton}
                onClick={() => void handlePublish()}
              >
                Objavi
              </button>
            )}
          </div>
        </div>

        {/* Status indicator */}
        {!isNew && page && (
          <div style={styles.statusBar}>
            <span>
              Status:{' '}
              {page.published_at
                ? page.has_unpublished_changes
                  ? 'Objavljen (neobjavljene izmjene)'
                  : 'Objavljen'
                : 'Draft'}
            </span>
            {page.published_at && (
              <span style={styles.statusDate}>
                Zadnja objava: {formatDate(page.published_at)}
              </span>
            )}
          </div>
        )}

        {/* Messages */}
        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        {/* Form */}
        <form onSubmit={(e) => void handleSaveDraft(e)} style={styles.form}>
          {/* Slug (only for new) */}
          {isNew && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Slug (URL putanja) *</h2>
              <p style={styles.hint}>
                Npr: o-nama, kontakt, lokacije. Male slova, brojke i crtice.
              </p>
              <input
                type="text"
                value={slug}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSlug(e.target.value.toLowerCase())}
                style={styles.input}
                placeholder="ime-stranice"
                required
              />
            </div>
          )}

          {/* Header section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Zaglavlje stranice</h2>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Naslov (HR) *</label>
                <input
                  type="text"
                  value={header.title_hr}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setHeader({ ...header, title_hr: e.target.value })
                  }
                  style={styles.input}
                  placeholder="Naslov na hrvatskom"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Naslov (EN) *</label>
                <input
                  type="text"
                  value={header.title_en}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setHeader({ ...header, title_en: e.target.value })
                  }
                  style={styles.input}
                  placeholder="Title in English"
                  required
                />
              </div>
            </div>

            <div style={styles.fieldRow}>
              <div style={styles.field}>
                <label style={styles.label}>Podnaslov (HR)</label>
                <input
                  type="text"
                  value={header.subtitle_hr || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setHeader({ ...header, subtitle_hr: e.target.value || null })
                  }
                  style={styles.input}
                  placeholder="Podnaslov (opcionalno)"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Podnaslov (EN)</label>
                <input
                  type="text"
                  value={header.subtitle_en || ''}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setHeader({ ...header, subtitle_en: e.target.value || null })
                  }
                  style={styles.input}
                  placeholder="Subtitle (optional)"
                />
              </div>
            </div>
          </div>

          {/* Blocks section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Blokovi sadrzaja</h2>
              {isSupervisor && !isNew && (
                <BlockTypeSelector
                  onSelect={(type) => void handleAddBlock(type)}
                  blocks={blocks}
                />
              )}
            </div>

            {blocks.length === 0 && (
              <div style={styles.emptyBlocks}>
                Nema blokova. {isSupervisor ? 'Dodajte blokove koristeci izbornik.' : 'Supervisor mora dodati blokove.'}
              </div>
            )}

            {sortedBlocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={index}
                totalBlocks={sortedBlocks.length}
                isSupervisor={isSupervisor}
                onContentChange={(content) => handleBlockContentChange(block.id, content)}
                onRemove={() => void handleRemoveBlock(block.id)}
                onMoveUp={() => handleMoveBlock(block.id, 'up')}
                onMoveDown={() => handleMoveBlock(block.id, 'down')}
              />
            ))}
          </div>

          {/* Save draft button */}
          <div style={styles.actions}>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={saving}
            >
              {saving ? 'Spremanje...' : 'Spremi draft'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

/**
 * Block type selector dropdown
 */
function BlockTypeSelector({
  onSelect,
  blocks,
}: {
  onSelect: (type: BlockType) => void;
  blocks: ContentBlock[];
}) {
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

/**
 * Block editor component
 */
function BlockEditor({
  block,
  index,
  totalBlocks,
  isSupervisor,
  onContentChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  isSupervisor: boolean;
  onContentChange: (content: ContentBlock['content']) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const canEdit = canEditBlockContent(block, isSupervisor);
  // Reordering is a structure change - only supervisor can reorder, and block must not be structure_locked
  const canReorder = isSupervisor && !block.structure_locked;

  return (
    <div style={styles.blockCard}>
      <div style={styles.blockHeader}>
        <span style={styles.blockIndex}>#{index + 1}</span>
        <span style={styles.blockType}>{BLOCK_TYPE_LABELS[block.type]}</span>
        <div style={styles.blockLocks}>
          {block.structure_locked && (
            <span style={styles.lockBadge} title="Struktura zakljucana">S</span>
          )}
          {block.content_locked && (
            <span style={styles.lockBadge} title="Sadrzaj zakljucan">C</span>
          )}
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
        {isSupervisor && !block.structure_locked && (
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

/**
 * Content editor for each block type
 */
function BlockContentEditor({
  block,
  onContentChange,
}: {
  block: ContentBlock;
  onContentChange: (content: ContentBlock['content']) => void;
}) {
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

    // Block types without editors yet - show neutral placeholder
    // NO JSON preview, NO raw data visibility, NO editing capability
    case 'card_list':
    case 'media':
    case 'map':
    case 'contact':
    case 'link_list':
      return (
        <div style={styles.blockContent}>
          <div style={styles.notImplementedInfo}>
            Urednik jos nije implementiran.
          </div>
        </div>
      );

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

/**
 * Get default content for new block
 */
function getDefaultBlockContent(type: BlockType): ContentBlock['content'] {
  switch (type) {
    case 'text':
      return {
        title_hr: null,
        title_en: null,
        body_hr: '',
        body_en: '',
      };
    case 'highlight':
      return {
        title_hr: null,
        title_en: null,
        body_hr: '',
        body_en: '',
        icon: null,
        variant: 'info',
      };
    case 'card_list':
      return { cards: [] };
    case 'media':
      return { images: [], caption_hr: null, caption_en: null };
    case 'map':
      return { pins: [] };
    case 'contact':
      return { contacts: [] };
    case 'link_list':
      return { links: [] };
    default:
      return {};
  }
}

/**
 * Format date for display
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  statusDate: {
    color: '#666666',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  success: {
    padding: '12px 16px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  hint: {
    fontSize: '13px',
    color: '#666666',
    margin: '0 0 16px 0',
  },
  field: {
    flex: 1,
    marginBottom: '12px',
  },
  fieldRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#333333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  select: {
    width: '200px',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  publishButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  unpublishButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  emptyBlocks: {
    padding: '32px',
    textAlign: 'center',
    color: '#666666',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
  },
  dropdown: {
    position: 'relative',
  },
  addBlockButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 10,
    minWidth: '160px',
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '10px 16px',
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
  },
  dropdownItemDisabled: {
    color: '#999999',
    cursor: 'not-allowed',
  },
  blockCard: {
    marginBottom: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  blockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
  },
  blockIndex: {
    fontSize: '12px',
    color: '#666666',
    fontWeight: '600',
  },
  blockType: {
    fontSize: '14px',
    fontWeight: '500',
    flex: 1,
  },
  blockLocks: {
    display: 'flex',
    gap: '4px',
  },
  lockBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    backgroundColor: '#ffc107',
    color: '#333333',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  reorderButtons: {
    display: 'flex',
    gap: '4px',
  },
  reorderButton: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  removeBlockButton: {
    padding: '4px 8px',
    backgroundColor: '#ffffff',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  blockContent: {
    padding: '16px',
  },
  noticeInfo: {
    padding: '16px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    fontSize: '14px',
  },
  lockedInfo: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    color: '#666666',
    fontSize: '14px',
  },
  notImplementedInfo: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    color: '#666666',
    fontSize: '14px',
    textAlign: 'center',
    fontStyle: 'italic',
  },
};

export default PageEditPage;
