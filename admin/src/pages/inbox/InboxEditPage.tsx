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
  isMunicipalTag,
  getMunicipalityFromTags,
} from '../../types/inbox';
import { styles } from './InboxEditPage.styles';

/**
 * Backend error code to Croatian message mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Inbox errors
  MESSAGE_LOCKED: 'Ova poruka je zaključana jer je poslana push obavijest. Nije moguće uređivati.',
  ALREADY_PUBLISHED: 'Poruka je već objavljena.',
  MESSAGE_DELETED: 'Poruka je obrisana.',
  NOT_ARCHIVED: 'Poruka nije arhivirana.',
  TAGS_EMPTY: 'Odaberite barem jednu oznaku.',
  TAGS_MAX_EXCEEDED: 'Maksimalno 2 oznake su dozvoljene.',
  HITNO_MISSING_CONTEXT: 'Hitno poruke moraju imati jednu kontekst oznaku.',
  HITNO_MISSING_DATES: 'Hitno poruke moraju imati definirani aktivni period.',
  // Auth errors
  UNAUTHENTICATED: 'Niste prijavljeni. Prijavite se ponovo.',
  SESSION_INVALID: 'Sesija je istekla. Prijavite se ponovo.',
  // Translation errors
  TRANSLATION_NOT_CONFIGURED: 'Usluga prijevoda nije dostupna.',
  TRANSLATION_FAILED: 'Prijevod nije uspio. Pokušajte ponovo.',
};

/**
 * Parse error response and return Croatian message
 */
function getErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Dogodila se neočekivana greška.';
  }

  const message = error.message;

  // Check for known error codes in the message
  for (const [code, croatianMessage] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(code)) {
      return croatianMessage;
    }
  }

  // Check for HTTP status codes
  if (message.includes('409')) {
    return 'Konflikt: poruka je već objavljena ili zaključana.';
  }
  if (message.includes('403')) {
    return 'Nemate ovlasti za ovu radnju.';
  }
  if (message.includes('404')) {
    return 'Poruka nije pronađena.';
  }

  return 'Greška pri spremanju. Pokušajte ponovo.';
}

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
      // If deselecting, just remove it
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }

      // vis + komiza are mutually exclusive
      let newTags = prev;
      if (tag === 'vis' && prev.includes('komiza')) {
        newTags = prev.filter((t) => t !== 'komiza');
      } else if (tag === 'komiza' && prev.includes('vis')) {
        newTags = prev.filter((t) => t !== 'vis');
      }

      // Max 2 tags - replace oldest if at limit
      if (newTags.length >= 2) {
        return [newTags[1], tag];
      }
      return [...newTags, tag];
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
    if (selectedTags.length === 0) {
      setError('Odaberite barem jednu oznaku.');
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
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      // Check if locked
      if (err instanceof Error && (err.message.includes('locked') || err.message.includes('MESSAGE_LOCKED'))) {
        setIsLocked(true);
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

    // Validate EN fields before publish (same as save)
    if (requiresEnglish(selectedTags) && (!titleEn.trim() || !bodyEn.trim())) {
      setError('Engleski prijevod je obavezan za ne-općinske poruke.');
      return;
    }

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
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      // Check if already published
      if (err instanceof Error && (err.message.includes('ALREADY_PUBLISHED') || err.message.includes('409'))) {
        setPublishedAt(new Date().toISOString()); // Mark as published to update UI
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
      if (err instanceof Error && (err.message.includes('503') || err.message.includes('TRANSLATION_NOT_CONFIGURED'))) {
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
                ⚠️ Provjerite prijevod prije objave.
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
            </div>
            {selectedTags.length > 0 && (
              <p style={styles.selectedTags}>
                Odabrano: {selectedTags.map((t) => TAG_LABELS[t]).join(', ')}
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

export default InboxEditPage;
