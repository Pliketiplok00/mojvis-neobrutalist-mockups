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
} from '../../types/static-page';
import { isValidSlug, canAddMapBlock } from '../../types/static-page';
import { styles } from './PageEditPage.styles';
import { BlockTypeSelector } from './blocks/BlockTypeSelector';
import { BlockEditor } from './blocks/BlockEditor';

export function PageEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      const loadedPage = await adminStaticPagesApi.getPage(pageId);
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
        const updated = await adminStaticPagesApi.updateDraft(id, { header, blocks });
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
            {!isNew && true && page?.published_at && (
              <button
                style={styles.unpublishButton}
                onClick={() => void handleUnpublish()}
              >
                Povuci iz objave
              </button>
            )}
            {!isNew && true && (
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
              {!isNew && (
                <BlockTypeSelector
                  onSelect={(type) => void handleAddBlock(type)}
                  blocks={blocks}
                />
              )}
            </div>

            {blocks.length === 0 && (
              <div style={styles.emptyBlocks}>
                Nema blokova. Dodajte blokove koristeci izbornik.
              </div>
            )}

            {sortedBlocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={index}
                totalBlocks={sortedBlocks.length}
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
      return {
        lat: 0,
        lng: 0,
        zoom: 14,
        title_hr: null,
        title_en: null,
        address_hr: null,
        address_en: null,
        note_hr: null,
        note_en: null,
      };
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


export default PageEditPage;
