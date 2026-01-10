/**
 * Static Pages List Page (Admin)
 *
 * Lists all static pages with publish status.
 * Phase 3: Static Content Pages
 *
 * Rules (per spec):
 * - Draft/publish workflow
 * - Shows publish status indicator
 * - Admin can view all, Supervisor can create/delete
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminStaticPagesApi } from '../../services/api';
import type { StaticPageAdmin } from '../../types/static-page';

export function PagesListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<StaticPageAdmin[]>([]);

  useEffect(() => {
    void loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const response = await adminStaticPagesApi.getPages();
      setPages(response.pages);
    } catch (err) {
      console.error('[Admin] Error loading pages:', err);
      setError('Greska pri ucitavanju stranica.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page: StaticPageAdmin) => {
    if (!confirm(`Jeste li sigurni da zelite obrisati stranicu "${page.slug}"?`)) {
      return;
    }

    try {
      await adminStaticPagesApi.deletePage(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
    } catch (err) {
      console.error('[Admin] Error deleting page:', err);
      alert('Greska pri brisanju stranice.');
    }
  };

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
          <h1 style={styles.title}>Staticne stranice</h1>
          <button
            style={styles.createButton}
            onClick={() => navigate('/pages/new')}
          >
            + Nova stranica
          </button>
        </div>

        {/* Info */}
        <div style={styles.info}>
          Draft/publish workflow: Izmjene se spremaju kao draft, objava zahtijeva odobrenje supervisora.
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Empty state */}
        {pages.length === 0 && !error && (
          <div style={styles.empty}>
            Nema staticnih stranica. Kliknite "Nova stranica" za kreiranje.
          </div>
        )}

        {/* Pages list */}
        {pages.length > 0 && (
          <table style={styles.table} data-testid="pages-list">
            <thead>
              <tr>
                <th style={styles.th}>Slug</th>
                <th style={styles.th}>Naslov (HR)</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Zadnja izmjena</th>
                <th style={styles.th}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr
                  key={page.id}
                  style={{ ...styles.tr, ...styles.clickableRow }}
                  data-testid={`pages-row-${page.id}`}
                  onClick={() => navigate(`/pages/${page.id}`)}
                >
                  <td style={styles.td}>
                    <code style={styles.slug}>{page.slug}</code>
                  </td>
                  <td style={styles.td}>{page.draft_header.title_hr}</td>
                  <td style={styles.td}>
                    <StatusBadge page={page} />
                  </td>
                  <td style={styles.td}>
                    {formatDate(page.draft_updated_at)}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button
                        style={styles.editButton}
                        data-testid={`pages-edit-${page.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/pages/${page.id}`);
                        }}
                      >
                        Uredi
                      </button>
                      <button
                        style={styles.deleteButton}
                        data-testid={`pages-delete-${page.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDelete(page);
                        }}
                      >
                        Obrisi
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

/**
 * Status badge component
 */
function StatusBadge({ page }: { page: StaticPageAdmin }) {
  if (!page.published_at) {
    return <span style={{ ...styles.badge, ...styles.badgeDraft }}>Draft</span>;
  }
  if (page.has_unpublished_changes) {
    return (
      <span style={{ ...styles.badge, ...styles.badgeChanged }}>
        Objavljen (s izmjenama)
      </span>
    );
  }
  return (
    <span style={{ ...styles.badge, ...styles.badgePublished }}>Objavljen</span>
  );
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  info: {
    padding: '12px 16px',
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
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
  empty: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  createButton: {
    padding: '12px 20px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    fontWeight: '600',
    fontSize: '13px',
    color: '#666666',
    borderBottom: '1px solid #e0e0e0',
  },
  tr: {
    borderBottom: '1px solid #e0e0e0',
  },
  clickableRow: {
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
  },
  slug: {
    backgroundColor: '#f1f3f4',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  badgeDraft: {
    backgroundColor: '#ffeaa7',
    color: '#856404',
  },
  badgePublished: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  badgeChanged: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#ffffff',
    color: '#dc3545',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    fontSize: '13px',
    cursor: 'pointer',
  },
};

export default PagesListPage;
