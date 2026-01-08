/**
 * Event Edit Page (Admin)
 *
 * Create or edit an event.
 *
 * Rules (per spec):
 * - HR and EN both REQUIRED for events
 * - Events are live on save (no draft workflow)
 * - HR-only UI for admin panel
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminEventsApi } from '../../services/api';
import type { AdminEvent, AdminEventInput } from '../../types/event';

export function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [titleHr, setTitleHr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionHr, setDescriptionHr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [locationHr, setLocationHr] = useState('');
  const [locationEn, setLocationEn] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);

  // Load existing event if editing
  useEffect(() => {
    if (id) {
      void loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      const event = await adminEventsApi.getEvent(eventId);
      populateForm(event);
    } catch (err) {
      console.error('[Admin] Error loading event:', err);
      setError('Greška pri učitavanju događaja.');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (event: AdminEvent) => {
    setTitleHr(event.title_hr);
    setTitleEn(event.title_en);
    setDescriptionHr(event.description_hr || '');
    setDescriptionEn(event.description_en || '');
    setLocationHr(event.location_hr || '');
    setLocationEn(event.location_en || '');
    setIsAllDay(event.is_all_day);

    // Parse datetime
    const start = new Date(event.start_datetime);
    setStartDate(start.toISOString().split('T')[0]);
    setStartTime(start.toTimeString().slice(0, 5));

    if (event.end_datetime) {
      const end = new Date(event.end_datetime);
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!titleHr.trim()) {
      setError('Naslov (HR) je obavezan.');
      return;
    }
    if (!titleEn.trim()) {
      setError('Naslov (EN) je obavezan.');
      return;
    }
    if (!startDate) {
      setError('Datum početka je obavezan.');
      return;
    }

    // Build datetime strings
    const startDatetime = isAllDay
      ? `${startDate}T00:00:00`
      : `${startDate}T${startTime || '00:00'}:00`;

    let endDatetime: string | null = null;
    if (endDate) {
      endDatetime = isAllDay
        ? `${endDate}T23:59:59`
        : `${endDate}T${endTime || '23:59'}:00`;
    }

    const input: AdminEventInput = {
      title_hr: titleHr.trim(),
      title_en: titleEn.trim(),
      description_hr: descriptionHr.trim() || null,
      description_en: descriptionEn.trim() || null,
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      location_hr: locationHr.trim() || null,
      location_en: locationEn.trim() || null,
      is_all_day: isAllDay,
    };

    setSaving(true);

    try {
      if (isEditing && id) {
        await adminEventsApi.updateEvent(id, input);
      } else {
        await adminEventsApi.createEvent(input);
      }
      navigate('/events');
    } catch (err) {
      console.error('[Admin] Error saving event:', err);
      setError('Greška pri spremanju događaja.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={styles.container}>
          <div style={styles.loading}>Učitavanje...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isEditing ? 'Uredi događaj' : 'Novi događaj'}
          </h1>
          <button
            style={styles.backButton}
            onClick={() => navigate('/events')}
          >
            ← Natrag
          </button>
        </div>

        {/* Warning banner */}
        <div style={styles.warningBanner}>
          Događaj će biti objavljen odmah nakon spremanja.
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title HR */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Naslov (HR) <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={titleHr}
              onChange={(e) => setTitleHr(e.target.value)}
              style={styles.input}
              placeholder="Unesite naslov na hrvatskom"
            />
          </div>

          {/* Title EN */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Naslov (EN) <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              style={styles.input}
              placeholder="Enter title in English"
            />
          </div>

          {/* Date/Time row */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Datum početka <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.input}
              />
            </div>

            {!isAllDay && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Vrijeme početka</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Datum završetka</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.input}
              />
            </div>

            {!isAllDay && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Vrijeme završetka</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          {/* All day toggle */}
          <div style={styles.checkboxGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                style={styles.checkbox}
              />
              Cijeli dan
            </label>
          </div>

          {/* Location HR */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Lokacija (HR)</label>
            <input
              type="text"
              value={locationHr}
              onChange={(e) => setLocationHr(e.target.value)}
              style={styles.input}
              placeholder="Unesite lokaciju na hrvatskom"
            />
          </div>

          {/* Location EN */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Lokacija (EN)</label>
            <input
              type="text"
              value={locationEn}
              onChange={(e) => setLocationEn(e.target.value)}
              style={styles.input}
              placeholder="Enter location in English"
            />
          </div>

          {/* Description HR */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Opis (HR)</label>
            <textarea
              value={descriptionHr}
              onChange={(e) => setDescriptionHr(e.target.value)}
              style={styles.textarea}
              rows={4}
              placeholder="Unesite opis na hrvatskom"
            />
          </div>

          {/* Description EN */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Opis (EN)</label>
            <textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              style={styles.textarea}
              rows={4}
              placeholder="Enter description in English"
            />
          </div>

          {/* Submit */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={() => navigate('/events')}
            >
              Odustani
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={saving}
            >
              {saving ? 'Spremanje...' : isEditing ? 'Spremi promjene' : 'Kreiraj događaj'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px',
    maxWidth: '800px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  warningBanner: {
    padding: '12px 16px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  formGroup: {
    marginBottom: '20px',
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333333',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  checkboxGroup: {
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default EventEditPage;
