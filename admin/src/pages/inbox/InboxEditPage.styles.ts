/**
 * InboxEditPage Styles
 *
 * Extracted from InboxEditPage.tsx for maintainability.
 */

import type { CSSProperties } from 'react';

export const styles: Record<string, CSSProperties> = {
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
  // Phase 7: Locked message styles
  lockedBanner: {
    padding: '16px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '2px solid #9ca3af',
  },
  pushedAt: {
    color: '#6b7280',
    fontSize: '13px',
  },
  lockedNote: {
    color: '#6b7280',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  // Phase 3: Forbidden message styles
  forbiddenBanner: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '2px solid #fca5a5',
  },
  forbiddenNote: {
    color: '#b91c1c',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  // Phase 3: Disabled tag styles
  disabledTagLabel: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  disabledTagText: {
    color: '#9ca3af',
  },
  fieldset: {
    border: 'none',
    margin: 0,
    padding: 0,
  },
  warning: {
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
    marginBottom: '24px',
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: 0,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  translateButton: {
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  translateWarning: {
    padding: '10px 14px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #fbbf24',
  },
  hint: {
    fontSize: '13px',
    color: '#666666',
    margin: '0 0 16px 0',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '6px',
    color: '#333333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  tagsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '8px',
  },
  tagLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
  },
  checkbox: {
    width: '16px',
    height: '16px',
  },
  tagText: {
    fontSize: '13px',
    color: '#333333',
  },
  tagTextSelected: {
    fontWeight: '600',
  },
  selectedTags: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#666666',
  },
  hitnoHint: {
    color: '#dc2626',
    fontWeight: '500',
  },
  dateRow: {
    display: 'flex',
    gap: '16px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
  },
  cancelButton: {
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Package 2: Publish button
  publishButton: {
    padding: '12px 24px',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Package 2: Draft indicator
  draftBanner: {
    padding: '16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '2px solid #fbbf24',
  },
  draftNote: {
    color: '#b45309',
    fontSize: '13px',
    fontStyle: 'italic',
  },
  // Package 2: Published indicator
  publishedBanner: {
    padding: '12px 16px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
    border: '1px solid #6ee7b7',
  },
  publishedAt: {
    color: '#047857',
    fontSize: '13px',
  },
  // Info banner for new messages
  info: {
    padding: '12px 16px',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
  },
};
