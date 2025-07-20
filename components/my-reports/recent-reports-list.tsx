import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Bot, ImageIcon, CheckSquare } from "lucide-react"

const reports = [
  {
    title: "Large pothole on 12th Main Road",
    category: "CIVIC",
    severity: "LOW",
    aiAssigned: true,
    location: "HSR Layout Sector 1",
    date: "10/28/2024",
    status: "Investigating",
  },
  {
    title: "Traffic signal malfunction",
    category: "TRAFFIC",
    severity: "CRITICAL",
    aiAssigned: true,
    location: "Koramangala 5th Block",
    date: "10/28/2024",
    status: "Resolved",
  },
  {
    title: "Street light not working",
    category: "CIVIC",
    severity: "MEDIUM",
    aiAssigned: false,
    location: "HSR Layout Sector 1",
    date: "10/28/2024",
    status: "Pending",
  },
]

const severityClasses: { [key: string]: string } = {
  LOW: "bg-yellow-500/20 text-yellow-400",
  MEDIUM: "bg-orange-500/20 text-orange-400",
  CRITICAL: "bg-red-500/20 text-red-400",
}

const categoryClasses: { [key: string]: string } = {
  CIVIC: "bg-blue-500/20 text-blue-400",
  TRAFFIC: "bg-purple-500/20 text-purple-400",
}

export function RecentReportsList() {
  return (
    <Card className="bg-[#111113] border-gray-800 h-full">
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-gray-800/50">
              <ImageIcon className="h-8 w-8 text-gray-500 mt-1 flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-semibold">{report.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs mt-1">
                  <span className={`font-bold uppercase px-2 py-0.5 rounded ${categoryClasses[report.category] || ""}`}>
                    {report.category}
                  </span>
                  <span className={`font-bold uppercase px-2 py-0.5 rounded ${severityClasses[report.severity] || ""}`}>
                    {report.severity}
                  </span>
                  {report.aiAssigned && (
                    <span className="flex items-center gap-1 font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                      <Bot className="h-3 w-3" /> AI Assigned
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {report.location} - {report.date}
                </p>
              </div>
              <div className="text-right flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <p className="text-sm font-semibold mb-2">{report.status}</p>
                {report.status !== "Resolved" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 hover:bg-gray-700 w-full sm:w-auto bg-transparent"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" /> Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
