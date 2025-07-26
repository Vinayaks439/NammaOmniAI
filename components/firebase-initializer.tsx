'use client'

import { useEffect } from "react"
import { initAnalytics } from "../lib/firebase"

export function FirebaseInitializer() {
  useEffect(() => {
    initAnalytics()
  }, [])

  return null
} 