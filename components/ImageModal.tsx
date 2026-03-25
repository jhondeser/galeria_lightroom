'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  RotateCw,
} from 'lucide-react';
import { Photo } from '@/types/photo';

interface ImageModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ImageModal({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (photo) {
      setIsLoading(true);
      setZoom(1);
      setRotation(0);
    }
  }, [photo]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !photo) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'ArrowLeft':
          if (hasPrev) onPrev();
          break;
        case 'ArrowRight':
          if (hasNext) onNext();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'r':
        case 'R':
          setRotation((prev) => (prev + 90) % 360);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom((prev) => Math.min(3, prev + 0.25));
          break;
        case '-':
          e.preventDefault();
          setZoom((prev) => Math.max(1, prev - 0.25));
          break;
        case '0':
          setZoom(1);
          setRotation(0);
          break;
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isOpen, photo, hasNext, hasPrev, onClose, onNext, onPrev, isFullscreen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error al cambiar pantalla completa:', error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error al salir de pantalla completa:', error);
    }
  };

  const resetTransformations = () => {
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen || !photo) return null;

  const imageSrc = `/api/image?filename=${encodeURIComponent(photo.filename)}`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Navegación */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all group"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all group"
          aria-label="Siguiente imagen"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Cerrar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-3 right-3 md:top-4 md:right-4 z-30 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all group"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Controles */}
      <div className="absolute top-3 left-3 md:top-4 md:left-4 z-30 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((prev) => Math.max(1, prev - 0.25));
            }}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Reducir zoom"
          >
            <span className="text-lg font-bold">−</span>
          </button>

          <span className="px-2 text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom((prev) => Math.min(3, prev + 0.25));
            }}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Aumentar zoom"
          >
            <span className="text-lg font-bold">+</span>
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            resetTransformations();
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors group"
          aria-label="Resetear imagen"
          title="Resetear"
        >
          <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setRotation((prev) => (prev + 90) % 360);
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Rotar imagen"
          title="Rotar 90°"
        >
          <span className="text-lg font-bold">↻</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Zona de imagen */}
      <div className="w-full h-full flex items-center justify-center p-2 md:p-6">
        <div
          className="relative w-full h-full overflow-hidden flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          <div
            className="flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          >
            <Image
              src={imageSrc}
              alt={photo.caption || `Imagen ${photo.id}`}
              width={photo.width || 1600}
              height={photo.height || 1000}
              className={`object-contain transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              } w-auto h-auto max-w-[95vw] max-h-[85vh]`}
              sizes="100vw"
              unoptimized
              quality={90}
              priority
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}