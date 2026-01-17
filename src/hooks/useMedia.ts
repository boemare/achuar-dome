import { useState, useEffect, useCallback } from 'react';
import { MediaItem, MediaFilter, MediaType } from '../types/media';
import { fetchAllMedia, fetchMediaById, uploadMedia, deleteMedia } from '../services/supabase/media';

interface UseMediaResult {
  media: MediaItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  filter: MediaFilter | undefined;
  setFilter: (filter: MediaFilter | undefined) => void;
  selectedMedia: MediaItem | null;
  selectMedia: (id: string, type: MediaType) => Promise<void>;
  clearSelection: () => void;
  upload: (
    file: Blob | File,
    type: MediaType,
    metadata: { observationId?: string; userId?: string; speciesId?: string; duration?: number }
  ) => Promise<MediaItem | null>;
  remove: (id: string, type: MediaType) => Promise<boolean>;
}

export function useMedia(initialFilter?: MediaFilter): UseMediaResult {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MediaFilter | undefined>(initialFilter);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchAllMedia(filter);
      setMedia(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadMore = useCallback(async () => {
    // For now, we fetch all at once
    // Could implement pagination later with offset
  }, []);

  const selectMedia = useCallback(async (id: string, type: MediaType) => {
    const item = await fetchMediaById(id, type);
    setSelectedMedia(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  const upload = useCallback(
    async (
      file: Blob | File,
      type: MediaType,
      metadata: { observationId?: string; userId?: string; speciesId?: string; duration?: number }
    ): Promise<MediaItem | null> => {
      const item = await uploadMedia(file, type, metadata);
      if (item) {
        setMedia((prev) => [item, ...prev]);
      }
      return item;
    },
    []
  );

  const remove = useCallback(async (id: string, type: MediaType): Promise<boolean> => {
    const success = await deleteMedia(id, type);
    if (success) {
      setMedia((prev) => prev.filter((item) => item.id !== id));
      if (selectedMedia?.id === id) {
        setSelectedMedia(null);
      }
    }
    return success;
  }, [selectedMedia]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    media,
    loading,
    error,
    refresh,
    loadMore,
    filter,
    setFilter,
    selectedMedia,
    selectMedia,
    clearSelection,
    upload,
    remove,
  };
}
