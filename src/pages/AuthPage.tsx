import React, { useState } from "react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuthPageProps {
  type: "login" | "signup"
}

const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const { login, signup, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const isLogin = type === "login"
  const title = isLogin ? "Welcome Back" : "Start Your Journey"
  const subtitle = isLogin 
    ? "Sign in to continue your fitness transformation" 
    : "Create your account and begin achieving your goals"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        toast.success("Welcome back!")
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match")
          return
        }
        await signup(formData.name, formData.email, formData.password)
        toast.success("Account created successfully!")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-8">
      <div className="w-full max-w-sm space-y-12">
        {/* Minimal back button */}
        <Button variant="ghost" asChild className="absolute top-8 left-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>

        {/* Ultra-minimal header */}
        <div className="text-center space-y-2">
          <h1 className="text-heading-md">{title}</h1>
          <p className="text-body-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Clean form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-sm font-normal">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="flat-input mt-1"
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm font-normal">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="flat-input mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-normal">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="flat-input pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-normal">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="flat-input mt-1"
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full flat-button" disabled={isLoading}>
            {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </Button>
        </form>

        {/* Switch auth type */}
        <div className="text-center">
          <span className="text-body-sm text-muted-foreground">
            {isLogin ? "New here?" : "Have an account?"}
          </span>{" "}
          <Button variant="link" asChild className="p-0 h-auto font-normal">
            <Link to={isLogin ? "/signup" : "/login"}>
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage