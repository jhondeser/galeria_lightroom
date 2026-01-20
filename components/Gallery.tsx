// components/Gallery.tsx - Versión simplificada
'use client';

import { Photo } from '@/types/photo';
import ImageCard from './ImageCard';
import { ImageOff } from 'lucide-react';

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No hay imágenes que coincidan
        </h3>
        <p className="text-gray-500">
          Intenta con otros filtros o verifica tus datos
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <ImageCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}