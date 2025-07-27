"use client";

import type React from "react";

import { AppHeader } from "@/components/shared/app-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Filter,
  AlertTriangle,
  Thermometer,
  Clock,
  FileWarning,
  PartyPopper,
  Book,
  TrafficCone,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Geofence from "@/components/dashboard/geofence";
import { useSummaryStream } from "@/hooks/use-summary-stream";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrafficEventsStream } from "@/hooks/use-traffic-events-stream";
import { OutageSummaryEntry, useEnergyEventsStream } from "@/hooks/use-energy-events-stream";
import { CulturalEventsEntry, useCultureEventsStream } from "@/hooks/use-culture-events-stream";
// Type imports
import type {
  TrafficDigestEntry,
} from "@/hooks/use-traffic-events-stream";

// Type import (optional – only needed if you reference the type explicitly)
import type { WeatherSummary } from "@/hooks/use-traffic-events-stream";    

// ────────────────────────────────────────────────────────────────
// Unified feed item shape
// ────────────────────────────────────────────────────────────────
export type FeedItem = {
  id: number;
  category: string;
  location: string;
  title: string;
  summary: string;
  severity: string;
  advice: string;
};

// (InteractiveMap removed – geofence component handles map rendering)

// --- Re-composed components ---

const AiSummaryCard = ({ summary }: { summary: string | null }) => {
  // Loading state – show a placeholder card structure with skeleton lines
  if (!summary) {
    return (
      <Card className="bg-black/20 border-white/10 backdrop-blur-lg h-full animate-pulse">
        <CardHeader className="flex flex-row justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 animate-none" />
            <Skeleton className="h-4 w-32 animate-none" />
          </div>
          <Skeleton className="h-5 w-20 rounded animate-none" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full animate-none" />
          <Skeleton className="h-4 w-5/6 animate-none" />
          <Skeleton className="h-4 w-2/3 animate-none" />
        </CardContent>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full animate-none" />
          <Skeleton className="h-4 w-5/6 animate-none" />
          <Skeleton className="h-4 w-2/3 animate-none" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-white/10 backdrop-blur-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30 h-full">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-2xl">Namma Omni AI Pulse</CardTitle>
          <CardDescription>Your personalized live brief.</CardDescription>
        </div>
        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">
          AI Generated
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
};

// ... existing code ...

// ────────────────────────────────────────────────────────────────
// Quick-stats card (weather, commute, issues)
// ────────────────────────────────────────────────────────────────
const QuickStats = ({
  trafficEvents,
  weatherEvents,
}: {
  trafficEvents: TrafficDigestEntry[];
  weatherEvents: WeatherSummary[];
}) => {
  /* ── Weather ─────────────────────────────── */
  const latestWeather = weatherEvents?.at(-1);
  const temperature = latestWeather?.temperature ?? "24";

  /* ── Commute delay (avg minutes) ─────────── */
  const extracted = trafficEvents
    ?.map((t) => {
      const m = t.delay.match(/(\d+)/); // pull the number part (mins)
      return m ? parseInt(m[1], 10) : null;
    })
    .filter((n): n is number => n !== null);
  const avgDelay =
    extracted && extracted.length > 0
      ? `${Math.round(
          extracted.reduce((a, b) => a + b, 0) / extracted.length,
        )}m`
      : trafficEvents?.[0]?.delay ?? "--";

  /* ── Issues count ────────────────────────── */
  const issuesCount = trafficEvents?.length;

  return (
    <Card className="bg-[#111113] border-gray-800 h-full">
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
        <CardDescription>At-a-glance overview.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {/* Weather */}
        <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
          <Thermometer className="h-6 w-6 mx-auto text-orange-400 mb-2" />
          <p className="text-xl font-bold">{temperature}</p>
          <p className="text-sm text-gray-400">Weather</p>
        </div>

        {/* Commute */}
        <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
          <Clock className="h-6 w-6 mx-auto text-blue-400 mb-2" />
          <p className="text-xl font-bold">{avgDelay}</p>
          <p className="text-sm text-gray-400">Commute</p>
        </div>

        {/* Issues */}
        <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
          <FileWarning className="h-6 w-6 mx-auto text-yellow-400 mb-2" />
          <p className="text-xl font-bold">{issuesCount}</p>
          <p className="text-sm text-gray-400">Issues</p>
        </div>

        {/* Events – still placeholder */}
        <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
          <PartyPopper className="h-6 w-6 mx-auto text-purple-400 mb-2" />
          <p className="text-xl font-bold">—</p>
          <p className="text-sm text-gray-400">Events</p>
        </div>
      </CardContent>
    </Card>
  );
};

// ... existing code ...

// Sample static items (kept for fallback / demo)

const categoryDetails: {
  [key: string]: { icon: React.ElementType; color: string };
} = {
  Traffic: { icon: TrafficCone, color: "bg-indigo-500/20 text-indigo-400" },
  Power: { icon: Wrench, color: "bg-pink-500/20 text-pink-400" },
  Weather: { icon: PartyPopper, color: "bg-purple-500/20 text-purple-400" },
  Cultural: { icon: Book, color: "bg-green-500/20 text-green-400" },
};

const severityDetails: {
  [key: string]: { icon: React.ElementType; color: string };
} = {
  CRITICAL: { icon: PartyPopper, color: "bg-red-500/20 text-red-400" },
  HIGH: { icon: TrafficCone, color: "bg-orange-500/20 text-orange-400" },
  MEDIUM: { icon: Wrench, color: "bg-yellow-500/20 text-yellow-400" },
  LOW: { icon: AlertTriangle, color: "bg-green-500/20 text-green-400" },
};

const LiveFeed = ({
  trafficEvents,
  weatherEvents,
  energyEvents,
  culturalEvents,
  filter,
  setFilter,
}: {
  trafficEvents: TrafficDigestEntry[];
  weatherEvents: WeatherSummary[];
  energyEvents: OutageSummaryEntry[];
  culturalEvents: CulturalEventsEntry[];
  filter: string;
  setFilter: (f: string) => void;
}) => {
  const mappedTraffic: FeedItem[] = trafficEvents.map((t, idx) => ({
    id: Date.now() + idx,
    category: "Traffic",
    location: t.location,
    title: `Delay of ${t.delay} at ${t.location}`,
    summary: t.summary,
    severity: t.severityReason.split(";")[0].trim(),
    advice: t.advice,
  }));

  const mappedWeather: FeedItem[] = weatherEvents.map((w, idx) => ({
    id: Date.now() + trafficEvents.length + idx,
    category: "Weather",
    location: w.location,
    title: `Weather in ${w.location}`,
    summary: w.conditions,
    severity: `${w.precipitation} Precipitation`,
    advice: "",
  }));

  const mappedCultural: FeedItem[] = culturalEvents.map((c, idx) => ({
    id: Date.now() + trafficEvents.length + weatherEvents.length + energyEvents.length + idx,
    category: "Cultural",
    location: c.area,
    title: c.title,
    summary: c.description,
    venue: c.venue,
    price: c.price,
    link: c.link,
    severity: "",
    advice: "",
  }));

  const mappedEnergy: FeedItem[] = energyEvents.map((e, idx) => {
    const summaryLocation =
      e.locations[
        e.locations.findIndex((location) => e.locations.includes(location))
      ];
    return {
      id: Date.now() + trafficEvents.length + weatherEvents.length + energyEvents.length + idx,
      category: "Power",
      location: summaryLocation,
      title: `${e.reason} in ${summaryLocation}`,
      summary: e.summary,
      severity: `${e.severity} Severity`,
      advice: e.advice,
    };
  });

  const items = [...mappedTraffic, ...mappedWeather, ...mappedEnergy, ...mappedCultural];

  const filteredItems =
    filter === "All Categories"
      ? items
      : items.filter((item) => item.category === filter);

  return (
    <Card className="bg-[#111113] border-gray-800 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Feed</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
              <DropdownMenuRadioItem value="All Categories">
                All Categories
              </DropdownMenuRadioItem>
              <DropdownMenuSeparator />
              {Object.keys(categoryDetails).map((cat) => (
                <DropdownMenuRadioItem key={cat} value={cat}>
                  {cat}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-2">
        <div className="space-y-4">
          {filteredItems.length === 0 && (
            <p className="text-gray-500 text-center text-xl">
              There doesn't seem to be anything to display at the moment
            </p>
          )}
          {filteredItems.length > 0 &&
            filteredItems.map((item) => {
              const categoryColorDetails = categoryDetails[item.category] ?? {
                icon: MapPin,
                color: "bg-gray-500/20 text-gray-400",
              };
              const severityColorDetails = severityDetails[item.severity] ?? {
                icon: MapPin,
                color: "bg-gray-500/20 text-gray-400",
              };
              return (
                <div key={item.id} className="p-3 rounded-lg bg-gray-800/50">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${categoryColorDetails.color}`}
                        >
                          {item.category}
                        </span>
                        <span
                          className={`text-xs font-bold ml-2 uppercase px-2 py-0.5 rounded ${severityColorDetails.color}`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-sm text-gray-400">{item.summary}</p>
                      {item.advice && (
                        <p className="text-sm text-blue-400">
                          Advice: {item.advice}
                        </p>
                      )}
                    </div>
                    {/* Removed live indicator as it's not directly applicable to the new FeedItem type */}
                  </div>
                  <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                    <span>
                      <MapPin className="inline h-3 w-3 mr-1" /> {item.location}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};

const FeaturedEventCard = () => (
  <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50">
    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <PartyPopper className="h-8 w-8 text-purple-300 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Featured Event</h3>
          <p className="text-sm text-gray-300">
            On other news: Check out{" "}
            <span className="font-bold text-white">Jazz Mataaz</span> event at
            Sarjapur Mall.
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant="outline"
          className="bg-transparent border-white/50 text-white hover:bg-white/10"
        >
          <MapPin className="h-4 w-4 mr-2" /> View Location
        </Button>
        <Button className="bg-white text-black hover:bg-gray-200">
          <Book className="h-4 w-4 mr-2" /> Book Now
        </Button>
      </div>
    </CardContent>
  </Card>
);

const CommuteDelaysCard = () => (
  <Card className="bg-yellow-500/10 border-yellow-500/30">
    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Commute Delays Expected</h3>
          <p className="text-sm text-gray-300">
            Metro construction in HSR Layout (+10 mins)
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        className="bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 flex-shrink-0"
      >
        View Alternate Routes
      </Button>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [center, setCenter] = useState({ lat: 12.971892, lng: 77.641155 });
  const [areas, setAreas] = useState<string[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedFilter, setFeedFilter] = useState("All Categories");

  const summary = useSummaryStream(center.lat, center.lng, areas);
  const energyEvents = useEnergyEventsStream(center);
  const culturalEvents = useCultureEventsStream(areas);
  const [trafficEvents, weatherEvents] = useTrafficEventsStream(center);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      <AppHeader activePage="Dashboard" />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-bold">Live Dashboard</h1>
          <p className="text-gray-400">Real-time pulse of Bengaluru</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* //Change the below classname to "lg:col-span-3" to remove Quick Stats */}
          <div className="lg:col-span-2">
            <AiSummaryCard summary={summary} />
          </div>
          {/* //Comment the below 3 lines to remove Quick Stats */}
          <div className="lg:col-span-1">
            <QuickStats trafficEvents={trafficEvents} weatherEvents={weatherEvents} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[60vh] min-h-[500px] rounded-lg overflow-hidden relative">
            <Geofence
              center={center}
              areas={areas}
              setCenter={setCenter}
              setAreas={setAreas}
            />
          </div>
          <div className="lg:col-span-1 h-[60vh] min-h-[500px]">
            <LiveFeed
              trafficEvents={trafficEvents}
              weatherEvents={weatherEvents}
              energyEvents={energyEvents}
              culturalEvents={culturalEvents}
              filter={feedFilter}
              setFilter={setFeedFilter}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeaturedEventCard />
          <CommuteDelaysCard />
        </div>
      </main>
    </div>
  );
}
