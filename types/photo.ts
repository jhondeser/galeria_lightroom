// types/photo.ts
export interface Photo {
  id: string;
  filename: string;        // Nombre nuevo: "img_001.jpg"
  path: string;            // Solo nombre: "img_001.jpg" o ruta si prefieres
  tags: string[];
  date: string;
  width: number;
  height: number;
  caption: string;
  software: string;
  camera: string;
  
  // 📌 NUEVOS CAMPOS después del renombrado:
  original_filename?: string;  // Nombre original antes de renombrar
  renamed?: boolean;           // Si ha sido renombrado
  rename_date?: string;        // Fecha de renombrado
  
  // Campos opcionales que tu script podría extraer
  sourceFile?: string;
  directory?: string;
  fileSize?: string;
  fileFormat?: string;
  colorSpace?: string;
  rating?: number;            // Si Lightroom tiene rating (1-5 estrellas)
  colorLabels?: string[];     // Etiquetas de color de Lightroom
  
  // Campos para UI/frontend (no vienen del JSON)
  imageUrl?: string;          // URL completa para la imagen
  thumbnailUrl?: string;      // URL para thumbnail (si implementas)
  isSelected?: boolean;       // Para selección múltiple en UI
}