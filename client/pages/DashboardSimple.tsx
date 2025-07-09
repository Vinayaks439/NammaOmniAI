import { Header } from "@/components/Header";
import { LiveFeed } from "@/components/LiveFeed";
import { GeofenceMap } from "@/components/GeofenceMap";
import { GeminiPulse } from "@/components/GeminiPulse";
import { Event } from "@shared/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, BarChart3, Map, Activity } from "lucide-react";

// Mock events for testing
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Heavy Traffic on Outer Ring Road",
    description:
      "Slow moving traffic reported between Silk Board and Electronic City.",
    category: "traffic",
    severity: "high",
    source: "user_report",
    location: {
      lat: 12.9279,
      lng: 77.6271,
      address: "Outer Ring Road, Electronic City",
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    verificationCount: 15,
    isVerified: true,
    status: "active",
  },
];

export default function DashboardSimple() {
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();
  const [events] = useState<Event[]>(mockEvents);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  // Handle scroll to hide/show scroll hint
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setShowScrollHint(scrollTop < 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToOlderView = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: window.innerHeight - 200,
        behavior: "smooth",
      });
    }
  };

  const stats = {
    active: events.filter((e) => e.status === "active").length,
    critical: events.filter((e) => e.severity === "critical").length,
    high: events.filter((e) => e.severity === "high").length,
    medium: events.filter((e) => e.severity === "medium").length,
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {/* Namma Omni AI Pulse Section */}
        <section className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-background to-muted/20">
          <div className="container py-8">
            <div className="max-w-4xl mx-auto">
              <GeminiPulse />

              {/* Scroll indicator */}
              {showScrollHint && (
                <div className="text-center mt-8 animate-bounce">
                  <button
                    onClick={scrollToOlderView}
                    className="inline-flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="text-sm mb-2">
                      Scroll for detailed dashboard
                    </span>
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Older Dashboard View */}
        <section className="min-h-screen bg-background">
          {/* Stats bar */}
          <div className="border-b bg-card sticky top-0 z-10">
            <div className="container py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Live Dashboard</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium">
                    Live - Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    /* Filter active events */
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Active Events</p>
                      <p className="text-2xl font-bold text-primary">
                        {stats.active}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    /* Filter critical events */
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-emergency" />
                    <div>
                      <p className="text-sm font-medium">Critical</p>
                      <p className="text-2xl font-bold text-emergency">
                        {stats.critical}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    /* Filter high severity */
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-orange-500" />
                    <div>
                      <p className="text-sm font-medium">High Severity</p>
                      <p className="text-2xl font-bold text-orange-500">
                        {stats.high}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    /* Filter medium severity */
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-warning" />
                    <div>
                      <p className="text-sm font-medium">Medium Severity</p>
                      <p className="text-2xl font-bold text-warning">
                        {stats.medium}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Map and Feed */}
          <div className="h-[calc(100vh-200px)]">
            <div className="flex h-full">
              <div className="flex-1 p-4">
                <div className="h-full flex flex-col">
                  <div className="flex items-center space-x-2 mb-4">
                    <Map className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Interactive City Map</h3>
                  </div>
                  <div className="flex-1">
                    <GeofenceMap
                      events={events}
                      onEventSelect={handleEventSelect}
                      selectedEvent={selectedEvent}
                      userLocation={{ lat: 12.9716, lng: 77.5946 }}
                      onGeofenceChange={(radius) =>
                        console.log("Geofence radius:", radius)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="w-96 border-l bg-card/50">
                <LiveFeed
                  events={events}
                  onEventSelect={handleEventSelect}
                  selectedEvent={selectedEvent}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
