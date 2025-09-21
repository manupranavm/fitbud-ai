import React from "react"
import { Header } from "./header"

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}

export { AppLayout }