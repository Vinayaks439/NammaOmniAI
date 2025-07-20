import { AppHeader } from "@/components/shared/app-header"
import { CommunityHeroCard } from "@/components/my-reports/community-hero-card"
import { StatsGrid } from "@/components/my-reports/stats-grid"
import { RewardsCard } from "@/components/my-reports/rewards-card"
import { RecentReportsList } from "@/components/my-reports/recent-reports-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function MyReportsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090B]">
      <AppHeader activePage="My Reports" />
      <main className="flex-grow p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">My Report Dashboard</h1>
            <p className="text-gray-400">Track your contributions to making the city better.</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/report-issue">
              <Plus className="mr-2 h-4 w-4" /> Report New Issue
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CommunityHeroCard />
            <StatsGrid />
            <RewardsCard />
          </div>
          <div className="lg:col-span-2">
            <RecentReportsList />
          </div>
        </div>
      </main>
    </div>
  )
}
