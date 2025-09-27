import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Camera, Users, Utensils, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CameraCircle } from "@/components/ui/camera-circle"
import { useAuth } from "@/hooks/useAuth"

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showScanOptions, setShowScanOptions] = useState(false);

  const handleCameraClick = () => {
    if (user) {
      // If logged in, show scan options
      setShowScanOptions(!showScanOptions);
    } else {
      // If not logged in, go to signup
      navigate('/signup');
    }
  };

  const handleScanFood = () => {
    navigate('/nutrition');
  };

  const handleScanForm = () => {
    navigate('/form-monitor');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ultra-minimal hero section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8">
        {/* Central glowing camera circle */}
        <div className="flex flex-col items-center space-y-8">
          <div className="relative">
            <CameraCircle 
              onClick={handleCameraClick}
              size="xl"
              className="cursor-pointer"
            />
            
            {/* Scan options - only show if user is logged in and clicked */}
            {showScanOptions && (
              <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 flex gap-4 animate-fade-in">
                <Button 
                  onClick={handleScanFood}
                  variant="outline" 
                  size="sm"
                  className="bg-background/95 backdrop-blur-sm"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Scan Food
                </Button>
                <Button 
                  onClick={handleScanForm}
                  variant="outline" 
                  size="sm"
                  className="bg-background/95 backdrop-blur-sm"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Scan Form
                </Button>
              </div>
            )}
          </div>
          
          {/* Minimal guidance text */}
          <p className="text-body text-muted-foreground text-center max-w-xs">
            Tap to Scan
          </p>
        </div>

        {/* Minimal auth links - bottom of screen */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-6">
          {!user ? (
            <>
              <Button variant="link" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button variant="default" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          ) : (
            <Button variant="link" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
        </div>
      </section>

    </div>
  )
}

export default LandingPage