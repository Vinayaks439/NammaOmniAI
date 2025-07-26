#!/usr/bin/env python3
"""
exif_latlong_extractor.py
----------------------------------
Extract GPS latitude / longitude from either
• a **local image file**, or
• an **HTTP/HTTPS image URL** (JPEG / PNG / HEIC, etc.).

JPEG/PNG: plain Pillow is enough.
HEIC/HEIF: tries Pillow plugin (pillow‑heif) first;
           if that fails, falls back to pyheif + piexif.

Dependencies:
    pip install pillow pillow‑heif pyheif piexif requests
    # Linux users: sudo apt install libheif1 libheif-dev
"""

from __future__ import annotations

import os
import sys
import tempfile
from typing import Optional, Tuple

import requests
from PIL import Image, UnidentifiedImageError
from PIL.ExifTags import TAGS, GPSTAGS

# Try to enable Pillow’s HEIC plugin if present
try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:
    pillow_heif = None  # just for info/debug


# ── helpers ────────────────────────────────────────────────────────────────
def _get_if_exist(data: dict, key):
    return data.get(key)


def _convert_to_degrees(value):
    d = value[0][0] / value[0][1]
    m = value[1][0] / value[1][1]
    s = value[2][0] / value[2][1]
    return d + (m / 60.0) + (s / 3600.0)


def _extract_from_file(image_path: str) -> Tuple[Optional[float], Optional[float]]:
    """
    Read EXIF from a local image path and return (lat, lng).
    Falls back to pyheif+piexif for HEIC/HEIF when Pillow fails.
    """
    try:
        img = Image.open(image_path)
        exif_data = img._getexif() or {}
        return _parse_exif_dict(exif_data)

    except UnidentifiedImageError as first_exc:
        # Pillow could not decode – maybe it’s HEIC and pillow‑heif is missing
        lower = image_path.lower()
        if lower.endswith((".heic", ".heif")):
            return _extract_heic_with_pyheif(image_path, first_exc)
        raise RuntimeError(f"Failed to read EXIF from {image_path}: {first_exc}") from first_exc


def _parse_exif_dict(exif_data: dict) -> Tuple[Optional[float], Optional[float]]:
    """Given Pillow’s exif dict, return lat/lng (or Nones)."""
    gps_info = {}
    for tag, val in exif_data.items():
        if TAGS.get(tag, tag) == "GPSInfo":
            for t in val:
                gps_info[GPSTAGS.get(t, t)] = val[t]

    lat = lng = None
    gps_latitude = _get_if_exist(gps_info, "GPSLatitude")
    gps_latitude_ref = _get_if_exist(gps_info, "GPSLatitudeRef")
    gps_longitude = _get_if_exist(gps_info, "GPSLongitude")
    gps_longitude_ref = _get_if_exist(gps_info, "GPSLongitudeRef")

    if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
        lat = _convert_to_degrees(gps_latitude)
        if gps_latitude_ref != "N":
            lat = -lat
        lng = _convert_to_degrees(gps_longitude)
        if gps_longitude_ref != "E":
            lng = -lng

    return lat, lng


def _extract_heic_with_pyheif(image_path: str, orig_exc: Exception):
    """
    Fallback path: use pyheif to decode and piexif to parse metadata.
    """
    try:
        import pyheif
        import piexif
    except ImportError as ie:
        raise RuntimeError(
            "Pillow could not open the HEIC/HEIF file and pyheif/piexif "
            "are not installed. Install with:\n"
            "    pip install pyheif piexif\n"
            "or add pillow‑heif.\n"
        ) from ie

    try:
        heif_file = pyheif.read(image_path)
    except Exception as he:
        raise RuntimeError(f"pyheif failed to decode {image_path}: {he}") from he

    # Extract EXIF bytes out of HEIF metadata blocks
    exif_dict = {}
    for meta in heif_file.metadata or []:
        if meta["type"] == "Exif":
            exif_dict = piexif.load(meta["data"])
            break  # only need the first Exif block

    gps_ifd = exif_dict.get("GPS", {}) if exif_dict else {}

    lat = lng = None
    gps_latitude = gps_ifd.get(piexif.GPSIFD.GPSLatitude)
    gps_latitude_ref = gps_ifd.get(piexif.GPSIFD.GPSLatitudeRef)
    gps_longitude = gps_ifd.get(piexif.GPSIFD.GPSLongitude)
    gps_longitude_ref = gps_ifd.get(piexif.GPSIFD.GPSLongitudeRef)

    if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
        lat = _convert_to_degrees(gps_latitude)
        if gps_latitude_ref.decode() != "N":
            lat = -lat
        lng = _convert_to_degrees(gps_longitude)
        if gps_longitude_ref.decode() != "E":
            lng = -lng

    return lat, lng


# ── public API ─────────────────────────────────────────────────────────────
def extract_exif_lat_lng(source: str, timeout: int = 15) -> Tuple[Optional[float], Optional[float]]:
    """
    Return `(lat, lng)` from a local image **or** an image URL.
    Values are `None` when GPS info is absent.
    """
    # 1) Local file on disk
    if os.path.isfile(source):
        return _extract_from_file(source)

    # 2) HTTP / HTTPS URL  →  download → temp file → extract
    elif source.startswith(("http://", "https://")):
        resp = requests.get(source, timeout=timeout)
        resp.raise_for_status()

        raw_bytes = resp.content  # binary; do NOT use .text
        suffix = os.path.splitext(source.split("?")[0])[-1].lower()
        if not suffix or len(suffix) > 6:
            suffix = ".jpg"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(raw_bytes)
            tmp_path = tmp.name

        try:
            return _extract_from_file(tmp_path)
        finally:
            os.remove(tmp_path)

    else:
        raise ValueError("Source must be a local file path or HTTP/HTTPS URL.")


# ── CLI entry‑point ────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract GPS latitude/longitude from an image file or URL."
    )
    parser.add_argument(
        "source",
        help="Path to an image (e.g. IMG_2530.HEIC) or an image URL "
        "(e.g. https://…/IMG_2530.HEIC)",
    )
    args = parser.parse_args()

    try:
        lat, lng = extract_exif_lat_lng(args.source)
        if lat is not None and lng is not None:
            print(f"GPS coordinates: {lat:.6f}, {lng:.6f}")
        else:
            print("No GPS data found in this image.")
    except Exception as err:
        print(f"❌ Error: {err}", file=sys.stderr)
        sys.exit(1)
