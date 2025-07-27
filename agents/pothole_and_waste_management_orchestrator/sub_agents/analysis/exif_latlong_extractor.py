#!/usr/bin/env python3
"""
exif_latlong_extractor.py
────────────────────────
Cloud‑ready helper that extracts GPS latitude/longitude **only from a JPEG
image URL** and returns a plain dict:

    {"lat": float|None, "lng": float|None}

Designed for import inside Cloud Functions / Cloud Run. No CLI or argparse.

Example
-------
    from exif_latlong_extractor import extract_exif_lat_lng

    coords = extract_exif_lat_lng(
        "https://example.com/photo_with_gps.jpg"
    )
    # → {"lat": 12.971598, "lng": 77.594566}

Dependencies
------------
    pip install pillow requests
"""

from __future__ import annotations

import os
import tempfile
from typing import Optional, Dict

import requests
from PIL import Image, UnidentifiedImageError
from PIL.ExifTags import TAGS, GPSTAGS

__all__ = ["extract_exif_lat_lng"]

# ── helpers ────────────────────────────────────────────────────────────────

def _get_if_exist(data: dict, key):
    return data.get(key)


def _convert_to_degrees(dms_tuple):
    d, m, s = (float(x) for x in dms_tuple)
    return d + (m / 60.0) + (s / 3600.0)


def _parse_exif_dict(exif_data: dict) -> Dict[str, Optional[float]]:
    gps_info = {}
    for tag, val in exif_data.items():
        if TAGS.get(tag, tag) == "GPSInfo":
            for t in val:
                gps_info[GPSTAGS.get(t, t)] = val[t]

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
        return {"lat": lat, "lng": lng}

    return {"lat": None, "lng": None}


# ── public API ─────────────────────────────────────────────────────────────

def extract_exif_lat_lng(url: str, timeout: int = 15) -> Dict[str, Optional[float]]:
    """Download JPEG at *url* and return GPS coords as dict (lat/lng)."""
    if not url.lower().startswith(("http://", "https://")):
        raise ValueError("Input must be an HTTP/HTTPS image URL.")
    if not url.lower().endswith((".jpg", ".jpeg")):
        raise ValueError("Only JPEG images are supported.")

    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(resp.content)
        tmp_path = tmp.name

    try:
        try:
            img = Image.open(tmp_path)
            exif_data = img._getexif() or {}
        except UnidentifiedImageError as exc:
            raise RuntimeError(f"Pillow could not decode JPEG: {exc}") from exc
        return _parse_exif_dict(exif_data)
    finally:
        try:
            os.remove(tmp_path)
        except FileNotFoundError:
            pass
