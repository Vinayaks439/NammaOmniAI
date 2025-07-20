"use client"

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-defaulticon-compatibility"

import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle, useMapEvents } from "react-leaflet"
import type { LatLngExpression, DivIcon, LatLngBoundsExpression, LatLng } from "leaflet"
import * as L from "leaflet"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Square, CircleIcon as CircleIconLucide, Layers, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

const position: LatLngExpression = [12.9716, 77.5946] // Bengaluru center

const createAmbulanceIcon = () => {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M3 13v-2h3V8h2v3h3v2H8v3H6v-3H3z"/><path d="M18 3H6a3 3 0 0 0-3 3v5h2a4 4 0 1 1 8 0h3l3.5 3.5V6a3 3 0 0 0-3-3Zm-3 7H6V6h12v4Z"/>
  </svg>`
  const html = `
  <div style="
    display:flex;
    align-items:center;
    justify-content:center;
    width:24px;
    height:24px;
    border-radius:50%;
    background:#dc2626;
    border:2px solid #ffffff;
    box-shadow:0 0 4px rgba(0,0,0,.4);
  ">
    ${svg}
  </div>`

  return new L.divIcon({
    html,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  }) as DivIcon
}

type Geofence =
  | { id: number; type: "circle"; center: LatLng; radius: number }
  | { id: number; type: "square"; bounds: LatLngBoundsExpression }

const GeofenceEditor = ({
  geofence,
  onUpdate,
  onSave,
  onDelete,
  onCancel,
}: {
  geofence: Geofence
  onUpdate: (geofence: Geofence) => void
  onSave: () => void
  onDelete: (id: number) => void
  onCancel: () => void
}) => {
  const handleRadiusChange = (value: number[]) => {
    if (geofence.type === "circle") {
      onUpdate({ ...geofence, radius: value[0] })
    }
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-[#111113]/80 p-3 rounded-lg border border-gray-700 backdrop-blur-sm flex flex-col gap-3 w-64">
      <p className="text-sm text-center text-gray-200 font-semibold">Edit Geofence</p>
      {geofence.type === "circle" && (
        <div className="space-y-2">
          <Label htmlFor="radius-slider" className="text-xs">
            Radius: {(geofence.radius / 1000).toFixed(2)} km
          </Label>
          <Slider
            id="radius-slider"
            min={100}
            max={5000}
            step={100}
            value={[geofence.radius]}
            onValueChange={handleRadiusChange}
          />
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <Button size="icon" variant="destructive" onClick={() => onDelete(geofence.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} className="flex-1 bg-green-600 hover:bg-green-700">
          Save
        </Button>
      </div>
    </div>
  )
}

const GeofenceCreator = ({ onGeofenceCreated }: { onGeofenceCreated: (geofence: Geofence) => void }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [drawMode, setDrawMode] = useState<"circle" | "square" | null>(null)

  useMapEvents({
    click(e) {
      if (!drawMode) return
      const newGeofence =
        drawMode === "circle"
          ? { id: Date.now(), type: "circle" as const, center: e.latlng, radius: 500 }
          : {
              id: Date.now(),
              type: "square" as const,
              bounds: [
                [e.latlng.lat - 0.01, e.latlng.lng - 0.01],
                [e.latlng.lat + 0.01, e.latlng.lng + 0.01],
              ] as LatLngBoundsExpression,
            }
      onGeofenceCreated(newGeofence)
      setDrawMode(null)
      setIsPanelOpen(false)
    },
  })

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2">
      <Button size="icon" variant="secondary" onClick={() => setIsPanelOpen(!isPanelOpen)}>
        <Layers className="h-5 w-5" />
      </Button>
      {isPanelOpen && (
        <div className="bg-[#111113]/80 p-3 rounded-lg border border-gray-700 backdrop-blur-sm flex flex-col gap-3 w-64">
          <p className="text-sm text-center text-gray-200 font-semibold">Create Geofence</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={drawMode === "circle" ? "default" : "outline"}
              onClick={() => setDrawMode("circle")}
              className="flex-1"
            >
              <CircleIconLucide className="h-4 w-4 mr-2" /> Circle
            </Button>
            <Button
              size="sm"
              variant={drawMode === "square" ? "default" : "outline"}
              onClick={() => setDrawMode("square")}
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" /> Square
            </Button>
          </div>
          {drawMode && <p className="text-xs text-center text-blue-400 animate-pulse">Click on the map to place</p>}
        </div>
      )}
    </div>
  )
}

const GeofenceLayer = ({
  geofence,
  isSelected,
  onSelect,
}: {
  geofence: Geofence
  isSelected: boolean
  onSelect: (geofence: Geofence) => void
}) => {
  const eventHandlers = useMemo(
    () => ({
      click() {
        onSelect(geofence)
      },
    }),
    [geofence, onSelect],
  )

  const pathOptions = {
    color: isSelected ? "yellow" : "cyan",
    fillColor: isSelected ? "yellow" : "cyan",
    fillOpacity: 0.3,
    weight: isSelected ? 3 : 1.5,
  }

  if (geofence.type === "circle") {
    return (
      <Circle
        center={geofence.center}
        radius={geofence.radius}
        pathOptions={pathOptions}
        eventHandlers={eventHandlers}
      />
    )
  }
  return <Rectangle bounds={geofence.bounds} pathOptions={pathOptions} eventHandlers={eventHandlers} />
}

export default function InteractiveMap({ onGeofenceCreated }: { onGeofenceCreated: (geofence: Geofence) => void }) {
  const ambulanceIcon = createAmbulanceIcon()
  const [geofences, setGeofences] = useState<Geofence[]>([
    { id: 1, type: "circle", center: L.latLng(12.9352, 77.6245), radius: 1000 },
  ])
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null)

  const handleGeofenceCreate = (newGeofence: Geofence) => {
    setGeofences((prev) => [...prev, newGeofence])
    onGeofenceCreated(newGeofence)
    toast({
      title: "Geofence Created!",
      description: "The live feed has been updated with data for the new area.",
    })
    setEditingGeofence(newGeofence)
  }

  const handleSelectGeofence = (geofence: Geofence) => {
    setEditingGeofence(geofence)
  }

  const handleSaveGeofence = () => {
    if (!editingGeofence) return
    setGeofences((prev) => prev.map((gf) => (gf.id === editingGeofence.id ? editingGeofence : gf)))
    setEditingGeofence(null)
    toast({ title: "Geofence Updated!" })
  }

  const handleDeleteGeofence = (id: number) => {
    setGeofences((prev) => prev.filter((gf) => gf.id !== id))
    setEditingGeofence(null)
    toast({ title: "Geofence Deleted!", variant: "destructive" })
  }

  const handleCancelEdit = () => {
    setEditingGeofence(null)
  }

  return (
    <MapContainer
      center={position}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {editingGeofence ? (
        <GeofenceEditor
          geofence={editingGeofence}
          onUpdate={setEditingGeofence}
          onSave={handleSaveGeofence}
          onDelete={handleDeleteGeofence}
          onCancel={handleCancelEdit}
        />
      ) : (
        <GeofenceCreator onGeofenceCreated={handleGeofenceCreate} />
      )}

      {geofences.map((gf) => {
        const geofenceToRender = editingGeofence && editingGeofence.id === gf.id ? editingGeofence : gf
        return (
          <GeofenceLayer
            key={gf.id}
            geofence={geofenceToRender}
            isSelected={editingGeofence?.id === gf.id}
            onSelect={handleSelectGeofence}
          />
        )
      })}

      <Marker position={[12.9279, 77.6271]} icon={ambulanceIcon}>
        <Popup>Active Ambulance en route. High priority.</Popup>
      </Marker>
      <Marker position={[12.9784, 77.6408]}>
        <Popup>Indiranagar: Power cut scheduled.</Popup>
      </Marker>
    </MapContainer>
  )
}
