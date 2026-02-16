/**
 * Menu Extras Page (Admin)
 *
 * Manages server-driven menu items that are appended after core menu items.
 * Extras link ONLY to static pages via StaticPage:<slug>.
 */

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { adminMenuExtrasApi } from '../../services/api';
import type { MenuExtra, MenuExtraCreateInput, MenuExtraUpdateInput } from '../../types/menu-extras';
import { TARGET_REGEX, LABEL_MIN_LENGTH, LABEL_MAX_LENGTH } from '../../types/menu-extras';
import { styles } from './MenuExtrasPage.styles';

export function MenuExtrasPage() {
  const [extras, setExtras] = useState<MenuExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formLabelHr, setFormLabelHr] = useState('');
  const [formLabelEn, setFormLabelEn] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  const fetchExtras = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminMenuExtrasApi.getExtras();
      setExtras(response.extras);
    } catch (err) {
      console.error('[Admin] Error fetching menu extras:', err);
      setError('Greska pri ucitavanju dodatnih stavki izbornika.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExtras();
  }, []);

  const resetForm = () => {
    setFormLabelHr('');
    setFormLabelEn('');
    setFormTarget('');
    setFormOrder(0);
    setFormEnabled(true);
    setFormError(null);
    setEditingId(null);
    setShowCreateForm(false);
  };

  const validateForm = (): string | null => {
    if (!formLabelHr || formLabelHr.length < LABEL_MIN_LENGTH || formLabelHr.length > LABEL_MAX_LENGTH) {
      return `Naziv (HR) mora biti ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} znakova`;
    }
    if (!formLabelEn || formLabelEn.length < LABEL_MIN_LENGTH || formLabelEn.length > LABEL_MAX_LENGTH) {
      return `Naziv (EN) mora biti ${LABEL_MIN_LENGTH}-${LABEL_MAX_LENGTH} znakova`;
    }
    if (!formTarget || !TARGET_REGEX.test(formTarget)) {
      return 'Cilj mora biti u formatu StaticPage:<slug> (npr. StaticPage:o-nama)';
    }
    return null;
  };

  const handleCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormSaving(true);
    setFormError(null);

    try {
      const input: MenuExtraCreateInput = {
        label_hr: formLabelHr,
        label_en: formLabelEn,
        target: formTarget,
        display_order: formOrder,
        enabled: formEnabled,
      };
      await adminMenuExtrasApi.createExtra(input);
      resetForm();
      void fetchExtras();
    } catch (err) {
      console.error('[Admin] Error creating menu extra:', err);
      setFormError('Greska pri kreiranju stavke.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleStartEdit = (extra: MenuExtra) => {
    setEditingId(extra.id);
    setFormLabelHr(extra.label_hr);
    setFormLabelEn(extra.label_en);
    setFormTarget(extra.target);
    setFormOrder(extra.display_order);
    setFormEnabled(extra.enabled);
    setFormError(null);
    setShowCreateForm(false);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormSaving(true);
    setFormError(null);

    try {
      const input: MenuExtraUpdateInput = {
        label_hr: formLabelHr,
        label_en: formLabelEn,
        target: formTarget,
        display_order: formOrder,
        enabled: formEnabled,
      };
      await adminMenuExtrasApi.updateExtra(editingId, input);
      resetForm();
      void fetchExtras();
    } catch (err) {
      console.error('[Admin] Error updating menu extra:', err);
      setFormError('Greska pri azuriranju stavke.');
    } finally {
      setFormSaving(false);
    }
  };

  const handleToggleEnabled = async (extra: MenuExtra) => {
    try {
      await adminMenuExtrasApi.updateExtra(extra.id, { enabled: !extra.enabled });
      void fetchExtras();
    } catch (err) {
      console.error('[Admin] Error toggling menu extra:', err);
      alert('Greska pri promjeni statusa.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Jeste li sigurni da zelite obrisati ovu stavku?')) {
      return;
    }

    try {
      await adminMenuExtrasApi.deleteExtra(id);
      void fetchExtras();
    } catch (err) {
      console.error('[Admin] Error deleting menu extra:', err);
      alert('Greska pri brisanju stavke.');
    }
  };

  const extractSlug = (target: string): string => {
    return target.replace('StaticPage:', '');
  };

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
