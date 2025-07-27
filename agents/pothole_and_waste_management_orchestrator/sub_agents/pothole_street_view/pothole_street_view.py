#!/usr/bin/env python3
"""
street_view_agent.py — geotag‑only, GCS‑persistent (no temp files)
-----------------------------------------------------------------
Same behaviour as before *but* the upload now streams the JPEG directly from
memory to Google Cloud Storage — no temporary file on disk. This is slightly
faster and avoids `/tmp` churn.
"""

from __future__ import annotations

import os
import uuid
from io import BytesIO
from typing import List

import requests
from google.cloud import storage
from PIL import Image
from streetview import get_panorama_meta, search_panoramas

# ── constants ──────────────────────────────────────────────────────────────
_DEFAULT_TARGET_YEAR = "2025"
_IMAGE_SIZE = "640x640"
_FIELD_OF_VIEW = 90
_PITCH = 0

# ── helpers ────────────────────────────────────────────────────────────────

def _fetch_street_view_static(api_key: str, pano_id: str, heading: float, *,
                              size: str = _IMAGE_SIZE,
                              fov: int = _FIELD_OF_VIEW,
                              pitch: int = _PITCH) -> Image.Image:
    url = (
        "https://maps.googleapis.com/maps/api/streetview"
        f"?size={size}&pano={pano_id}&heading={heading}&fov={fov}&pitch={pitch}&key={api_key}"
    )
    resp = requests.get(url)
    resp.raise_for_status()
    return Image.open(BytesIO(resp.content))


def _upload_to_gcs(bucket: storage.Bucket, image: Image.Image, remote_path: str) -> str:
    """Upload *image* to *bucket* at *remote_path* directly from memory."""
    blob = bucket.blob(remote_path)

    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    buffer.seek(0)

    blob.upload_from_file(buffer, content_type="image/jpeg")
    return f"https://storage.googleapis.com/{bucket.name}/{remote_path}"


# ── public API ─────────────────────────────────────────────────────────────

def collect_street_view_images(*,
                               lat: float,
                               lng: float,
                               samples: int = 8,
                               api_key: str | None = None,
                               gcs_bucket: str | None = None,
                               target_year: str = _DEFAULT_TARGET_YEAR) -> List[str]:
    """Capture *samples* Street View images around (*lat*, *lng*) and persist them."""
    api_key = api_key or os.getenv("GOOGLE_MAPS_API_KEY")
    bucket_name = gcs_bucket or os.getenv("GCS_BUCKET_NAME")
    if not api_key:
        raise RuntimeError("GOOGLE_MAPS_API_KEY env var (or api_key param) is missing.")
    if not bucket_name:
        raise RuntimeError("GCS_BUCKET_NAME env var (or gcs_bucket param) is missing.")

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    panoramas = search_panoramas(lat=lat, lon=lng)
    pano_meta = next(
        (
            get_panorama_meta(p.pano_id, api_key=api_key)
            for p in panoramas
            if get_panorama_meta(p.pano_id, api_key=api_key).date.startswith(target_year)
        ),
        None,
    )
    if not pano_meta:
        raise RuntimeError(f"No {target_year} panorama found at {lat},{lng}")

    urls: List[str] = []
    for heading in (i * (360 / samples) for i in range(samples)):
        img = _fetch_street_view_static(api_key, pano_meta.pano_id, heading)
        unique_id = uuid.uuid4().hex
        remote_filename = (
            f"street_view/{target_year}/sv_{unique_id}_{lat:.5f}_{lng:.5f}_{int(heading):03d}.jpg"
        )
        urls.append(_upload_to_gcs(bucket, img, remote_filename))

    return urls


__all__ = ["collect_street_view_images"]
