/**
 * ClickFixDetailPage Styles
 *
 * Extracted from ClickFixDetailPage.tsx for better maintainability.
 */

import type { CSSProperties } from 'react';

type StylesType = Record<string, CSSProperties>;

export const styles: StylesType = {
  container: {
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  backLink: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    marginBottom: '8px',
    display: 'block',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  loading: {
    padding: '48px',
    textAlign: 'center',
    color: '#666666',
  },
  error: {
    padding: '24px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '8px',
    textAlign: 'center',
  },
  backButton: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#721c24',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    gap: '24px',
  },
  mainColumn: {
    flex: 1,
  },
  sideColumn: {
    width: '300px',
    flexShrink: 0,
  },
  statusSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  messageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
  },
  messageSubject: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
    marginBottom: '8px',
  },
  messageDate: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '16px',
  },
  messageBody: {
    fontSize: '16px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    marginBottom: '16px',
  },
  locationSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  locationLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666666',
  },
  locationValue: {
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#2E7D32',
  },
  mapLink: {
    fontSize: '14px',
    color: '#007bff',
    marginLeft: 'auto',
  },
  photosSection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  photosGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  photoThumbnail: {
    width: '120px',
    height: '120px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #000000',
    cursor: 'pointer',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  repliesSection: {
    marginTop: '24px',
  },
  noReplies: {
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: '24px',
  },
  replyCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #000000',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  replyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  replyLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#000000',
  },
  replyDate: {
    fontSize: '12px',
    color: '#666666',
  },
  replyBody: {
    fontSize: '14px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap',
  },
  replyForm: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  },
  replyFormTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  replyTextarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  submitButton: {
    marginTop: '12px',
    padding: '12px 24px',
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  actionsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  statusButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusButton: {
    padding: '10px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  statusButtonActive: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: '1px solid #000000',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  infoLabel: {
    color: '#666666',
  },
  infoValue: {
    fontWeight: '500',
  },
  lightbox: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lightboxClose: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '20px',
    backgroundColor: '#ffffff',
    border: 'none',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  lightboxImage: {
    maxWidth: '90%',
    maxHeight: '80%',
    objectFit: 'contain',
  },
  lightboxNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginTop: '24px',
  },
  lightboxNavButton: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  lightboxCounter: {
    color: '#ffffff',
    fontSize: '14px',
  },
};
