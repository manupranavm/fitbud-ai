import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CameraCircle } from "@/components/ui/camera-circle"

const LandingPage: React.FC = () => {
  const handleCameraScan = () => {
    // TODO: Implement camera functionality for scanning food/forms/equipment
    console.log("Opening camera for scanning...")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-12 max-w-2xl animate-fade-in">
            {/* Main Title */}
            <h1 className="text-heading-lg text-foreground">
              Scan. Track. Transform.
            </h1>
            
            {/* Central Illuminating Camera Circle */}
            <div className="flex justify-center">
              <CameraCircle 
                onClick={handleCameraScan}
                size="xl"
                className="mx-auto"
              />
            </div>
            
            {/* Minimal Guidance Text */}
            <p className="text-body text-muted-foreground">
              Tap to Scan
            </p>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="pb-12 flex gap-6">
          <Button asChild variant="secondary" className="animate-button-hover">
            <Link to="/signup">
              Join
            </Link>
          </Button>
          
          <Button asChild variant="ghost" className="animate-button-hover">
            <Link to="/login">
              Sign In
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default LandingPage