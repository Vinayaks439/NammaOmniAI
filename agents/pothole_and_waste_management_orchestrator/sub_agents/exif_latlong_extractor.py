#!/usr/bin/env python3
"""
exif_latlong_extractor.py
----------------------------------
Cloud‑agent‑friendly helper that extracts GPS latitude / longitude **only from an
HTTP/HTTPS image URL** (JPEG / PNG / HEIC, etc.). Local file paths are no longer
accepted as input.

Typical usage inside a Cloud Function or Cloud Run service::

    from exif_latlong_extractor import extract_exif_lat_lng

    lat, lng = extract_exif_lat_lng(request_json["image_url"])

If the image lacks embedded GPS data both values come back as ``None``. All
network / decoding errors raise exceptions, so your calling code can decide
whether to retry or log.

Dependencies:
    pip install pillow pillow‑heif pyheif piexif requests
    # Linux users: sudo apt install libheif1 libheif-dev
"""

from __future__ import annotations

import os
import tempfile
from typing import Optional, Tuple

import requests
from PIL import Image, UnidentifiedImageError
from PIL.ExifTags import TAGS, GPSTAGS

# Attempt to register Pillow‑HEIF plugin for native .heic support
try:
    import pillow_heif

    pillow_heif.register_heif_opener()
except ImportError:  # optional dependency
    pillow_heif = None  # pragma: no cover


# ── helpers ────────────────────────────────────────────────────────────────

def _get_if_exist(data: dict, key):
    return data.get(key)


def _convert_to_degrees(value):
    d = value[0][0] / value[0][1]
    m = value[1][0] / value[1][1]
    s = value[2][0] / value[2][1]
    return d + (m / 60.0) + (s / 3600.0)


# ── core extraction routines ───────────────────────────────────────────────

def _extract_from_file(image_path: str) -> Tuple[Optional[float], Optional[float]]:
    """Read EXIF from *image_path* and return ``(lat, lng)`` or ``(None, None)``.

    Falls back to *pyheif* + *piexif* for HEIC when Pillow cannot decode. All
    failures raise ``RuntimeError`` so the caller can handle them appropriately.
    """
    try:
        img = Image.open(image_path)
        exif_data = img._getexif() or {}
        return _parse_exif_dict(exif_data)

    except UnidentifiedImageError as first_exc:
        lower = image_path.lower()
        if lower.endswith((".heic", ".heif")):
            return _extract_heic_with_pyheif(image_path, first_exc)
        raise RuntimeError(f"Failed to read EXIF from {image_path}: {first_exc}") from first_exc


def _parse_exif_dict(exif_data: dict) -> Tuple[Optional[float], Optional[float]]:
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
        return lat, lng

    return None, None


def _extract_heic_with_pyheif(image_path: str, orig_exc: Exception):
    try:
        import pyheif
        import piexif
    except ImportError as ie:
        raise RuntimeError(
            "HEIC decoding requires pyheif & piexif or pillow‑heif.\n"
            "Install with: pip install pyheif piexif"
        ) from ie

    try:
        heif_file = pyheif.read(image_path)
    except Exception as he:
        raise RuntimeError(f"pyheif failed to decode {image_path}: {he}") from he

    exif_dict = {}
    for meta in heif_file.metadata or []:
        if meta["type"] == "Exif":
            exif_dict = piexif.load(meta["data"])
            break

    gps_ifd = exif_dict.get("GPS", {}) if exif_dict else {}

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

    return None, None


# ── public API ─────────────────────────────────────────────────────────────

def extract_exif_lat_lng(url: str, timeout: int = 15) -> Tuple[Optional[float], Optional[float]]:
    """Download *url* and return its embedded GPS coordinates.

    Parameters
    ----------
    url : str
        Must start with ``http://`` or ``https://``.
    timeout : int, optional
        Seconds to wait for the HTTP response (default 15).
    """
    if not url.startswith(("http://", "https://")):
        raise ValueError("Input must be an HTTP/HTTPS image URL – local files are not supported.")

    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()

    raw_bytes = resp.content
    suffix = os.path.splitext(url.split("?")[0])[-1].lower() or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(raw_bytes)
        tmp_path = tmp.name
    try:
        return _extract_from_file(tmp_path)
    finally:
        os.remove(tmp_path)


# Backward‑compat alias:
extract_exif_lat_lng_url = extract_exif_lat_lng

__all__ = [
    "extract_exif_lat_lng",
    "extract_exif_lat_lng_url",
]
