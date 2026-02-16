/**
 * Menu Extras Page (Admin)
 *
 * Manages server-driven menu items that are appended after core menu items.
 * Extras link ONLY to static pages via StaticPage:<slug>.
 */

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { LABEL_MAX_LENGTH } from '../../types/menu-extras';
import { styles } from './MenuExtrasPage.styles';
import { useMenuExtras } from './useMenuExtras';

export function MenuExtrasPage() {
  const {
    extras,
    loading,
    error,
    editingId,
    showCreateForm,
    setShowCreateForm,
    formLabelHr,
    setFormLabelHr,
    formLabelEn,
    setFormLabelEn,
    formTarget,
    setFormTarget,
    formOrder,
    setFormOrder,
    formEnabled,
    setFormEnabled,
    formError,
    formSaving,
    fetchExtras,
    resetForm,
    handleCreate,
    handleStartEdit,
    handleUpdate,
    handleToggleEnabled,
    handleDelete,
    extractSlug,
  } = useMenuExtras();

  return (
    <DashboardLayout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dodatne stavke izbornika</h1>
            <p style={styles.subtitle}>
              {extras.length} stavki (dodaju se nakon glavnih stavki izbornika)
            </p>
          </div>
          {!showCreateForm && !editingId && (
            <button
              style={styles.createButton}
              onClick={() => {
                resetForm();
                setShowCreateForm(true);
              }}
            >
              + Nova stavka
            </button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingId) && (
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>
              {editingId ? 'Uredi stavku' : 'Nova stavka'}
            </h2>

            {formError && <div style={styles.formError}>{formError}</div>}

            <div style={styles.formGrid}>
              <div style={styles.formField}>
                <label style={styles.label}>Naziv (HR) *</label>
                <input
                  type="text"
                  value={formLabelHr}
                  onChange={(e) => setFormLabelHr(e.target.value)}
                  placeholder="npr. O nama"
                  style={styles.input}
                  maxLength={LABEL_MAX_LENGTH}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Naziv (EN) *</label>
                <input
                  type="text"
                  value={formLabelEn}
                  onChange={(e) => setFormLabelEn(e.target.value)}
                  placeholder="e.g. About us"
                  style={styles.input}
                  maxLength={LABEL_MAX_LENGTH}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Cilj (StaticPage:slug) *</label>
                <input
                  type="text"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  placeholder="StaticPage:o-nama"
                  style={styles.input}
                />
                <span style={styles.hint}>
                  Format: StaticPage:naziv-stranice (mali znakovi, crtice)
                </span>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Redoslijed</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 0)}
                  style={styles.input}
                />
                <span style={styles.hint}>Manji broj = prikazuje se prije</span>
              </div>

              <div style={styles.formField}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Aktivno (prikazuje se u izborniku)
                </label>
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.cancelButton}
                onClick={resetForm}
                disabled={formSaving}
              >
                Odustani
              </button>
              <button
                style={styles.saveButton}
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={formSaving}
              >
                {formSaving ? 'Spremanje...' : editingId ? 'Spremi promjene' : 'Kreiraj'}
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={styles.errorCard}>
            <p>{error}</p>
            <button onClick={() => void fetchExtras()} style={styles.retryButton}>
              Pokusaj ponovo
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && <p style={styles.loading}>Ucitavanje...</p>}

        {/* Extras List */}
        {!loading && !error && (
          <div style={styles.listCard}>
            {extras.length === 0 ? (
              <p style={styles.emptyText}>
                Nema dodatnih stavki izbornika. Kreirajte prvu!
              </p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Red.</th>
                    <th style={styles.th}>Naziv (HR)</th>
                    <th style={styles.th}>Naziv (EN)</th>
                    <th style={styles.th}>Stranica (slug)</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {extras.map((extra) => (
                    <tr key={extra.id} style={styles.tr}>
                      <td style={styles.td}>{extra.display_order}</td>
                      <td style={styles.td}>{extra.label_hr}</td>
                      <td style={styles.td}>{extra.label_en}</td>
                      <td style={styles.td}>
                        <code style={styles.slug}>{extractSlug(extra.target)}</code>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.statusBadge,
                            backgroundColor: extra.enabled ? '#28a745' : '#6c757d',
                          }}
                          onClick={() => void handleToggleEnabled(extra)}
                        >
                          {extra.enabled ? 'Aktivno' : 'Neaktivno'}
                        </button>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.actionButton}
                          onClick={() => handleStartEdit(extra)}
                        >
                          Uredi
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => void handleDelete(extra.id)}
                        >
                          Obrisi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MenuExtrasPage;
