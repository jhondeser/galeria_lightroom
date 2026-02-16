// components/ImageSourceConfig.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  RefreshCw,
  RotateCcw,  // 👈 Este es el icono correcto para "reset"
  History,
  FolderSearch
} from 'lucide-react';

interface ImageSourceConfigProps {
  onSourceChange: (sourcePath: string, photos: any[]) => void;
  currentPath?: string;
}

export default function ImageSourceConfig({ onSourceChange, currentPath }: ImageSourceConfigProps) {
  const [imagePath, setImagePath] = useState(currentPath || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [scanOptions, setScanOptions] = useState({
    recursive: false,
    extractMetadata: true
  });

  // Cargar historial del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pathHistory');
    if (saved) {
      setPathHistory(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imagePath.trim()) {
      setStatus('error');
      setMessage('Por favor ingresa una ruta válida');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');
    setMessage('Procesando imágenes...');

    try {
      // 1. Configurar la ruta en el endpoint
      const configResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'set',
          path: imagePath 
        })
      });

      if (!configResponse.ok) {
        const error = await configResponse.json();
        throw new Error(error.error || 'Error configurando ruta');
      }

      // 2. Ejecutar script de extracción de metadatos
      const metadataResponse = await fetch('/api/process-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: imagePath,
          options: scanOptions
        })
      });

      if (!metadataResponse.ok) {
        const error = await metadataResponse.json();
        throw new Error(error.error || 'Error procesando imágenes');
      }

      const metadata = await metadataResponse.json();
      
      // 3. Guardar en historial
      const updatedHistory = [imagePath, ...pathHistory.filter(p => p !== imagePath)].slice(0, 5);
      setPathHistory(updatedHistory);
      localStorage.setItem('pathHistory', JSON.stringify(updatedHistory));
      
      // 4. Notificar al componente padre
      onSourceChange(imagePath, metadata.photos);
      
      setStatus('success');
      setMessage(`✅ ${metadata.metadata.total_photos} imágenes procesadas correctamente`);
      
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    setStatus('processing');
    setMessage('Restableciendo a configuración por defecto...');

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });

      if (response.ok) {
        setImagePath('');
        setStatus('success');
        setMessage('✅ Configuración restablecida');
        
        // Recargar fotos por defecto
        const defaultPhotosResponse = await fetch('/api/photos');
        const defaultPhotos = await defaultPhotosResponse.json();
        onSourceChange('', defaultPhotos.photos);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error al restablecer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestPath = async () => {
    if (!imagePath.trim()) return;
    
    setStatus('processing');
    setMessage('Verificando ruta...');
    
    try {
      // Verificar que la ruta existe y tiene imágenes
      const response = await fetch('/api/verify-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: imagePath })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setStatus('success');
        setMessage(`✅ Ruta válida - ${data.imageCount} imágenes encontradas`);
        
        // Mostrar ejemplos si hay
        if (data.sampleImages && data.sampleImages.length > 0) {
          setMessage(prev => `${prev}\nEjemplos: ${data.sampleImages.slice(0, 3).join(', ')}`);
        }
      } else {
        setStatus('error');
        setMessage(`❌ ${data.error || 'Ruta no válida'}`);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error verificando ruta');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen className="text-blue-600" />
          Configurar fuente de imágenes
        </h2>
        
        {/* Botón para restablecer - AHORA CON RotateCcw */}
        <button
          onClick={handleReset}
          disabled={isProcessing}
          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={16} />  {/* 👈 Icono corregido */}
          Restablecer
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de ruta con autocompletado */}
        <div>
          <label htmlFor="imagePath" className="block text-sm font-medium text-gray-700 mb-2">
            Ruta de las imágenes
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                id="imagePath"
                value={imagePath}
                onChange={(e) => setImagePath(e.target.value)}
                placeholder="Ej: G:\Mi unidad\Fotos o /home/usuario/imagenes"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
                list="path-history"
              />
              <datalist id="path-history">
                {pathHistory.map((path, index) => (
                  <option key={index} value={path} />
                ))}
              </datalist>
              
              {/* Icono de carpeta dentro del input (opcional) */}
              <FolderSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button
              type="button"
              onClick={handleTestPath}
              disabled={isProcessing || !imagePath.trim()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={18} />
              Verificar
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Ruta absoluta donde están tus imágenes
          </p>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={scanOptions.recursive}
              onChange={(e) => setScanOptions({...scanOptions, recursive: e.target.checked})}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium">Búsqueda recursiva</span>
              <p className="text-gray-500 text-xs">Incluir subcarpetas</p>
            </div>
          </label>
          
          <label className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={scanOptions.extractMetadata}
              onChange={(e) => setScanOptions({...scanOptions, extractMetadata: e.target.checked})}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium">Extraer metadatos</span>
              <p className="text-gray-500 text-xs">Tags, fecha, cámara, etc.</p>
            </div>
          </label>
        </div>

        {/* Botón principal */}
        <button
          type="submit"
          disabled={isProcessing || !imagePath.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg font-medium transition-colors"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Procesando...
            </>
          ) : (
            <>
              <Play size={20} />
              Cargar imágenes desde esta ruta
            </>
          )}
        </button>

        {/* Mensaje de estado */}
        {message && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            status === 'processing' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
            'bg-gray-50 text-gray-800 border border-gray-200'
          }`}>
            {status === 'success' && <CheckCircle className="flex-shrink-0 mt-0.5" size={18} />}
            {status === 'error' && <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />}
            {status === 'processing' && <Loader2 className="animate-spin flex-shrink-0 mt-0.5" size={18} />}
            <span className="text-sm whitespace-pre-line">{message}</span>
          </div>
        )}

        {/* Historial de rutas recientes */}
        {pathHistory.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <History size={12} />
              Rutas recientes:
            </p>
            <div className="flex flex-wrap gap-2">
              {pathHistory.map((path, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setImagePath(path)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  {path.length > 30 ? path.substring(0, 30) + '...' : path}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ejemplos de rutas */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <p className="font-medium mb-1">📌 Ejemplos de rutas válidas:</p>
          <ul className="space-y-1 list-disc pl-4">
            <li><code className="bg-gray-100 px-1 py-0.5 rounded">G:\Mi unidad\Fotos</code> - Unidad externa en Windows</li>
            <li><code className="bg-gray-100 px-1 py-0.5 rounded">C:\Users\Usuario\Pictures</code> - Carpeta local</li>
            <li><code className="bg-gray-100 px-1 py-0.5 rounded">/Volumes/DiscoExterno/Fotos</code> - Mac</li>
            <li><code className="bg-gray-100 px-1 py-0.5 rounded">/home/usuario/imagenes</code> - Linux</li>
          </ul>
        </div>
      </form>
    </div>
  );
}