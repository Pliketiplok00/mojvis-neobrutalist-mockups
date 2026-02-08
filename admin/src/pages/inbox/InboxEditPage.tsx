/**
 * Inbox Edit/Create Page (Admin)
 *
 * Form for creating and editing inbox messages.
 *
 * Rules (per spec):
 * - Max 2 tags per message
 * - HR content required, EN optional for municipal
 * - HR-only admin UI
 *
 * Package 2: Draft/Publish workflow
 * - New messages are saved as DRAFTS (not visible to public)
 * - Drafts can be edited freely
 * - Publish action makes message visible and triggers push if hitno
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
import { adminInboxApi, adminTranslateApi } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
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
  isMunicipalTag,
  getMunicipalityFromTags,
} from '../../types/inbox';

export function InboxEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showTranslateWarning, setShowTranslateWarning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [titleHr, setTitleHr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyHr, setBodyHr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [selectedTags, setSelectedTags] = useState<InboxTag[]>([]);
  const [activeFrom, setActiveFrom] = useState('');
  const [activeTo, setActiveTo] = useState('');

  // Package 2: Draft/Publish state
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // Phase 7: Locked state
  const [isLocked, setIsLocked] = useState(false);
  const [pushedAt, setPushedAt] = useState<string | null>(null);

  // Phase 3: Authorization state
  const [isForbidden, setIsForbidden] = useState(false);
  const adminNoticeScope = user?.notice_municipality_scope ?? null;

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
      // Package 2: Load draft/publish state
      setPublishedAt(message.published_at);
      // Phase 7: Load locked state
      setIsLocked(message.is_locked);
      setPushedAt(message.pushed_at);

      // Phase 3: Check if admin can edit this message
      // Breakglass admins bypass municipal restrictions
      if (!user?.is_breakglass) {
        const messageMunicipality = getMunicipalityFromTags(message.tags);
        if (messageMunicipality !== null) {
          // It's a municipal notice - check if admin has permission
          if (adminNoticeScope === null || adminNoticeScope !== messageMunicipality) {
            setIsForbidden(true);
          }
        }
      }
    } catch (err) {
      console.error('[Admin] Error loading message:', err);
      setError('Greška pri učitavanju poruke.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Phase 3: Check if admin can select/use a municipal tag
   */
  const canUseMunicipalTag = (tag: InboxTag): boolean => {
    if (!isMunicipalTag(tag)) return true; // Non-municipal tags are always allowed
    if (user?.is_breakglass) return true; // Breakglass can use any municipal tag
    if (adminNoticeScope === null) return false; // No scope = can't use municipal tags
    return tag === adminNoticeScope; // Can only use tag matching scope
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
        // Package 2: Create as draft, then navigate to edit page
        const newMessage = await adminInboxApi.createMessage(input);
        navigate(`/messages/${newMessage.id}`, { replace: true });
      } else if (id) {
        await adminInboxApi.updateMessage(id, input);
        // Stay on page after save (user may want to publish)
        setError(null);
      }
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

  /**
   * Package 2: Publish a draft message
   */
  const handlePublish = async () => {
    if (!id || isNew || publishedAt) return;

    setError(null);
    setPublishing(true);

    try {
      const publishedMessage = await adminInboxApi.publishMessage(id);
      setPublishedAt(publishedMessage.published_at);
      setIsLocked(publishedMessage.is_locked);
      setPushedAt(publishedMessage.pushed_at);
      // Navigate to list after successful publish
      navigate('/messages');
    } catch (err: unknown) {
      console.error('[Admin] Error publishing message:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('already published') || errorMessage.includes('409')) {
        setError('Poruka je već objavljena.');
        setPublishedAt(new Date().toISOString()); // Mark as published to update UI
      } else {
        setError('Greška pri objavljivanju poruke. Pokušajte ponovo.');
      }
    } finally {
      setPublishing(false);
    }
  };

  /**
   * Translate Croatian content to English using DeepL
   */
  const handleTranslate = async () => {
    // Validate HR content exists
    if (!titleHr.trim() || !bodyHr.trim()) {
      setError('Unesite hrvatski sadržaj prije prijevoda.');
      return;
    }

    // Confirm overwrite if EN content exists
    if ((titleEn.trim() || bodyEn.trim()) && !showTranslateWarning) {
      if (!window.confirm('Engleski sadržaj već postoji. Želite li ga zamijeniti?')) {
        return;
      }
    }

    setError(null);
    setTranslating(true);

    try {
      const result = await adminTranslateApi.translateHrToEn(titleHr, bodyHr);
      setTitleEn(result.title_en);
      setBodyEn(result.body_en);
      setShowTranslateWarning(true); // Show warning after translation
    } catch (err: unknown) {
      console.error('[Admin] Translation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Greška pri prijevodu';
      if (errorMessage.includes('503') || errorMessage.includes('not configured')) {
        setError('Usluga prijevoda nije dostupna. Kontaktirajte administratora.');
      } else {
        setError('Prijevod nije uspio. Pokušajte ponovo.');
      }
    } finally {
      setTranslating(false);
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

        {/* Phase 3: Forbidden message warning */}
        {isForbidden && (
          <div style={styles.forbiddenBanner} data-testid="inbox-forbidden-badge">
            🚫 Nemate ovlasti uređivati obavijesti za ovu općinu.
            <br />
            <span style={styles.forbiddenNote}>
              Vaš korisnički račun može uređivati samo {adminNoticeScope === 'vis' ? 'Vis' : adminNoticeScope === 'komiza' ? 'Komiža' : 'općinske'} obavijesti.
            </span>
          </div>
        )}

        {/* Phase 7: Locked message warning */}
        {isLocked && !isForbidden && (
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

        {/* Package 2: Draft indicator */}
        {!isNew && !publishedAt && !isLocked && (
          <div style={styles.draftBanner} data-testid="inbox-draft-badge">
            📝 Ova poruka je <strong>skica</strong> i nije vidljiva javnosti.
            <br />
            <span style={styles.draftNote}>Kliknite "Objavi" kada ste spremni objaviti poruku.</span>
          </div>
        )}

        {/* Info for published messages */}
        {publishedAt && !isLocked && (
          <div style={styles.publishedBanner}>
            ✓ Poruka je objavljena i vidljiva javnosti.
            {publishedAt && (
              <span style={styles.publishedAt}>
                {' '}(Objavljeno: {new Date(publishedAt).toLocaleString('hr-HR')})
              </span>
            )}
          </div>
        )}

        {/* Info for new messages */}
        {isNew && (
          <div style={styles.info}>
            ℹ️ Nova poruka će biti spremljena kao skica. Nakon spremanja možete je objaviti.
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(e)} style={styles.form}>
          {/* Phase 7: Disable entire form if locked or forbidden */}
          <fieldset disabled={isLocked || isForbidden} style={styles.fieldset}>
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
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Sadržaj (Engleski) {needsEnglish ? '*' : '(opcionalno)'}
              </h2>
              <button
                type="button"
                style={styles.translateButton}
                onClick={() => void handleTranslate()}
                disabled={translating || !titleHr.trim() || !bodyHr.trim() || isLocked || isForbidden}
                title={!titleHr.trim() || !bodyHr.trim() ? 'Unesite hrvatski sadržaj' : 'Prevedi na engleski'}
              >
                {translating ? 'Prevodim...' : 'Auto-prevedi (HR → EN)'}
              </button>
            </div>
            {!needsEnglish && (
              <p style={styles.hint}>
                Općinske poruke mogu biti samo na hrvatskom.
              </p>
            )}
            {showTranslateWarning && (
              <div style={styles.translateWarning}>
                Provjerite prijevod prije objave.
              </div>
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
              {ACTIVE_INBOX_TAGS.map((tag) => {
                const isAllowed = canUseMunicipalTag(tag);
                const isDisabled = !isAllowed && isMunicipalTag(tag);
                return (
                  <label
                    key={tag}
                    style={{
                      ...styles.tagLabel,
                      ...(isDisabled ? styles.disabledTagLabel : {}),
                    }}
                    title={isDisabled ? `Nemate ovlasti za ${TAG_LABELS[tag]} obavijesti` : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      style={styles.checkbox}
                      disabled={isDisabled}
                    />
                    <span
                      style={{
                        ...styles.tagText,
                        ...(selectedTags.includes(tag) ? styles.tagTextSelected : {}),
                        ...(isDisabled ? styles.disabledTagText : {}),
                      }}
                    >
                      {TAG_LABELS[tag]}
                      {isDisabled && ' 🔒'}
                    </span>
                  </label>
                );
              })}
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
              {(isLocked || isForbidden) ? 'Natrag' : 'Odustani'}
            </button>
            {!isLocked && !isForbidden && (
              <>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={saving || publishing}
                  data-testid="inbox-submit"
                >
                  {saving ? 'Spremanje...' : 'Spremi'}
                </button>
                {/* Package 2: Publish button for saved drafts */}
                {!isNew && !publishedAt && (
                  <button
                    type="button"
                    style={styles.publishButton}
                    onClick={() => void handlePublish()}
                    disabled={saving || publishing}
                    data-testid="inbox-publish"
                  >
                    {publishing ? 'Objavljujem...' : 'Objavi'}
                  </button>
                )}
              </>
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
  // Phase 3: Forbidden message styles
  forbiddenBanner: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '2px solid #fca5a5',
  },
  forbiddenNote: {
    color: '#b91c1c',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  // Phase 3: Disabled tag styles
  disabledTagLabel: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  disabledTagText: {
    color: '#9ca3af',
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
    margin: 0,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  translateButton: {
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  translateWarning: {
    padding: '10px 14px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #fbbf24',
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
  // Package 2: Publish button
  publishButton: {
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Package 2: Draft indicator
  draftBanner: {
    padding: '16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '2px solid #fbbf24',
  },
  draftNote: {
    color: '#b45309',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  // Package 2: Published indicator
  publishedBanner: {
    padding: '12px 16px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '1px solid #6ee7b7',
  },
  publishedAt: {
    color: '#047857',
    fontSize: '13px',
  },
  // Info banner for new messages
  info: {
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
  },
};

export default InboxEditPage;
