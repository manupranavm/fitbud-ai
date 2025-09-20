import React from "react"
import { Link } from "react-router-dom"
import { Play, Zap, Target, Smartphone, Shield, Users } from "lucide-react"
import { FitnessButton } from "@/components/ui/fitness-button"
import { FitnessCard, FitnessCardContent, FitnessCardDescription, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card"
import heroImage from "@/assets/hero-fitness.jpg"

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: "AI Form Analysis",
      description: "Get real-time feedback on your workout form with our advanced AI technology."
    },
    {
      icon: Zap,
      title: "Smart Nutrition",
      description: "Scan your meals and get instant calorie and macro tracking with portion estimation."
    },
    {
      icon: Users,
      title: "Personalized Plans",
      description: "Customized workout and nutrition plans adapted to your goals and fitness level."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-heading-xl text-white mb-6">
              Transform Your Fitness Journey with{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI-Powered
              </span>{" "}
              Precision
            </h1>
            
            <p className="text-body-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Get real-time form feedback, smart nutrition tracking, and personalized workout plans. 
              Whether you're a beginner or a pro, our AI adapts to your needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <FitnessButton asChild variant="hero" size="xl">
                <Link to="/signup">
                  <Play className="w-5 h-5" />
                  Start Your Journey
                </Link>
              </FitnessButton>
              
              <FitnessButton asChild variant="glass" size="xl">
                <Link to="/login">
                  Sign In
                </Link>
              </FitnessButton>
            </div>
            
            <div className="text-white/70 text-sm">
              <span className="inline-flex items-center gap-2">
                <Shield className="w-4 h-4" />
                HIPAA Compliant • Privacy First • 100% Secure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-heading-lg mb-4">
              Everything You Need to{" "}
              <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with proven fitness science 
              to deliver results that matter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <FitnessCard 
                  key={index}
                  variant="gradient" 
                  className="text-center animate-slide-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <FitnessCardHeader>
                    <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <FitnessCardTitle className="text-xl">
                      {feature.title}
                    </FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <FitnessCardDescription className="text-base">
                      {feature.description}
                    </FitnessCardDescription>
                  </FitnessCardContent>
                </FitnessCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-heading-lg text-white mb-6">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-body-lg text-white/90 mb-8">
              Join thousands of users who have already transformed their fitness journey 
              with our AI-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <FitnessButton asChild variant="secondary" size="xl">
                <Link to="/signup">
                  Get Started Free
                </Link>
              </FitnessButton>
              
              <FitnessButton asChild variant="glass" size="xl">
                <Link to="/demo">
                  <Smartphone className="w-5 h-5" />
                  Watch Demo
                </Link>
              </FitnessButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage