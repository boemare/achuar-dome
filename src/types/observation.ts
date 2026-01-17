export type ObservationType = 'wildlife' | 'boat' | 'human' | 'other';

export interface Species {
  id: string;
  name: string;
  nameAchuar?: string;
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'fish' | 'insect' | 'other';
}

export interface Observation {
  id: string;
  type: ObservationType;
  speciesId?: string;
  species?: Species;
  latitude: number;
  longitude: number;
  createdAt: Date;
  userId: string;
  notes?: string;
  voiceNoteUrl?: string;
  photos: string[];
  videos: string[];
  isRestricted: boolean; // true for boats/humans - Elder only
}

export interface ObservationFilter {
  type?: ObservationType;
  speciesId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
