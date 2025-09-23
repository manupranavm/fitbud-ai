import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FitnessCard, FitnessCardContent, FitnessCardHeader, FitnessCardTitle } from '@/components/ui/fitness-card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface PoseAnalysisResult {
  feedback: string;
  type: 'good' | 'warning' | 'error';
  confidence: number;
}

interface Keypoint {
  x: number;
  y: number;
  score?: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Initialize TensorFlow and pose detection model
  const initializePoseDetection = async () => {
    try {
      setIsLoading(true);
      await tf.ready();
      
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      
      detectorRef.current = await poseDetection.createDetector(model, detectorConfig);
      console.log('Pose detector initialized');
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      toast({
        title: "Initialization failed",
        description: "Could not load AI pose detection model",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePose = (keypoints: Keypoint[]) => {
    if (!keypoints || keypoints.length < 17) return null;

    const feedback = [];
    let overallScore = 1.0;

    // Key body landmarks (MoveNet format)
    const nose = keypoints[0];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftElbow = keypoints[7];
    const rightElbow = keypoints[8];
    const leftWrist = keypoints[9];
    const rightWrist = keypoints[10];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];
    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];

    // Check for common form issues
    
    // 1. Shoulder alignment
    if (leftShoulder && rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      if (shoulderDiff > 30) {
        feedback.push("Keep your shoulders level");
        overallScore -= 0.2;
      }
    }

    // 2. Knee alignment during squats
    if (leftKnee && rightKnee && leftAnkle && rightAnkle) {
      const kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
      const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
      
      if (kneeWidth < ankleWidth * 0.8) {
        feedback.push("Keep your knees aligned over your feet");
        overallScore -= 0.15;
      }
    }

    // 3. Back posture
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
      const hipCenter = (leftHip.x + rightHip.x) / 2;
      const postureDiff = Math.abs(shoulderCenter - hipCenter);
      
      if (postureDiff > 40) {
        feedback.push("Keep your back straight");
        overallScore -= 0.25;
      }
    }

    // 4. Squat depth
    if (leftHip && rightHip && leftKnee && rightKnee) {
      const hipHeight = (leftHip.y + rightHip.y) / 2;
      const kneeHeight = (leftKnee.y + rightKnee.y) / 2;
      
      if (hipHeight < kneeHeight - 20) {
        feedback.push("Good squat depth!");
      } else if (hipHeight > kneeHeight + 30) {
        feedback.push("Try to squat deeper");
        overallScore -= 0.1;
      }
    }

    // Determine feedback type and message
    if (feedback.length === 0) {
      return {
        feedback: "Excellent form! Keep it up!",
        type: 'good' as const,
        confidence: Math.min(overallScore, 0.98)
      };
    } else if (overallScore > 0.7) {
      return {
        feedback: feedback[0],
        type: 'warning' as const,
        confidence: overallScore
      };
    } else {
      return {
        feedback: feedback[0],
        type: 'error' as const,
        confidence: overallScore
      };
    }
  };

  useEffect(() => {
    initializePoseDetection();
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
        await startPoseAnalysis();

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

    if (analysisFrameRef.current) {
      cancelAnimationFrame(analysisFrameRef.current);
      analysisFrameRef.current = null;
    }

    setIsActive(false);
    setCurrentFeedback(null);
  };

  const startPoseAnalysis = async () => {
    if (!detectorRef.current || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzeFrame = async () => {
      if (!detectorRef.current || !videoRef.current || !isActive) return;

      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        
        if (poses.length > 0) {
          const pose = poses[0];
          const feedback = analyzePose(pose.keypoints);
          
          if (feedback) {
            setCurrentFeedback(feedback);
          }

          // Draw pose keypoints on canvas for visual feedback
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw keypoints
          pose.keypoints.forEach(keypoint => {
            if (keypoint.score && keypoint.score > 0.3) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
              ctx.fill();
            }
          });
        }
      } catch (error) {
        console.error('Error analyzing pose:', error);
      }

      if (isActive) {
        analysisFrameRef.current = requestAnimationFrame(analyzeFrame);
      }
    };

    analyzeFrame();
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
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ opacity: 0.7 }}
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
                  <h3 className="text-lg font-semibold mb-2">AI Workout Form Monitor</h3>
                  <p className="text-muted-foreground mb-6">
                    Our AI will analyze your workout form in real-time using advanced pose detection to provide instant feedback and help improve your technique.
                  </p>
                  {isLoading ? (
                    <Button disabled size="lg" className="gap-2">
                      Loading AI Model...
                    </Button>
                  ) : (
                    <Button onClick={startMonitoring} size="lg" className="gap-2">
                      <Play className="w-4 h-4" />
                      Start AI Monitoring
                    </Button>
                  )}
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