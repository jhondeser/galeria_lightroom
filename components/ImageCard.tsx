// components/ImageCard.tsx
import Image from 'next/image';
import { Photo } from '@/types/photo';
import { Tag } from 'lucide-react';

interface ImageCardProps {
  photo: Photo;
}

export default function ImageCard({ photo }: ImageCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-white">
      {/* Contenedor de imagen */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={`/${photo.file}`}
          alt={photo.caption || photo.filename}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>
      
      {/* Información de la imagen */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-800 truncate">
            {photo.filename}
          </h3>
          {photo.date && (
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
              {photo.date}
            </span>
          )}
        </div>
        
        {/* Tags */}
        {photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <Tag className="w-3 h-3 text-gray-400 mt-1" />
            <div className="flex flex-wrap gap-1 ml-1">
              {photo.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {photo.tags.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">
                  +{photo.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Caption */}
        {photo.caption && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {photo.caption}
          </p>
        )}
      </div>
    </div>
  );
}