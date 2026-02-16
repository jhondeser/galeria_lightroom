// components/PathInput.tsx
'use client';

import { useState } from 'react';
import { FolderOpen, Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

interface PathInputProps {
  onPathSet: () => void;
}

export default function PathInput({ onPathSet }: PathInputProps) {
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!path.trim()) {
      setStatus('error');
      setMessage('Por favor ingresa una ruta');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // 1. Guardar la ruta en el endpoint
      const res1 = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      if (!res1.ok) throw new Error('Error guardando ruta');
      
      // 2. Ejecutar script Python para extraer metadatos
      const res2 = await fetch('/api/run-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      if (!res2.ok) throw new Error('Error procesando imágenes');
      
      setStatus('success');
      setMessage('✅ Imágenes cargadas correctamente');
      onPathSet();
      
    } catch (error) {
      setStatus('error');
      setMessage('❌ Error al procesar la ruta');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Título y descripción */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Galería de Fotos</h1>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {path ? `Ruta actual: ${path}` : 'Configura la ubicación de tus imágenes'}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="G:\Mi unidad\Fotos o /home/usuario/imagenes"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all"
                  disabled={loading}
                />
                {status === 'success' && (
                  <div className="absolute right-3 top-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="absolute right-3 top-3">
                    <AlertCircle className="w-5 h-5 text-red-300" />
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <FolderOpen size={18} />
                    <span>Cargar imágenes</span>
                  </>
                )}
              </button>
            </div>

            {/* Mensaje de estado */}
            {message && (
              <div className={`mt-3 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                status === 'success' ? 'bg-green-500/20 text-green-100' :
                status === 'error' ? 'bg-red-500/20 text-red-100' :
                'bg-blue-500/20 text-blue-100'
              }`}>
                {status === 'success' && <CheckCircle size={16} />}
                {status === 'error' && <AlertCircle size={16} />}
                <span>{message}</span>
              </div>
            )}

            {/* Ejemplos rápidos */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-blue-200">
              <span className="opacity-75">Ejemplos:</span>
              <button 
                type="button"
                onClick={() => setPath('G:\\Mi unidad\\Fotos')}
                className="hover:text-white transition-colors px-2 py-1 bg-white/10 rounded"
              >
                📁 Windows
              </button>
              <button 
                type="button"
                onClick={() => setPath('/Users/usuario/Pictures')}
                className="hover:text-white transition-colors px-2 py-1 bg-white/10 rounded"
              >
                📁 Mac
              </button>
              <button 
                type="button"
                onClick={() => setPath('/home/usuario/imagenes')}
                className="hover:text-white transition-colors px-2 py-1 bg-white/10 rounded"
              >
                📁 Linux
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}