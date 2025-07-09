import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, divIcon } from "leaflet";
import { Event, EventCategory } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface MapProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  selectedEvent?: Event;
  center?: [number, number];
  zoom?: number;
}

const getCategoryColor = (category: EventCategory) => {
  switch (category) {
    case "traffic":
      return "bg-traffic text-traffic-foreground";
    case "civic":
      return "bg-civic text-civic-foreground";
    case "event":
      return "bg-event text-event-foreground";
    case "emergency":
      return "bg-emergency text-emergency-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return "⚠️";
    case "high":
      return "🔴";
    case "medium":
      return "🟡";
    case "low":
      return "🟢";
    default:
      return "📍";
  }
};

const createCustomIcon = (event: Event) => {
  const color = getCategoryColor(event.category);
  const icon = getSeverityIcon(event.severity);

  return divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${color.replace("text-", "text-").replace("bg-", "bg-")}">
        <span class="text-sm">${icon}</span>
        ${event.severity === "critical" ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>' : ""}
      </div>
    `,
    className: "custom-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export function Map({
  events,
  onEventSelect,
  selectedEvent,
  center = [12.9716, 77.5946],
  zoom = 11,
}: MapProps) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={createCustomIcon(event)}
            eventHandlers={{
              click: () => onEventSelect(event),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[250px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{event.title}</h3>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", getCategoryColor(event.category))}
                  >
                    {event.category}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location.address || "Location"}
                  </div>
                </div>

                {event.severity === "critical" && (
                  <div className="flex items-center text-xs text-emergency mb-2">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Critical Priority
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onEventSelect(event)}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-xs mb-2">Event Types</h4>
        <div className="space-y-1">
          {[
            { category: "traffic" as EventCategory, label: "Traffic" },
            { category: "civic" as EventCategory, label: "Civic Issues" },
            { category: "event" as EventCategory, label: "Public Events" },
            { category: "emergency" as EventCategory, label: "Emergency" },
          ].map(({ category, label }) => (
            <div key={category} className="flex items-center text-xs">
              <div
                className={cn(
                  "w-3 h-3 rounded-full mr-2",
                  getCategoryColor(category),
                )}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
