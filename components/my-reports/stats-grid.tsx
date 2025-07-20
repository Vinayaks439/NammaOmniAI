import { Card, CardContent } from "@/components/ui/card"
import { FileText, Check, Gift, Star } from "lucide-react"

const stats = [
  { label: "Total Reports", value: 12, icon: FileText },
  { label: "Resolved", value: 8, icon: Check },
  { label: "Scratch Cards", value: 3, icon: Gift },
  { label: "Level", value: 3, icon: Star },
]

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-[#111113] border-gray-800 text-center p-4">
          <CardContent className="p-0 flex flex-col items-center justify-center">
            <stat.icon className="h-6 w-6 text-gray-400 mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
