import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "lucide-react"

export function CommunityHeroCard() {
  return (
    <Card className="bg-[#111113] border-gray-800">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Trophy className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <CardTitle>Community Hero</CardTitle>
          <p className="text-sm text-gray-400">Level 3</p>
        </div>
        <span className="ml-auto font-bold text-blue-400">95 pts</span>
      </CardHeader>
      <CardContent>
        <Progress value={55} className="h-2 mb-2" />
        <p className="text-sm text-gray-400 text-center">Progress to next level: 55%</p>
        <div className="mt-4 text-center bg-gray-800/50 p-3 rounded-lg">
          <p className="font-semibold">
            <span className="text-yellow-400">15 pts</span> to next scratch card!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
