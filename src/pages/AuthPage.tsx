import gymImage from "@/assets/gym-workout.jpg";
import { FitnessButton } from "@/components/ui/fitness-button";
import { FitnessCard, FitnessCardContent } from "@/components/ui/fitness-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

interface AuthPageProps {
  type: "login" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ type }) => {
  const { login, signup, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isLogin = type === "login";
  const title = isLogin ? "Welcome Back" : "Start Your Journey";
  const subtitle = isLogin
    ? "Sign in to continue your fitness transformation"
    : "Create your account and begin achieving your goals";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }

        try {
          await signup(formData.name, formData.email, formData.password);
          toast.success("Account created successfully!");
          navigate("/onboarding");
        } catch (error) {
          // Check if this is an email confirmation error
          if (
            error instanceof Error &&
            error.message.includes("check your email")
          ) {
            toast.success(
              "Account created! Please check your email to confirm your account."
            );
            navigate("/login");
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Back to Landing */}
          <div className="flex items-center">
            <FitnessButton asChild variant="ghost" size="sm" className="p-0">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </FitnessButton>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-heading-md">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form */}
          <FitnessCard>
            <FitnessCardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10"
                      required
                    />
                    <FitnessButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </FitnessButton>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}

                <FitnessButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Please wait..."
                    : isLogin
                    ? "Sign In"
                    : "Create Account"}
                </FitnessButton>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </span>{" "}
                <Link
                  to={isLogin ? "/signup" : "/login"}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Link>
              </div>
            </FitnessCardContent>
          </FitnessCard>

          {/* Privacy Notice */}
          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${gymImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-overlay" />
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="text-center text-white">
            <h2 className="text-heading-lg mb-4">
              Your Fitness Journey Starts Here
            </h2>
            <p className="text-body-lg opacity-90">
              Join thousands who have transformed their lives with AI-powered
              fitness guidance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
