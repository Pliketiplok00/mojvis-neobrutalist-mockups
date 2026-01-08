/**
 * Feedback Detail Page (Admin)
 *
 * View feedback details, change status, and add replies.
 *
 * Rules (per spec):
 * - Admin can change status
 * - Admin can add multiple replies (thread)
 * - Reply language must match original feedback language
 * - HR-only UI for admin panel
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminFeedbackApi } from '../../services/api';
import type { FeedbackDetail, FeedbackStatus } from '../../types/feedback';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/feedback';

export function FeedbackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // TODO: Get from auth context
  const adminMunicipality: string | undefined = undefined;

  const fetchFeedback = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await adminFeedbackApi.getFeedbackDetail(id, adminMunicipality);
      setFeedback(data);
    } catch (err) {
      console.error('[Admin] Error fetching feedback:', err);
      setError('Greska pri ucitavanju poruke.');
    } finally {
      setLoading(false);
    }
  }, [id, adminMunicipality]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (!id || !feedback) return;

    setStatusUpdating(true);
    try {
      const updated = await adminFeedbackApi.updateStatus(id, newStatus, adminMunicipality);
      setFeedback(updated);
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
      await adminFeedbackApi.addReply(
        id,
        { body: replyBody.trim() },
        adminMunicipality
      );
      // Refetch to get updated feedback with new reply
      const updated = await adminFeedbackApi.getFeedbackDetail(id, adminMunicipality);
      setFeedback(updated);
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

  const getStatusBadgeStyle = (status: FeedbackStatus): React.CSSProperties => {
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

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.loading}>Ucitavanje...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !feedback) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.error}>
            {error || 'Poruka nije pronadena.'}
            <button style={styles.backButton} onClick={() => navigate('/feedback')}>
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
          <button style={styles.backLink} onClick={() => navigate('/feedback')}>
            &larr; Povratak na popis
          </button>
          <h1 style={styles.title}>Povratna informacija</h1>
        </div>

        {/* Main content */}
        <div style={styles.content}>
          {/* Left column - Message details */}
          <div style={styles.mainColumn}>
            {/* Status badge */}
            <div style={styles.statusSection}>
              <span style={getStatusBadgeStyle(feedback.status)}>
                {feedback.status_label}
              </span>
              <span style={styles.languageTag}>
                Jezik: {feedback.language.toUpperCase()}
              </span>
            </div>

            {/* Original message */}
            <div style={styles.messageCard}>
              <h2 style={styles.messageSubject}>{feedback.subject}</h2>
              <p style={styles.messageDate}>
                Primljeno: {formatDate(feedback.created_at)}
              </p>
              <div style={styles.messageBody}>{feedback.body}</div>
            </div>

            {/* Replies section */}
            <div style={styles.repliesSection}>
              <h3 style={styles.sectionTitle}>
                Odgovori ({feedback.replies.length})
              </h3>

              {feedback.replies.length === 0 ? (
                <p style={styles.noReplies}>Jos nema odgovora na ovu poruku.</p>
              ) : (
                feedback.replies.map((reply) => (
                  <div key={reply.id} style={styles.replyCard} data-testid={`feedback-reply-${reply.id}`}>
                    <div style={styles.replyHeader}>
                      <span style={styles.replyLabel}>Odgovor admina</span>
                      <span style={styles.replyDate}>
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <div style={styles.replyBody} data-testid="feedback-reply-body">{reply.body}</div>
                  </div>
                ))
              )}

              {/* Reply form */}
              <div style={styles.replyForm}>
                <h4 style={styles.replyFormTitle}>Dodaj odgovor</h4>
                <p style={styles.replyHint}>
                  Odgovor mora biti na {feedback.language === 'hr' ? 'hrvatskom' : 'engleskom'} jeziku.
                </p>
                <textarea
                  style={styles.replyTextarea}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Unesite tekst odgovora..."
                  rows={4}
                  disabled={submitting}
                  data-testid="feedback-reply-input"
                />
                <button
                  style={styles.submitButton}
                  onClick={() => void handleSubmitReply()}
                  disabled={submitting || !replyBody.trim()}
                  data-testid="feedback-reply-submit"
                >
                  {submitting ? 'Slanje...' : 'Posalji odgovor'}
                </button>
              </div>
            </div>
          </div>

          {/* Right column - Actions */}
          <div style={styles.sideColumn}>
            <div style={styles.actionsCard} data-testid="feedback-status-section">
              <h3 style={styles.actionsTitle}>Promijeni status</h3>
              <div style={styles.statusButtons}>
                {(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((status) => (
                  <button
                    key={status}
                    data-testid={`feedback-status-${status}`}
                    style={{
                      ...styles.statusButton,
                      ...(feedback.status === status ? styles.statusButtonActive : {}),
                    }}
                    onClick={() => void handleStatusChange(status)}
                    disabled={statusUpdating || feedback.status === status}
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
                <span style={styles.infoValue}>{feedback.id.slice(0, 8)}...</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Uredaj:</span>
                <span style={styles.infoValue}>{feedback.device_id.slice(0, 8)}...</span>
              </div>
              {feedback.municipality && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Opcina:</span>
                  <span style={styles.infoValue}>{feedback.municipality}</span>
                </div>
              )}
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Azurirano:</span>
                <span style={styles.infoValue}>{formatDate(feedback.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  languageTag: {
    backgroundColor: '#e9ecef',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#495057',
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
  },
  repliesSection: {
    marginTop: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
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
    marginBottom: '4px',
  },
  replyHint: {
    fontSize: '12px',
    color: '#666666',
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
};

export default FeedbackDetailPage;
