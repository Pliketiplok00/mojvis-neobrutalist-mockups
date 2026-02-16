/**
 * Contact Block Editor
 *
 * Editor for contact list blocks in static pages.
 * Extracted from PageEditPage.tsx for maintainability.
 */

import type { ChangeEvent } from 'react';
import type { ContactBlockContent, ContactItem } from '../../../types/static-page';
import { styles } from '../PageEditPage.styles';

interface ContactBlockEditorProps {
  content: ContactBlockContent;
  onContentChange: (content: ContactBlockContent) => void;
}

/**
 * Contact Block Editor component
 */
export function ContactBlockEditor({
  content,
  onContentChange,
}: ContactBlockEditorProps) {
  const contacts = content.contacts || [];

  const generateId = () => `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddContact = () => {
    const newContact: ContactItem = {
      id: generateId(),
      icon: null,
      name_hr: '',
      name_en: '',
      address_hr: null,
      address_en: null,
      phones: [],
      email: null,
      working_hours_hr: null,
      working_hours_en: null,
      note_hr: null,
      note_en: null,
    };
    onContentChange({ contacts: [...contacts, newContact] });
  };

  const handleRemoveContact = (contactId: string) => {
    onContentChange({ contacts: contacts.filter((c) => c.id !== contactId) });
  };

  const handleContactChange = (contactId: string, updates: Partial<ContactItem>) => {
    onContentChange({
      contacts: contacts.map((c) =>
        c.id === contactId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleMoveContact = (contactId: string, direction: 'up' | 'down') => {
    const currentIndex = contacts.findIndex((c) => c.id === contactId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= contacts.length) return;

    const newContacts = [...contacts];
    [newContacts[currentIndex], newContacts[targetIndex]] = [newContacts[targetIndex], newContacts[currentIndex]];
    onContentChange({ contacts: newContacts });
  };

  return (
    <div style={styles.blockContent}>
      {contacts.length === 0 && (
        <div style={styles.emptyList}>
          Nema kontakata. Dodajte prvi kontakt.
        </div>
      )}

      {contacts.map((contact, index) => (
        <ContactItemEditor
          key={contact.id}
          contact={contact}
          index={index}
          totalContacts={contacts.length}
          onChange={(updates) => handleContactChange(contact.id, updates)}
          onRemove={() => handleRemoveContact(contact.id)}
          onMoveUp={() => handleMoveContact(contact.id, 'up')}
          onMoveDown={() => handleMoveContact(contact.id, 'down')}
        />
      ))}

      <button
        type="button"
        style={styles.addContactButton}
        onClick={handleAddContact}
      >
        + Dodaj kontakt
      </button>
    </div>
  );
}

interface ContactItemEditorProps {
  contact: ContactItem;
  index: number;
  totalContacts: number;
  onChange: (updates: Partial<ContactItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

/**
 * Contact Item Editor component
 */
function ContactItemEditor({
  contact,
  index,
  totalContacts,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ContactItemEditorProps) {
  const missingNameHr = !contact.name_hr.trim();
  const missingNameEn = !contact.name_en.trim();

  const handleAddPhone = () => {
    onChange({ phones: [...contact.phones, ''] });
  };

  const handleRemovePhone = (phoneIndex: number) => {
    onChange({ phones: contact.phones.filter((_, i) => i !== phoneIndex) });
  };

  const handlePhoneChange = (phoneIndex: number, value: string) => {
    const newPhones = [...contact.phones];
    newPhones[phoneIndex] = value;
    onChange({ phones: newPhones });
  };

  return (
    <div style={styles.contactItem}>
      {/* Header with index and actions */}
      <div style={styles.contactItemHeader}>
        <span style={styles.contactItemIndex}>Kontakt #{index + 1}</span>
        <div style={styles.contactItemActions}>
          <button
            type="button"
            style={styles.contactReorderBtn}
            onClick={onMoveUp}
            disabled={index === 0}
            title="Pomakni gore"
          >
            ↑
          </button>
          <button
            type="button"
            style={styles.contactReorderBtn}
            onClick={onMoveDown}
            disabled={index === totalContacts - 1}
            title="Pomakni dolje"
          >
            ↓
          </button>
          <button
            type="button"
            style={styles.contactRemoveBtn}
            onClick={onRemove}
            title="Ukloni kontakt"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Name (required) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>
            Naziv (HR) *
            {missingNameHr && <span style={styles.fieldError}> (obavezno)</span>}
          </label>
          <input
            type="text"
            value={contact.name_hr}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ name_hr: e.target.value })
            }
            style={{
              ...styles.input,
              ...(missingNameHr ? styles.inputError : {}),
            }}
            placeholder="Naziv kontakta na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Naziv (EN) *
            {missingNameEn && <span style={styles.fieldError}> (obavezno)</span>}
          </label>
          <input
            type="text"
            value={contact.name_en}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ name_en: e.target.value })
            }
            style={{
              ...styles.input,
              ...(missingNameEn ? styles.inputError : {}),
            }}
            placeholder="Contact name in English"
          />
        </div>
      </div>

      {/* Address (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Adresa (HR)</label>
          <input
            type="text"
            value={contact.address_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ address_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Adresa na hrvatskom"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Adresa (EN)</label>
          <input
            type="text"
            value={contact.address_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ address_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Address in English"
          />
        </div>
      </div>

      {/* Phone numbers (repeatable) */}
      <div style={styles.field}>
        <label style={styles.label}>Telefoni</label>
        {contact.phones.map((phone, phoneIndex) => (
          <div key={phoneIndex} style={styles.phoneRow}>
            <input
              type="text"
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handlePhoneChange(phoneIndex, e.target.value)
              }
              style={styles.phoneInput}
              placeholder="+385 XX XXX XXXX"
            />
            <button
              type="button"
              style={styles.phoneRemoveBtn}
              onClick={() => handleRemovePhone(phoneIndex)}
              title="Ukloni telefon"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          style={styles.addPhoneButton}
          onClick={handleAddPhone}
        >
          + Dodaj telefon
        </button>
      </div>

      {/* Email (optional) */}
      <div style={styles.field}>
        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={contact.email || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange({ email: e.target.value || null })
          }
          style={styles.input}
          placeholder="email@example.com"
        />
      </div>

      {/* Working hours (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Radno vrijeme (HR)</label>
          <input
            type="text"
            value={contact.working_hours_hr || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ working_hours_hr: e.target.value || null })
            }
            style={styles.input}
            placeholder="Pon-Pet: 08:00-16:00"
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Radno vrijeme (EN)</label>
          <input
            type="text"
            value={contact.working_hours_en || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange({ working_hours_en: e.target.value || null })
            }
            style={styles.input}
            placeholder="Mon-Fri: 08:00-16:00"
          />
        </div>
      </div>

      {/* Note (optional) */}
      <div style={styles.fieldRow}>
        <div style={styles.field}>
          <label style={styles.label}>Napomena (HR)</label>
          <textarea
            value={contact.note_hr || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ note_hr: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Dodatne informacije..."
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Napomena (EN)</label>
          <textarea
            value={contact.note_en || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              onChange({ note_en: e.target.value || null })
            }
            style={styles.textarea}
            rows={2}
            placeholder="Additional information..."
          />
        </div>
      </div>
    </div>
  );
}
