# scripts/extract_metadata.py
import os
import sys
import json
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print("Error: Se necesita la ruta")
        sys.exit(1)
    
    input_dir = sys.argv[1]
    photos = []
    
    # Buscar imágenes
    for file in Path(input_dir).glob('*'):
        if file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            photos.append({
                "id": f"photo-{len(photos)+1:03d}",
                "filename": file.name,
                "tags": []
            })
    
    # Guardar JSON
    output = {
        "metadata": {
            "source": input_dir,
            "total_photos": len(photos)
        },
        "photos": photos
    }
    
    with open('public/photos.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"✅ Procesadas {len(photos)} imágenes")

if __name__ == "__main__":
    main()