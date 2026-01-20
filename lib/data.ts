// lib/data.ts - Simplificado
import { Photo } from '@/types/photo';

// Función para extraer tags únicos
export function getUniqueTags(photos: Photo[]): string[] {
  const allTags = photos.flatMap(photo => photo.tags || []);
  return Array.from(new Set(allTags)).sort();
}

// Función para contar fotos por tag (opcional)
export function getTagCounts(photos: Photo[]): Record<string, number> {
  const counts: Record<string, number> = {};
  photos.forEach(photo => {
    photo.tags?.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}