import { useState, useEffect, useCallback } from 'react';
import { ObservationFilter } from '../types/observation';
import {
  ObservationWithMedia,
  fetchObservations,
  fetchObservationById,
} from '../services/supabase/observations';

interface UseObservationsResult {
  observations: ObservationWithMedia[];
  loading: boolean;
  error: string | null;
  selectedObservation: ObservationWithMedia | null;
  refresh: () => Promise<void>;
  selectObservation: (id: string) => Promise<void>;
  clearSelection: () => void;
  filter: ObservationFilter | undefined;
  setFilter: (filter: ObservationFilter | undefined) => void;
}

export function useObservations(
  initialFilter?: ObservationFilter,
  isElder: boolean = false
): UseObservationsResult {
  const [observations, setObservations] = useState<ObservationWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<ObservationWithMedia | null>(null);
  const [filter, setFilter] = useState<ObservationFilter | undefined>(initialFilter);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchObservations(filter, isElder);
      setObservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch observations');
    } finally {
      setLoading(false);
    }
  }, [filter, isElder]);

  const selectObservation = useCallback(async (id: string) => {
    const obs = await fetchObservationById(id);
    setSelectedObservation(obs);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedObservation(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    observations,
    loading,
    error,
    selectedObservation,
    refresh,
    selectObservation,
    clearSelection,
    filter,
    setFilter,
  };
}
