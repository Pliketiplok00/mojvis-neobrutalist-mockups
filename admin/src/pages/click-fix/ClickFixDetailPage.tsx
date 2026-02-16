/**
 * Click & Fix Detail Page (Admin)
 *
 * View Click & Fix details, photos, location, change status, and add replies.
 *
 * Phase 6: Click & Fix feature.
 *
 * Rules (per spec):
 * - Admin can change status
 * - Admin can add multiple replies (thread)
 * - Photos displayed in gallery
 * - Location shown as coordinates
 * - HR-only UI for admin panel
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminClickFixApi, API_BASE_URL } from '../../services/api';
import type { ClickFixDetail, ClickFixStatus } from '../../types/click-fix';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/click-fix';
import { styles } from './ClickFixDetailPage.styles';

export function ClickFixDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [clickFix, setClickFix] = useState<ClickFixDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const fetchClickFix = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await adminClickFixApi.getClickFixDetail(id);
      setClickFix(data);
    } catch (err) {
      console.error('[Admin] Error fetching click fix:', err);
      setError('Greska pri ucitavanju prijave.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchClickFix();
  }, [fetchClickFix]);

  const handleStatusChange = async (newStatus: ClickFixStatus) => {
    if (!id || !clickFix) return;

    setStatusUpdating(true);
    try {
      const updated = await adminClickFixApi.updateStatus(id, newStatus);
      setClickFix(updated);
    } catch (err) {
      console.error('[Admin] Error updating status:', err);
      alert('Greska pri promjeni statusa.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!id || !replyBody.trim()) return;

    setSubmitting(true);
    try {
      await adminClickFixApi.addReply(id, { body: replyBody.trim() });
      // Refetch to get updated click-fix with new reply
      const updated = await adminClickFixApi.getClickFixDetail(id);
      setClickFix(updated);
      setReplyBody('');
    } catch (err) {
      console.error('[Admin] Error submitting reply:', err);
      alert('Greska pri slanju odgovora.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusBadgeStyle = (status: ClickFixStatus): React.CSSProperties => {
    const colors = STATUS_COLORS[status];
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-block',
    };
  };

  const getPhotoUrl = (url: string): string => {
    // If the URL is relative (starts with /uploads), prepend the API base URL
    if (url.startsWith('/uploads')) {
      return `${API_BASE_URL}${url}`;
    }
    return url;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.loading}>Ucitavanje...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !clickFix) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.error}>
            {error || 'Prijava nije pronadena.'}
            <button style={styles.backButton} onClick={() => navigate('/click-fix')}>
              Natrag na popis
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backLink} onClick={() => navigate('/click-fix')}>
            &larr; Povratak na popis
          </button>
          <h1 style={styles.title}>Click & Fix prijava</h1>
        </div>

        {/* Main content */}
        <div style={styles.content}>
          {/* Left column - Message details */}
          <div style={styles.mainColumn}>
            {/* Status badge */}
            <div style={styles.statusSection}>
              <span style={getStatusBadgeStyle(clickFix.status)}>
                {clickFix.status_label}
              </span>
            </div>

            {/* Original message */}
            <div style={styles.messageCard}>
              <h2 style={styles.messageSubject}>{clickFix.subject}</h2>
              <p style={styles.messageDate}>
                Primljeno: {formatDate(clickFix.created_at)}
              </p>
              <div style={styles.messageBody}>{clickFix.description}</div>

              {/* Location */}
              <div style={styles.locationSection}>
                <span style={styles.locationLabel}>Lokacija:</span>
                <span style={styles.locationValue}>
                  {clickFix.location.lat.toFixed(6)}, {clickFix.location.lng.toFixed(6)}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${clickFix.location.lat},${clickFix.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.mapLink}
                  data-testid="clickfix-map-link"
                >
                  Otvori na karti
                </a>
              </div>
            </div>

            {/* Photos section */}
            {clickFix.photos.length > 0 && (
              <div style={styles.photosSection} data-testid="clickfix-photos">
                <h3 style={styles.sectionTitle}>
                  Slike ({clickFix.photos.length})
                </h3>
                <div style={styles.photosGrid}>
                  {clickFix.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      style={styles.photoThumbnail}
                      onClick={() => setSelectedPhotoIndex(index)}
                      data-testid={`clickfix-photo-${index}`}
                    >
                      <img
                        src={getPhotoUrl(photo.url)}
                        alt={`Slika ${index + 1}`}
                        style={styles.photoImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Replies section */}
            <div style={styles.repliesSection}>
              <h3 style={styles.sectionTitle}>
                Odgovori ({clickFix.replies.length})
              </h3>

              {clickFix.replies.length === 0 ? (
                <p style={styles.noReplies}>Jos nema odgovora na ovu prijavu.</p>
              ) : (
                clickFix.replies.map((reply) => (
                  <div key={reply.id} style={styles.replyCard} data-testid={`clickfix-reply-${reply.id}`}>
                    <div style={styles.replyHeader}>
                      <span style={styles.replyLabel}>Odgovor admina</span>
                      <span style={styles.replyDate}>
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div style={styles.replyBody} data-testid="clickfix-reply-body">{reply.body}</div>
                  </div>
                ))
              )}

              {/* Reply form */}
              <div style={styles.replyForm}>
                <h4 style={styles.replyFormTitle}>Dodaj odgovor</h4>
                <textarea
                  style={styles.replyTextarea}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Unesite tekst odgovora..."
                  rows={4}
                  disabled={submitting}
                  data-testid="clickfix-reply-input"
                />
                <button
                  style={styles.submitButton}
                  onClick={() => void handleSubmitReply()}
                  disabled={submitting || !replyBody.trim()}
                  data-testid="clickfix-reply-submit"
                >
                  {submitting ? 'Slanje...' : 'Posalji odgovor'}
                </button>
              </div>
            </div>
          </div>

          {/* Right column - Actions */}
          <div style={styles.sideColumn}>
            <div style={styles.actionsCard} data-testid="clickfix-status-section">
              <h3 style={styles.actionsTitle}>Promijeni status</h3>
              <div style={styles.statusButtons}>
                {(Object.keys(STATUS_LABELS) as ClickFixStatus[]).map((status) => (
                  <button
                    key={status}
                    data-testid={`clickfix-status-${status}`}
                    style={{
                      ...styles.statusButton,
                      ...(clickFix.status === status ? styles.statusButtonActive : {}),
                    }}
                    onClick={() => void handleStatusChange(status)}
                    disabled={statusUpdating || clickFix.status === status}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.infoCard}>
              <h3 style={styles.infoTitle}>Informacije</h3>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>ID:</span>
                <span style={styles.infoValue}>{clickFix.id.slice(0, 8)}...</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Uredaj:</span>
                <span style={styles.infoValue}>{clickFix.device_id.slice(0, 8)}...</span>
              </div>
              {clickFix.municipality && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Opcina:</span>
                  <span style={styles.infoValue}>{clickFix.municipality}</span>
                </div>
              )}
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Slike:</span>
                <span style={styles.infoValue}>{clickFix.photos.length}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Azurirano:</span>
                <span style={styles.infoValue}>{formatDate(clickFix.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo lightbox modal */}
      {selectedPhotoIndex !== null && clickFix.photos[selectedPhotoIndex] && (
        <div style={styles.lightbox} onClick={() => setSelectedPhotoIndex(null)}>
          <button
            style={styles.lightboxClose}
            onClick={() => setSelectedPhotoIndex(null)}
          >
            X
          </button>
          <img
            src={getPhotoUrl(clickFix.photos[selectedPhotoIndex].url)}
            alt={`Slika ${selectedPhotoIndex + 1}`}
            style={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={styles.lightboxNav}>
            <button
              style={styles.lightboxNavButton}
              disabled={selectedPhotoIndex === 0}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(selectedPhotoIndex - 1);
              }}
            >
              &larr; Prethodna
            </button>
            <span style={styles.lightboxCounter}>
              {selectedPhotoIndex + 1} / {clickFix.photos.length}
            </span>
            <button
              style={styles.lightboxNavButton}
              disabled={selectedPhotoIndex === clickFix.photos.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPhotoIndex(selectedPhotoIndex + 1);
              }}
            >
              Sljedeca &rarr;
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ClickFixDetailPage;
