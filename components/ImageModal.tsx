// components/ImageModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink, Maximize, Minimize, RotateCw } from 'lucide-react';
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
  hasPrev
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Calcular dimensiones óptimas para la imagen
  const calculateOptimalDimensions = () => {
    if (!photo || typeof window === 'undefined') {
      return { width: 1200, height: 800 };
    }

    // Dimensiones de la ventana (con márgenes)
    const windowWidth = window.innerWidth - 80; // 40px de padding a cada lado
    const windowHeight = window.innerHeight - 200; // Espacio para controles
    
    // Si tenemos las dimensiones originales
    if (photo.width && photo.height) {
      const aspectRatio = photo.width / photo.height;
      
      // Calcular dimensiones que se ajusten al viewport
      let calculatedWidth = windowWidth;
      let calculatedHeight = windowWidth / aspectRatio;
      
      // Si es demasiado alto, ajustar por altura
      if (calculatedHeight > windowHeight) {
        calculatedHeight = windowHeight;
        calculatedWidth = windowHeight * aspectRatio;
      }
      
      return {
        width: Math.floor(calculatedWidth),
        height: Math.floor(calculatedHeight)
      };
    }
    
    // Dimensiones por defecto
    return {
      width: Math.min(windowWidth, 1200),
      height: Math.min(windowHeight, 800)
    };
  };

  useEffect(() => {
    if (photo) {
      setImageDimensions(calculateOptimalDimensions());
    }
  }, [photo, isFullscreen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1);
      setRotation(0);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !photo) return;

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
          setZoom(prev => Math.min(3, prev + 0.25));
          break;
        case '-':
          e.preventDefault();
          setZoom(prev => Math.max(0.25, prev - 0.25));
          break;
        case '0':
          setZoom(1);
          break;
      }
    };

    const handleResize = () => {
      if (photo && isOpen) {
        setImageDimensions(calculateOptimalDimensions());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, photo, hasNext, hasPrev, onClose, onNext, onPrev, isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    if (!photo) return;
    
    try {
      const response = await fetch(`/api/image?filename=${photo.filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetTransformations = () => {
    setZoom(1);
    setRotation(0);
  };

  if (!isOpen || !photo) return null;

  const imageSrc = `/api/image?filename=${photo.filename}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Botones de navegación */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all group"
          aria-label="Imagen anterior"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all group"
          aria-label="Siguiente imagen"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Botón de cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all group"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Controles en la parte superior izquierda */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {/* Controles de zoom */}
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.max(0.25, zoom - 0.25));
            }}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Zoom out"
          >
            <span className="text-lg font-bold">−</span>
          </button>
          <span className="px-2 text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.min(3, zoom + 0.25));
            }}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            aria-label="Zoom in"
          >
            <span className="text-lg font-bold">+</span>
          </button>
        </div>

        {/* Controles adicionales */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetTransformations();
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors group"
          aria-label="Resetear zoom y rotación"
          title="Reset"
        >
          <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setRotation((prev) => (prev + 90) % 360);
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors group"
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
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors group"
          aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Contenedor principal de la imagen */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={handleImageClick}
        ref={imageContainerRef}
      >
        <div 
          className="relative bg-black/30 rounded-xl overflow-auto modal-image-container"
          style={{
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
            maxWidth: '90vw',
            maxHeight: '90vh',
            transition: 'width 0.3s ease, height 0.3s ease'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}

          <div
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image
              src={imageSrc}
              alt={photo.caption || `Imagen ${photo.id}`}
              width={imageDimensions.width}
              height={imageDimensions.height}
              className={`object-contain transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              sizes="90vw"
              unoptimized={true}
              quality={100}
              onLoad={() => setIsLoading(false)}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}