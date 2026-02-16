/**
 * Service List Page (Admin)
 *
 * Lists all public services with status and actions.
 *
 * Features:
 * - Shows service type (permanent/periodic)
 * - Active/inactive status
 * - Edit, Deactivate, Restore actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminPublicServicesApi } from '../../services/api';
import type { PublicService } from '../../services/api';

export function ServiceListPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminPublicServicesApi.getAll();
      setServices(data);
    } catch (err) {
      console.error('[Admin] Error fetching services:', err);
      setError('Greska pri ucitavanju usluga. Pokusajte ponovo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchServices();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/services/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Jeste li sigurni da zelite deaktivirati ovu uslugu?')) {
      return;
    }

    try {
      await adminPublicServicesApi.delete(id);
      void fetchServices();
    } catch (err) {
      console.error('[Admin] Error deactivating service:', err);
      alert('Greska pri deaktivaciji usluge.');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await adminPublicServicesApi.restore(id);
      void fetchServices();
    } catch (err) {
      console.error('[Admin] Error restoring service:', err);
      alert('Greska pri aktivaciji usluge.');
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'permanent' ? 'Stalno dostupna' : 'Povremeno dostupna';
  };

  const getTypeBadgeColor = (type: string) => {
    return type === 'permanent' ? '#10b981' : '#f59e0b';
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Javne usluge</h1>
            <p style={styles.subtitle}>
              {services.length} usluga ukupno
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.loading}>Ucitavanje...</div>
        )}

        {/* Service List */}
        {!loading && (
          <div style={styles.list}>
            {services.map((service) => (
              <div
                key={service.id}
                style={{
                  ...styles.card,
                  opacity: service.is_active ? 1 : 0.6,
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.cardInfo}>
                    <span
                      style={{
                        ...styles.typeBadge,
                        backgroundColor: getTypeBadgeColor(service.type),
                      }}
                    >
                      {getTypeLabel(service.type)}
                    </span>
                    {!service.is_active && (
                      <span style={styles.inactiveBadge}>NEAKTIVNO</span>
                    )}
                    <h3 style={styles.serviceName}>{service.title_hr}</h3>
                    {service.subtitle_hr && (
                      <p style={styles.serviceSubtitle}>{service.subtitle_hr}</p>
                    )}
                    {service.address && (
                      <p style={styles.serviceAddress}>{service.address}</p>
                    )}
                  </div>
                  <div style={styles.actions}>
                    <button
                      style={styles.editButton}
                      onClick={() => handleEdit(service.id)}
                    >
                      Uredi
                    </button>
                    {service.is_active ? (
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete(service.id)}
                      >
                        Deaktiviraj
                      </button>
                    ) : (
                      <button
                        style={styles.restoreButton}
                        onClick={() => handleRestore(service.id)}
                      >
                        Aktiviraj
                      </button>
                    )}
                  </div>
                </div>

                {/* Info row */}
                <div style={styles.infoRow}>
                  {service.type === 'permanent' && service.working_hours.length > 0 && (
                    <span style={styles.infoItem}>
                      {service.working_hours.length} radno vrijeme
                    </span>
                  )}
                  {service.type === 'periodic' && service.scheduled_dates.length > 0 && (
                    <span style={styles.infoItem}>
                      {service.scheduled_dates.length} termin(a)
                    </span>
                  )}
                  {service.contacts.length > 0 && (
                    <span style={styles.infoItem}>
                      {service.contacts.length} kontakt(a)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <div style={styles.empty}>
            <p>Nema usluga.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0 0',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '2px solid #fecaca',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '2px solid #1a1a1a',
    boxShadow: '4px 4px 0 #1a1a1a',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  cardInfo: {
    flex: 1,
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    marginRight: '8px',
  },
  inactiveBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  serviceName: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '12px 0 4px 0',
    color: '#1a1a1a',
  },
  serviceSubtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 4px 0',
  },
  serviceAddress: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  restoreButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
  },
  infoRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
  },
  infoItem: {
    fontSize: '13px',
    color: '#666',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '2px dashed #d1d5db',
  },
};
