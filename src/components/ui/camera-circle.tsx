import React from "react"
import { Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraCircleProps {
  onClick?: () => void
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24", 
  lg: "w-32 h-32",
  xl: "w-48 h-48"
}

const iconSizes = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12", 
  xl: "w-16 h-16"
}

export const CameraCircle: React.FC<CameraCircleProps> = ({ 
  onClick, 
  className,
  size = "xl"
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-full border-2 border-foreground/20 bg-card/30 backdrop-blur-sm",
        "flex items-center justify-center cursor-pointer",
        "transition-all duration-500 ease-in-out",
        "hover:border-foreground/40 hover:bg-card/50",
        "animate-glow glow-circle",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        sizeClasses[size],
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-foreground/5 to-transparent" />
      
      {/* Camera icon */}
      <Camera 
        className={cn(
          "relative z-10 text-foreground/80 transition-colors duration-300",
          "group-hover:text-foreground",
          iconSizes[size]
        )} 
      />
      
      {/* Pulsing outer ring */}
      <div className="absolute inset-0 rounded-full border border-foreground/10 animate-ping" />
    </button>
  )
}