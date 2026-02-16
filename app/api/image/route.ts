// app/api/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Variable para guardar la ruta que el cliente ingrese
let userImagePath: string | null = null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json({ error: 'Se requiere nombre de archivo' }, { status: 400 });
    }
    
    // Usar la ruta del usuario o la ruta por defecto
    const basePath = userImagePath || 'G:\\Mi unidad\\respaldo pc\\jhonatan\\jhondeser_web\\libreria_lightroom';
    const imagePath = path.join(basePath, filename);
    
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
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
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// Endpoint para recibir la ruta del cliente
export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    userImagePath = path;
    return NextResponse.json({ success: true, message: 'Ruta guardada' });
  } catch (error) {
    return NextResponse.json({ error: 'Error guardando ruta' }, { status: 500 });
  }
}