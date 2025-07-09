import { Event, EventCategory } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function MapSimple({ events, onEventSelect, selectedEvent }: MapProps) {
  return (
    <div className="relative h-full w-full bg-muted/20 rounded-lg overflow-hidden">
      {/* Map background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
        <div className="absolute inset-0 opacity-10 bg-grid bg-repeat" />
      </div>

      {/* Map title */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-card/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
          <h3 className="font-semibold text-sm">
            Namma Omni AI Interactive Map
          </h3>
          <p className="text-xs text-muted-foreground">
            Real-time event tracking
          </p>
        </div>
      </div>

      {/* Event markers overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {events.map((event, index) => {
          // Calculate pseudo-random positions for demo
          const x = 20 + ((index * 123 + event.id.length * 456) % 60);
          const y = 20 + ((index * 789 + event.title.length * 234) % 60);

          return (
            <div
              key={event.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
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
                      {event.location.address || "Location"}
                    </div>
                  </div>

                  {event.severity === "critical" && (
                    <div className="flex items-center text-xs text-emergency mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Critical Priority
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

      {/* Status indicator */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground">Live</span>
        </div>
      </div>
    </div>
  );
}
