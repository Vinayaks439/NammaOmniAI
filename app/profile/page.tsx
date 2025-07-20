"use client"

import { useState } from "react"
import { AppHeader } from "@/components/shared/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AmbulanceRegistrationFlow } from "@/components/profile/ambulance-registration-flow"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"

const UserInfo = () => (
  <div className="flex flex-col items-center md:items-start md:flex-row gap-6">
    <Avatar className="w-24 h-24 border-2 border-cyan-400">
      <AvatarImage src="/placeholder.svg?height=96&width=96" />
      <AvatarFallback>RK</AvatarFallback>
    </Avatar>
    <div className="flex-grow text-center md:text-left">
      <h2 className="text-3xl font-bold">Rajesh Kumar</h2>
      <p className="text-gray-400">rajesh.kumar@example.com</p>
    </div>
    <Button variant="outline">Edit Profile</Button>
  </div>
)

const PersonalInfoCard = () => (
  <Card className="bg-[#111113] border-gray-800">
    <CardHeader>
      <CardTitle>Personal Information</CardTitle>
      <CardDescription>Manage your personal details and contact information.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" defaultValue="Rajesh Kumar" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" defaultValue="rajesh.kumar@example.com" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" defaultValue="+91 98765 43210" />
      </div>
    </CardContent>
  </Card>
)

const ActivityOverview = () => (
  <Card className="bg-[#111113] border-gray-800">
    <CardHeader>
      <CardTitle>Activity Overview</CardTitle>
      <CardDescription>Your recent activity and contributions.</CardDescription>
    </CardHeader>
    <CardContent className="grid grid-cols-3 gap-4 text-center">
      <div>
        <p className="text-2xl font-bold text-blue-400">23</p>
        <p className="text-sm text-gray-400">Issues Reported</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-green-400">127</p>
        <p className="text-sm text-gray-400">Civic Points</p>
      </div>
      <div>
        <p className="text-2xl font-bold text-yellow-400">Gold</p>
        <p className="text-sm text-gray-400">Current Level</p>
      </div>
    </CardContent>
  </Card>
)

const AmbulanceStatusCard = ({ onStartRegistration }: { onStartRegistration: () => void }) => (
  <Card className="bg-red-900/20 border-red-500/30">
    <CardHeader>
      <CardTitle>Ambulance Service Registration</CardTitle>
      <CardDescription>
        Register as an ambulance service provider to access emergency features and SOS alerts.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="p-4 rounded-lg bg-blue-900/30">
        <h4 className="font-semibold mb-2">What you'll get:</h4>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>Emergency SOS button for traffic alerts</li>
          <li>Priority routing and navigation</li>
          <li>Direct communication with nearby commuters</li>
        </ul>
      </div>
      <div className="p-4 rounded-lg bg-yellow-900/30">
        <h4 className="font-semibold mb-2">Required Documents:</h4>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
          <li>Valid Driving License</li>
          <li>Vehicle Registration Certificate (RC)</li>
          <li>Hospital/Organization Affiliation Certificate</li>
        </ul>
      </div>
      <Button className="w-full bg-red-600 hover:bg-red-700" onClick={onStartRegistration}>
        Start Registration Process
      </Button>
    </CardContent>
  </Card>
)

const VerifiedStatusCard = () => (
  <Card className="bg-green-900/20 border-green-500/30">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <ShieldCheck className="text-green-400" />
        Ambulance Service Status
      </CardTitle>
      <CardDescription>Your ambulance registration is complete and verified.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="p-4 rounded-lg bg-green-500/20 text-center mb-4">
        <h3 className="font-semibold text-green-300">Registration Approved!</h3>
        <p className="text-sm text-gray-300">
          You can now toggle to Ambulance Mode using the switch in your profile menu.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <p className="text-gray-400">License Number</p>
        <p className="font-mono">DL-UTQ0ZDC9</p>
        <p className="text-gray-400">Vehicle Registration</p>
        <p className="font-mono">KA-01-GR88</p>
        <p className="text-gray-400">Hospital Affiliation</p>
        <p>Manipal Hospital</p>
        <p className="text-gray-400">Emergency Features</p>
        <p className="text-green-400 font-semibold">Active & Available</p>
      </div>
    </CardContent>
  </Card>
)

export default function ProfilePage() {
  const { isVerifiedAmbulance, setIsVerifiedAmbulance } = useAppContext()
  const [isRegistering, setIsRegistering] = useState(false)

  const handleRegistrationComplete = () => {
    setIsVerifiedAmbulance(true)
    setIsRegistering(false)
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen flex flex-col bg-[#09090B]">
        <AppHeader activePage="Profile" />
        <main className="flex-grow p-4 md:p-6">
          <AmbulanceRegistrationFlow onBack={() => setIsRegistering(false)} onComplete={handleRegistrationComplete} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      <AppHeader activePage="Profile" />
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <UserInfo />
          <PersonalInfoCard />
          <ActivityOverview />
          {isVerifiedAmbulance ? (
            <VerifiedStatusCard />
          ) : (
            <AmbulanceStatusCard onStartRegistration={() => setIsRegistering(true)} />
          )}
        </div>
      </main>
    </div>
  )
}
