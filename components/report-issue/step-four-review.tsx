"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, MapPin, AlertTriangle, TrafficCone, Wrench, Zap } from "lucide-react"

export default function StepFourReview({ onNext }: { onNext: () => void }) {
  return (
    <div className="w-full max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-center">Review AI Analysis</h2>

      <Card className="bg-[#1A1A1C] border-gray-700">
        <CardHeader>
          <CardTitle>AI Analysis Complete</CardTitle>
          <CardDescription className="text-gray-400">94% confidence</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Large pothole detected on road surface causing potential traffic hazard.</p>
          <div className="flex gap-2 mt-2">
            <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">pothole</span>
            <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">road</span>
            <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">asphalt</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-600/20 to-yellow-600/20 border-orange-500">
        <CardHeader>
          <CardTitle>AI Severity Assessment</CardTitle>
          <CardDescription className="text-orange-400">HIGH PRIORITY</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-black/30 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-red-400">Safety Impact</h4>
            <p className="text-xs text-gray-300">High - potential vehicle damage</p>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-orange-400">Urgency Level</h4>
            <p className="text-xs text-gray-300">Requires prompt attention</p>
          </div>
          <div className="bg-black/30 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-yellow-400">Impact Scale</h4>
            <p className="text-xs text-gray-300">200+ daily commuters affected</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold mb-2">Category (AI-suggested)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex-col gap-2 bg-blue-500/10 border-blue-500 text-white">
            <Wrench /> Civic Issues
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 border-gray-700 text-gray-400 bg-transparent">
            <TrafficCone /> Traffic Problems
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 border-gray-700 text-gray-400 bg-transparent">
            <AlertTriangle /> Emergency
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2 border-gray-700 text-gray-400 bg-transparent">
            <Zap /> Public Events
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Description (AI-generated)</h3>
        <div className="p-4 rounded-lg bg-[#1A1A1C] border border-gray-700">
          Large pothole detected on road surface causing potential traffic hazard.
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Auto-detected location</h3>
        <div className="p-4 rounded-lg bg-[#1A1A1C] border border-gray-700 flex items-center gap-2">
          <MapPin className="text-red-500" />
          Koramangala 5th Block, Bengaluru
        </div>
      </div>

      <div className="text-right">
        <Button onClick={onNext} size="lg" className="bg-blue-600 hover:bg-blue-700">
          Continue <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
