import { useState, useRef, useEffect } from "react";
import { Event, EventCategory } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Clock,
  MapPin,
  AlertTriangle,
  Camera,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GeofenceMapProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  selectedEvent?: Event;
  userLocation?: { lat: number; lng: number };
  onGeofenceChange?: (radius: number) => void;
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

// Bangalore landmarks for realistic positioning
const bangaloreAreas = [
  { name: "Koramangala", x: 45, y: 60 },
  { name: "Indiranagar", x: 55, y: 45 },
  { name: "Whitefield", x: 75, y: 35 },
  { name: "HSR Layout", x: 50, y: 70 },
  { name: "Electronic City", x: 40, y: 85 },
  { name: "Malleshwaram", x: 35, y: 25 },
  { name: "Jayanagar", x: 40, y: 55 },
  { name: "BTM Layout", x: 45, y: 65 },
  { name: "Sarjapur", x: 70, y: 75 },
  { name: "Marathahalli", x: 65, y: 40 },
];

export function GeofenceMap({
  events,
  onEventSelect,
  selectedEvent,
  userLocation = { lat: 12.9716, lng: 77.5946 },
  onGeofenceChange,
}: GeofenceMapProps) {
  const [geofenceRadius, setGeofenceRadius] = useState(5);
  const [showGeofenceTools, setShowGeofenceTools] = useState(false);
  const [userPosition] = useState({ x: 48, y: 55 }); // Koramangala area

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setGeofenceRadius(newRadius);
    onGeofenceChange?.(newRadius);
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden border">
      {/* Bangalore Mock Map Background */}
      <div className="absolute inset-0">
        {/* Roads/Streets */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {/* Major roads */}
          <path
            d="M0,50 Q200,45 400,55 Q600,60 800,50"
            stroke="#94a3b8"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M100,0 Q105,200 95,400 Q90,600 100,800"
            stroke="#94a3b8"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M300,0 Q305,200 295,400 Q290,600 300,800"
            stroke="#94a3b8"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M0,200 Q200,195 400,205 Q600,210 800,200"
            stroke="#94a3b8"
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        </svg>

        {/* Area labels */}
        {bangaloreAreas.map((area, index) => (
          <div
            key={index}
            className="absolute text-xs text-slate-600 font-medium"
            style={{
              left: `${area.x}%`,
              top: `${area.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            {area.name}
          </div>
        ))}
      </div>

      {/* User Location with Geofence */}
      <div
        className="absolute z-10"
        style={{
          left: `${userPosition.x}%`,
          top: `${userPosition.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Geofence Circle */}
        <div
          className="absolute border-2 border-primary/40 bg-primary/5 rounded-full pointer-events-none"
          style={{
            width: `${geofenceRadius * 40}px`,
            height: `${geofenceRadius * 40}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* User marker */}
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>

        {/* User label */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/90 rounded px-2 py-1 text-xs font-medium whitespace-nowrap">
          You are here (Koramangala)
        </div>
      </div>

      {/* Event markers */}
      <div className="absolute inset-0 z-20">
        {events.map((event, index) => {
          // Position events around Bangalore areas
          const areaIndex = index % bangaloreAreas.length;
          const area = bangaloreAreas[areaIndex];
          const x = area.x + (Math.random() - 0.5) * 10;
          const y = area.y + (Math.random() - 0.5) * 10;

          // Check if event is within geofence
          const distance = Math.sqrt(
            Math.pow(x - userPosition.x, 2) + Math.pow(y - userPosition.y, 2),
          );
          const isInGeofence = distance <= geofenceRadius * 4;

          return (
            <div
              key={event.id}
              className={cn(
                "absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110",
                !isInGeofence && "opacity-40",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onEventSelect(event)}
            >
              {/* Marker */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg",
                  getCategoryColor(event.category),
                  selectedEvent?.id === event.id && "ring-2 ring-primary",
                )}
              >
                <span className="text-sm">
                  {getSeverityIcon(event.severity)}
                </span>
                {event.severity === "critical" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Hover card */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        getCategoryColor(event.category),
                      )}
                    >
                      {event.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {area.name}
                    </div>
                  </div>

                  {!isInGeofence && (
                    <div className="text-xs text-muted-foreground mt-1 italic">
                      Outside geofence
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-30">
        <Card className="p-3">
          <h3 className="font-semibold text-sm mb-2">Bangalore Live Map</h3>
          <p className="text-xs text-muted-foreground">
            {
              events.filter((_, i) => {
                const areaIndex = i % bangaloreAreas.length;
                const area = bangaloreAreas[areaIndex];
                const x = area.x;
                const y = area.y;
                const distance = Math.sqrt(
                  Math.pow(x - userPosition.x, 2) +
                    Math.pow(y - userPosition.y, 2),
                );
                return distance <= geofenceRadius * 4;
              }).length
            }{" "}
            events in {geofenceRadius}km radius
          </p>
        </Card>
      </div>

      {/* Geofence Tools */}
      <div className="absolute top-4 right-4 z-30">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Geofence</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGeofenceTools(!showGeofenceTools)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {showGeofenceTools && (
            <div className="space-y-3 min-w-[200px]">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Radius</span>
                  <span className="text-xs font-medium">
                    {geofenceRadius} km
                  </span>
                </div>
                <Slider
                  value={[geofenceRadius]}
                  onValueChange={handleRadiusChange}
                  max={20}
                  min={5}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center text-xs text-muted-foreground">
                <Target className="w-3 h-3 mr-1" />
                Monitoring area around you
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-30">
        <Card className="p-3">
          <h4 className="font-semibold text-xs mb-2">Event Types</h4>
          <div className="space-y-1">
            {[
              {
                category: "traffic" as EventCategory,
                label: "Traffic",
                icon: "🚗",
              },
              {
                category: "civic" as EventCategory,
                label: "Civic",
                icon: "🏗️",
              },
              {
                category: "event" as EventCategory,
                label: "Events",
                icon: "🎪",
              },
              {
                category: "emergency" as EventCategory,
                label: "Emergency",
                icon: "🚨",
              },
            ].map(({ category, label, icon }) => (
              <div key={category} className="flex items-center text-xs">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full mr-2",
                    getCategoryColor(category),
                  )}
                />
                <span className="mr-1">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Status */}
      <div className="absolute bottom-4 right-4 z-30">
        <Card className="p-3">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted-foreground">Live Tracking</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
