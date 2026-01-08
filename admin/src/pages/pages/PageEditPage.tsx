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
  LinkListBlockContent,
  LinkItem,
  ContactBlockContent,
  ContactItem,
  CardListBlockContent,
  CardItem,
  MediaBlockContent,
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

  const handleToggleStructureLock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, structure_locked: !b.structure_locked } : b
      )
    );
  };

  const handleToggleContentLock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, content_locked: !b.content_locked } : b
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
                onToggleStructureLock={() => handleToggleStructureLock(block.id)}
                onToggleContentLock={() => handleToggleContentLock(block.id)}
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
  onToggleStructureLock,
  onToggleContentLock,
}: {
  block: ContentBlock;
  index: number;
  totalBlocks: number;
  isSupervisor: boolean;
  onContentChange: (content: ContentBlock['content']) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleStructureLock: () => void;
  onToggleContentLock: () => void;
}) {
  const canEdit = canEditBlockContent(block, isSupervisor);
  // Reordering is a structure change - only supervisor can reorder, and block must not be structure_locked
  const canReorder = isSupervisor && !block.structure_locked;

  return (
    <div style={styles.blockCard}>
      <div style={styles.blockHeader}>
        <span style={styles.blockIndex}>#{index + 1}</span>
        <span style={styles.blockType}>{BLOCK_TYPE_LABELS[block.type]}</span>
        {/* Supervisor-only lock toggles */}
        {isSupervisor && (
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
        )}
        {/* Lock badges for non-supervisor view */}
        {!isSupervisor && (
          <div style={styles.blockLocks}>
            {block.structure_locked && (
              <span style={styles.lockBadge} title="Struktura zakljucana">S</span>
            )}
            {block.content_locked && (
              <span style={styles.lockBadge} title="Sadrzaj zakljucan">C</span>
            )}
          </div>
        )}
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

    // Block types without editors yet - show neutral placeholder
    // NO JSON preview, NO raw data visibility, NO editing capability
    case 'map':
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
 * Link List Editor component
 */
function LinkListEditor({
  content,
  onContentChange,
}: {
  content: LinkListBlockContent;
  onContentChange: (content: LinkListBlockContent) => void;
}) {
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

/**
 * Contact Block Editor component
 */
function ContactBlockEditor({
  content,
  onContentChange,
}: {
  content: ContactBlockContent;
  onContentChange: (content: ContactBlockContent) => void;
}) {
  const contacts = content.contacts || [];

  const generateId = () => `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddContact = () => {
    const newContact: ContactItem = {
      id: generateId(),
      icon: null,
      name_hr: '',
      name_en: '',
      address_hr: null,
      address_en: null,
      phones: [],
      email: null,
      working_hours_hr: null,
      working_hours_en: null,
      note_hr: null,
      note_en: null,
    };
    onContentChange({ contacts: [...contacts, newContact] });
  };

  const handleRemoveContact = (contactId: string) => {
    onContentChange({ contacts: contacts.filter((c) => c.id !== contactId) });
  };

  const handleContactChange = (contactId: string, updates: Partial<ContactItem>) => {
    onContentChange({
      contacts: contacts.map((c) =>
        c.id === contactId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleMoveContact = (contactId: string, direction: 'up' | 'down') => {
    const currentIndex = contacts.findIndex((c) => c.id === contactId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= contacts.length) return;

    const newContacts = [...contacts];
    [newContacts[currentIndex], newContacts[targetIndex]] = [newContacts[targetIndex], newContacts[currentIndex]];
    onContentChange({ contacts: newContacts });
  };

  return (
    <div style={styles.blockContent}>
      {contacts.length === 0 && (
        <div style={styles.emptyList}>
          Nema kontakata. Dodajte prvi kontakt.
        </div>
      )}

      {contacts.map((contact, index) => (
        <ContactItemEditor
          key={contact.id}
          contact={contact}
          index={index}
          totalContacts={contacts.length}
          onChange={(updates) => handleContactChange(contact.id, updates)}
          onRemove={() => handleRemoveContact(contact.id)}
          onMoveUp={() => handleMoveContact(contact.id, 'up')}
          onMoveDown={() => handleMoveContact(contact.id, 'down')}
        />
      ))}

      <button
        type="button"
        style={styles.addContactButton}
        onClick={handleAddContact}
      >
        + Dodaj kontakt
      </button>
    </div>
  );
}

/**
 * Contact Item Editor component
 */
function ContactItemEditor({
  contact,
  index,
  totalContacts,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  contact: ContactItem;
  index: number;
  totalContacts: number;
  onChange: (updates: Partial<ContactItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const missingNameHr = !contact.name_hr.trim();
  const missingNameEn = !contact.name_en.trim();

  const handleAddPhone = () => {
    onChange({ phones: [...contact.phones, ''] });
  };

  const handleRemovePhone = (phoneIndex: number) => {
    onChange({ phones: contact.phones.filter((_, i) => i !== phoneIndex) });
  };

  const handlePhoneChange = (phoneIndex: number, value: string) => {
    const newPhones = [...contact.phones];
    newPhones[phoneIndex] = value;
    onChange({ phones: newPhones });
  };

  return (
    <div style={styles.contactItem}>
      {/* Header with index and actions */}
      <div style={styles.contactItemHeader}>
        <span style={styles.contactItemIndex}>Kontakt #{index + 1}</span>
        <div style={styles.contactItemActions}>
          <button
            type="button"
            style={styles.contactReorderBtn}
            onClick={onMoveUp}
            disabled={index === 0}
            title="Pomakni gore"
          >
            ↑
          </button>
          <button
            type="button"
            style={styles.contactReorderBtn}
            onClick={onMoveDown}
            disabled={index === totalContacts - 1}
            title="Pomakni dolje"
          >
            ↓
          </button>
          <button
            type="button"
            style={styles.contactRemoveBtn}
            onClick={onRemove}
            title="Ukloni kontakt"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Name (required) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>
            Naziv (HR) *
            {missingNameHr && <span style={styles.fieldError}> (obavezno)</span>}
          </label>
          <input
            type="text"
            value={contact.name_hr}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ name_hr: e.target.value })
            }
            style={{
              ...styles.input,
              ...(missingNameHr ? styles.inputError : {}),
            }}
            placeholder="Naziv kontakta na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Naziv (EN) *
            {missingNameEn && <span style={styles.fieldError}> (obavezno)</span>}
          </label>
          <input
            type="text"
            value={contact.name_en}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ name_en: e.target.value })
            }
            style={{
              ...styles.input,
              ...(missingNameEn ? styles.inputError : {}),
            }}
            placeholder="Contact name in English"
          />
        </div>
      </div>

      {/* Address (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Adresa (HR)</label>
          <input
            type="text"
            value={contact.address_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ address_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Adresa na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Adresa (EN)</label>
          <input
            type="text"
            value={contact.address_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ address_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Address in English"
          />
        </div>
      </div>

      {/* Phone numbers (repeatable) */}
      <div style={styles.field}>
        <label style={styles.label}>Telefoni</label>
        {contact.phones.map((phone, phoneIndex) => (
          <div key={phoneIndex} style={styles.phoneRow}>
            <input
              type="text"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handlePhoneChange(phoneIndex, e.target.value)
              }
              style={styles.phoneInput}
              placeholder="+385 XX XXX XXXX"
            />
            <button
              type="button"
              style={styles.phoneRemoveBtn}
              onClick={() => handleRemovePhone(phoneIndex)}
              title="Ukloni telefon"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          style={styles.addPhoneButton}
          onClick={handleAddPhone}
        >
          + Dodaj telefon
        </button>
      </div>

      {/* Email (optional) */}
      <div style={styles.field}>
        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={contact.email || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange({ email: e.target.value || null })
          }
          style={styles.input}
          placeholder="email@example.com"
        />
      </div>

      {/* Working hours (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Radno vrijeme (HR)</label>
          <input
            type="text"
            value={contact.working_hours_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ working_hours_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Pon-Pet: 08:00-16:00"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Radno vrijeme (EN)</label>
          <input
            type="text"
            value={contact.working_hours_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ working_hours_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Mon-Fri: 08:00-16:00"
          />
        </div>
      </div>

      {/* Note (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Napomena (HR)</label>
          <textarea
            value={contact.note_hr || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ note_hr: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Dodatne informacije..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Napomena (EN)</label>
          <textarea
            value={contact.note_en || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ note_en: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Additional information..."
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Card List Editor component
 */
function CardListEditor({
  content,
  onContentChange,
}: {
  content: CardListBlockContent;
  onContentChange: (content: CardListBlockContent) => void;
}) {
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
}: {
  card: CardItem;
  index: number;
  totalCards: number;
  onChange: (updates: Partial<CardItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
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

/**
 * Media Block Editor component
 */
function MediaBlockEditor({
  content,
  onContentChange,
}: {
  content: MediaBlockContent;
  onContentChange: (content: MediaBlockContent) => void;
}) {
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
      return {
        url: '',
        caption_hr: null,
        caption_en: null,
        alt_hr: null,
        alt_en: null,
        credit_hr: null,
        credit_en: null,
      };
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
  lockToggles: {
    display: 'flex',
    gap: '12px',
    marginLeft: '8px',
  },
  lockToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#666666',
  },
  lockCheckbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
  },
  lockToggleLabel: {
    userSelect: 'none',
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
  // LinkList editor styles
  emptyList: {
    padding: '24px',
    textAlign: 'center',
    color: '#999999',
    fontStyle: 'italic',
    backgroundColor: '#fafafa',
    borderRadius: '4px',
    marginBottom: '12px',
  },
  linkItem: {
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
  },
  linkItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  linkItemIndex: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666666',
  },
  linkItemActions: {
    display: 'flex',
    gap: '4px',
  },
  linkReorderBtn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  linkRemoveBtn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  addLinkButton: {
    padding: '10px 16px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
  },
  fieldError: {
    color: '#dc3545',
    fontSize: '12px',
    fontWeight: 'normal',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  // Contact editor styles
  contactItem: {
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  contactItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
  },
  contactItemIndex: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333333',
  },
  contactItemActions: {
    display: 'flex',
    gap: '4px',
  },
  contactReorderBtn: {
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
  contactRemoveBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  addContactButton: {
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
  },
  phoneRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  phoneInput: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  phoneRemoveBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  addPhoneButton: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    color: '#666666',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  // CardList editor styles
  cardItem: {
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  cardItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e0e0e0',
  },
  cardItemIndex: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333333',
  },
  cardItemActions: {
    display: 'flex',
    gap: '4px',
  },
  cardReorderBtn: {
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
  cardRemoveBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  addCardButton: {
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px dashed #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
  },
  // Media editor styles
  mediaPreview: {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
  },
  mediaPreviewImage: {
    maxWidth: '100%',
    maxHeight: '160px',
    display: 'block',
    borderRadius: '4px',
  },
  mediaPreviewLink: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  mediaPreviewLabel: {
    fontSize: '12px',
    color: '#666666',
    fontWeight: '500',
  },
  mediaPreviewUrl: {
    fontSize: '13px',
    color: '#333333',
    wordBreak: 'break-all',
  },
};

export default PageEditPage;
