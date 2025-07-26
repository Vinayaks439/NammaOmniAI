# exif_latlong_extractor.py
# Utility to extract GPS latitude and longitude from image EXIF metadata

from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def _get_if_exist(data, key):
    return data.get(key)


def _convert_to_degrees(value):
    # Convert the GPS coordinates stored in the EXIF to degrees in float format
    d = value[0][0] / value[0][1]
    m = value[1][0] / value[1][1]
    s = value[2][0] / value[2][1]
    return d + (m / 60.0) + (s / 3600.0)


def extract_exif_lat_lng(image_path: str):
    """
    Reads an image file and extracts latitude and longitude from its EXIF data.
    Returns a tuple (lat, lng) or (None, None) if not available.
    """
    try:
        img = Image.open(image_path)
        exif_data = img._getexif() or {}
    except Exception as e:
        raise RuntimeError(f"Failed to read EXIF from {image_path}: {e}")

    gps_info = {}
    for tag, val in exif_data.items():
        decoded = TAGS.get(tag, tag)
        if decoded == "GPSInfo":
            for t in val:
                sub_decoded = GPSTAGS.get(t, t)
                gps_info[sub_decoded] = val[t]

    # Extract latitude and longitude
    lat = None
    lng = None
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

# Example usage:
# lat, lng = extract_exif_lat_lng("user_image.jpg")
# if lat and lng:
#     print(f"Image contains GPS at {lat}, {lng}")

