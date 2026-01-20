// app/page.tsx - VERSIÓN FINAL
'use client';

import { useState, useEffect } from 'react';
import Gallery from '@/components/Gallery';
import { Photo } from '@/types/photo';
import { getUniqueTags, getTagCounts } from '@/lib/data';
import { Loader2, Filter, X, Search } from 'lucide-react';

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Record<string, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos del JSON
  useEffect(() => {
    const loadPhotos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/photos.json');
        const data = await response.json();
        
        // Usar datos tal cual están
        setPhotos(data);
        setFilteredPhotos(data);
        
        const uniqueTags = getUniqueTags(data);
        setAllTags(uniqueTags);
        setTagCounts(getTagCounts(data));
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, []);

  // Aplicar filtros cuando cambian
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPhotos(photos);
    } else {
      const filtered = photos.filter(photo =>
        selectedTags.every(tag => photo.tags.includes(tag))
      );
      setFilteredPhotos(filtered);
    }
  }, [selectedTags, photos]);

  // Funciones para manejar filtros
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
  };

  // Filtrar tags por búsqueda
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tags más populares (top 5)
  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Galería Lightroom
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Visualiza y filtra tus fotos por keywords exportados desde Adobe Lightroom.
              Selecciona múltiples tags para filtrar (usando lógica AND).
            </p>
          </div>
          
          {selectedTags.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors self-start md:self-center"
            >
              <X className="w-4 h-4" />
              Limpiar filtros ({selectedTags.length})
            </button>
          )}
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Cargando galería...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Panel de filtros - izquierda */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-800">Filtros</h2>
                </div>
                <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {photos.length} fotos
                </span>
              </div>

              {/* Búsqueda */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <div className="absolute left-3 top-2.5">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {filteredTags.length} de {allTags.length} tags
                </p>
              </div>

              {/* Tags populares */}
              {popularTags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Tags populares
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {tag} ({tagCounts[tag]})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags seleccionados */}
              {selectedTags.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Seleccionados ({selectedTags.length})
                    </h3>
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Limpiar todo
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {tag}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lista de todos los tags */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Todos los tags ({allTags.length})
                </h3>
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
                  {filteredTags.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No se encontraron tags
                    </p>
                  ) : (
                    filteredTags.map(tag => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <div
                          key={tag}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded mr-3 ${
                              isSelected ? 'bg-blue-500' : 'bg-gray-200'
                            }`} />
                            <span className={`${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                              {tag}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {tagCounts[tag] || 0}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  📌 <span className="font-medium">Filtro AND:</span> Las fotos deben tener TODOS los tags seleccionados.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  👆 Haz clic en cualquier tag para seleccionarlo.
                </p>
              </div>
            </div>
          </aside>
          
          {/* Galería - derecha */}
          <section className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              {/* Header de la galería */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Galería de fotos
                    </h2>
                    {selectedTags.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Filtrado por: {selectedTags.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="font-medium">{filteredPhotos.length}</span> de{' '}
                    <span className="font-medium">{photos.length}</span> imágenes
                    {selectedTags.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        • {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} seleccionado{selectedTags.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Tags activos para rápido acceso */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Galería de imágenes */}
              <Gallery photos={filteredPhotos} />
            </div>
            
            {/* Estadísticas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-2">📊 Estadísticas</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• {photos.length} fotos totales</p>
                  <p>• {allTags.length} tags únicos</p>
                  <p>• {Object.values(tagCounts).reduce((a, b) => a + b, 0)} tags asignados</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">ℹ️ Cómo filtrar</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Selecciona múltiples tags (AND)</li>
                  <li>• Usa el buscador para tags</li>
                  <li>• Los números muestran cuántas fotos tienen ese tag</li>
                </ul>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">🚀 Próximamente</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Script Python para procesar fotos reales</li>
                  <li>• Despliegue en Vercel</li>
                  <li>• Integración con Google Drive</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      )}
      
      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>
            Galería desarrollada con Next.js 14 • Filtrado por metadatos de Lightroom
          </p>
          <p className="mt-1">
            Datos de ejemplo: 10 fotos con keywords de Lightroom
          </p>
        </div>
      </footer>
    </main>
  );
}