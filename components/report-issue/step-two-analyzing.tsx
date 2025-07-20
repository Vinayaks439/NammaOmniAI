"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StepTwoAnalyzing({ onAnalysisComplete }: { onAnalysisComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnalysisComplete()
    }, 3000) // Simulate AI analysis time
    return () => clearTimeout(timer)
  }, [onAnalysisComplete])

  return (
    <Card className="w-full max-w-md bg-[#1A1A1C] border-gray-700 text-center">
      <CardHeader>
        <div className="mx-auto bg-gray-800 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
          <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
        </div>
        <CardTitle className="text-2xl font-bold">AI Analyzing...</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">
          Our AI is analyzing the image to detect, categorize, and assess the severity of the issue. Please wait a
          moment.
        </p>
      </CardContent>
    </Card>
  )
}
