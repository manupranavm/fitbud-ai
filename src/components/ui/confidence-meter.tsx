import * as React from "react"
import { cn } from "@/lib/utils"
import { ProgressRing } from "./progress-ring"

interface ConfidenceMeterProps {
  confidence: number // 0-100
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  size = "md",
  showLabel = true,
  className
}) => {
  const sizeConfig = {
    sm: { ring: 80, text: "text-sm" },
    md: { ring: 120, text: "text-lg" },
    lg: { ring: 160, text: "text-xl" }
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "success"
    if (score >= 60) return "primary" 
    if (score >= 40) return "secondary"
    return "destructive"
  }

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Work"
  }

  const color = getConfidenceColor(confidence)
  const label = getConfidenceLabel(confidence)
  const { ring, text } = sizeConfig[size]

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <ProgressRing
        progress={confidence}
        size={ring}
        color={color}
        className="animate-scale-in"
      >
        <div className="text-center">
          <div className={cn("font-bold font-heading", text)}>
            {confidence}%
          </div>
          {showLabel && (
            <div className="text-xs text-muted-foreground">
              {label}
            </div>
          )}
        </div>
      </ProgressRing>
    </div>
  )
}

export { ConfidenceMeter }