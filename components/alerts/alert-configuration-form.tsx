"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus } from "lucide-react"

export function AlertConfigurationForm() {
  return (
    <Card className="bg-[#111113] border-gray-800">
      <CardHeader>
        <CardTitle>Alert Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 text-gray-300">Severity Levels</h3>
          <RadioGroup defaultValue="high-critical" className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="critical" id="r1" />
              <Label htmlFor="r1">Critical only</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high-critical" id="r2" />
              <Label htmlFor="r2">High & Critical</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="r3" />
              <Label htmlFor="r3">All alerts</Label>
            </div>
          </RadioGroup>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-gray-300">Categories</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-traffic" defaultChecked />
              <Label htmlFor="cat-traffic">Traffic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-civic" defaultChecked />
              <Label htmlFor="cat-civic">Civic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-emergency" defaultChecked />
              <Label htmlFor="cat-emergency">Emergency</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cat-events" />
              <Label htmlFor="cat-events">Events</Label>
            </div>
          </div>
        </div>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Subscription
        </Button>
      </CardContent>
    </Card>
  )
}
