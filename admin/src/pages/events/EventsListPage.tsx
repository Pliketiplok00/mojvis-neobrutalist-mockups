/**
 * Events List Page (Admin)
 *
 * Lists all events with actions.
 *
 * Rules (per spec):
 * - HR and EN both REQUIRED for events
 * - Events are live on save (no draft workflow)
 * - HR-only UI for admin panel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminEventsApi } from '../../services/api';
import type { AdminEvent } from '../../types/event';

export function EventsListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchEvents = async (pageNum: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminEventsApi.getEvents(pageNum, 20);
      setEvents(response.events);
      setHasMore(response.has_more);
      setTotal(response.total);
    } catch (err) {
      console.error('[Admin] Error fetching events:', err);
      setError('Greška pri učitavanju događaja. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents(page);
  }, [page]);

  const handleCreate = () => {
    navigate('/events/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/events/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati ovaj događaj?')) {
      return;
    }

    try {
      await adminEventsApi.deleteEvent(id);
      void fetchEvents(page);
    } catch (err) {
      console.error('[Admin] Error deleting event:', err);
      alert('Greška pri brisanju događaja.');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('hr-HR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isEventUpcoming = (event: AdminEvent) => {
    return new Date(event.start_datetime) > new Date();
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Događaji</h1>
            <p style={styles.subtitle}>{total} ukupno događaja</p>
          </div>
          <button style={styles.createButton} onClick={handleCreate}>
            + Novi događaj
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div style={styles.error}>
            {error}
            <button
              style={styles.retryButton}
              onClick={() => void fetchEvents(page)}
            >
              Pokušaj ponovo
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <div style={styles.loading}>Učitavanje...</div>}

        {/* Events table */}
        {!loading && !error && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Naslov</th>
                  <th style={styles.th}>Datum</th>
                  <th style={styles.th}>Vrijeme</th>
                  <th style={styles.th}>Lokacija</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={styles.emptyRow}>
                      Nema događaja. Kliknite "Novi događaj" za kreiranje.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id}>
                      <td style={styles.td}>
                        <span>{event.title_hr}</span>
                      </td>
                      <td style={styles.td}>
                        {formatDate(event.start_datetime)}
                      </td>
                      <td style={styles.td}>
                        {event.is_all_day
                          ? 'Cijeli dan'
                          : formatTime(event.start_datetime)}
                      </td>
                      <td style={styles.td}>
                        {event.location_hr || '-'}
                      </td>
                      <td style={styles.td}>
                        {isEventUpcoming(event) ? (
                          <span style={styles.statusUpcoming}>Nadolazeći</span>
                        ) : (
                          <span style={styles.statusPast}>Prošli</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button
                            style={styles.editButton}
                            onClick={() => handleEdit(event.id)}
                          >
                            Uredi
                          </button>
                          <button
                            style={styles.deleteButton}
                            onClick={() => void handleDelete(event.id)}
                          >
                            Obriši
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
        {!loading && !error && events.length > 0 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageButton}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Prethodna
            </button>
            <span style={styles.pageInfo}>Stranica {page}</span>
            <button
              style={styles.pageButton}
              disabled={!hasMore}
              onClick={() => setPage(page + 1)}
            >
              Sljedeća →
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
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
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
  statusUpcoming: {
    color: '#28a745',
    fontWeight: '500',
  },
  statusPast: {
    color: '#6c757d',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
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

export default EventsListPage;
