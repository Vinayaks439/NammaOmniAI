"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "../ui/skeleton";

interface GeofenceProps {
  center: { lat: number, lng: number };
  areas: string[];
  setCenter: (center: { lat: number, lng: number }) => void;
  setAreas: (areas: string[]) => void;
}

export default function Geofence({ center, areas, setCenter, setAreas}: GeofenceProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [radius, setRadius] = useState(5000)
  const [error, setError] = useState<string | null>(null)
  const rectRef = useRef<any>(null)
  const geocoderRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  // Helper functions
  function metersToLat(m: number) { return m / 111320 }
  function metersToLng(m: number, lat: number) { return m / (111320 * Math.cos(lat * Math.PI/180)) }

  // Load Google Maps JS API
  useEffect(() => {
    const loadMap = async () => {
      if (!(window as any).google) {
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`
        script.async = true
        if (document.body) {
          document.body.appendChild(script)
        }
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            setCenter({ lat: position.coords.latitude, lng: position.coords.longitude })
          })
        }
        // Google Maps will call `initMap` once the script is loaded
        (window as any).initMap = initMap
      } else {
        // Script already loaded – initialise immediately
        initMap()
      }
    }
    loadMap()

    return () => {
      // Clean up the global callback on unmount
      (window as any).initMap = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center])

  // Expose initMap globally for Google callback
  function initMap() {
    const map = new (window as any).google.maps.Map(mapRef.current, {
      center, zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
    })
    const trafficLayer = new (window as any).google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    mapInstanceRef.current = map
    geocoderRef.current = new (window as any).google.maps.Geocoder()
    // Draggable, editable square
    const dLat = metersToLat(radius), dLng = metersToLng(radius, center.lat)
    const rect = new (window as any).google.maps.Rectangle({
      map, draggable: true, editable: true,
      bounds: {
        north: center.lat + dLat,
        south: center.lat - dLat,
        east:  center.lng + dLng,
        west:  center.lng - dLng
      },
      fillColor: '#FF0000', fillOpacity: 0.2,
      strokeColor: '#FF0000', strokeWeight: 2
    })
    rectRef.current = rect
    // Automatically fetch areas once the rectangle & map are ready
    fetchAreas()
  }

  // Update rectangle when radius changes
  useEffect(() => {
    if (!rectRef.current || !mapInstanceRef.current) return
    const rect = rectRef.current
    const map = mapInstanceRef.current
    const bounds = rect.getBounds()
    const c = bounds.getCenter()
    const dLat = metersToLat(radius), dLng = metersToLng(radius, c.lat())
    rect.setBounds({
      north: c.lat() + dLat,
      south: c.lat() - dLat,
      east:  c.lng() + dLng,
      west:  c.lng() - dLng
    })
    // Optionally, fit map to rectangle
    // map.fitBounds(rect.getBounds())
    // eslint-disable-next-line
  }, [radius])

  // Promisified reverse-geocode at a point
  function geocodePt(latlng: {lat: number, lng: number}) {
    return new Promise<any[]>((resolve, reject) => {
      geocoderRef.current.geocode({ location: latlng }, (results: any, status: string) => {
        if (status === 'OK') resolve(results)
        else if (status === 'ZERO_RESULTS') resolve([])
        else reject(status)
      })
    })
  }

  // Fetch areas in rectangle
  async function fetchAreas() {
    if (!rectRef.current) return
    setError(null)
    setAreas([])
    try {
      const bounds = rectRef.current.getBounds()
      const sw = bounds.getSouthWest().toJSON()
      const ne = bounds.getNorthEast().toJSON()
      const rows = 5, cols = 5
      const latStep = (ne.lat - sw.lat)/(rows-1)
      const lngStep = (ne.lng - sw.lng)/(cols-1)
      const names = new Set<string>(), promises = []
      for (let i=0; i<rows; i++) {
        for (let j=0; j<cols; j++) {
          const lat = sw.lat + latStep*i
          const lng = sw.lng + lngStep*j
          promises.push(
            geocodePt({lat,lng})
              .then(results => {
                results.forEach((r: any) => {
                  r.address_components.forEach((ac: any) => {
                    if (ac.types.includes('locality') || ac.types.includes('sublocality')) {
                      names.add(ac.long_name)
                    }
                  })
                })
              })
          )
        }
      }
      await Promise.all(promises)
      setAreas(Array.from(names))
      if (!names.size) setError('No areas found in this box')
    } catch (err: any) {
      setError('Geocoder error: ' + err)
    }
  }

  return (
    <div className="relative w-full h-[600px]">
      <div ref={mapRef} className="w-full h-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white p-4 shadow-lg z-10 rounded flex items-center gap-4">
        <label className="flex items-center gap-2 text-black">
          Radius (km):
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={Number(radius)/1000}
            onChange={e => setRadius(Number(e.target.value) * 1000)}
          />
          <span>{Number(radius)/1000}</span>
        </label>
      </div>
    </div>
  )
} 