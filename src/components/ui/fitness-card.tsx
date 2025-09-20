import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const fitnessCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-border",
        gradient: "bg-gradient-card border-white/10",
        glass: "glass",
        workout: "border-primary/20 hover:border-primary/40 hover:shadow-primary animate-hover",
        food: "border-success/20 hover:border-success/40 hover:shadow-success animate-hover",
        progress: "border-secondary/20 hover:border-secondary/40 hover:shadow-secondary animate-hover",
        interactive: "cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface FitnessCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fitnessCardVariants> {}

const FitnessCard = React.forwardRef<HTMLDivElement, FitnessCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(fitnessCardVariants({ variant, size, className }))}
      {...props}
    />
  )
)
FitnessCard.displayName = "FitnessCard"

const FitnessCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
))
FitnessCardHeader.displayName = "FitnessCardHeader"

const FitnessCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
FitnessCardTitle.displayName = "FitnessCardTitle"

const FitnessCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FitnessCardDescription.displayName = "FitnessCardDescription"

const FitnessCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
FitnessCardContent.displayName = "FitnessCardContent"

const FitnessCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
FitnessCardFooter.displayName = "FitnessCardFooter"

export {
  FitnessCard,
  FitnessCardHeader,
  FitnessCardFooter,
  FitnessCardTitle,
  FitnessCardDescription,
  FitnessCardContent,
  fitnessCardVariants
}