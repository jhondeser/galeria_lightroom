// components/ImageCard.tsx
import Image from 'next/image';
import { Photo } from '@/types/photo';
import { useState } from 'react';
import { Maximize2 } from 'lucide-react';

interface ImageCardProps {
  photo: Photo;
  priority?: boolean;
  onClick?: () => void;
}

export default function ImageCard({ photo, priority = false, onClick }: ImageCardProps) {
  const imageSrc = `/api/image?filename=${photo.filename}`;
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getAspectRatio = () => {
    if (photo.width && photo.height) {
      return photo.width / photo.height;
    }
    const ratios = [3/4, 1, 4/3, 16/9];
    const hash = photo.id ? parseInt(photo.id.toString().slice(-1)) : 0;
    return ratios[hash % ratios.length];
  };

  const aspectRatio = getAspectRatio();

  return (
    <div 
      className="group relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-1"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Botón de expandir visible en hover */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-10 p-2 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Maximize2 className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`relative overflow-hidden ${aspectRatio < 0.8 ? 'h-full' : ''}`}>
        {imageError ? (
          <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400">Imagen no disponible</span>
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={photo.caption || `Imagen ${photo.id}`}
            width={aspectRatio > 1.2 ? 800 : 400}
            height={aspectRatio < 0.8 ? 600 : 400}
            className={`
              w-full h-auto object-cover transition-transform duration-700
              ${aspectRatio < 0.8 ? 'min-h-[300px] max-h-[600px]' : ''}
              group-hover:scale-[1.03]
            `}
            sizes={`
              (max-width: 640px) 100vw,
              (max-width: 768px) ${aspectRatio > 1.2 ? '100vw' : '50vw'},
              (max-width: 1024px) ${aspectRatio > 1.2 ? '50vw' : '33vw'},
              ${aspectRatio > 1.2 ? '40vw' : '20vw'}
            `}
            unoptimized={true}
            priority={priority}
            quality={90}
            onError={() => setImageError(true)}
          />
        )}
      </div>
      
    </div>
  );
}