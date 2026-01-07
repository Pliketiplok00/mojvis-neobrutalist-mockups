/**
 * Feedback List Page (Admin)
 *
 * Lists all user feedback with status and actions.
 *
 * Rules (per spec):
 * - Admin cannot create feedback (user-initiated only)
 * - Admin can change status and add replies
 * - Scoped by municipality for local admins
 * - HR-only UI for admin panel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminFeedbackApi } from '../../services/api';
import type { FeedbackListItem, FeedbackStatus } from '../../types/feedback';
import { STATUS_COLORS } from '../../types/feedback';

export function FeedbackListPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // TODO: Get from auth context
  const adminMunicipality: string | undefined = undefined;

  const fetchFeedback = async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminFeedbackApi.getFeedback(pageNum, 20, adminMunicipality);
      setFeedback(response.items);
      setHasMore(response.has_more);
      setTotal(response.total);
    } catch (err) {
      console.error('[Admin] Error fetching feedback:', err);
      setError('Greska pri ucitavanju poruka. Pokusajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFeedback(page);
  }, [page]);

  const handleView = (id: string) => {
    navigate(`/feedback/${id}`);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadgeStyle = (status: FeedbackStatus): React.CSSProperties => {
    const colors = STATUS_COLORS[status];
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
    };
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Povratne informacije</h1>
            <p style={styles.subtitle}>{total} ukupno poruka</p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div style={styles.error}>
            {error}
            <button
              style={styles.retryButton}
              onClick={() => void fetchFeedback(page)}
            >
              Pokusaj ponovo
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <div style={styles.loading}>Ucitavanje...</div>}

        {/* Feedback table */}
        {!loading && !error && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Tema</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Jezik</th>
                  <th style={styles.th}>Odgovori</th>
                  <th style={styles.th}>Datum</th>
                  <th style={styles.th}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {feedback.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyRow}>
                      Nema primljenih povratnih informacija.
                    </td>
                  </tr>
                ) : (
                  feedback.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        <span style={styles.subjectText}>{item.subject}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={getStatusBadgeStyle(item.status)}>
                          {item.status_label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.languageTag}>
                          {item.language.toUpperCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.replyCount}>{item.reply_count}</span>
                      </td>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.viewButton}
                            onClick={() => handleView(item.id)}
                          >
                            Pregledaj
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && feedback.length > 0 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageButton}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prethodna
            </button>
            <span style={styles.pageInfo}>Stranica {page}</span>
            <button
              style={styles.pageButton}
              disabled={!hasMore}
              onClick={() => setPage(page + 1)}
            >
              Sljedeca
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: 0,
  },
  error: {
    padding: '16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#721c24',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  tableContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333333',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  emptyRow: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  subjectText: {
    fontWeight: '500',
  },
  languageTag: {
    backgroundColor: '#e9ecef',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#495057',
    fontWeight: '500',
  },
  replyCount: {
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  viewButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '24px',
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    color: '#666666',
  },
};

export default FeedbackListPage;
