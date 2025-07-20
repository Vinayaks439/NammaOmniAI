"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, MapPin, ArrowRight, Award } from "lucide-react"

export default function StepFiveSummary({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="w-full max-w-2xl text-center">
      <div className="mx-auto bg-green-500/20 rounded-full p-4 w-24 h-24 flex items-center justify-center mb-6 border-2 border-green-500">
        <CheckCircle className="h-16 w-16 text-green-400" />
      </div>
      <h2 className="text-3xl font-bold mb-2">Ready to Submit</h2>
      <p className="text-gray-400 mb-8">Your report is ready! This will help improve the city for everyone.</p>

      <Card className="bg-[#1A1A1C] border-gray-700 text-left">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Report Summary
            <div className="flex gap-2">
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">CIVIC</span>
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">HIGH</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">Large pothole detected on road surface causing potential traffic hazard.</p>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/50">
            <p className="font-semibold text-sm text-blue-300">🤖 AI Assessment: HIGH priority</p>
            <p className="text-sm text-gray-300">Large size and depth of pothole poses safety risk to vehicles.</p>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="h-4 w-4 text-red-500" />
            <span>Koramangala 5th Block, Bengaluru</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 flex items-center justify-center gap-3">
        <Award className="h-6 w-6 text-yellow-400" />
        <p className="font-semibold">
          Reward: You'll earn <span className="text-white">5 credit points</span> for this report!
        </p>
      </div>

      <div className="mt-8">
        <Button
          onClick={onSubmit}
          size="lg"
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
        >
          Submit Report <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
