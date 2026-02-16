// components/Gallery.tsx
'use client';

import { Photo } from '@/types/photo';
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import { ImageOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [rows, setRows] = useState<Photo[][]>([]);
  const targetRowHeight = 250;

  // Efecto para manejar el ancho del contenedor
  useEffect(() => {
    if (!containerRef.current || photos.length === 0) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [photos.length]);

  // Algoritmo para empaquetar imágenes en filas fluidas
  useEffect(() => {
    if (containerWidth === 0 || photos.length === 0) return;

    const newRows: Photo[][] = [];
    let currentRow: Photo[] = [];
    let currentRowWidth = 0;

    photos.forEach(photo => {
      const aspectRatio = photo.width && photo.height 
        ? photo.width / photo.height 
        : 1;
      
      const imgHeight = targetRowHeight;
      const imgWidth = imgHeight * aspectRatio;

      if (currentRowWidth + imgWidth <= containerWidth || currentRow.length === 0) {
        currentRow.push(photo);
        currentRowWidth += imgWidth;
      } else {
        newRows.push(currentRow);
        currentRow = [photo];
        currentRowWidth = imgWidth;
      }
    });

    if (currentRow.length > 0) {
      newRows.push(currentRow);
    }

    setRows(newRows);
  }, [photos, containerWidth, targetRowHeight]);

  // Manejar navegación con teclado en el modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleOpenModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPhotoIndex(null), 300); // Esperar a que se cierre la animación
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
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

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <>
      <div ref={containerRef} className="w-full">
        {rows.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="flex gap-y-4 mb-4 overflow-hidden"
            style={{ height: `${targetRowHeight}px` }}
          >
            {row.map((photo, photoIndex) => {
              let globalIndex = 0;
              for (let i = 0; i < rowIndex; i++) {
                globalIndex += rows[i].length;
              }
              globalIndex += photoIndex;
              
              const aspectRatio = photo.width && photo.height 
                ? photo.width / photo.height 
                : 1;
              
              return (
                <div
                  key={`${rowIndex}-${photoIndex}`}
                  className="flex-1 min-w-0 relative overflow-hidden hover:shadow-xl transition-shadow"
                  style={{ 
                    flex: aspectRatio,
                    maxWidth: `${aspectRatio * 100}%`
                  }}
                >
                  <div className="relative w-full h-full">
                    <ImageCard 
                      photo={photo} 
                      priority={rowIndex === 0 && photoIndex < 3}
                      onClick={() => handleOpenModal(globalIndex)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal */}
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