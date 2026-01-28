import { supabase, STORAGE_BUCKET } from './client';
import { MediaItem, MediaType, MediaFilter } from '../../types/media';

export interface PhotoRecord {
  id: string;
  observation_id: string | null;
  user_id: string | null;
  storage_path: string;
  thumbnail_path: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

export interface VideoRecord {
  id: string;
  observation_id: string | null;
  user_id: string | null;
  storage_path: string;
  thumbnail_path: string | null;
  duration: number | null;
  created_at: string;
}

export interface VoiceRecord {
  id: string;
  observation_id: string | null;
  user_id: string | null;
  species_id: string | null;
  storage_path: string;
  duration: number | null;
  transcription: string | null;
  created_at: string;
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function getSignedUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);
  if (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
  return data.signedUrl || null;
}

function photoToMediaItem(photo: PhotoRecord): MediaItem {
  return {
    id: photo.id,
    type: 'photo',
    url: getPublicUrl(photo.storage_path),
    thumbnailUrl: photo.thumbnail_path ? getPublicUrl(photo.thumbnail_path) : undefined,
    createdAt: new Date(photo.created_at),
    observationId: photo.observation_id || undefined,
    userId: photo.user_id || '',
  };
}

function videoToMediaItem(video: VideoRecord): MediaItem {
  return {
    id: video.id,
    type: 'video',
    url: getPublicUrl(video.storage_path),
    thumbnailUrl: video.thumbnail_path ? getPublicUrl(video.thumbnail_path) : undefined,
    createdAt: new Date(video.created_at),
    observationId: video.observation_id || undefined,
    userId: video.user_id || '',
    duration: video.duration || undefined,
  };
}

function voiceToMediaItem(voice: VoiceRecord): MediaItem {
  return {
    id: voice.id,
    type: 'audio',
    url: getPublicUrl(voice.storage_path),
    createdAt: new Date(voice.created_at),
    observationId: voice.observation_id || undefined,
    userId: voice.user_id || '',
    duration: voice.duration || undefined,
    speciesId: voice.species_id || undefined,
  };
}

export async function fetchAllMedia(filter?: MediaFilter): Promise<MediaItem[]> {
  const mediaItems: MediaItem[] = [];

  // Fetch based on filter type or all types
  const fetchPhotos = !filter?.type || filter.type === 'photo';
  const fetchVideos = !filter?.type || filter.type === 'video';
  const fetchAudio = !filter?.type || filter.type === 'audio';

  const promises: Promise<void>[] = [];

  if (fetchPhotos) {
    promises.push(
      (async () => {
        let query = supabase.from('photos').select('*').order('created_at', { ascending: false });

        if (filter?.dateFrom) {
          query = query.gte('created_at', filter.dateFrom.toISOString());
        }
        if (filter?.dateTo) {
          query = query.lte('created_at', filter.dateTo.toISOString());
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching photos:', error);
          return;
        }
        mediaItems.push(...(data || []).map(photoToMediaItem));
      })()
    );
  }

  if (fetchVideos) {
    promises.push(
      (async () => {
        let query = supabase.from('videos').select('*').order('created_at', { ascending: false });

        if (filter?.dateFrom) {
          query = query.gte('created_at', filter.dateFrom.toISOString());
        }
        if (filter?.dateTo) {
          query = query.lte('created_at', filter.dateTo.toISOString());
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching videos:', error);
          return;
        }
        mediaItems.push(...(data || []).map(videoToMediaItem));
      })()
    );
  }

  if (fetchAudio) {
    promises.push(
      (async () => {
        let query = supabase
          .from('voice_recordings')
          .select('*')
          .order('created_at', { ascending: false });

        if (filter?.speciesId) {
          query = query.eq('species_id', filter.speciesId);
        }
        if (filter?.dateFrom) {
          query = query.gte('created_at', filter.dateFrom.toISOString());
        }
        if (filter?.dateTo) {
          query = query.lte('created_at', filter.dateTo.toISOString());
        }

        const { data, error } = await query;
        if (error) {
          console.error('Error fetching voice recordings:', error);
          return;
        }
        mediaItems.push(...(data || []).map(voiceToMediaItem));
      })()
    );
  }

  await Promise.all(promises);

  // Sort all media by date descending
  return mediaItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function fetchMediaById(id: string, type: MediaType): Promise<MediaItem | null> {
  let tableName: string;
  let transform: (record: any) => MediaItem;

  switch (type) {
    case 'photo':
      tableName = 'photos';
      transform = photoToMediaItem;
      break;
    case 'video':
      tableName = 'videos';
      transform = videoToMediaItem;
      break;
    case 'audio':
      tableName = 'voice_recordings';
      transform = voiceToMediaItem;
      break;
  }

  const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();

  if (error || !data) {
    console.error(`Error fetching ${type}:`, error);
    return null;
  }

  return transform(data);
}

export async function uploadMedia(
  file: Blob | File,
  type: MediaType,
  metadata: {
    observationId?: string;
    userId?: string;
    speciesId?: string;
    duration?: number;
  }
): Promise<MediaItem | null> {
  const timestamp = Date.now();
  const extension = type === 'photo' ? 'jpg' : type === 'video' ? 'mp4' : 'm4a';
  const folder = type === 'audio' ? 'voice' : `${type}s`;
  const path = `${folder}/${timestamp}.${extension}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  // Create database record
  let tableName: string;
  let record: Record<string, any>;

  switch (type) {
    case 'photo':
      tableName = 'photos';
      record = {
        storage_path: path,
        observation_id: metadata.observationId,
        user_id: metadata.userId,
      };
      break;
    case 'video':
      tableName = 'videos';
      record = {
        storage_path: path,
        observation_id: metadata.observationId,
        user_id: metadata.userId,
        duration: metadata.duration,
      };
      break;
    case 'audio':
      tableName = 'voice_recordings';
      record = {
        storage_path: path,
        observation_id: metadata.observationId,
        user_id: metadata.userId,
        species_id: metadata.speciesId,
        duration: metadata.duration,
      };
      break;
  }

  const { data, error } = await supabase.from(tableName).insert(record).select().single();

  if (error || !data) {
    console.error('Error creating media record:', error);
    return null;
  }

  const mediaItem = await fetchMediaById(data.id, type);
  if (!mediaItem) return null;

  // Prefer signed URL so uploads work even when bucket is private.
  const signedUrl = await getSignedUrl(path);
  if (signedUrl) {
    mediaItem.url = signedUrl;
  }

  if (mediaItem.thumbnailUrl && record.thumbnail_path) {
    const signedThumb = await getSignedUrl(record.thumbnail_path);
    if (signedThumb) {
      mediaItem.thumbnailUrl = signedThumb;
    }
  }

  return mediaItem;
}

export async function deleteMedia(id: string, type: MediaType): Promise<boolean> {
  let tableName: string;

  switch (type) {
    case 'photo':
      tableName = 'photos';
      break;
    case 'video':
      tableName = 'videos';
      break;
    case 'audio':
      tableName = 'voice_recordings';
      break;
  }

  // Get the storage path first
  const { data: record, error: fetchError } = await supabase
    .from(tableName)
    .select('storage_path')
    .eq('id', id)
    .single();

  if (fetchError || !record) {
    console.error('Error fetching media for deletion:', fetchError);
    return false;
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([record.storage_path]);

  if (storageError) {
    console.error('Error deleting from storage:', storageError);
  }

  // Delete database record
  const { error: deleteError } = await supabase.from(tableName).delete().eq('id', id);

  if (deleteError) {
    console.error('Error deleting media record:', deleteError);
    return false;
  }

  return true;
}
