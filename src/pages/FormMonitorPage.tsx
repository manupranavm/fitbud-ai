import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, X, AlertCircle, CheckCircle, Play, Pause, ChevronLeft, Info, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FitnessButton } from '@/components/ui/fitness-button';
import { FitnessCard, FitnessCardContent, FitnessCardHeader, FitnessCardTitle } from '@/components/ui/fitness-card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import gymImage from '@/assets/gym-workout.jpg';

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

const FormMonitorPage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<PoseAnalysisResult | null>(null);
  const [trialCount, setTrialCount] = useState(() => {
    return parseInt(localStorage.getItem('workoutMonitorTrials') || '0');
  });
  const [showTrialLimit, setShowTrialLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    goodFormPercentage: 0,
    feedbackCount: 0
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const feedbackHistoryRef = useRef<PoseAnalysisResult[]>([]);
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Initialize TensorFlow and pose detection model
  const initializePoseDetection = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing TensorFlow.js...');
      
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('TensorFlow.js ready, backend:', tf.getBackend());
      
      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };
      
      console.log('Creating pose detector...');
      detectorRef.current = await poseDetection.createDetector(model, detectorConfig);
      console.log('Pose detector initialized successfully');
      
      toast({
        title: "AI Model Ready",
        description: "Pose detection model loaded successfully",
      });
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      toast({
        title: "Model Load Failed",
        description: "Could not initialize AI pose detection. Camera will still work.",
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
    let result: PoseAnalysisResult;
    if (feedback.length === 0) {
      result = {
        feedback: "Excellent form! Keep it up!",
        type: 'good' as const,
        confidence: Math.min(overallScore, 0.98)
      };
    } else if (overallScore > 0.7) {
      result = {
        feedback: feedback[0],
        type: 'warning' as const,
        confidence: overallScore
      };
    } else {
      result = {
        feedback: feedback[0],
        type: 'error' as const,
        confidence: overallScore
      };
    }

    // Track feedback for session stats
    feedbackHistoryRef.current.push(result);
    updateSessionStats();

    return result;
  };

  const updateSessionStats = () => {
    const history = feedbackHistoryRef.current;
    const goodFeedback = history.filter(f => f.type === 'good').length;
    const goodPercentage = history.length > 0 ? Math.round((goodFeedback / history.length) * 100) : 0;
    
    const duration = sessionStartRef.current 
      ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
      : 0;

    setSessionStats({
      duration,
      goodFormPercentage: goodPercentage,
      feedbackCount: history.length
    });
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
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        console.log('Setting video srcObject');
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Reset session tracking
        sessionStartRef.current = Date.now();
        feedbackHistoryRef.current = [];
        setSessionStats({ duration: 0, goodFormPercentage: 0, feedbackCount: 0 });
        
        const playVideo = async () => {
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log('Video is now playing');
              setIsActive(true);
              
              setTimeout(() => {
                if (detectorRef.current) {
                  console.log('Starting pose analysis');
                  startPoseAnalysis();
                }
              }, 1000);
              
            } catch (playError) {
              console.error('Error playing video:', playError);
            }
          }
        };
        
        videoRef.current.addEventListener('loadedmetadata', playVideo);
        videoRef.current.addEventListener('canplay', playVideo);
      }

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
    sessionStartRef.current = null;
  };

  const startPoseAnalysis = async () => {
    if (!detectorRef.current || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyzeFrame = async () => {
      if (!detectorRef.current || !videoRef.current || !isActive) {
        console.log('Analysis stopped - missing requirements');
        return;
      }

      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        
        if (poses.length > 0) {
          const pose = poses[0];
          const feedback = analyzePose(pose.keypoints);
          
          if (feedback) {
            setCurrentFeedback(feedback);
          }

          // Draw pose keypoints on canvas
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx && videoRef.current) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              // Draw keypoints
              pose.keypoints.forEach((keypoint) => {
                if (keypoint.score && keypoint.score > 0.3) {
                  ctx.beginPath();
                  ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI);
                  ctx.fillStyle = '#00ff00';
                  ctx.fill();
                  ctx.strokeStyle = '#ffffff';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
              });
            }
          }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showTrialLimit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <FitnessCard className="w-full max-w-md">
          <FitnessCardHeader>
            <div className="flex items-center justify-between">
              <FitnessCardTitle>Trial Limit Reached</FitnessCardTitle>
              <FitnessButton asChild variant="ghost" size="icon">
                <Link to="/dashboard">
                  <X className="w-4 h-4" />
                </Link>
              </FitnessButton>
            </div>
          </FitnessCardHeader>
          <FitnessCardContent className="space-y-4">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                You've used your 2 free trial sessions. Sign up or log in to continue using real-time form monitoring.
              </p>
              <div className="space-y-2">
                <FitnessButton asChild className="w-full">
                  <Link to="/login">
                    Sign Up / Log In
                  </Link>
                </FitnessButton>
                <FitnessButton asChild variant="outline" className="w-full">
                  <Link to="/dashboard">
                    Back to Dashboard
                  </Link>
                </FitnessButton>
              </div>
            </div>
          </FitnessCardContent>
        </FitnessCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative mb-8 rounded-xl overflow-hidden animate-fade-in">
        <div 
          className="h-48 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${gymImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-overlay" />
          <div className="relative z-10 p-6 flex items-center h-full">
            <div className="flex items-center gap-4 text-white">
              <FitnessButton asChild variant="outline" size="icon" className="text-white border-white hover:bg-white/20">
                <Link to="/dashboard">
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </FitnessButton>
              <div>
                <h1 className="text-heading-lg mb-2">Live Workout Form Monitor</h1>
                <p className="text-body opacity-90">
                  AI-powered real-time pose analysis and form correction
                </p>
                {!isAuthenticated && (
                  <p className="text-sm opacity-75 mt-2">
                    Trial {trialCount}/2 sessions used
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-8">
        {!isActive && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Position yourself in front of the camera with your full body visible. Our AI will analyze your workout form and provide real-time feedback.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Feed - Main Area */}
          <div className="lg:col-span-2 space-y-6">
            <FitnessCard className="overflow-hidden">
              <div className="relative bg-muted rounded-lg overflow-hidden min-h-[500px]">
                {isActive ? (
                  <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ 
                        transform: 'scaleX(-1)',
                        display: 'block',
                        backgroundColor: '#000'
                      }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ 
                        transform: 'scaleX(-1)',
                        zIndex: 10,
                        opacity: 0.8
                      }}
                    />
                    
                    {/* Live Feedback Overlay */}
                    {currentFeedback && (
                      <div className="absolute top-4 left-4 right-4 z-20">
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
                    <div className="absolute bottom-4 left-4 z-20">
                      <Badge variant="default" className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        Monitoring Active
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">AI Workout Form Monitor</h3>
                    <p className="text-muted-foreground mb-6 max-w-lg">
                      Our AI will analyze your workout form in real-time using advanced pose detection to provide instant feedback and help improve your technique.
                    </p>
                    {isLoading ? (
                      <FitnessButton disabled size="lg" className="gap-2">
                        Loading AI Model...
                      </FitnessButton>
                    ) : (
                      <FitnessButton onClick={startMonitoring} size="lg" className="gap-2">
                        <Play className="w-4 h-4" />
                        Start AI Monitoring
                      </FitnessButton>
                    )}
                  </div>
                )}
              </div>
            </FitnessCard>
          </div>

          {/* Controls & Stats - Sidebar */}
          <div className="space-y-6">
            {/* Session Stats */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Session Stats
                </FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatTime(sessionStats.duration)}</div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{sessionStats.goodFormPercentage}%</div>
                    <div className="text-sm text-muted-foreground">Good Form</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{sessionStats.feedbackCount}</div>
                  <div className="text-sm text-muted-foreground">Feedback Points</div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Controls */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Controls
                </FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent className="space-y-4">
                {isActive ? (
                  <FitnessButton onClick={stopMonitoring} variant="destructive" className="w-full gap-2">
                    <Pause className="w-4 h-4" />
                    Stop Monitoring
                  </FitnessButton>
                ) : (
                  <FitnessButton 
                    onClick={startMonitoring} 
                    disabled={isLoading}
                    className="w-full gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isLoading ? 'Loading...' : 'Start Monitoring'}
                  </FitnessButton>
                )}
                
                <FitnessButton asChild variant="outline" className="w-full">
                  <Link to="/workout">
                    Start Workout
                  </Link>
                </FitnessButton>
              </FitnessCardContent>
            </FitnessCard>

            {/* Tips */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Tips for Best Results</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Ensure your full body is visible in the camera</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Stand 3-4 feet away from the camera</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Wear fitted clothing for better pose detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Ensure good lighting in the room</span>
                  </li>
                </ul>
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FormMonitorPage;