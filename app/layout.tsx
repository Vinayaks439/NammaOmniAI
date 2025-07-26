import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AppProvider } from "@/contexts/app-context"
import { FirebaseInitializer } from "@/components/firebase-initializer"

    
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Namma Omni AI - Smart City Dashboard",
  description: "A living pulse of the city, powered by Google AI and Firebase.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#09090B] text-white`}>
        <AppProvider>{children}</AppProvider>
        <Toaster />
        <FirebaseInitializer />
      </body>
    </html>
  )
}
