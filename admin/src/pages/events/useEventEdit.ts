/**
 * useEventEdit Hook
 *
 * Manages state and operations for EventEditPage.
 * Extracted from EventEditPage for better separation of concerns.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminEventsApi } from '../../services/api';
import type { AdminEvent, AdminEventInput } from '../../types/event';

/**
 * Validate image URL (must be http/https if provided)
 */
function isValidImageUrl(url: string): boolean {
  if (!url.trim()) return true; // empty is valid
  return url.startsWith('http://') || url.startsWith('https://');
}

interface UseEventEditResult {
  // UI state
  loading: boolean;
  saving: boolean;
  error: string | null;
  isEditing: boolean;

  // Form state - titles
  titleHr: string;
  setTitleHr: (val: string) => void;
  titleEn: string;
  setTitleEn: (val: string) => void;

  // Form state - descriptions
  descriptionHr: string;
  setDescriptionHr: (val: string) => void;
  descriptionEn: string;
  setDescriptionEn: (val: string) => void;

  // Form state - datetime
  startDate: string;
  setStartDate: (val: string) => void;
  startTime: string;
  setStartTime: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  endTime: string;
  setEndTime: (val: string) => void;
  isAllDay: boolean;
  setIsAllDay: (val: boolean) => void;

  // Form state - location/organizer
  locationHr: string;
  setLocationHr: (val: string) => void;
  locationEn: string;
  setLocationEn: (val: string) => void;
  organizerHr: string;
  setOrganizerHr: (val: string) => void;
  organizerEn: string;
  setOrganizerEn: (val: string) => void;

  // Form state - image
  imageUrl: string;
  setImageUrl: (val: string) => void;

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  navigateBack: () => void;
}

export function useEventEdit(): UseEventEditResult {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // UI state
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
  const [organizerHr, setOrganizerHr] = useState('Grad Vis');
  const [organizerEn, setOrganizerEn] = useState('Municipality of Vis');
  const [isAllDay, setIsAllDay] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const populateForm = useCallback((event: AdminEvent) => {
    setTitleHr(event.title_hr);
    setTitleEn(event.title_en);
    setDescriptionHr(event.description_hr || '');
    setDescriptionEn(event.description_en || '');
    setLocationHr(event.location_hr || '');
    setLocationEn(event.location_en || '');
    setOrganizerHr(event.organizer_hr);
    setOrganizerEn(event.organizer_en);
    setIsAllDay(event.is_all_day);
    setImageUrl(event.image_url || '');

    // Parse datetime
    const start = new Date(event.start_datetime);
    setStartDate(start.toISOString().split('T')[0]);
    setStartTime(start.toTimeString().slice(0, 5));

    if (event.end_datetime) {
      const end = new Date(event.end_datetime);
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
    }
  }, []);

  const loadEvent = useCallback(async (eventId: string) => {
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
  }, [populateForm]);

  useEffect(() => {
    if (id) {
      void loadEvent(id);
    }
  }, [id, loadEvent]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
    if (!organizerHr.trim()) {
      setError('Organizator (HR) je obavezan.');
      return;
    }
    if (!organizerEn.trim()) {
      setError('Organizator (EN) je obavezan.');
      return;
    }
    if (!isValidImageUrl(imageUrl)) {
      setError('URL slike mora biti HTTP ili HTTPS URL.');
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
      organizer_hr: organizerHr.trim(),
      organizer_en: organizerEn.trim(),
      is_all_day: isAllDay,
      image_url: imageUrl.trim() || null,
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
  }, [
    titleHr, titleEn, descriptionHr, descriptionEn,
    startDate, startTime, endDate, endTime,
    locationHr, locationEn, organizerHr, organizerEn,
    isAllDay, imageUrl, isEditing, id, navigate
  ]);

  const navigateBack = useCallback(() => {
    navigate('/events');
  }, [navigate]);

  return {
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
  };
}
