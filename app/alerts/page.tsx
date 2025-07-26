"use client"

import type React from "react"
import { useState } from "react"
import { AppHeader } from "@/components/shared/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, AlertTriangle, TrafficCone, Wrench, PartyPopper, MapPin } from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { AlertConfigurationForm } from "@/components/alerts/alert-configuration-form"

type Severity = "All" | "Critical" | "High" | "Medium"
type Category = "Emergency" | "Traffic" | "Civic Issues" | "Public Events"

const allAlerts = [
  {
    id: 1,
    severity: "Critical",
    category: "Emergency",
    title: "Fire at Commercial Street",
    description: "Fire reported at commercial building. Emergency services on site.",
    location: "Commercial Street, Shivaji Nagar",
    timestamp: "10/01/2024, 23:00:00",
  },
  {
    id: 2,
    severity: "High",
    category: "Traffic",
    title: "Traffic Congestion on Outer Ring Road",
    description: "Heavy traffic due to metro construction. Expect 30min delays.",
    location: "Outer Ring Road, Electronic City",
    timestamp: "10/01/2024, 18:15:00",
  },
  {
    id: 3,
    severity: "Medium",
    category: "Civic Issues",
    title: "Power Cut Scheduled",
    description: "Planned maintenance from 10 AM to 4 PM.",
    location: "Indiranagar Area",
    timestamp: "10/01/2024, 14:03:00",
  },
  {
    id: 4,
    severity: "High",
    category: "Emergency",
    title: "Gas Leak Reported",
    description: "Gas leak reported in residential area. Evacuation in progress.",
    location: "HSR Layout, Sector 2",
    timestamp: "10/01/2024, 11:30:00",
  },
]

const severityDetails: {
  [key in Severity]: {
    color: string
    iconColor: string
    count: number
    label: string
  }
} = {
  All: {
    color: "bg-cyan-900/50 border-cyan-500/30",
    iconColor: "text-cyan-400",
    count: allAlerts.length,
    label: "Active Events",
  },
  Critical: {
    color: "bg-red-900/50 border-red-500/30",
    iconColor: "text-red-400",
    count: allAlerts.filter((a) => a.severity === "Critical").length,
    label: "Critical",
  },
  High: {
    color: "bg-orange-900/50 border-orange-500/30",
    iconColor: "text-orange-400",
    count: allAlerts.filter((a) => a.severity === "High").length,
    label: "High Severity",
  },
  Medium: {
    color: "bg-yellow-900/50 border-yellow-500/30",
    iconColor: "text-yellow-400",
    count: allAlerts.filter((a) => a.severity === "Medium").length,
    label: "Medium Severity",
  },
}

const categoryIcons: { [key in Category]: React.ElementType } = {
  Emergency: AlertTriangle,
  Traffic: TrafficCone,
  "Civic Issues": Wrench,
  "Public Events": PartyPopper,
}

const AlertsStatsBar = ({
  selectedSeverity,
  onSelectSeverity,
}: {
  selectedSeverity: Severity
  onSelectSeverity: (severity: Severity) => void
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {(Object.keys(severityDetails) as Severity[]).map((severity) => {
        const details = severityDetails[severity]
        return (
          <Card
            key={severity}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105",
              details.color,
              selectedSeverity === severity ? "ring-2 ring-offset-2 ring-offset-black" : "",
              selectedSeverity === "All" && severity === "All"
                ? "ring-cyan-400"
                : selectedSeverity === severity
                  ? details.iconColor.replace("text-", "ring-")
                  : "",
            )}
            onClick={() => onSelectSeverity(severity)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn("text-sm font-medium", details.iconColor.replace("text-", "text-") + "200")}>
                {details.label}
              </CardTitle>
              <Zap className={cn("h-4 w-4", details.iconColor)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{details.count}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

const AlertItem = ({ alert }: { alert: (typeof allAlerts)[0] }) => {
  const severity = severityDetails[alert.severity as Severity]
  const Icon = categoryIcons[alert.category as Category]
  return (
    <div className={cn("p-4 rounded-lg border", severity.color.replace("bg-", "border-"))}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={cn("h-5 w-5", severity.iconColor)} />
        <h3 className="font-bold text-lg">{alert.title}</h3>
        <span
          className={cn(
            "ml-auto text-xs font-bold uppercase px-2 py-0.5 rounded",
            severity.color.replace("border-", "bg-"),
            severity.iconColor,
          )}
        >
          {alert.severity}
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-2 ml-8">{alert.description}</p>
      <p className="text-xs text-gray-500 ml-8 flex items-center gap-2">
        <MapPin className="h-3 w-3" /> {alert.location} ● {alert.timestamp}
      </p>
    </div>
  )
}

export default function AlertsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>("All")
  const [isConfiguring, setIsConfiguring] = useState(false)

  const filteredAlerts =
    selectedSeverity === "All" ? allAlerts : allAlerts.filter((alert) => alert.severity === selectedSeverity)

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      <AppHeader activePage="Alerts" />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Alerts</h1>
            <p className="text-gray-400">Manage your alert subscriptions.</p>
          </div>
          <Button variant="outline" onClick={() => setIsConfiguring(!isConfiguring)} className="bg-transparent">
            <Settings className="mr-2 h-4 w-4" />
            {isConfiguring ? "Hide Configuration" : "Configure Alerts"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {isConfiguring && (
            <div className="md:col-span-1">
              <AlertConfigurationForm />
            </div>
          )}
          <div className={isConfiguring ? "md:col-span-2" : "md:col-span-3"}>
            <AlertsStatsBar selectedSeverity={selectedSeverity} onSelectSeverity={setSelectedSeverity} />
            <Card className="bg-[#111113] border-gray-800">
              <CardHeader>
                <CardTitle>
                  {selectedSeverity === "All" ? "All Active Alerts" : `${selectedSeverity} Severity Alerts`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} />)
                ) : (
                  <p className="text-center text-gray-500 py-8">No alerts match the selected severity.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
