import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfileCard() {
  return (
    <Card className="bg-[#111113] border-gray-800">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4 border-2 border-cyan-400">
          <AvatarImage src="/placeholder.svg?height=96&width=96" />
          <AvatarFallback>V</AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">Vinayak</CardTitle>
        <p className="text-gray-400">vinayak@example.com</p>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-gray-500">Member since: Jan 2024</p>
      </CardContent>
    </Card>
  )
}
