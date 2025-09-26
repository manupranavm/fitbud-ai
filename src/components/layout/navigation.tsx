import React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Dumbbell, 
  Camera, 
  UtensilsCrossed, 
  TrendingUp, 
  Settings,
  User,
  Menu,
  X
} from "lucide-react"
import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard } from "@/components/ui/fitness-card"

const navigationItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/workout", icon: Dumbbell, label: "Workout" },
  { href: "/gym-equipment", icon: Settings, label: "Gym Equipment" },
  { href: "/form-monitor", icon: Camera, label: "Form Monitor" },
  { href: "/nutrition", icon: UtensilsCrossed, label: "Nutrition" },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/settings", icon: User, label: "Settings" },
]

interface NavigationProps {
  className?: string
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden lg:flex items-center space-x-1", className)}>
        {navigationItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                active 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden">
        <FitnessButton
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-foreground"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </FitnessButton>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-50 mt-2 mx-4">
          <FitnessCard variant="glass" className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors w-full",
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </FitnessCard>
        </div>
      )}
    </>
  )
}

export { Navigation }