import Image from 'next/image';
import { Photo } from '@/types/photo';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';

interface ImageCardProps {
  photo: Photo;
  priority?: boolean;
  onClick?: () => void;
  fillContainer?: boolean;
}

export default function ImageCard({
  photo,
  priority = false,
  onClick,
  fillContainer = false,
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false);

  const isInteractive = Boolean(onClick);
  const imageSrc = `/api/image?filename=${encodeURIComponent(photo.filename)}`;
  const imageWidth = photo.width || 1200;
  const imageHeight = photo.height || 800;

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 ${
        isInteractive ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''
      } ${fillContainer ? 'w-full h-full' : 'w-full'}`}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (!isInteractive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {isInteractive && (
        <>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none z-[1]" />
          <div className="absolute top-3 right-3 z-10 p-2 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        </>
      )}

      {imageError ? (
        <div
          className={`w-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${
            fillContainer ? 'h-full min-h-[200px]' : 'aspect-[4/3]'
          }`}
        >
          <span className="text-gray-400">Imagen no disponible</span>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={photo.caption || `Imagen ${photo.id}`}
          width={imageWidth}
          height={imageHeight}
          className={`block transition-transform duration-700 group-hover:scale-[1.02] ${
            fillContainer ? 'w-full h-full object-cover' : 'w-full h-auto'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          priority={priority}
          quality={80}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
}