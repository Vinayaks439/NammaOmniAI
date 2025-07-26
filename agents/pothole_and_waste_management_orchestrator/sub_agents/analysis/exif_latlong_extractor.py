import requests
from io import BytesIO
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def _get_if_exist(data, key):
    return data.get(key)

def _convert_to_degrees(value):
    d = value[0][0] / value[0][1]
    m = value[1][0] / value[1][1]
    s = value[2][0] / value[2][1]
    return d + (m / 60.0) + (s / 3600.0)

def extract_exif_lat_lng(image_path: str):
    """
    Reads an image (from disk or URL) and extracts latitude/longitude from EXIF.
    On HTTP errors or missing EXIF, returns (None, None).
    """
    try:
        if image_path.startswith(("http://", "https://")):
            resp = requests.get(image_path, timeout=5)
            resp.raise_for_status()
            img = Image.open(BytesIO(resp.content))
        else:
            img = Image.open(image_path)

        exif_data = img._getexif() or {}
    except requests.exceptions.HTTPError as he:
        # 404, 500, etc. — log and fall back to no-EXIF
        print(f"[WARN] HTTP error fetching EXIF URL {image_path}: {he}")
        return None, None
    except requests.exceptions.RequestException as re:
        # Network timeout, DNS failure, etc.
        print(f"[WARN] Network error fetching EXIF URL {image_path}: {re}")
        return None, None
    except Exception as e:
        # PIL can also throw on bad image data
        print(f"[WARN] Failed to open image {image_path}: {e}")
        return None, None

    gps_info = {}
    for tag, val in exif_data.items():
        decoded = TAGS.get(tag, tag)
        if decoded == "GPSInfo" and isinstance(val, dict):
            for t, v in val.items():
                sub_decoded = GPSTAGS.get(t, t)
                gps_info[sub_decoded] = v

    gps_lat = _get_if_exist(gps_info, "GPSLatitude")
    gps_lat_ref = _get_if_exist(gps_info, "GPSLatitudeRef")
    gps_lon = _get_if_exist(gps_info, "GPSLongitude")
    gps_lon_ref = _get_if_exist(gps_info, "GPSLongitudeRef")

    if gps_lat and gps_lat_ref and gps_lon and gps_lon_ref:
        lat = _convert_to_degrees(gps_lat)
        if gps_lat_ref != "N": lat = -lat
        lng = _convert_to_degrees(gps_lon)
        if gps_lon_ref != "E": lng = -lng
        return lat, lng

    # No GPS tags found
    return None, None
