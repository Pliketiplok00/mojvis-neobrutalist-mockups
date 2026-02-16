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

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { styles } from './EventEditPage.styles';
import { useEventEdit } from './useEventEdit';

export function EventEditPage() {
  const {
    loading,
    saving,
    error,
    isEditing,
    titleHr,
    setTitleHr,
    titleEn,
    setTitleEn,
    descriptionHr,
    setDescriptionHr,
    descriptionEn,
    setDescriptionEn,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    isAllDay,
    setIsAllDay,
    locationHr,
    setLocationHr,
    locationEn,
    setLocationEn,
    organizerHr,
    setOrganizerHr,
    organizerEn,
    setOrganizerEn,
    imageUrl,
    setImageUrl,
    handleSubmit,
    navigateBack,
  } = useEventEdit();

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
            onClick={navigateBack}
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

          {/* Organizer HR */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Organizator (HR) <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={organizerHr}
              onChange={(e) => setOrganizerHr(e.target.value)}
              style={styles.input}
              placeholder="Unesite organizatora na hrvatskom"
            />
          </div>

          {/* Organizer EN */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Organizator (EN) <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={organizerEn}
              onChange={(e) => setOrganizerEn(e.target.value)}
              style={styles.input}
              placeholder="Enter organizer in English"
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

          {/* Image URL */}
          <div style={styles.formGroup}>
            <label style={styles.label}>URL slike</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={styles.input}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Submit */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={navigateBack}
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

export default EventEditPage;
