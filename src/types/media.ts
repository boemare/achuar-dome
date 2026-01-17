export type MediaType = 'photo' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
  observationId?: string;
  userId: string;
  duration?: number; // For audio/video in seconds
  speciesId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface MediaFilter {
  type?: MediaType;
  speciesId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
