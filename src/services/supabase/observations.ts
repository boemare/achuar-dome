import { supabase } from './client';
import { Observation, ObservationFilter, Species } from '../../types/observation';

export interface ObservationWithMedia extends Observation {
  photoUrls: string[];
  videoUrls: string[];
  voiceUrls: string[];
}

export async function fetchObservations(
  filter?: ObservationFilter,
  isElder: boolean = false
): Promise<ObservationWithMedia[]> {
  let query = supabase
    .from('observations')
    .select(`
      *,
      species:species_id(id, name, name_achuar, category),
      photos(id, storage_path),
      videos(id, storage_path),
      voice_recordings(id, storage_path)
    `)
    .order('created_at', { ascending: false });

  // Filter restricted content for non-elders
  if (!isElder) {
    query = query.eq('is_restricted', false);
  }

  if (filter?.type) {
    query = query.eq('type', filter.type);
  }

  if (filter?.speciesId) {
    query = query.eq('species_id', filter.speciesId);
  }

  if (filter?.dateFrom) {
    query = query.gte('created_at', filter.dateFrom.toISOString());
  }

  if (filter?.dateTo) {
    query = query.lte('created_at', filter.dateTo.toISOString());
  }

  if (filter?.bounds) {
    query = query
      .gte('latitude', filter.bounds.south)
      .lte('latitude', filter.bounds.north)
      .gte('longitude', filter.bounds.west)
      .lte('longitude', filter.bounds.east);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching observations:', error);
    return [];
  }

  return (data || []).map((obs: any) => ({
    id: obs.id,
    type: obs.type,
    speciesId: obs.species_id,
    species: obs.species,
    latitude: parseFloat(obs.latitude),
    longitude: parseFloat(obs.longitude),
    createdAt: new Date(obs.created_at),
    userId: obs.user_id,
    notes: obs.notes,
    isRestricted: obs.is_restricted,
    photos: obs.photos?.map((p: any) => p.storage_path) || [],
    videos: obs.videos?.map((v: any) => v.storage_path) || [],
    photoUrls: obs.photos?.map((p: any) => getPublicUrl(p.storage_path)) || [],
    videoUrls: obs.videos?.map((v: any) => getPublicUrl(v.storage_path)) || [],
    voiceUrls: obs.voice_recordings?.map((v: any) => getPublicUrl(v.storage_path)) || [],
  }));
}

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from('media').getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchObservationById(id: string): Promise<ObservationWithMedia | null> {
  const { data, error } = await supabase
    .from('observations')
    .select(`
      *,
      species:species_id(id, name, name_achuar, category),
      photos(id, storage_path),
      videos(id, storage_path),
      voice_recordings(id, storage_path)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('Error fetching observation:', error);
    return null;
  }

  return {
    id: data.id,
    type: data.type,
    speciesId: data.species_id,
    species: data.species,
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    createdAt: new Date(data.created_at),
    userId: data.user_id,
    notes: data.notes,
    isRestricted: data.is_restricted,
    photos: data.photos?.map((p: any) => p.storage_path) || [],
    videos: data.videos?.map((v: any) => v.storage_path) || [],
    photoUrls: data.photos?.map((p: any) => getPublicUrl(p.storage_path)) || [],
    videoUrls: data.videos?.map((v: any) => getPublicUrl(v.storage_path)) || [],
    voiceUrls: data.voice_recordings?.map((v: any) => getPublicUrl(v.storage_path)) || [],
  };
}

export async function createObservation(observation: {
  type: Observation['type'];
  latitude: number;
  longitude: number;
  userId?: string;
  speciesId?: string;
  notes?: string;
  isRestricted?: boolean;
}): Promise<string | null> {
  const { data, error } = await supabase
    .from('observations')
    .insert({
      type: observation.type,
      latitude: observation.latitude,
      longitude: observation.longitude,
      user_id: observation.userId,
      species_id: observation.speciesId,
      notes: observation.notes,
      is_restricted: observation.isRestricted || observation.type === 'boat' || observation.type === 'human',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating observation:', error);
    return null;
  }

  return data.id;
}

export async function fetchSpecies(): Promise<Species[]> {
  const { data, error } = await supabase.from('species').select('*').order('name');

  if (error) {
    console.error('Error fetching species:', error);
    return [];
  }

  return (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    nameAchuar: s.name_achuar,
    category: s.category,
  }));
}
