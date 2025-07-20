"use client"

import { useAppContext } from "@/contexts/app-context"
import { Bell, Siren, CircleUserRound, Search, Plus, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppHeader({
  activePage,
}: {
  activePage: string
}) {
  const { isAmbulanceMode, setIsAmbulanceMode, isVerifiedAmbulance } = useAppContext()

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Alerts", href: "/alerts" },
    { name: "My Reports", href: "/my-reports" },
  ]

  const handleSosClick = () => {
    toast({
      title: "SOS Alert Activated!",
      description: "Notifications sent to commuters within a 2km radius.",
      variant: "destructive",
    })
  }

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-[#09090B]/80 backdrop-blur-sm z-50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="url(#grad-logo)" />
            <defs>
              <linearGradient id="grad-logo" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00A9FF" />
                <stop offset="1" stopColor="#00E0C7" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className="text-xl font-bold">Namma Omni AI</h1>
          {isAmbulanceMode && (
            <div className="absolute -top-1 -right-3 bg-red-600 rounded-full h-4 w-4 flex items-center justify-center text-white text-xs">
              +
            </div>
          )}
        </div>
        <nav className="hidden lg:flex items-center gap-6 ml-10">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                activePage === item.name ? "text-white font-semibold" : "text-gray-300"
              } hover:text-white transition-colors`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {isAmbulanceMode && (
          <Button
            variant="destructive"
            className="hidden sm:flex items-center gap-2 rounded-lg"
            onClick={handleSosClick}
          >
            <Siren className="h-5 w-5" />
          </Button>
        )}
        <Search className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
        <div className="relative">
          <Bell className="h-6 w-6 text-gray-300 hover:text-white cursor-pointer" />
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
        <Button asChild className="hidden md:flex bg-blue-600 hover:bg-blue-700">
          <Link href="/report-issue">
            <Plus className="mr-2 h-4 w-4" /> Report Issue
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative cursor-pointer">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="User" />
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
              {isAmbulanceMode && (
                <div className="absolute -top-1 -right-1 bg-red-600 rounded-full h-4 w-4 flex items-center justify-center text-white text-xs border-2 border-[#09090B]">
                  +
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <p>Rajesh Kumar</p>
              <p className="text-xs text-gray-400 font-normal">rajesh.kumar@example.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <div
                className={`flex items-center justify-between ${!isVerifiedAmbulance ? "cursor-not-allowed" : ""}`}
                title={
                  !isVerifiedAmbulance ? "Complete ambulance registration to enable mode" : "Toggle Ambulance Mode"
                }
              >
                <Label
                  htmlFor="ambulance-mode-toggle"
                  className={`flex items-center gap-2 ${!isVerifiedAmbulance ? "text-gray-500" : ""}`}
                >
                  <Siren className="h-4 w-4" />
                  Ambulance Mode
                </Label>
                <Switch
                  id="ambulance-mode-toggle"
                  checked={isAmbulanceMode}
                  onCheckedChange={setIsAmbulanceMode}
                  disabled={!isVerifiedAmbulance}
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <CircleUserRound className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
