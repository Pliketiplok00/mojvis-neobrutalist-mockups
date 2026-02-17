/**
 * Service Edit Page (Admin)
 *
 * Edit existing public service.
 *
 * Features:
 * - Basic info (title, subtitle, address) in HR and EN
 * - Dynamic contacts (phone/email)
 * - Working hours for permanent services
 * - Scheduled dates for periodic services
 * - Notes
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminPublicServicesApi } from '../../services/api';
import type {
  PublicService,
  Contact,
  WorkingHours,
  ScheduledDate,
  ServiceLocation,
  LocationHours,
} from '../../services/api';

export function ServiceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<PublicService | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [titleHr, setTitleHr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleHr, setSubtitleHr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [address, setAddress] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [scheduledDates, setScheduledDates] = useState<ScheduledDate[]>([]);
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [noteHr, setNoteHr] = useState('');
  const [noteEn, setNoteEn] = useState('');

  useEffect(() => {
    if (id) {
      void loadService(id);
    }
  }, [id]);

  const loadService = async (serviceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminPublicServicesApi.getById(serviceId);
      setService(data);

      // Populate form
      setTitleHr(data.title_hr);
      setTitleEn(data.title_en);
      setSubtitleHr(data.subtitle_hr || '');
      setSubtitleEn(data.subtitle_en || '');
      setAddress(data.address || '');
      setContacts(data.contacts || []);
      setWorkingHours(data.working_hours || []);
      setScheduledDates(data.scheduled_dates || []);
      setLocations(data.locations || []);
      setNoteHr(data.note_hr || '');
      setNoteEn(data.note_en || '');
    } catch (err) {
      console.error('[Admin] Error loading service:', err);
      setError('Greska pri ucitavanju usluge.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      await adminPublicServicesApi.update(id, {
        title_hr: titleHr,
        title_en: titleEn,
        subtitle_hr: subtitleHr || null,
        subtitle_en: subtitleEn || null,
        address: address || null,
        contacts,
        working_hours: workingHours,
        scheduled_dates: scheduledDates,
        locations,
        note_hr: noteHr || null,
        note_en: noteEn || null,
      });

      navigate('/services');
    } catch (err) {
      console.error('[Admin] Error saving service:', err);
      setError('Greska pri spremanju usluge.');
    } finally {
      setSaving(false);
    }
  };

  // Contact handlers
  const addContact = () => {
    setContacts([...contacts, { type: 'phone', value: '' }]);
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    if (field === 'type') {
      updated[index] = { ...updated[index], type: value as 'phone' | 'email' };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setContacts(updated);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  // Working hours handlers (for permanent services)
  const addWorkingHours = () => {
    setWorkingHours([
      ...workingHours,
      { time: '', description_hr: '', description_en: '' },
    ]);
  };

  const updateWorkingHours = (
    index: number,
    field: keyof WorkingHours,
    value: string
  ) => {
    const updated = [...workingHours];
    updated[index] = { ...updated[index], [field]: value };
    setWorkingHours(updated);
  };

  const removeWorkingHours = (index: number) => {
    setWorkingHours(workingHours.filter((_, i) => i !== index));
  };

  // Scheduled dates handlers (for periodic services)
  const addScheduledDate = () => {
    setScheduledDates([
      ...scheduledDates,
      {
        date: '',
        time_from: '',
        time_to: '',
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const updateScheduledDate = (
    index: number,
    field: keyof ScheduledDate,
    value: string
  ) => {
    const updated = [...scheduledDates];
    updated[index] = { ...updated[index], [field]: value };
    setScheduledDates(updated);
  };

  const removeScheduledDate = (index: number) => {
    setScheduledDates(scheduledDates.filter((_, i) => i !== index));
  };

  // Location handlers (for multi-location services like pharmacies)
  const addLocation = () => {
    setLocations([
      ...locations,
      {
        name_hr: '',
        name_en: '',
        address: '',
        phone: '',
        hours: [],
      },
    ]);
  };

  const updateLocation = (
    index: number,
    field: keyof ServiceLocation,
    value: string | LocationHours[]
  ) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    setLocations(updated);
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const addLocationHours = (locIndex: number) => {
    const updated = [...locations];
    updated[locIndex] = {
      ...updated[locIndex],
      hours: [
        ...updated[locIndex].hours,
        { time: '', description_hr: '', description_en: '' },
      ],
    };
    setLocations(updated);
  };

  const updateLocationHours = (
    locIndex: number,
    hourIndex: number,
    field: keyof LocationHours,
    value: string
  ) => {
    const updated = [...locations];
    const hours = [...updated[locIndex].hours];
    hours[hourIndex] = { ...hours[hourIndex], [field]: value };
    updated[locIndex] = { ...updated[locIndex], hours };
    setLocations(updated);
  };

  const removeLocationHours = (locIndex: number, hourIndex: number) => {
    const updated = [...locations];
    updated[locIndex] = {
      ...updated[locIndex],
      hours: updated[locIndex].hours.filter((_, i) => i !== hourIndex),
    };
    setLocations(updated);
  };

  // Check if service has multiple locations
  const hasLocations = locations.length > 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.loading}>Ucitavanje...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.error}>Usluga nije pronadena.</div>
          <button style={styles.backButton} onClick={() => navigate('/services')}>
            Natrag na listu
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isPermanent = service.type === 'permanent';

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backLink} onClick={() => navigate('/services')}>
            &larr; Natrag
          </button>
          <h1 style={styles.title}>Uredi: {service.title_hr}</h1>
          <span
            style={{
              ...styles.typeBadge,
              backgroundColor: isPermanent ? '#10b981' : '#f59e0b',
            }}
          >
            {isPermanent ? 'Stalno dostupna' : 'Povremeno dostupna'}
          </span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.form}>
          {/* Basic Info Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Osnovni podaci</h2>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Naziv (HR) *</label>
                <input
                  style={styles.input}
                  value={titleHr}
                  onChange={(e) => setTitleHr(e.target.value)}
                  placeholder="Dom zdravlja"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Naziv (EN) *</label>
                <input
                  style={styles.input}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Health Center"
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Podnaslov (HR)</label>
                <input
                  style={styles.input}
                  value={subtitleHr}
                  onChange={(e) => setSubtitleHr(e.target.value)}
                  placeholder="Primarna zdravstvena zastita"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Podnaslov (EN)</label>
                <input
                  style={styles.input}
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  placeholder="Primary healthcare"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Adresa</label>
              <input
                style={styles.input}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Put Mula 12, Vis"
              />
            </div>
          </section>

          {/* Contacts Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Kontakti</h2>

            {contacts.map((contact, index) => (
              <div key={index} style={styles.dynamicRow}>
                <select
                  style={styles.select}
                  value={contact.type}
                  onChange={(e) => updateContact(index, 'type', e.target.value)}
                >
                  <option value="phone">Telefon</option>
                  <option value="email">Email</option>
                </select>
                <input
                  style={styles.inputFlex}
                  value={contact.value}
                  onChange={(e) => updateContact(index, 'value', e.target.value)}
                  placeholder={
                    contact.type === 'phone'
                      ? '+385 21 711 155'
                      : 'info@example.hr'
                  }
                />
                <button
                  style={styles.removeButton}
                  onClick={() => removeContact(index)}
                  type="button"
                >
                  Ukloni
                </button>
              </div>
            ))}

            <button style={styles.addButton} onClick={addContact} type="button">
              + Dodaj kontakt
            </button>
          </section>

          {/* Working Hours (permanent) or Scheduled Dates (periodic) */}
          {isPermanent ? (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Radno vrijeme</h2>

              {workingHours.map((wh, index) => (
                <div key={index} style={styles.dynamicCard}>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Vrijeme</label>
                      <input
                        style={styles.input}
                        value={wh.time}
                        onChange={(e) =>
                          updateWorkingHours(index, 'time', e.target.value)
                        }
                        placeholder="08:00-16:00"
                      />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Opis (HR)</label>
                      <input
                        style={styles.input}
                        value={wh.description_hr}
                        onChange={(e) =>
                          updateWorkingHours(index, 'description_hr', e.target.value)
                        }
                        placeholder="Pon - Pet"
                      />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Opis (EN)</label>
                      <input
                        style={styles.input}
                        value={wh.description_en}
                        onChange={(e) =>
                          updateWorkingHours(index, 'description_en', e.target.value)
                        }
                        placeholder="Mon - Fri"
                      />
                    </div>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeWorkingHours(index)}
                    type="button"
                  >
                    Ukloni
                  </button>
                </div>
              ))}

              <button
                style={styles.addButton}
                onClick={addWorkingHours}
                type="button"
              >
                + Dodaj radno vrijeme
              </button>
            </section>
          ) : (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Zakazani termini</h2>
              <p style={styles.hint}>
                Tag &quot;NOVI DATUMI&quot; ce se prikazati 7 dana nakon dodavanja
                novog termina.
              </p>

              {scheduledDates.map((sd, index) => (
                <div key={index} style={styles.dynamicCard}>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Datum</label>
                      <input
                        style={styles.input}
                        type="date"
                        value={sd.date}
                        onChange={(e) =>
                          updateScheduledDate(index, 'date', e.target.value)
                        }
                      />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Od</label>
                      <input
                        style={styles.input}
                        type="time"
                        value={sd.time_from}
                        onChange={(e) =>
                          updateScheduledDate(index, 'time_from', e.target.value)
                        }
                      />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Do</label>
                      <input
                        style={styles.input}
                        type="time"
                        value={sd.time_to}
                        onChange={(e) =>
                          updateScheduledDate(index, 'time_to', e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeScheduledDate(index)}
                    type="button"
                  >
                    Ukloni
                  </button>
                </div>
              ))}

              <button
                style={styles.addButton}
                onClick={addScheduledDate}
                type="button"
              >
                + Dodaj termin
              </button>
            </section>
          )}

          {/* Locations Section (for multi-location services) */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Lokacije</h2>
            <p style={styles.hint}>
              Za usluge s vise lokacija (npr. Ljekarne). Ako usluga ima lokacije,
              pojedinacna adresa/kontakt iznad se ignoriraju.
            </p>

            {locations.map((loc, locIndex) => (
              <div key={locIndex} style={styles.locationCard}>
                <div style={styles.locationHeader}>
                  <span style={styles.locationTitle}>Lokacija {locIndex + 1}</span>
                  <button
                    style={styles.removeButton}
                    onClick={() => removeLocation(locIndex)}
                    type="button"
                  >
                    Ukloni lokaciju
                  </button>
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Naziv (HR) *</label>
                    <input
                      style={styles.input}
                      value={loc.name_hr}
                      onChange={(e) =>
                        updateLocation(locIndex, 'name_hr', e.target.value)
                      }
                      placeholder="Ljekarna Vis"
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Naziv (EN) *</label>
                    <input
                      style={styles.input}
                      value={loc.name_en}
                      onChange={(e) =>
                        updateLocation(locIndex, 'name_en', e.target.value)
                      }
                      placeholder="Pharmacy Vis"
                    />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Adresa *</label>
                    <input
                      style={styles.input}
                      value={loc.address}
                      onChange={(e) =>
                        updateLocation(locIndex, 'address', e.target.value)
                      }
                      placeholder="Vukovarska ul. 2, 21480 Vis"
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Telefon *</label>
                    <input
                      style={styles.input}
                      value={loc.phone}
                      onChange={(e) =>
                        updateLocation(locIndex, 'phone', e.target.value)
                      }
                      placeholder="+385 21 711 434"
                    />
                  </div>
                </div>

                {/* Location Hours */}
                <div style={styles.locationHoursSection}>
                  <label style={styles.label}>Radno vrijeme</label>
                  {loc.hours.map((hour, hourIndex) => (
                    <div key={hourIndex} style={styles.dynamicRow}>
                      <input
                        style={{ ...styles.inputFlex, flex: 1 }}
                        value={hour.time}
                        onChange={(e) =>
                          updateLocationHours(
                            locIndex,
                            hourIndex,
                            'time',
                            e.target.value
                          )
                        }
                        placeholder="08:00-13:00"
                      />
                      <input
                        style={{ ...styles.inputFlex, flex: 1 }}
                        value={hour.description_hr}
                        onChange={(e) =>
                          updateLocationHours(
                            locIndex,
                            hourIndex,
                            'description_hr',
                            e.target.value
                          )
                        }
                        placeholder="Pon - Pet"
                      />
                      <input
                        style={{ ...styles.inputFlex, flex: 1 }}
                        value={hour.description_en}
                        onChange={(e) =>
                          updateLocationHours(
                            locIndex,
                            hourIndex,
                            'description_en',
                            e.target.value
                          )
                        }
                        placeholder="Mon - Fri"
                      />
                      <button
                        style={styles.removeButtonSmall}
                        onClick={() => removeLocationHours(locIndex, hourIndex)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    style={styles.addButtonSmall}
                    onClick={() => addLocationHours(locIndex)}
                    type="button"
                  >
                    + Dodaj radno vrijeme
                  </button>
                </div>
              </div>
            ))}

            <button style={styles.addButton} onClick={addLocation} type="button">
              + Dodaj lokaciju
            </button>
          </section>

          {/* Notes Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Napomena</h2>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Napomena (HR)</label>
                <textarea
                  style={styles.textarea}
                  value={noteHr}
                  onChange={(e) => setNoteHr(e.target.value)}
                  rows={3}
                  placeholder="Hitna pomoc dostupna 24/7 na broj 194"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Napomena (EN)</label>
                <textarea
                  style={styles.textarea}
                  value={noteEn}
                  onChange={(e) => setNoteEn(e.target.value)}
                  rows={3}
                  placeholder="Emergency available 24/7 at 194"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.cancelButton}
              onClick={() => navigate('/services')}
              type="button"
            >
              Odustani
            </button>
            <button
              style={styles.saveButton}
              onClick={handleSave}
              disabled={saving}
              type="button"
            >
              {saving ? 'Spremanje...' : 'Spremi'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '24px',
    maxWidth: '900px',
  },
  header: {
    marginBottom: '24px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    marginBottom: '8px',
    display: 'block',
  },
  backButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#1a1a1a',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '2px solid #1a1a1a',
    boxShadow: '4px 4px 0 #1a1a1a',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    color: '#1a1a1a',
  },
  hint: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  field: {
    flex: 1,
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box' as const,
  },
  inputFlex: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    width: '120px',
    backgroundColor: '#fff',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    resize: 'vertical' as const,
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  },
  dynamicRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  dynamicCard: {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '12px',
    border: '1px solid #e5e7eb',
  },
  addButton: {
    padding: '10px 16px',
    backgroundColor: '#f3f4f6',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#6b7280',
    width: '100%',
  },
  removeButton: {
    padding: '6px 12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  locationCard: {
    padding: '20px',
    backgroundColor: '#f0fdf4',
    borderRadius: '8px',
    marginBottom: '16px',
    border: '2px solid #86efac',
  },
  locationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  locationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#166534',
  },
  locationHoursSection: {
    marginTop: '12px',
  },
  addButtonSmall: {
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    border: '1px dashed #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  },
  removeButtonSmall: {
    padding: '4px 10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    minWidth: '32px',
  },
};
