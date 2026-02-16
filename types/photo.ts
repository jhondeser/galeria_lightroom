// types/photo.ts
export interface Photo {
  id: string;
  filename: string;
  path: string;
  tags: string[];
  date: string;
  width?: number;
  height?: number;
  caption?: string;
  software?: string;
  camera?: string;
  // Nuevos campos
  dominantColor?: string;
  blurhash?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  rating?: number; // 1-5 estrellas
  favorite?: boolean;
}

export interface TagWithCount {
  name: string;
  count: number;
  relatedTags?: string[]; // Tags que aparecen frecuentemente juntos
}