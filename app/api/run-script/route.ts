// app/api/run-script/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { path: imagePath } = await request.json();
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'extract_metadata.py');
    
    // Ejecutar script
    exec(`python "${scriptPath}" "${imagePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error:', error);
      }
      console.log('Output:', stdout);
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}