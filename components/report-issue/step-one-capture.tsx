"use client"

import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StepOneCapture({ onNext }: { onNext: () => void }) {
  return (
    <Card className="w-full max-w-md bg-[#1A1A1C] border-gray-700 text-center">
      <CardHeader>
        <div className="mx-auto bg-gray-800 rounded-full p-4 w-20 h-20 flex items-center justify-center mb-4">
          <Camera className="h-10 w-10 text-blue-400" />
        </div>
        <CardTitle className="text-2xl font-bold">Capture the Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 mb-6">
          Take a photo of the problem you want to report. Our AI will automatically analyze and categorize it.
        </p>
        <Button onClick={onNext} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
          <Camera className="mr-2 h-5 w-5" />
          Open Camera
        </Button>
      </CardContent>
    </Card>
  )
}
