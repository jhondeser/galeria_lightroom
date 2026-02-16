"""
Script PARA EXTRACCION DE METADATOS DE LIGHTROOM
Versión que SÍ funciona con rutas complejas
"""

import os
import sys
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import subprocess

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PhotoProcessor:
    def __init__(self, input_dir: str, output_file: str = "photos.json"):
        self.input_dir = Path(input_dir).resolve()
        self.output_file = Path(output_file).resolve()
        self.photos_data = []
        
        if not self.input_dir.exists():
            logger.error(f"Directorio no existe: {self.input_dir}")
            sys.exit(1)
        
        # Verificar exiftool
        if not self._check_exiftool():
            sys.exit(1)
    
    def _check_exiftool(self):
        """Verifica que exiftool funcione."""
        try:
            result = subprocess.run(
                ["exiftool", "-ver"],
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                logger.info(f"✅ exiftool versión: {result.stdout.strip()}")
                return True
        except:
            pass
        
        logger.error("❌ exiftool no funciona. Verifica que esté en PATH.")
        return False
    
    def find_images(self) -> List[Path]:
        """Encuentra imágenes en el directorio."""
        images = []
        seen = set()
        
        exts = ['.jpg', '.jpeg', '.JPG', '.JPEG', '.png', '.PNG', '.tiff', '.TIFF']
        
        for ext in exts:
            for img in self.input_dir.glob(f"*{ext}"):
                if img.is_file():
                    key = img.name.lower()
                    if key not in seen:
                        seen.add(key)
                        images.append(img)
        
        logger.info(f"📸 Encontradas {len(images)} imágenes")
        return sorted(images, key=lambda x: x.name.lower())
    
    def get_metadata(self, image_path: Path) -> Optional[Dict[str, Any]]:
        """
        Obtiene metadatos MANEJANDO RUTAS COMPLEJAS.
        Esta es la clave: cambia al directorio de la imagen.
        """
        try:
            # GUARDAR directorio actual
            original_dir = os.getcwd()
            
            # IR al directorio donde está la imagen
            os.chdir(image_path.parent)
            
            # Usar solo el NOMBRE del archivo (no ruta completa)
            file_name = image_path.name
            
            # Comando SIMPLE y directo
            cmd = ["exiftool", "-json", file_name]
            
            logger.debug(f"📂 Directorio: {os.getcwd()}")
            logger.debug(f"📄 Archivo: {file_name}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=10
            )
            
            # VOLVER al directorio original
            os.chdir(original_dir)
            
            if result.stdout:
                data = json.loads(result.stdout)
                if data and isinstance(data, list) and len(data) > 0:
                    return data[0]
            
            return None
            
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Error exiftool: {e.stderr[:200]}")
            try:
                os.chdir(original_dir)
            except:
                pass
            return None
        except Exception as e:
            logger.error(f"❌ Error: {e}")
            try:
                os.chdir(original_dir)
            except:
                pass
            return None
    
    def extract_tags(self, metadata: Dict[str, Any]) -> List[str]:
        """Extrae tags de los metadatos."""
        tags = []
        
        # Campos donde buscar tags
        tag_fields = [
            'Keywords',
            'Subject', 
            'XPKeywords',
            'IPTCCode',
            'Category',  # Otros posibles campos
            'SupplementalCategories'
        ]
        
        for field in tag_fields:
            if field in metadata:
                value = metadata[field]
                
                if isinstance(value, list):
                    # Si ya es una lista (como en tu caso)
                    tags.extend([str(item).strip() for item in value if str(item).strip()])
                elif isinstance(value, str):
                    # Si es string, separar por delimitadores comunes
                    value = value.strip()
                    if value:
                        # Probar diferentes separadores
                        for sep in [',', ';', '|', '/', '\\n']:
                            if sep in value:
                                parts = value.split(sep)
                                tags.extend([part.strip() for part in parts if part.strip()])
                                break
                        else:
                            # Si no tiene separadores, usar todo el string
                            tags.append(value)
        
        # Eliminar duplicados y ordenar
        unique_tags = sorted(list(set([tag for tag in tags if tag])))
        return unique_tags
    
    def process_image(self, img_path: Path, index: int) -> Optional[Dict[str, Any]]:
        """Procesa una imagen individual."""
        short_name = img_path.name[:40] + ("..." if len(img_path.name) > 40 else "")
        logger.info(f"[{index+1}] 📷 {short_name}")
        
        metadata = self.get_metadata(img_path)
        
        if not metadata:
            logger.warning(f"   ⚠️  Sin metadatos")
            return None
        
        tags = self.extract_tags(metadata)
        
        # Crear objeto de foto
        photo = {
            "id": f"photo-{index+1:03d}",
            "filename": img_path.name,
            "path": f"content/{img_path.name}", 
            "tags": tags,
            "date": metadata.get('DateTimeOriginal', metadata.get('ModifyDate', '')),
            "width": metadata.get('ImageWidth'),
            "height": metadata.get('ImageHeight'),
            "caption": metadata.get('Caption', metadata.get('Description', '')),
            "software": metadata.get('Software', ''),
            "camera": metadata.get('Model', '')
        }
        
        if tags:
            logger.info(f"   ✅ {len(tags)} tags: {', '.join(tags[:3])}{'...' if len(tags) > 3 else ''}")
        else:
            logger.info(f"   ℹ️  0 tags (pero tiene otros metadatos)")
        
        return photo
    
    def process_all(self):
        """Procesa todas las imágenes."""
        images = self.find_images()
        
        if not images:
            logger.error("❌ No hay imágenes para procesar")
            return False
        
        logger.info(f"🔄 Procesando {len(images)} imágenes...")
        
        success = 0
        for i, img in enumerate(images):
            try:
                photo = self.process_image(img, i)
                if photo:
                    self.photos_data.append(photo)
                    success += 1
            except Exception as e:
                logger.error(f"❌ Error con {img.name}: {e}")
        
        logger.info(f"📊 Resultado: {success} exitosas, {len(images)-success} fallidas")
        return success > 0
    
    def save_json(self):
        """Guarda en formato JSON."""
        if not self.photos_data:
            logger.error("❌ No hay datos para guardar")
            return False
        
        output = {
            "metadata": {
                "generated": datetime.now().isoformat(),
                "source": str(self.input_dir),
                "total_photos": len(self.photos_data),
                "total_tags": len(set(tag for p in self.photos_data for tag in p["tags"])),
                "generator": "Lightroom Metadata Extractor"
            },
            "photos": self.photos_data
        }
        
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            
            logger.info(f"💾 Guardado en: {self.output_file}")
            
            # Estadísticas
            all_tags = []
            for photo in self.photos_data:
                all_tags.extend(photo["tags"])
            
            if all_tags:
                unique = set(all_tags)
                logger.info(f"🏷️  Estadísticas tags:")
                logger.info(f"   • Únicos: {len(unique)}")
                logger.info(f"   • Totales: {len(all_tags)}")
                
                # Tags más comunes
                from collections import Counter
                common = Counter(all_tags).most_common(10)
                logger.info("   • Top 10 tags:")
                for tag, count in common:
                    logger.info(f"     {tag}: {count} fotos")
            else:
                logger.warning("⚠️  No se encontraron tags")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error guardando JSON: {e}")
            return False
    
    def run(self):
        """Ejecuta todo el proceso."""
        logger.info("=" * 60)
        logger.info("🖼️  EXTRACTOR DE METADATOS LIGHTROOM")
        logger.info("=" * 60)
        
        if self.process_all():
            if self.save_json():
                logger.info("🎉 ¡PROCESAMIENTO COMPLETADO!")
                return True
        
        logger.error("💥 Procesamiento falló")
        return False

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Extrae tags/metadatos de fotos de Lightroom"
    )
    parser.add_argument("input_dir", help="Directorio con imágenes")
    parser.add_argument("-o", "--output", default="../public/photos.json", help="Archivo de salida")
    parser.add_argument("-v", "--verbose", action="store_true", help="Modo detallado")
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    processor = PhotoProcessor(args.input_dir, args.output)
    success = processor.run()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()