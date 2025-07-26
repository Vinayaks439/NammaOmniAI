"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppHeader } from "@/components/shared/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, AlertTriangle, TrafficCone, Wrench, PartyPopper, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { AlertConfigurationForm } from "@/components/alerts/alert-configuration-form"

// ───────────────────────── Types ─────────────────────────
type Severity = "All" | "Critical" | "High" | "Medium"
type Category = "Emergency" | "Traffic" | "Civic Issues" | "Public Events"

export interface Alert {
  id?: string
  severity?: Severity | string
  category?: Category | string
  title?: string
  description?: string
  location?: string
  timestamp?: string
  // optional backend fields
  lat?: number
  long?: number
  sentiment?: string
}

// Styling meta (static)
const severityStyles: Record<
  Severity,
  { color: string; iconColor: string; label: string }
> = {
  All: {
    color: "bg-cyan-900/50 border-cyan-500/30",
    iconColor: "text-cyan-400",
    label: "Active Events",
  },
  Critical: {
    color: "bg-red-900/50 border-red-500/30",
    iconColor: "text-red-400",
    label: "Critical",
  },
  High: {
    color: "bg-orange-900/50 border-orange-500/30",
    iconColor: "text-orange-400",
    label: "High Severity",
  },
  Medium: {
    color: "bg-yellow-900/50 border-yellow-500/30",
    iconColor: "text-yellow-400",
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
  counts,
}: {
  selectedSeverity: Severity
  onSelectSeverity: (severity: Severity) => void
  counts: Record<Severity, number>
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {(Object.keys(severityStyles) as Severity[]).map((severity) => {
        const details = severityStyles[severity]
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
              <div className="text-2xl font-bold">{counts[severity]}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

const AlertItem = ({ alert }: { alert: Alert }) => {
  const severity = severityStyles[alert.severity as Severity] ?? severityStyles.All
  const Icon = categoryIcons[alert.category as Category] ?? AlertTriangle
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
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch alerts from Gin backend on mount
  useEffect(() => {
    async function loadAlerts() {
        const req = new Request("http://localhost:8080/api/v1/alerts", {
        method: "GET",
        cache: "no-store",
      })
      const res = await fetch(req)
      console.log("res", res)
      if (res.ok) {
        try {
          const data = await res.json()
          console.log("data", data)
          setAlerts(data as Alert[])
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
    }
    loadAlerts()
  }, [])

  const filteredAlerts =
    selectedSeverity === "All"
      ? alerts
      : alerts.filter((alert) => alert.severity === selectedSeverity)

  // Compute dynamic counts
  const severityCounts: Record<Severity, number> = {
    All: alerts.length,
    Critical: alerts.filter((a) => a.severity === "Critical").length,
    High: alerts.filter((a) => a.severity === "High").length,
    Medium: alerts.filter((a) => a.severity === "Medium").length,
  }

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
            <AlertsStatsBar
              selectedSeverity={selectedSeverity}
              onSelectSeverity={setSelectedSeverity}
              counts={severityCounts}
            />
            <Card className="bg-[#111113] border-gray-800">
              <CardHeader>
                <CardTitle>
                  {selectedSeverity === "All" ? "All Active Alerts" : `${selectedSeverity} Severity Alerts`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-8">Loading…</p>
                ) : filteredAlerts.length > 0 ? (
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
