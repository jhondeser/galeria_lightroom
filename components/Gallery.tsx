'use client';

import { Photo } from '@/types/photo';
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import { ImageOff } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, photos.length]);

  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    if (selectedPhotoIndex >= photos.length) {
      setSelectedPhotoIndex(null);
      setIsModalOpen(false);
    }
  }, [photos, selectedPhotoIndex]);

  const handleOpenModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhotoIndex(null);
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => {
      if (prev === null) return prev;
      return prev < photos.length - 1 ? prev + 1 : prev;
    });
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => {
      if (prev === null) return prev;
      return prev > 0 ? prev - 1 : prev;
    });
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <ImageOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No se encontraron imágenes
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Prueba con otros filtros o asegúrate de que tus fotos tengan tags
        </p>
      </div>
    );
  }

  const selectedPhoto =
    selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id ?? photo.filename ?? index}
            className="mb-4 break-inside-avoid"
          >
            <ImageCard
              photo={photo}
              priority={index < 3}
              onClick={() => handleOpenModal(index)}
            />
          </div>
        ))}
      </div>

      <ImageModal
        photo={selectedPhoto}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNext={handleNextPhoto}
        onPrev={handlePrevPhoto}
        hasNext={selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1}
        hasPrev={selectedPhotoIndex !== null && selectedPhotoIndex > 0}
      />
    </>
  );
}