/**
 * Inbox Edit/Create Page (Admin)
 *
 * Form for creating and editing inbox messages.
 *
 * Rules (per spec):
 * - Max 2 tags per message
 * - HR content required, EN optional for municipal
 * - Messages are LIVE ON SAVE (no draft workflow)
 * - HR-only admin UI
 *
 * Phase 7: Locked messages
 * - Messages with hitno tag that triggered push are LOCKED
 * - Locked messages cannot be edited
 * - Show locked indicator with push timestamp
 */

import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminInboxApi } from '../../services/api';
import type { InboxTag, InboxMessageInput } from '../../types/inbox';
import {
  ACTIVE_INBOX_TAGS,
  TAG_LABELS,
  validateTags,
  requiresEnglish,
  isHitno,
  validateHitnoRules,
  isDeprecatedTag,
  DEPRECATED_TAGS,
} from '../../types/inbox';

export function InboxEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [titleHr, setTitleHr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyHr, setBodyHr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [selectedTags, setSelectedTags] = useState<InboxTag[]>([]);
  const [activeFrom, setActiveFrom] = useState('');
  const [activeTo, setActiveTo] = useState('');

  // Phase 7: Locked state
  const [isLocked, setIsLocked] = useState(false);
  const [pushedAt, setPushedAt] = useState<string | null>(null);

  // Load existing message
  useEffect(() => {
    if (!isNew && id) {
      void loadMessage(id);
    }
  }, [id, isNew]);

  const loadMessage = async (messageId: string) => {
    try {
      const message = await adminInboxApi.getMessage(messageId);
      setTitleHr(message.title_hr);
      setTitleEn(message.title_en || '');
      setBodyHr(message.body_hr);
      setBodyEn(message.body_en || '');
      setSelectedTags(message.tags);
      setActiveFrom(message.active_from ? formatDateTimeLocal(message.active_from) : '');
      setActiveTo(message.active_to ? formatDateTimeLocal(message.active_to) : '');
      // Phase 7: Load locked state
      setIsLocked(message.is_locked);
      setPushedAt(message.pushed_at);
    } catch (err) {
      console.error('[Admin] Error loading message:', err);
      setError('Greška pri učitavanju poruke.');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag: InboxTag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 2) {
        // Max 2 tags - replace oldest
        return [prev[1], tag];
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!titleHr.trim()) {
      setError('Naslov (HR) je obavezan.');
      return;
    }
    if (!bodyHr.trim()) {
      setError('Sadržaj (HR) je obavezan.');
      return;
    }
    if (!validateTags(selectedTags)) {
      setError('Maksimalno 2 oznake su dozvoljene.');
      return;
    }
    if (requiresEnglish(selectedTags) && (!titleEn.trim() || !bodyEn.trim())) {
      setError('Engleski prijevod je obavezan za ne-općinske poruke.');
      return;
    }

    // Validate hitno rules (Phase 3)
    const hitnoValidation = validateHitnoRules(
      selectedTags,
      activeFrom || null,
      activeTo || null
    );
    if (!hitnoValidation.valid) {
      setError(hitnoValidation.error || 'Neispravna konfiguracija hitno poruke.');
      return;
    }

    // Validate date range
    if (activeFrom && activeTo && new Date(activeFrom) >= new Date(activeTo)) {
      setError('Datum završetka mora biti nakon datuma početka.');
      return;
    }

    setSaving(true);

    const input: InboxMessageInput = {
      title_hr: titleHr.trim(),
      title_en: titleEn.trim() || null,
      body_hr: bodyHr.trim(),
      body_en: bodyEn.trim() || null,
      tags: selectedTags,
      active_from: activeFrom ? new Date(activeFrom).toISOString() : null,
      active_to: activeTo ? new Date(activeTo).toISOString() : null,
    };

    try {
      if (isNew) {
        await adminInboxApi.createMessage(input);
      } else if (id) {
        await adminInboxApi.updateMessage(id, input);
      }
      navigate('/messages');
    } catch (err: unknown) {
      console.error('[Admin] Error saving message:', err);
      // Phase 7: Handle locked message error (409)
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('locked') || errorMessage.includes('409')) {
        setError('Ova poruka je zaključana jer je poslana push obavijest. Nije moguće uređivati.');
        setIsLocked(true);
      } else {
        setError('Greška pri spremanju poruke. Pokušajte ponovo.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.loading}>Učitavanje...</div>
      </DashboardLayout>
    );
  }

  const needsEnglish = requiresEnglish(selectedTags);

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isNew ? 'Nova poruka' : 'Uredi poruku'}
          </h1>
          <button
            style={styles.cancelButton}
            onClick={() => navigate('/messages')}
          >
            Odustani
          </button>
        </div>

        {/* Phase 7: Locked message warning */}
        {isLocked && (
          <div style={styles.lockedBanner} data-testid="inbox-locked-badge">
            🔒 Ova poruka je zaključana jer je poslana push obavijest.
            {pushedAt && (
              <span style={styles.pushedAt}>
                {' '}(Poslano: {new Date(pushedAt).toLocaleString('hr-HR')})
              </span>
            )}
            <br />
            <span style={styles.lockedNote}>Zaključane poruke nije moguće uređivati. Možete ih samo obrisati.</span>
          </div>
        )}

        {/* Warning about live publishing */}
        {!isLocked && (
          <div style={styles.warning}>
            ⚠️ Poruke se objavljuju odmah nakon spremanja. Nema draft verzije.
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} style={styles.form}>
          {/* Phase 7: Disable entire form if locked */}
          <fieldset disabled={isLocked} style={styles.fieldset}>
          {/* Croatian content */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Sadržaj (Hrvatski) *</h2>

            <div style={styles.field}>
              <label style={styles.label}>Naslov (HR) *</label>
              <input
                type="text"
                value={titleHr}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleHr(e.target.value)}
                style={styles.input}
                placeholder="Naslov poruke na hrvatskom"
                required
                data-testid="inbox-title-hr"
                name="title_hr"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Sadržaj (HR) *</label>
              <textarea
                value={bodyHr}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBodyHr(e.target.value)}
                style={styles.textarea}
                placeholder="Tekst poruke na hrvatskom..."
                rows={6}
                required
                data-testid="inbox-body-hr"
                name="body_hr"
              />
            </div>
          </div>

          {/* English content */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Sadržaj (Engleski) {needsEnglish ? '*' : '(opcionalno)'}
            </h2>
            {!needsEnglish && (
              <p style={styles.hint}>
                Općinske poruke mogu biti samo na hrvatskom.
              </p>
            )}

            <div style={styles.field}>
              <label style={styles.label}>
                Naslov (EN) {needsEnglish ? '*' : ''}
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitleEn(e.target.value)}
                style={styles.input}
                placeholder="Message title in English"
                required={needsEnglish}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Sadržaj (EN) {needsEnglish ? '*' : ''}
              </label>
              <textarea
                value={bodyEn}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBodyEn(e.target.value)}
                style={styles.textarea}
                placeholder="Message body in English..."
                rows={6}
                required={needsEnglish}
              />
            </div>
          </div>

          {/* Tags */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Oznake (max. 2)</h2>
            <p style={styles.hint}>
              Odaberite do 2 oznake za kategorizaciju poruke.
              {isHitno(selectedTags) && (
                <span style={styles.hitnoHint}>
                  {' '}Hitno poruke zahtijevaju točno jednu kontekst oznaku.
                </span>
              )}
            </p>
            <div style={styles.tagsGrid}>
              {/* Show active tags for selection */}
              {ACTIVE_INBOX_TAGS.map((tag) => (
                <label key={tag} style={styles.tagLabel}>
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    style={styles.checkbox}
                  />
                  <span
                    style={{
                      ...styles.tagText,
                      ...(selectedTags.includes(tag) ? styles.tagTextSelected : {}),
                    }}
                  >
                    {TAG_LABELS[tag]}
                  </span>
                </label>
              ))}
              {/* Show deprecated tags as read-only if message has them */}
              {DEPRECATED_TAGS.filter(tag => selectedTags.includes(tag)).map((tag) => (
                <label key={tag} style={{ ...styles.tagLabel, ...styles.deprecatedTagLabel }}>
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleTagToggle(tag)}
                    style={styles.checkbox}
                  />
                  <span style={{ ...styles.tagText, ...styles.tagTextSelected, ...styles.deprecatedTagText }}>
                    {TAG_LABELS[tag]}
                  </span>
                </label>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p style={styles.selectedTags}>
                Odabrano: {selectedTags.map((t) => TAG_LABELS[t]).join(', ')}
                {selectedTags.some(isDeprecatedTag) && (
                  <span style={styles.deprecatedWarning}>
                    {' '}(Zastarjele oznake će biti zamijenjene s "promet" pri spremanju)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Active window - only shown for hitno messages */}
          {isHitno(selectedTags) && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Aktivni period (obavezno za hitno) *</h2>
              <p style={styles.hint}>
                Hitno poruke se prikazuju kao banner tijekom aktivnog perioda.
                Oba datuma su obavezna.
              </p>
              <div style={styles.dateRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Od *</label>
                  <input
                    type="datetime-local"
                    value={activeFrom}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setActiveFrom(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Do *</label>
                  <input
                    type="datetime-local"
                    value={activeTo}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setActiveTo(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => navigate('/messages')}
              data-testid="inbox-cancel"
            >
              {isLocked ? 'Natrag' : 'Odustani'}
            </button>
            {!isLocked && (
              <button
                type="submit"
                style={styles.saveButton}
                disabled={saving}
                data-testid="inbox-submit"
              >
                {saving ? 'Spremanje...' : 'Spremi i objavi'}
              </button>
            )}
          </div>
          </fieldset>
        </form>
      </div>
    </DashboardLayout>
  );
}

/**
 * Format ISO date string for datetime-local input
 */
function formatDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '800px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  // Phase 7: Locked message styles
  lockedBanner: {
    padding: '16px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '2px solid #9ca3af',
  },
  pushedAt: {
    color: '#6b7280',
    fontSize: '13px',
  },
  lockedNote: {
    color: '#6b7280',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  fieldset: {
    border: 'none',
    margin: 0,
    padding: 0,
  },
  warning: {
    padding: '12px 16px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '24px',
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
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  hint: {
    fontSize: '13px',
    color: '#666666',
    margin: '0 0 16px 0',
  },
  field: {
    marginBottom: '16px',
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
  tagsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '8px',
  },
  tagLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  tagText: {
    fontSize: '13px',
    color: '#333333',
  },
  tagTextSelected: {
    fontWeight: '600',
  },
  selectedTags: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#666666',
  },
  hitnoHint: {
    color: '#dc2626',
    fontWeight: '500',
  },
  deprecatedTagLabel: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  deprecatedTagText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  deprecatedWarning: {
    color: '#b45309',
    fontStyle: 'italic',
  },
  dateRow: {
    display: 'flex',
    gap: '16px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
  },
  cancelButton: {
    padding: '12px 24px',
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
};

export default InboxEditPage;
