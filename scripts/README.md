# 📸 Script de Procesamiento de Fotos Lightroom

Este script extrae metadatos (tags/keywords) de tus fotos exportadas desde Lightroom y genera un archivo `photos.json` para la galería web.

## 📋 Requisitos Previos

### 1. Instalar exiftool
El script usa `exiftool` para leer metadatos. Debes instalarlo primero:

#### **Windows:**
1. Descarga de: https://exiftool.org/
2. Extrae `exiftool(-k).exe` y renómbralo a `exiftool.exe`
3. Colócalo en `C:\Windows\` o añade a PATH

#### **macOS:**
```bash
brew install exiftool