import { Event, EventCategory } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertTriangle, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapWithGeofenceProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  selectedEvent?: Event;
  geofenceCenter?: { lat: number; lng: number };
  geofenceRadius?: number; // in kilometers
  highlightedEvent?: Event;
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

export function MapWithGeofence({
  events,
  onEventSelect,
  selectedEvent,
  geofenceCenter,
  geofenceRadius = 5,
  highlightedEvent,
}: MapWithGeofenceProps) {
  return (
    <div className="relative h-full w-full bg-muted/20 rounded-lg overflow-hidden">
      {/* Map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
        <div className="absolute inset-0 opacity-10 bg-grid bg-repeat" />
      </div>

      {/* Geofence Circle */}
      {geofenceCenter && (
        <div
          className="absolute border-2 border-primary/40 bg-primary/5 rounded-full pointer-events-none"
          style={{
            width: `${geofenceRadius * 8}%`,
            height: `${geofenceRadius * 8}%`,
            left: `${50 - geofenceRadius * 4}%`,
            top: `${50 - geofenceRadius * 4}%`,
          }}
        >
          {/* Geofence center marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Map title */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-card/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
          <h3 className="font-semibold text-sm">Namma Omni AI Smart Map</h3>
          <p className="text-xs text-muted-foreground">
            Real-time incident tracking
            {geofenceCenter && (
              <span className="block text-primary">
                📍 {geofenceRadius}km geofence active
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Event markers */}
      <div className="absolute inset-0 overflow-hidden">
        {events.map((event, index) => {
          const x = 20 + ((index * 123 + event.id.length * 456) % 60);
          const y = 20 + ((index * 789 + event.title.length * 234) % 60);

          const isHighlighted = highlightedEvent?.id === event.id;
          const isInGeofence = geofenceCenter
            ? Math.abs(x - 50) <= geofenceRadius * 4 &&
              Math.abs(y - 50) <= geofenceRadius * 4
            : true;

          return (
            <div
              key={event.id}
              className={cn(
                "absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110",
                isHighlighted && "scale-125 z-20",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onEventSelect(event)}
            >
              {/* Pulsing effect for highlighted event */}
              {isHighlighted && (
                <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                  <div className="w-full h-full rounded-full bg-primary/20 animate-ping" />
                  <div className="absolute inset-0 w-full h-full rounded-full bg-primary/10 animate-ping animation-delay-75" />
                </div>
              )}

              {/* Marker */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg",
                  getCategoryColor(event.category),
                  selectedEvent?.id === event.id && "ring-2 ring-primary",
                  isHighlighted && "ring-4 ring-primary/50",
                  !isInGeofence && "opacity-50",
                )}
              >
                <span className="text-sm">
                  {getSeverityIcon(event.severity)}
                </span>
                {event.severity === "critical" && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
                {isHighlighted && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground">★</span>
                  </div>
                )}
              </div>

              {/* Enhanced hover card for highlighted event */}
              <div
                className={cn(
                  "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity pointer-events-none",
                  isHighlighted ? "opacity-100" : "opacity-0 hover:opacity-100",
                )}
              >
                <div className="bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg min-w-[220px]">
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

                  {/* AI Analysis for highlighted event */}
                  {isHighlighted && event.aiAnalysis && (
                    <div className="bg-primary/10 rounded-md p-2 mb-2">
                      <p className="text-xs font-medium text-primary mb-1">
                        🤖 AI Analysis (
                        {Math.round(event.aiAnalysis.confidence * 100)}%)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.aiAnalysis.summary}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
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
                    <div className="flex items-center text-xs text-emergency mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Critical Priority
                    </div>
                  )}

                  {isHighlighted && (
                    <div className="flex items-center text-xs text-primary mt-1">
                      <Camera className="w-3 h-3 mr-1" />
                      Your submitted report
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-xs mb-2">Incident Types</h4>
        <div className="space-y-1">
          {[
            {
              category: "traffic" as EventCategory,
              label: "Traffic",
              icon: "🚗",
            },
            {
              category: "civic" as EventCategory,
              label: "Civic Issues",
              icon: "🏗️",
            },
            {
              category: "event" as EventCategory,
              label: "Public Events",
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

        {geofenceCenter && (
          <div className="mt-3 pt-2 border-t">
            <div className="flex items-center text-xs text-primary">
              <div className="w-3 h-3 rounded-full border border-primary mr-2" />
              <span>5km monitoring zone</span>
            </div>
          </div>
        )}
      </div>

      {/* Live Status */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground">Live Tracking</span>
        </div>
        {highlightedEvent && (
          <div className="text-xs text-primary mt-1">
            📍 Your report is live!
          </div>
        )}
      </div>
    </div>
  );
}
