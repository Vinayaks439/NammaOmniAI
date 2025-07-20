import type React from "react"
import { AppHeader } from "@/components/shared/app-header"

export default function ReportIssueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans">
      <AppHeader activePage="Report Issue" />
      <main className="p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  )
}
