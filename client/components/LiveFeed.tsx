import { Event, EventCategory } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface LiveFeedProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
  selectedEvent?: Event;
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

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "text-emergency";
    case "high":
      return "text-warning";
    case "medium":
      return "text-civic";
    case "low":
      return "text-success";
    default:
      return "text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "resolved":
      return <CheckCircle className="w-4 h-4 text-success" />;
    case "investigating":
      return <Eye className="w-4 h-4 text-warning" />;
    case "active":
      return <AlertTriangle className="w-4 h-4 text-emergency" />;
    default:
      return null;
  }
};

export function LiveFeed({
  events,
  onEventSelect,
  selectedEvent,
}: LiveFeedProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (categoryFilter !== "all" && event.category !== categoryFilter) {
        return false;
      }
      if (severityFilter !== "all" && event.severity !== severityFilter) {
        return false;
      }
      return true;
    });
  }, [events, categoryFilter, severityFilter]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      // Sort by timestamp (newest first)
      const timeSort =
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (timeSort !== 0) return timeSort;

      // Then by severity
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (
        (severityOrder[b.severity as keyof typeof severityOrder] || 0) -
        (severityOrder[a.severity as keyof typeof severityOrder] || 0)
      );
    });
  }, [filteredEvents]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-lg">Live Feed</h2>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {filteredEvents.length} events
          </Badge>
        </div>
        <Button variant="ghost" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="flex space-x-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="traffic">Traffic</SelectItem>
              <SelectItem value="civic">Civic Issues</SelectItem>
              <SelectItem value="event">Public Events</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No events match your current filters</p>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <Card
                key={event.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  selectedEvent?.id === event.id &&
                    "ring-2 ring-primary shadow-md",
                )}
                onClick={() => onEventSelect(event)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          getCategoryColor(event.category),
                        )}
                      >
                        {event.category}
                      </Badge>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          getSeverityColor(event.severity),
                        )}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(event.status)}
                      <span className="text-xs text-muted-foreground">
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Title and description */}
                  <div>
                    <h3 className="font-medium text-sm mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location.address || "Location"}
                      </div>
                    </div>
                    {event.isVerified && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-success/10 text-success border-success/20"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>

                  {/* AI Analysis */}
                  {event.aiAnalysis && (
                    <div className="bg-muted/50 rounded-md p-2">
                      <p className="text-xs text-muted-foreground">
                        <strong>AI Analysis:</strong> {event.aiAnalysis.summary}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        Confidence:{" "}
                        {Math.round(event.aiAnalysis.confidence * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
