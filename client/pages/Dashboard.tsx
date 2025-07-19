import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Map } from "@/components/Map";
import { LiveFeed } from "@/components/LiveFeed";
import { Event } from "@shared/types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Share,
  Flag,
  Eye,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { streamEvents } from "@/services/grpcClient";

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [showEventDialog, setShowEventDialog] = useState(false);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  // Replace mock/event polling with grpc streaming
  useEffect(() => {
    const grpcStream = streamEvents(
      (event: Event & { timestamp?: string | number }) => {
        // Optionally, filter duplicate events or update state as required
        setEvents((prev) => [
          ...prev,
          {
            id: event.id,
            title: event.title,
            description: event.description,
            category: event.category as Event["category"],
            severity: event.severity as Event["severity"],
            status: event.status as Event["status"],
            source: (event as any).source ?? "unknown", // fallback if source is missing
            location: (event as any).location ?? { address: "", lat: 0, lng: 0 },
            timestamp: typeof event.timestamp === "string" ? event.timestamp : new Date().toISOString(),
            verificationCount: (event as any).verificationCount ?? 0,
            isVerified: (event as any).isVerified ?? false,
            aiAnalysis: (event as any).aiAnalysis,
            imageUrl: (event as any).imageUrl,
          } as Event,
        ]);
      },
      (err) => {
        console.error("Error in grpc stream:", err);
      }
    );

    // If your stream supports cancellation:
    return () => {
      // If grpcStream is not void, add cancellation logic here.
      // Currently, streamEvents returns void, so nothing to clean up.
    };
  }, []);

  // You can derive stats based on the dynamic events
  const stats = {
    active: events.filter((e) => e.status === "active").length,
    critical: events.filter((e) => e.severity === "critical").length,
    investigating: events.filter((e) => e.status === "investigating").length,
    verified: events.filter((e) => e.isVerified).length,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      {/* Stats bar */}
      <div className="border-b bg-card">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">
                  Live - Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">Active:</span>
                <Badge variant="secondary">{stats.active}</Badge>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">Critical:</span>
                <Badge className="bg-emergency text-emergency-foreground">
                  {stats.critical}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground">
                  Investigating:
                </span>
                <Badge className="bg-warning text-warning-foreground">
                  {stats.investigating}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="h-full p-4">
              <Map
                events={events}
                onEventSelect={handleEventSelect}
                selectedEvent={selectedEvent}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={30} minSize={25}>
            <LiveFeed
              events={events}
              onEventSelect={handleEventSelect}
              selectedEvent={selectedEvent}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Event details dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-lg font-semibold pr-8">
                {selectedEvent?.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEventDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-6">
              {/* Header badges */}
              <div className="flex items-center space-x-2">
                <Badge className={cn(getCategoryColor(selectedEvent.category))}>
                  {selectedEvent.category}
                </Badge>
                <Badge
                  variant={
                    selectedEvent.severity === "critical"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {selectedEvent.severity.toUpperCase()}
                </Badge>
                {selectedEvent.isVerified && (
                  <Badge className="bg-success text-success-foreground">
                    Verified
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Image if available */}
              {selectedEvent.imageUrl && (
                <div>
                  <h3 className="font-medium mb-2">Evidence</h3>
                  <img
                    src={selectedEvent.imageUrl}
                    alt="Event evidence"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Reported</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selectedEvent.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedEvent.location.address || "Unknown location"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Verifications</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedEvent.verificationCount} reports
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {selectedEvent.status}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* AI Analysis */}
              {selectedEvent.aiAnalysis && (
                <div>
                  <h3 className="font-medium mb-2">AI Analysis</h3>
                  <Card className="p-4 bg-muted/50">
                    <p className="text-sm mb-3">
                      {selectedEvent.aiAnalysis.summary}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Confidence:</strong>{" "}
                      {Math.round(selectedEvent.aiAnalysis.confidence * 100)}%
                    </div>
                    {selectedEvent.aiAnalysis.suggestedActions && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1">
                          Suggested Actions:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {selectedEvent.aiAnalysis.suggestedActions.map(
                            (action, index) => (
                              <li key={index}>• {action}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const getCategoryColor = (category: string) => {
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
