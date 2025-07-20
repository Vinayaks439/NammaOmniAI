import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RewardsCard() {
  return (
    <Card className="bg-[#111113] border-gray-800">
      <CardHeader>
        <CardTitle>Available Rewards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-400 text-black">
          <span className="font-bold">Reward Card</span>
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-black shadow-md">
            Scratch Now
          </Button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-400 text-black">
          <span className="font-bold">Reward Card</span>
          <Button size="sm" variant="secondary" className="bg-white/20 hover:bg-white/30 text-black shadow-md">
            Scratch Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
