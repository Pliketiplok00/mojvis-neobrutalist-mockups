/**
 * EventEditPage Styles
 *
 * Extracted from EventEditPage.tsx for better maintainability.
 */

import type { CSSProperties } from 'react';

type StylesType = Record<string, CSSProperties>;

export const styles: StylesType = {
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
