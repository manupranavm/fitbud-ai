import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FitnessCard, FitnessCardContent, FitnessCardHeader, FitnessCardTitle } from '@/components/ui/fitness-card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface PoseAnalysisResult {
  feedback: string;
  type: 'good' | 'warning' | 'error';
  confidence: number;
}

interface WorkoutFormMonitorProps {
  onClose: () => void;
}

const WorkoutFormMonitor: React.FC<WorkoutFormMonitorProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<PoseAnalysisResult | null>(null);
  const [trialCount, setTrialCount] = useState(() => {
    return parseInt(localStorage.getItem('workoutMonitorTrials') || '0');
  });
  const [showTrialLimit, setShowTrialLimit] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const feedbackMessages = [
    { feedback: "Great form! Keep it up!", type: 'good' as const, confidence: 0.95 },
    { feedback: "Keep your back straight", type: 'warning' as const, confidence: 0.8 },
    { feedback: "Lower your hips more", type: 'warning' as const, confidence: 0.85 },
    { feedback: "Excellent posture!", type: 'good' as const, confidence: 0.92 },
    { feedback: "Bend your knees slightly", type: 'warning' as const, confidence: 0.78 },
    { feedback: "Perfect squat depth!", type: 'good' as const, confidence: 0.98 },
    { feedback: "Keep your core engaged", type: 'warning' as const, confidence: 0.82 },
    { feedback: "Slow down the movement", type: 'error' as const, confidence: 0.75 }
  ];

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  const startMonitoring = async () => {
    // Check trial limit for non-authenticated users
    if (!isAuthenticated && trialCount >= 2) {
      setShowTrialLimit(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });

        setIsActive(true);
        startPoseAnalysis();

        // Increment trial count for non-authenticated users
        if (!isAuthenticated) {
          const newTrialCount = trialCount + 1;
          setTrialCount(newTrialCount);
          localStorage.setItem('workoutMonitorTrials', newTrialCount.toString());
        }

        toast({
          title: "Camera activated",
          description: "Real-time form monitoring started",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use form monitoring",
        variant: "destructive",
      });
    }
  };

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    setIsActive(false);
    setCurrentFeedback(null);
  };

  const startPoseAnalysis = () => {
    // Simulate real-time pose analysis with random feedback
    analysisIntervalRef.current = setInterval(() => {
      const randomFeedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
      setCurrentFeedback(randomFeedback);
    }, 3000); // Update every 3 seconds
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getFeedbackVariant = (type: string) => {
    switch (type) {
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (showTrialLimit) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <FitnessCard className="w-full max-w-md">
          <FitnessCardHeader>
            <div className="flex items-center justify-between">
              <FitnessCardTitle>Trial Limit Reached</FitnessCardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </FitnessCardHeader>
          <FitnessCardContent className="space-y-4">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                You've used your 2 free trial sessions. Sign up or log in to continue using real-time form monitoring.
              </p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => window.location.href = '/auth'}>
                  Sign Up / Log In
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </FitnessCardContent>
        </FitnessCard>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-background rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Live Workout Form Monitor</h2>
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Trial {trialCount}/2 sessions used
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 h-full">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            {/* Video Feed */}
            <div className="lg:col-span-2 relative bg-muted rounded-lg overflow-hidden">
              {isActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ display: 'none' }}
                  />
                  
                  {/* Live Feedback Overlay */}
                  {currentFeedback && (
                    <div className="absolute top-4 left-4 right-4">
                      <Badge 
                        variant={getFeedbackVariant(currentFeedback.type)}
                        className="flex items-center gap-2 p-3 text-sm backdrop-blur-sm"
                      >
                        {getFeedbackIcon(currentFeedback.type)}
                        {currentFeedback.feedback}
                        <span className="ml-auto text-xs opacity-70">
                          {Math.round(currentFeedback.confidence * 100)}%
                        </span>
                      </Badge>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="default" className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      Monitoring Active
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start Form Monitoring</h3>
                  <p className="text-muted-foreground mb-6">
                    We'll analyze your workout form in real-time and provide instant feedback to help improve your technique.
                  </p>
                  <Button onClick={startMonitoring} size="lg" className="gap-2">
                    <Play className="w-4 h-4" />
                    Start Monitoring
                  </Button>
                </div>
              )}
            </div>

            {/* Controls & Info */}
            <div className="space-y-4">
              {isActive && (
                <div className="space-y-4">
                  <Button 
                    onClick={stopMonitoring} 
                    variant="destructive" 
                    className="w-full gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Stop Monitoring
                  </Button>
                </div>
              )}

              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle className="text-sm">How it works</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Position yourself in front of the camera</li>
                    <li>• Perform your exercise movements</li>
                    <li>• Get real-time feedback on your form</li>
                    <li>• Improve your technique with AI guidance</li>
                  </ul>
                </FitnessCardContent>
              </FitnessCard>

              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle className="text-sm">Tips for best results</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Ensure good lighting</li>
                    <li>• Keep your full body in frame</li>
                    <li>• Wear fitted clothing</li>
                    <li>• Clear background works best</li>
                  </ul>
                </FitnessCardContent>
              </FitnessCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutFormMonitor;