/**
 * Inbox List Page (Admin)
 *
 * Lists all inbox messages with filters and actions.
 *
 * Features:
 * - Tabs: Active / Archived
 * - Active: show Delete (archive) button
 * - Archived: show Restore button
 * - Municipal authorization enforced on actions
 *
 * Rules (per spec):
 * - Municipal messages only visible to authorized admins
 * - Messages are live on save (no draft workflow)
 * - HR-only UI for admin panel
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminInboxApi } from '../../services/api';
import type { InboxMessage, InboxTag } from '../../types/inbox';
import { TAG_LABELS, isMunicipalNotice, getMunicipalityFromTags } from '../../types/inbox';
import { useAuth } from '../../services/AuthContext';
import { styles } from './InboxListPage.styles';

type ViewMode = 'active' | 'archived';

export function InboxListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('active');

  const fetchMessages = async (pageNum: number, archived: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminInboxApi.getMessages(pageNum, 20, archived);
      setMessages(response.messages);
      setHasMore(response.has_more);
      setTotal(response.total);
    } catch (err) {
      console.error('[Admin] Error fetching messages:', err);
      setError('Greška pri učitavanju poruka. Pokušajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages(page, viewMode === 'archived');
  }, [page, viewMode]);

  // Reset to page 1 when switching tabs
  const handleViewModeChange = (mode: ViewMode) => {
    setPage(1);
    setViewMode(mode);
  };

  const handleCreate = () => {
    navigate('/messages/new');
  };

  const handleEdit = (id: string) => {
    navigate(`/messages/${id}`);
  };

  /**
   * Check if admin can edit/delete/restore a message based on municipal scope
   */
  const canEditMessage = (message: InboxMessage): boolean => {
    if (!user) return false;

    // Breakglass admin can edit any message
    if (user.is_breakglass) return true;

    // Non-municipal messages are always editable
    if (!isMunicipalNotice(message.tags)) return true;

    // Check municipal scope
    const messageMunicipality = getMunicipalityFromTags(message.tags);
    return user.notice_municipality_scope === messageMunicipality;
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Jeste li sigurni da želite arhivirati ovu poruku?')) {
      return;
    }

    try {
      await adminInboxApi.deleteMessage(id);
      void fetchMessages(page, viewMode === 'archived');
    } catch (err) {
      console.error('[Admin] Error archiving message:', err);
      alert('Greška pri arhiviranju poruke.');
    }
  };

  const handleRestore = async (id: string) => {
    if (!window.confirm('Jeste li sigurni da želite vratiti ovu poruku?')) {
      return;
    }

    try {
      await adminInboxApi.restoreMessage(id);
      void fetchMessages(page, viewMode === 'archived');
    } catch (err) {
      console.error('[Admin] Error restoring message:', err);
      alert('Greška pri vraćanju poruke.');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isMessageActive = (message: InboxMessage) => {
    const now = new Date();
    if (!message.active_from && !message.active_to) return false;
    if (message.active_from && new Date(message.active_from) > now) return false;
    if (message.active_to && new Date(message.active_to) < now) return false;
    return true;
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Poruke (Inbox)</h1>
            <p style={styles.subtitle}>
              {total} {viewMode === 'archived' ? 'arhiviranih' : 'aktivnih'} poruka
            </p>
          </div>
          {viewMode === 'active' && (
            <button
              style={styles.createButton}
              onClick={handleCreate}
              data-testid="inbox-create"
            >
              + Nova poruka
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(viewMode === 'active' ? styles.tabActive : {}),
            }}
            onClick={() => handleViewModeChange('active')}
            data-testid="inbox-tab-active"
          >
            Aktivne
          </button>
          <button
            style={{
              ...styles.tab,
              ...(viewMode === 'archived' ? styles.tabActive : {}),
            }}
            onClick={() => handleViewModeChange('archived')}
            data-testid="inbox-tab-archived"
          >
            Arhivirane
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div style={styles.error}>
            {error}
            <button
              style={styles.retryButton}
              onClick={() => void fetchMessages(page, viewMode === 'archived')}
            >
              Pokušaj ponovo
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && <div style={styles.loading}>Učitavanje...</div>}

        {/* Messages table */}
        {!loading && !error && (
          <div style={styles.tableContainer} data-testid="inbox-list">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Naslov</th>
                  <th style={styles.th}>Oznake</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Datum</th>
                  <th style={styles.th}>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyRow}>
                      {viewMode === 'archived'
                        ? 'Nema arhiviranih poruka.'
                        : 'Nema poruka. Kliknite "Nova poruka" za kreiranje.'}
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => {
                    const canEdit = canEditMessage(message);
                    const isArchived = viewMode === 'archived';

                    return (
                      <tr
                        key={message.id}
                        data-testid={`inbox-row-${message.id}`}
                        style={{
                          ...styles.clickableRow,
                          ...(isArchived ? styles.archivedRow : {}),
                        }}
                        onClick={() => handleEdit(message.id)}
                      >
                        <td style={styles.td}>
                          <div style={styles.titleCell}>
                            {isArchived && (
                              <span style={styles.archivedBadge}>ARHIV</span>
                            )}
                            {message.tags.includes('hitno') && (
                              <span style={styles.urgentBadge} data-testid={`inbox-hitno-${message.id}`}>HITNO</span>
                            )}
                            <span>{message.title_hr}</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tags}>
                            {message.tags
                              .filter((t) => t !== 'hitno')
                              .map((tag) => (
                                <span key={tag} style={styles.tag}>
                                  {TAG_LABELS[tag as InboxTag]}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td style={styles.td}>
                          {isArchived ? (
                            <span style={styles.statusArchived}>Arhivirana</span>
                          ) : isMessageActive(message) ? (
                            <span style={styles.statusActive}>Aktivna</span>
                          ) : message.active_from || message.active_to ? (
                            <span style={styles.statusInactive}>Neaktivna</span>
                          ) : (
                            <span style={styles.statusNone}>Bez banera</span>
                          )}
                        </td>
                        <td style={styles.td}>{formatDate(message.created_at)}</td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            {isArchived ? (
                              // Archived view: show Restore button
                              <button
                                style={{
                                  ...styles.restoreButton,
                                  ...(canEdit ? {} : styles.disabledButton),
                                }}
                                disabled={!canEdit}
                                title={canEdit ? 'Vrati poruku' : 'Nemate ovlasti'}
                                data-testid={`inbox-restore-${message.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canEdit) void handleRestore(message.id);
                                }}
                              >
                                Vrati
                              </button>
                            ) : (
                              // Active view: show Edit and Archive buttons
                              <>
                                <button
                                  style={styles.editButton}
                                  data-testid={`inbox-edit-${message.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(message.id);
                                  }}
                                >
                                  Uredi
                                </button>
                                <button
                                  style={{
                                    ...styles.deleteButton,
                                    ...(canEdit ? {} : styles.disabledButton),
                                  }}
                                  disabled={!canEdit}
                                  title={canEdit ? 'Arhiviraj poruku' : 'Nemate ovlasti'}
                                  data-testid={`inbox-delete-${message.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (canEdit) void handleDelete(message.id);
                                  }}
                                >
                                  Arhiviraj
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && messages.length > 0 && (
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

export default InboxListPage;
