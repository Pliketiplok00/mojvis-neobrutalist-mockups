/**
 * useDepartures Hook
 *
 * Fetches and manages departure data for a transport line.
 * Extracted from LineDetailScreen for cleaner separation.
 */

import { useState, useEffect, useCallback } from 'react';
import { transportApi } from '../services/api';
import type { TransportType, DeparturesListResponse } from '../types/transport';

interface UseDeparturesOptions {
  lineId: string;
  transportType: TransportType;
  selectedDate: string;
  language: 'hr' | 'en';
  enabled: boolean; // Set to true when line data is loaded
}

interface UseDeparturesReturn {
  departures: DeparturesListResponse | null;
  departuresLoading: boolean;
  selectedDirection: number;
  setSelectedDirection: (direction: number) => void;
}

/**
 * Hook for fetching and managing departure data
 *
 * @param options.lineId - Line ID to fetch departures for
 * @param options.transportType - 'road' or 'sea'
 * @param options.selectedDate - Date in YYYY-MM-DD format
 * @param options.language - 'hr' or 'en'
 * @param options.enabled - Whether to fetch (set true when line detail is loaded)
 */
export function useDepartures({
  lineId,
  transportType,
  selectedDate,
  language,
  enabled,
}: UseDeparturesOptions): UseDeparturesReturn {
  const [departures, setDepartures] = useState<DeparturesListResponse | null>(null);
  const [departuresLoading, setDeparturesLoading] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<number>(0);

  const fetchDepartures = useCallback(async () => {
    if (!enabled) return;

    setDeparturesLoading(true);
    try {
      const deps = await transportApi.getDepartures(
        transportType,
        lineId,
        selectedDate,
        selectedDirection,
        language
      );
      setDepartures(deps);
    } catch (err) {
      console.error('[useDepartures] Error fetching departures:', err);
    } finally {
      setDeparturesLoading(false);
    }
  }, [lineId, transportType, selectedDate, selectedDirection, language, enabled]);

  useEffect(() => {
    if (enabled) {
      void fetchDepartures();
    }
  }, [enabled, fetchDepartures]);

  return {
    departures,
    departuresLoading,
    selectedDirection,
    setSelectedDirection,
  };
}
