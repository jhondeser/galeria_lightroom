# scripts/rename_files_directly.py
import os
import json
from pathlib import Path
import shutil
from typing import Dict, List
import re

def rename_files_directly(
    folder_path: str,
    json_file: str = "public/photos.json",
    name_pattern: str = "img_{counter:03d}{ext}",
    counter_start: int = 1,
    make_backup: bool = True
) -> Dict[str, str]:
    """
    Renombra archivos directamente en su carpeta original.
    
    Args:
        folder_path: Ruta a la carpeta con las imágenes
        json_file: Ruta al archivo JSON con los metadatos
        name_pattern: Patrón para nombres nuevos. Variables disponibles:
                     {counter} - número secuencial
                     {ext} - extensión del archivo
                     {date} - fecha de la foto (si está disponible)
        counter_start: Número inicial para el contador
        make_backup: Si True, crea una copia de seguridad de los nombres originales
    
    Returns:
        Diccionario con el mapeo: {nombre_original: nombre_nuevo}
    """
    
    folder = Path(folder_path)
    json_path = Path(json_file)
    
    print(f"🔄 INICIANDO RENOMBRADO DIRECTO")
    print(f"📁 Carpeta: {folder}")
    print(f"📄 JSON: {json_path}")
    print("=" * 60)
    
    # Verificar que la carpeta existe
    if not folder.exists():
        print(f"❌ ERROR: La carpeta no existe: {folder}")
        return {}
    
    # Verificar que el JSON existe
    if not json_path.exists():
        print(f"❌ ERROR: El archivo JSON no existe: {json_path}")
        return {}
    
    # Cargar el JSON
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ ERROR al cargar JSON: {e}")
        return {}
    
    # Verificar estructura del JSON
    if 'photos' not in data:
        print("❌ ERROR: El JSON no tiene el campo 'photos'")
        return {}
    
    photos = data['photos']
    print(f"📊 Encontradas {len(photos)} fotos en el JSON")
    
    # Crear diccionario para buscar fotos por nombre original
    photo_by_filename = {photo['filename']: photo for photo in photos}
    
    # Obtener TODOS los archivos de imagen en la carpeta
    image_extensions = {'.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG', 
                       '.tiff', '.TIFF', '.webp', '.WEBP'}
    
    all_files = list(folder.iterdir())
    image_files = [f for f in all_files if f.suffix.lower() in 
                  {ext.lower() for ext in image_extensions}]
    
    print(f"📁 Archivos de imagen en carpeta: {len(image_files)}")
    
    # Filtrar solo los archivos que están en el JSON
    files_to_rename = []
    for img_file in image_files:
        if img_file.name in photo_by_filename:
            files_to_rename.append(img_file)
        else:
            print(f"⚠️  Archivo no encontrado en JSON (se omitirá): {img_file.name}")
    
    print(f"📝 Archivos a renombrar (coinciden con JSON): {len(files_to_rename)}")
    
    if not files_to_rename:
        print("⚠️  No hay archivos para renombrar. Verifica que los nombres coincidan.")
        return {}
    
    # Ordenar archivos alfabéticamente para consistencia
    files_to_rename.sort(key=lambda x: x.name.lower())
    
    # Mapeo de nombres
    name_mapping = {}
    
    # PRIMERO: Crear copias de seguridad si se solicita
    if make_backup:
        backup_dir = folder / "backup_original_names"
        backup_dir.mkdir(exist_ok=True)
        
        # Guardar lista de nombres originales
        backup_file = backup_dir / "original_names.json"
        original_names = [f.name for f in files_to_rename]
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(original_names, f, indent=2, ensure_ascii=False)
        
        print(f"📋 Backup creado en: {backup_file}")
    
    # SEGUNDO: Renombrar los archivos físicamente
    print("\n🔄 Renombrando archivos...")
    
    # Usar un enfoque de dos pasos para evitar conflictos
    # Paso 1: Renombrar a nombres temporales
    temp_files = []
    
    for i, img_file in enumerate(files_to_rename):
        temp_name = f"__temp_{i:04d}{img_file.suffix}"
        temp_path = folder / temp_name
        
        try:
            img_file.rename(temp_path)
            temp_files.append((img_file.name, temp_path))
            print(f"  🔄 Temporal: {img_file.name} -> {temp_name}")
        except Exception as e:
            print(f"  ❌ Error al renombrar temporalmente {img_file.name}: {e}")
            # Revertir cambios si hay error
            for orig_name, temp_path in temp_files:
                if temp_path.exists():
                    temp_path.rename(folder / orig_name)
            return {}
    
    # Paso 2: Renombrar a nombres finales
    print("\n🔄 Asignando nombres finales...")
    
    counter = counter_start
    
    for original_name, temp_path in temp_files:
        # Obtener la foto del JSON
        photo = photo_by_filename.get(original_name)
        
        if not photo:
            print(f"  ⚠️  No se encontró metadata para: {original_name}")
            # Mantener como temporal por ahora
            continue
        
        # Extraer información para el patrón
        ext = temp_path.suffix.lower()
        
        # Buscar fecha en los metadatos
        photo_date = ""
        if 'date' in photo and photo['date']:
            try:
                # Extraer solo el año-mes-día
                date_str = photo['date'][:10].replace(':', '-')
                photo_date = date_str
            except:
                pass
        
        # Generar nombre nuevo según el patrón
        new_name = name_pattern.format(
            counter=counter,
            ext=ext,
            date=photo_date,
            id=photo.get('id', '')
        )
        
        new_path = folder / new_name
        
        try:
            # Renombrar archivo
            temp_path.rename(new_path)
            
            # Guardar el mapeo
            name_mapping[original_name] = new_name
            
            # Actualizar el JSON
            photo['original_filename'] = original_name
            photo['filename'] = new_name
            photo['path'] = new_name  # Actualizar el path también
            
            print(f"  ✅ {original_name[:40]:<40} -> {new_name}")
            
            counter += 1
            
        except Exception as e:
            print(f"  ❌ Error al renombrar {original_name} a {new_name}: {e}")
    
    # TERCERO: Actualizar el JSON completo
    print("\n🔄 Actualizando archivo JSON...")
    
    try:
        # Actualizar metadata
        if 'metadata' in data:
            data['metadata']['files_renamed'] = True
            data['metadata']['rename_date'] = os.path.getctime(__file__)
            data['metadata']['original_files_backup'] = str(backup_file) if make_backup else None
        
        # Guardar JSON actualizado
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 JSON actualizado guardado en: {json_path}")
        
    except Exception as e:
        print(f"❌ Error al guardar JSON: {e}")
        # IMPORTANTE: No revertir renombrado si falla el JSON
    
    # CUARTO: Crear archivo de mapeo
    mapping_file = folder / "name_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(name_mapping, f, indent=2, ensure_ascii=False)
    
    print(f"📋 Mapeo de nombres guardado en: {mapping_file}")
    
    # Resumen final
    print("\n" + "=" * 60)
    print("🎉 RENOMBRADO COMPLETADO")
    print(f"📁 Archivos renombrados: {len(name_mapping)}")
    print(f"📄 JSON actualizado: {json_path}")
    print(f"📋 Mapeo guardado: {mapping_file}")
    
    if make_backup:
        print(f"💾 Backup creado: {backup_file}")
    
    return name_mapping

