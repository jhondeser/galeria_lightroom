# scripts/extract_metadata.py

import sys
import json
import subprocess
from pathlib import Path


def extract_metadata(input_dir):
    """
    Ejecuta exiftool y devuelve metadata en JSON
    """

    cmd = [
        "exiftool",
        "-j",
        "-n",
        "-ext", "jpg",
        "-ext", "jpeg",
        "-ext", "png",
        "-FileName",
        "-IPTC:Keywords",
        "-XMP-dc:Subject",
        "-DateTimeOriginal",
        "-CreateDate",
        "-Make",
        "-Model",
        "-GPSLatitude",
        "-GPSLongitude",
        input_dir
    ]

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=True
    )

    return json.loads(result.stdout)


def main():

    if len(sys.argv) < 2:
        print("Error: Se necesita la ruta")
        sys.exit(1)

    input_dir = sys.argv[1]

    metadata_list = extract_metadata(input_dir)

    photos = []

    for i, item in enumerate(metadata_list):

        filename = item.get("FileName")

        if not filename:
            continue

        tags = []

        # IPTC Keywords
        if "Keywords" in item:
            if isinstance(item["Keywords"], list):
                tags.extend(item["Keywords"])
            else:
                tags.append(item["Keywords"])

        # XMP Subject
        if "Subject" in item:
            if isinstance(item["Subject"], list):
                tags.extend(item["Subject"])
            else:
                tags.append(item["Subject"])

        photo = {
            "id": f"photo-{i+1:03d}",
            "filename": filename,
            "tags": list(set(tags)),
            "metadata": {
                "date_taken": item.get("DateTimeOriginal"),
                "create_date": item.get("CreateDate"),
                "make": item.get("Make"),
                "model": item.get("Model"),
                "gps": {
                    "lat": item.get("GPSLatitude"),
                    "lng": item.get("GPSLongitude")
                }
            }
        }

        photos.append(photo)

    output = {
        "metadata": {
            "source": input_dir,
            "total_photos": len(photos)
        },
        "photos": photos
    }

    Path("public").mkdir(exist_ok=True)

    with open("public/photos.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"✅ Procesadas {len(photos)} imágenes")


if __name__ == "__main__":
    main()