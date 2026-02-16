/**
 * useMenuExtras Hook
 *
 * Manages state and operations for MenuExtras page.
 * Extracted from MenuExtrasPage for better separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { adminMenuExtrasApi } from '../../services/api';
import type { MenuExtra, MenuExtraCreateInput, MenuExtraUpdateInput } from '../../types/menu-extras';
import { TARGET_REGEX, LABEL_MIN_LENGTH, LABEL_MAX_LENGTH } from '../../types/menu-extras';

interface UseMenuExtrasResult {
  // List state
  extras: MenuExtra[];
  loading: boolean;
  error: string | null;

  // Edit mode
  editingId: string | null;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;

  // Form state
  formLabelHr: string;
  setFormLabelHr: (val: string) => void;
  formLabelEn: string;
  setFormLabelEn: (val: string) => void;
  formTarget: string;
  setFormTarget: (val: string) => void;
  formOrder: number;
  setFormOrder: (val: number) => void;
  formEnabled: boolean;
  setFormEnabled: (val: boolean) => void;
  formError: string | null;
  formSaving: boolean;

  // Actions
  fetchExtras: () => Promise<void>;
  resetForm: () => void;
  handleCreate: () => Promise<void>;
  handleStartEdit: (extra: MenuExtra) => void;
  handleUpdate: () => Promise<void>;
  handleToggleEnabled: (extra: MenuExtra) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  extractSlug: (target: string) => string;
}

export function useMenuExtras(): UseMenuExtrasResult {
  // List state
  const [extras, setExtras] = useState<MenuExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
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

  const fetchExtras = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void fetchExtras();
  }, [fetchExtras]);

  const resetForm = useCallback(() => {
    setFormLabelHr('');
    setFormLabelEn('');
    setFormTarget('');
    setFormOrder(0);
    setFormEnabled(true);
    setFormError(null);
    setEditingId(null);
    setShowCreateForm(false);
  }, []);

  const validateForm = useCallback((): string | null => {
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
  }, [formLabelHr, formLabelEn, formTarget]);

  const handleCreate = useCallback(async () => {
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
  }, [formLabelHr, formLabelEn, formTarget, formOrder, formEnabled, validateForm, resetForm, fetchExtras]);

  const handleStartEdit = useCallback((extra: MenuExtra) => {
    setEditingId(extra.id);
    setFormLabelHr(extra.label_hr);
    setFormLabelEn(extra.label_en);
    setFormTarget(extra.target);
    setFormOrder(extra.display_order);
    setFormEnabled(extra.enabled);
    setFormError(null);
    setShowCreateForm(false);
  }, []);

  const handleUpdate = useCallback(async () => {
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
  }, [editingId, formLabelHr, formLabelEn, formTarget, formOrder, formEnabled, validateForm, resetForm, fetchExtras]);

  const handleToggleEnabled = useCallback(async (extra: MenuExtra) => {
    try {
      await adminMenuExtrasApi.updateExtra(extra.id, { enabled: !extra.enabled });
      void fetchExtras();
    } catch (err) {
      console.error('[Admin] Error toggling menu extra:', err);
      alert('Greska pri promjeni statusa.');
    }
  }, [fetchExtras]);

  const handleDelete = useCallback(async (id: string) => {
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
  }, [fetchExtras]);

  const extractSlug = useCallback((target: string): string => {
    return target.replace('StaticPage:', '');
  }, []);

  return {
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
  };
}
