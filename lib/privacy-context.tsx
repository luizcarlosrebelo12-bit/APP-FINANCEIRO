"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface PrivacyContextType {
  hideValues: boolean
  togglePrivacy: () => void
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined)

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hideValues, setHideValues] = useState(false)

  const togglePrivacy = () => setHideValues((prev) => !prev)

  return (
    <PrivacyContext.Provider value={{ hideValues, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (!context) {
    throw new Error("usePrivacy precisa estar dentro de um PrivacyProvider")
  }
  return context
}