def main():
    """Función principal para ejecutar desde línea de comandos."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Renombra archivos de imagen directamente en su carpeta original'
    )
    
    parser.add_argument(
        'folder',
        help='Carpeta con las imágenes a renombrar'
    )
    
    parser.add_argument(
        '--json',
        default='public/photos.json',
        help='Ruta al archivo JSON (default: public/photos.json)'
    )
    
    parser.add_argument(
        '--pattern',
        default='img_{counter:03d}{ext}',
        help='Patrón para nombres nuevos. Variables: {counter}, {ext}, {date}, {id}'
    )
    
    parser.add_argument(
        '--start',
        type=int,
        default=1,
        help='Número inicial para el contador (default: 1)'
    )
    
    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='No crear copia de seguridad'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Simular sin renombrar realmente'
    )
    
    args = parser.parse_args()
    
    if args.dry_run:
        print("🔍 MODO SIMULACIÓN - No se renombrarán archivos")
        print(f"Carpeta: {args.folder}")
        print(f"Patrón: {args.pattern}")
        print(f"Contador inicial: {args.start}")
        
        # Simular qué haría
        folder = Path(args.folder)
        if folder.exists():
            image_files = list(folder.glob("*.jpg")) + list(folder.glob("*.png"))
            print(f"\n📁 Se encontrarían {len(image_files)} archivos de imagen")
            for i, img in enumerate(image_files[:5], args.start):
                new_name = args.pattern.format(counter=i, ext=img.suffix.lower(), date="", id="")
                print(f"  {img.name[:30]:<30} -> {new_name}")
            if len(image_files) > 5:
                print(f"  ... y {len(image_files) - 5} más")
        return
    
    # Ejecutar renombrado
    rename_files_directly(
        folder_path=args.folder,
        json_file=args.json,
        name_pattern=args.pattern,
        counter_start=args.start,
        make_backup=not args.no_backup
    )

if __name__ == "__main__":
    main()