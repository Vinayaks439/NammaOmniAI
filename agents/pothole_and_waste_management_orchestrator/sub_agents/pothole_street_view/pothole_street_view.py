# Revised street_view_agent.py using uniform bucket‑level access for public reads
#!/usr/bin/env python3
"""
street_view_agent.py:
Download Street View images for 2025 along a route or around a point,
upload to Google Cloud Storage (GCS) under uniform bucket‑level access,
and print public URLs for downstream analysis.

IMPORTANT: Before running, you must grant **public-read** access at the bucket level:

    gsutil iam ch allUsers:roles/storage.objectViewer gs://<YOUR_BUCKET_NAME>

Uniform bucket‑level access should already be enabled for this bucket.
"""

import os
import sys
import math
import argparse
import googlemaps
import polyline
import requests
from datetime import datetime
from io import BytesIO
from PIL import Image
from googlemaps.exceptions import ApiError
from streetview import search_panoramas, get_panorama_meta
from google.cloud import storage

# Configuration
API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GCS_BUCKET = os.getenv("GCS_BUCKET_NAME")
if not API_KEY:
    print("Error: Set the GOOGLE_MAPS_API_KEY environment variable.")
    sys.exit(1)
if not GCS_BUCKET:
    print("Error: Set the GCS_BUCKET_NAME environment variable.")
    sys.exit(1)

TARGET_YEAR = "2025"
IMAGE_SIZE = "640x640"
FIELD_OF_VIEW = 90
PITCH = 0

# Initialize GCS client once
storage_client = storage.Client()
bucket = storage_client.bucket(GCS_BUCKET)


def fetch_street_view_static(pano_id, heading, size=IMAGE_SIZE, fov=FIELD_OF_VIEW, pitch=PITCH):
    """Fetch a Street View image via the Static API and return a PIL Image."""
    url = (
        "https://maps.googleapis.com/maps/api/streetview"
        f"?size={size}"
        f"&pano={pano_id}"
        f"&heading={heading}"
        f"&fov={fov}"
        f"&pitch={pitch}"
        f"&key={API_KEY}"
    )
    resp = requests.get(url)
    resp.raise_for_status()
    return Image.open(BytesIO(resp.content))


def upload_to_gcs(local_path, remote_path):
    """Upload a file to GCS and return its public URL under uniform access."""
    blob = bucket.blob(remote_path)
    blob.upload_from_filename(local_path)
    return f"https://storage.googleapis.com/{GCS_BUCKET}/{remote_path}"


def main():
    parser = argparse.ArgumentParser(
        description="Download Street View snaps for 2025 and upload to GCS with public URLs."
    )
    parser.add_argument("origin", help="Start address or 'lat,lng'")
    parser.add_argument("destination", nargs="?", help="End address or 'lat,lng' (for route)")
    parser.add_argument("--interval", type=int, default=20, help="Sample every Nth point")
    parser.add_argument("--mode", choices=["route","geotag"], default="route")
    parser.add_argument("--samples", type=int, default=8)
    args = parser.parse_args()

    # Determine sample points (route vs geotag)
    gmaps = googlemaps.Client(key=API_KEY)
    if args.mode == "route" and args.destination:
        routes = gmaps.directions(args.origin, args.destination, mode="driving", departure_time=datetime.now())
        pts = routes[0]["overview_polyline"]["points"]
        points = polyline.decode(pts)
        sampled = points[::args.interval]
    else:
        lat,lng = map(float, args.origin.split(","))
        sampled = [(lat,lng)]

    urls=[]; saved=0
    for idx,(lat,lng) in enumerate(sampled):
        headings = [calculate_bearing((lat,lng), sampled[idx+1])] if idx+1<len(sampled) else [i*(360/args.samples) for i in range(args.samples)]
        panos=search_panoramas(lat=lat,lon=lng)
        chosen=None
        for p in panos:
            try: m=get_panorama_meta(pano_id=p.pano_id,api_key=API_KEY)
            except: continue
            if m.date.startswith(TARGET_YEAR): chosen=m; break
        if not chosen: print(f"No {TARGET_YEAR} pano at {lat},{lng}"); continue
        for h in headings:
            try:
                img=fetch_street_view_static(chosen.pano_id,h)
                fn=f"sv_{TARGET_YEAR}_{saved:03d}_{int(h)}.jpg"
                lp=os.path.join("/tmp",fn); img.save(lp)
                rp=f"street_view/{TARGET_YEAR}/{fn}"
                url=upload_to_gcs(lp,rp); print(f"Public URL: {url}")
                urls.append(url); saved+=1
            except Exception as e:
                print(f"Error pano {chosen.pano_id}@{int(h)}: {e}")
    print("Done. URLs:"); [print(u) for u in urls]

if __name__=="__main__": main()
