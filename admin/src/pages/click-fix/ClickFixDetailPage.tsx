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
import { adminClickFixApi } from '../../services/api';
import type { ClickFixDetail, ClickFixStatus } from '../../types/click-fix';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/click-fix';

// Backend URL for photo URLs
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://api.mojvis.hr';

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

  // TODO: Get from auth context
  const adminMunicipality: string | undefined = undefined;

  const fetchClickFix = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await adminClickFixApi.getClickFixDetail(id, adminMunicipality);
      setClickFix(data);
    } catch (err) {
      console.error('[Admin] Error fetching click fix:', err);
      setError('Greska pri ucitavanju prijave.');
    } finally {
      setLoading(false);
    }
  }, [id, adminMunicipality]);

  useEffect(() => {
    void fetchClickFix();
  }, [fetchClickFix]);

  const handleStatusChange = async (newStatus: ClickFixStatus) => {
    if (!id || !clickFix) return;

    setStatusUpdating(true);
    try {
      const updated = await adminClickFixApi.updateStatus(id, newStatus, adminMunicipality);
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
      const updated = await adminClickFixApi.addReply(
        id,
        { body: replyBody.trim() },
        adminMunicipality
      );
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
                  <div key={reply.id} style={styles.replyCard}>
                    <div style={styles.replyHeader}>
                      <span style={styles.replyLabel}>Odgovor admina</span>
                      <span style={styles.replyDate}>
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div style={styles.replyBody}>{reply.body}</div>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    marginBottom: '8px',
    display: 'block',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  error: {
    padding: '24px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '8px',
    textAlign: 'center',
  },
  backButton: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#721c24',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    gap: '24px',
  },
  mainColumn: {
    flex: 1,
  },
  sideColumn: {
    width: '300px',
    flexShrink: 0,
  },
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  messageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
  },
  messageSubject: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    marginBottom: '8px',
  },
  messageDate: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '16px',
  },
  messageBody: {
    fontSize: '16px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginBottom: '16px',
  },
  locationSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  locationLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666666',
  },
  locationValue: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#2E7D32',
  },
  mapLink: {
    fontSize: '14px',
    color: '#007bff',
    marginLeft: 'auto',
  },
  photosSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  photosGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  photoThumbnail: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #000000',
    cursor: 'pointer',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  repliesSection: {
    marginTop: '24px',
  },
  noReplies: {
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: '24px',
  },
  replyCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  replyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  replyLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#000000',
  },
  replyDate: {
    fontSize: '12px',
    color: '#666666',
  },
  replyBody: {
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  replyForm: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  replyFormTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  replyTextarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitButton: {
    marginTop: '12px',
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  actionsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  statusButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusButton: {
    padding: '10px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  statusButtonActive: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: '1px solid #000000',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  infoLabel: {
    color: '#666666',
  },
  infoValue: {
    fontWeight: '500',
  },
  lightbox: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lightboxClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    border: 'none',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  lightboxImage: {
    maxWidth: '90%',
    maxHeight: '80%',
    objectFit: 'contain',
  },
  lightboxNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginTop: '24px',
  },
  lightboxNavButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  lightboxCounter: {
    color: '#ffffff',
    fontSize: '14px',
  },
};

export default ClickFixDetailPage;
