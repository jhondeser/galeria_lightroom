// app/api/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Ahora los nombres son simples: img_001.jpg, img_002.jpg, etc.
const IMAGES_FOLDER = 'G:\\Mi unidad\\respaldo pc\\jhonatan\\jhondeser_web\\libreria_lightroom';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename'); // ej: "img_001.jpg"
    
    if (!filename) {
      return NextResponse.json({ error: 'Se requiere nombre de archivo' }, { status: 400 });
    }
    
    // 📌 Ruta directa - sin encoding complejo
    const imagePath = path.join(IMAGES_FOLDER, filename);
    
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ 
        error: 'Imagen no encontrada',
        path: imagePath 
      }, { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    });
    
  } catch (error) {
    console.error('❌ Error en endpoint:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}