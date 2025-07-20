"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Trash2 } from "lucide-react"

const subscriptions = [
  {
    title: "Work Commute Alerts",
    location: "Koramangala to Whitefield (5km)",
    time: "7 AM - 10 PM",
    tags: ["traffic", "civic", "critical", "high"],
    active: true,
  },
  {
    title: "Emergency Alerts - Citywide",
    location: "All areas (50km)",
    time: "24/7",
    tags: ["emergency", "critical"],
    active: true,
  },
]

export function ActiveSubscriptions() {
  return (
    <Card className="bg-[#111113] border-gray-800">
      <CardHeader>
        <CardTitle>Active Subscriptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptions.map((sub, index) => (
          <div key={index} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-lg">{sub.title}</h4>
              <Switch defaultChecked={sub.active} />
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {sub.location}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {sub.time}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {sub.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="capitalize bg-gray-700 text-gray-300">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 bg-transparent border-gray-600 hover:bg-gray-700">
                Edit
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 hover:bg-red-900/50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
