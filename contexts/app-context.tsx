"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type AppContextType = {
  isAmbulanceMode: boolean
  setIsAmbulanceMode: (isAmbulanceMode: boolean) => void
  isVerifiedAmbulance: boolean
  setIsVerifiedAmbulance: (isVerified: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAmbulanceMode, setIsAmbulanceMode] = useState(false)
  const [isVerifiedAmbulance, setIsVerifiedAmbulance] = useState(false)

  return (
    <AppContext.Provider value={{ isAmbulanceMode, setIsAmbulanceMode, isVerifiedAmbulance, setIsVerifiedAmbulance }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
