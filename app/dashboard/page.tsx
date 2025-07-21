"use client"

import type React from "react"

import { AppHeader } from "@/components/shared/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Geofence from "@/components/dashboard/geofence"
import { useSummaryStream } from "@/hooks/use-summary-stream"

// (InteractiveMap removed – geofence component handles map rendering)

// --- Re-composed components ---

const AiSummaryCard = ({ energyManagmentSummary, trafficUpdateSummary }: { energyManagmentSummary: string | null; trafficUpdateSummary: string | null }) => (
  <Card className="bg-black/20 border-white/10 backdrop-blur-lg bg-gradient-to-br from-blue-900/30 to-purple-900/30 h-full">
    <CardHeader className="flex flex-row justify-between items-start">
      <div>
        <CardTitle className="text-2xl">Namma Omni AI Pulse</CardTitle>
        <CardDescription>Your personalized morning brief.</CardDescription>
      </div>
      <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-cyan-500/20 text-cyan-400">AI Generated</span>
    </CardHeader>
    <CardContent>
      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
        {energyManagmentSummary ||
          "ENergy placeholder Hey Vinayak, good afternoon! ☀️ Your day's shaping up to be a bright and sunny one — expect a pleasant 39°C on average. Your commute looks smooth with an ETA of around 45 minutes 👍, though there's a small hiccup — metro construction in HSR Layout might add about 10 extra minutes."}
      </p>
      <br />
      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
        {trafficUpdateSummary ||
          "Traffic placeholderHey Vinayak, good afternoon! ☀️ Your day's shaping up to be a bright and sunny one — expect a pleasant 39°C on average. Your commute looks smooth with an ETA of around 45 minutes 👍, though there's a small hiccup — metro construction in HSR Layout might add about 10 extra minutes."}
      </p>
    </CardContent>
  </Card>
)

const QuickStats = () => (
  <Card className="bg-[#111113] border-gray-800 h-full">
    <CardHeader>
      <CardTitle>Quick Stats</CardTitle>
      <CardDescription>At-a-glance overview.</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
        <Thermometer className="h-6 w-6 mx-auto text-orange-400 mb-2" />
        <p className="text-xl font-bold">39°C</p>
        <p className="text-sm text-gray-400">Weather</p>
      </div>
      <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
        <Clock className="h-6 w-6 mx-auto text-blue-400 mb-2" />
        <p className="text-xl font-bold">45m</p>
        <p className="text-sm text-gray-400">Commute</p>
      </div>
      <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
        <FileWarning className="h-6 w-6 mx-auto text-yellow-400 mb-2" />
        <p className="text-xl font-bold">1</p>
        <p className="text-sm text-gray-400">Issues</p>
      </div>
      <div className="bg-white/5 border-white/10 p-4 text-center rounded-lg">
        <PartyPopper className="h-6 w-6 mx-auto text-purple-400 mb-2" />
        <p className="text-xl font-bold">1</p>
        <p className="text-sm text-gray-400">Events</p>
      </div>
    </CardContent>
  </Card>
)

const allFeedItems = [
  {
    id: 1,
    category: "Traffic",
    severity: "HIGH",
    title: "Heavy Traffic on Outer Ring Road",
    description: "Slow moving traffic reported between Silk Board and Marathahalli.",
    location: "Outer Ring Road, Bengaluru",
    timestamp: "15:30:30",
    live: true,
  },
  {
    id: 2,
    category: "Civic Issues",
    severity: "MEDIUM",
    title: "Power Cut Scheduled",
    description: "Planned maintenance from 10 AM to 4 PM.",
    location: "Indiranagar Area",
    timestamp: "10/01/2024, 14:03:00",
    live: false,
  },
  {
    id: 3,
    category: "Emergency",
    severity: "CRITICAL",
    title: "Fire Reported at Commercial Building",
    description: "Emergency services dispatched. Avoid the area.",
    location: "Commercial Street",
    timestamp: "15:45:10",
    live: true,
  },
  {
    id: 4,
    category: "Public Events",
    severity: "LOW",
    title: "Charity Marathon Today",
    description: "Road closures on MG Road from 6 AM to 10 AM.",
    location: "MG Road",
    timestamp: "10/02/2024, 06:00:00",
    live: false,
  },
]

const categoryDetails: { [key: string]: { icon: React.ElementType; color: string } } = {
  Traffic: { icon: TrafficCone, color: "bg-orange-500/20 text-orange-400" },
  "Civic Issues": { icon: Wrench, color: "bg-yellow-500/20 text-yellow-400" },
  Emergency: { icon: AlertTriangle, color: "bg-red-500/20 text-red-400" },
  "Public Events": { icon: PartyPopper, color: "bg-purple-500/20 text-purple-400" },
}

const LiveFeed = ({
  items,
  filter,
  setFilter,
}: { items: typeof allFeedItems; filter: string; setFilter: (f: string) => void }) => {
  const filteredItems = filter === "All Categories" ? items : items.filter((item) => item.category === filter)

  return (
    <Card className="bg-[#111113] border-gray-800 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Live Feed</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {filter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
              <DropdownMenuRadioItem value="All Categories">All Categories</DropdownMenuRadioItem>
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
          {filteredItems.map((item) => {
            const details = categoryDetails[item.category]
            return (
              <div key={item.id} className="p-3 rounded-lg bg-gray-800/50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${details.color}`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                  {item.live && <span className="text-xs text-red-500 animate-pulse">LIVE</span>}
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                  <span>
                    <MapPin className="inline h-3 w-3 mr-1" /> {item.location}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

const FeaturedEventCard = () => (
  <Card className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50">
    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <PartyPopper className="h-8 w-8 text-purple-300 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Featured Event</h3>
          <p className="text-sm text-gray-300">
            On other news: Check out <span className="font-bold text-white">Jazz Mataaz</span> event at Sarjapur Mall.
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10">
          <MapPin className="h-4 w-4 mr-2" /> View Location
        </Button>
        <Button className="bg-white text-black hover:bg-gray-200">
          <Book className="h-4 w-4 mr-2" /> Book Now
        </Button>
      </div>
    </CardContent>
  </Card>
)

const CommuteDelaysCard = () => (
  <Card className="bg-yellow-500/10 border-yellow-500/30">
    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold">Commute Delays Expected</h3>
          <p className="text-sm text-gray-300">Metro construction in HSR Layout (+10 mins)</p>
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
)

export default function DashboardPage() {
  const [feedItems, setFeedItems] = useState(allFeedItems)
  const [feedFilter, setFeedFilter] = useState("All Categories")

  // Live AI summary via gRPC stream
  const [energyManagmentSummary, trafficUpdateSummary] = useSummaryStream();

  const handleGeofenceCreated = () => {
    // Simulate reloading feed data
    const shuffled = [...allFeedItems].sort(() => 0.5 - Math.random())
    setFeedItems(shuffled)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      <AppHeader activePage="Dashboard" />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-bold">Live Dashboard</h1>
          <p className="text-gray-400">Real-time pulse of Bengaluru</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AiSummaryCard energyManagmentSummary={energyManagmentSummary} trafficUpdateSummary={trafficUpdateSummary} />
          </div>
          <div className="lg:col-span-1">
            <QuickStats />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[60vh] min-h-[500px] rounded-lg overflow-hidden relative"><Geofence /></div>
          <div className="lg:col-span-1 h-[60vh] min-h-[500px]">
            <LiveFeed items={feedItems} filter={feedFilter} setFilter={setFeedFilter} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeaturedEventCard />
          <CommuteDelaysCard />
        </div>
      </main>
    </div>
  )
}
