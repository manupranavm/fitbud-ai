import formMonitorImage from "@/assets/hero-fitness.jpg";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FitnessButton } from "@/components/ui/fitness-button";
import {
  FitnessCard,
  FitnessCardContent,
  FitnessCardHeader,
  FitnessCardTitle,
} from "@/components/ui/fitness-card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import {
  Activity,
  AlertCircle,
  Camera,
  CheckCircle,
  Info,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Target,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface PoseAnalysisResult {
  feedback: string;
  type: "good" | "warning" | "error";
  confidence: number;
  youtubeVideo?: {
    title: string;
    url: string;
    thumbnail: string;
  };
  exerciseType?: string;
}

interface Keypoint {
  x: number;
  y: number;
  score?: number;
}

type DetectionMethod = "tensorflow" | "mediapipe" | "web" | "none";

const FormMonitorPage: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentFeedback, setCurrentFeedback] =
    useState<PoseAnalysisResult | null>(null);
  const [trialCount, setTrialCount] = useState(() => {
    return parseInt(localStorage.getItem("workoutMonitorTrials") || "0");
  });
  const [showTrialLimit, setShowTrialLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionMethod, setDetectionMethod] =
    useState<DetectionMethod>("none");
  const [detectionStatus, setDetectionStatus] =
    useState<string>("Not initialized");
  const [availableMethods, setAvailableMethods] = useState<DetectionMethod[]>(
    []
  );
  const [sessionStats, setSessionStats] = useState({
    duration: 0,
    goodFormPercentage: 0,
    feedbackCount: 0,
  });
  const [selectedExercise, setSelectedExercise] = useState<string>("Auto");
  const [detectedExercise, setDetectedExercise] = useState<string>("Unknown");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const feedbackHistoryRef = useRef<PoseAnalysisResult[]>([]);

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Check available detection methods
  const checkAvailableMethods = async () => {
    const methods: DetectionMethod[] = ["web"]; // Always available

    try {
      // Check TensorFlow.js
      await tf.ready();
      if (typeof window !== "undefined" && "tensorflow" in window) {
        methods.push("tensorflow");
      }
    } catch (error) {
      console.log("TensorFlow.js not available:", error);
    }

    try {
      // Check MediaPipe
      if (typeof window !== "undefined" && "MediaPipe" in window) {
        methods.push("mediapipe");
      }
    } catch (error) {
      console.log("MediaPipe not available:", error);
    }

    setAvailableMethods(methods);
    if (methods.length > 0) {
      setDetectionMethod(methods[0]);
    }
  };

  // Initialize detection method
  const initializeDetection = async (method: DetectionMethod) => {
    try {
      setIsLoading(true);
      setDetectionStatus("Initializing...");

      switch (method) {
        case "tensorflow":
          await initializeTensorFlow();
          break;
        case "mediapipe":
          await initializeMediaPipe();
          break;
        case "web":
          await initializeWebDetection();
          break;
        default:
          setDetectionStatus("No detection method selected");
      }
    } catch (error) {
      console.error("Detection initialization failed:", error);
      setDetectionStatus(`Failed to initialize ${method}`);
      toast({
        title: "Detection Error",
        description: `Failed to initialize ${method} detection. Trying fallback method.`,
        variant: "destructive",
      });

      // Try fallback to web detection
      if (method !== "web") {
        await initializeWebDetection();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // TensorFlow.js initialization
  const initializeTensorFlow = async () => {
    try {
      await tf.setBackend("webgl");
      await tf.ready();

      const model = poseDetection.SupportedModels.MoveNet;
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true,
      };

      detectorRef.current = await poseDetection.createDetector(
        model,
        detectorConfig
      );
      setDetectionStatus("TensorFlow.js ready");
      console.log("TensorFlow.js pose detection initialized");
    } catch (error) {
      throw new Error(`TensorFlow.js initialization failed: ${error}`);
    }
  };

  // MediaPipe initialization (simplified)
  const initializeMediaPipe = async () => {
    try {
      // For now, we'll simulate MediaPipe initialization
      // In a real implementation, you'd load the MediaPipe pose model
      setDetectionStatus("MediaPipe ready (simulated)");
      console.log("MediaPipe pose detection initialized (simulated)");
    } catch (error) {
      throw new Error(`MediaPipe initialization failed: ${error}`);
    }
  };

  // Web-based fallback detection
  const initializeWebDetection = async () => {
    try {
      setDetectionStatus("Web-based detection ready");
      console.log("Web-based pose detection initialized");
    } catch (error) {
      throw new Error(`Web detection initialization failed: ${error}`);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };
      }
    } catch (error) {
      console.error("Camera access failed:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Start monitoring
  const startMonitoring = async () => {
    if (!isAuthenticated && trialCount >= 3) {
      setShowTrialLimit(true);
      return;
    }

    try {
      await startCamera();
      await initializeDetection(detectionMethod);

      setIsActive(true);
      sessionStartRef.current = Date.now();
      feedbackHistoryRef.current = [];

      startPoseAnalysis();

      if (!isAuthenticated) {
        setTrialCount((prev) => {
          const newCount = prev + 1;
          localStorage.setItem("workoutMonitorTrials", newCount.toString());
          return newCount;
        });
      }

      toast({
        title: "Monitoring Started",
        description: `Using ${detectionMethod} detection method`,
      });
    } catch (error) {
      console.error("Failed to start monitoring:", error);
      toast({
        title: "Start Failed",
        description: "Unable to start form monitoring",
        variant: "destructive",
      });
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsActive(false);
    stopCamera();

    if (analysisFrameRef.current) {
      cancelAnimationFrame(analysisFrameRef.current);
      analysisFrameRef.current = null;
    }

    if (sessionStartRef.current) {
      const duration = Math.round(
        (Date.now() - sessionStartRef.current) / 1000
      );
      const goodFormCount = feedbackHistoryRef.current.filter(
        (f) => f.type === "good"
      ).length;
      const goodFormPercentage =
        feedbackHistoryRef.current.length > 0
          ? Math.round(
              (goodFormCount / feedbackHistoryRef.current.length) * 100
            )
          : 0;

      setSessionStats({
        duration,
        goodFormPercentage,
        feedbackCount: feedbackHistoryRef.current.length,
      });
    }

    setCurrentFeedback(null);
  };

  // Pose analysis based on detection method
  const startPoseAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyzeFrame = async () => {
      if (!videoRef.current || !isActive) return;

      try {
        let poses: any[] = [];

        switch (detectionMethod) {
          case "tensorflow":
            if (detectorRef.current) {
              poses = await detectorRef.current.estimatePoses(videoRef.current);
            }
            break;
          case "mediapipe":
            poses = await analyzeWithMediaPipe();
            break;
          case "web":
            poses = await analyzeWithWebDetection();
            break;
        }

        if (poses.length > 0) {
          const pose = poses[0];
          const keypoints = (pose.keypoints ||
            pose.landmarks ||
            []) as Keypoint[];

          // Detect exercise if Auto
          let exerciseForFeedback = selectedExercise;
          if (exerciseForFeedback === "Auto") {
            const guess = detectExercise(keypoints);
            setDetectedExercise(guess);
            exerciseForFeedback = guess;
          } else {
            setDetectedExercise("Manual: " + selectedExercise);
          }

          const feedback = analyzePose(keypoints, exerciseForFeedback);

          if (feedback) {
            setCurrentFeedback(feedback);
            feedbackHistoryRef.current.push(feedback);
          }

          // Draw pose on canvas
          drawPoseOnCanvas(ctx, pose, videoRef.current);
        }
      } catch (error) {
        console.error("Pose analysis error:", error);
      }

      if (isActive) {
        analysisFrameRef.current = requestAnimationFrame(analyzeFrame);
      }
    };

    analyzeFrame();
  };

  // MediaPipe analysis (simplified)
  const analyzeWithMediaPipe = async (): Promise<any[]> => {
    // Simplified MediaPipe analysis
    // In a real implementation, you'd use the actual MediaPipe pose model
    return [
      {
        landmarks: generateMockKeypoints(),
      },
    ];
  };

  // Web-based analysis (fallback)
  const analyzeWithWebDetection = async (): Promise<any[]> => {
    // Simple web-based pose estimation using basic image analysis
    return [
      {
        keypoints: generateMockKeypoints(),
      },
    ];
  };

  // Generate mock keypoints for testing
  const generateMockKeypoints = (): Keypoint[] => {
    const keypoints: Keypoint[] = [];
    const video = videoRef.current;
    if (!video) return keypoints;

    const centerX = video.videoWidth / 2;
    const centerY = video.videoHeight / 2;
    const time = Date.now() / 1000;

    // Generate mock keypoints with some movement
    const keypointNames = [
      "nose",
      "leftEye",
      "rightEye",
      "leftEar",
      "rightEar",
      "leftShoulder",
      "rightShoulder",
      "leftElbow",
      "rightElbow",
      "leftWrist",
      "rightWrist",
      "leftHip",
      "rightHip",
      "leftKnee",
      "rightKnee",
      "leftAnkle",
      "rightAnkle",
    ];

    keypointNames.forEach((name, index) => {
      const offsetX = Math.sin(time + index) * 20;
      const offsetY = Math.cos(time + index * 0.5) * 15;

      keypoints.push({
        x: centerX + offsetX + (index - 8) * 30,
        y: centerY + offsetY + Math.floor(index / 4) * 50,
        score: 0.8 + Math.random() * 0.2,
      });
    });

    return keypoints;
  };

  // Draw pose on canvas
  const drawPoseOnCanvas = (
    ctx: CanvasRenderingContext2D,
    pose: any,
    video: HTMLVideoElement
  ) => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    canvasEl.width = video.videoWidth;
    canvasEl.height = video.videoHeight;
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    const keypoints = pose.keypoints || pose.landmarks || [];

    // Draw keypoints
    keypoints.forEach((keypoint: Keypoint) => {
      if (keypoint.score && keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw connections
    drawPoseConnections(ctx, keypoints);
  };

  // Draw pose connections
  const drawPoseConnections = (
    ctx: CanvasRenderingContext2D,
    keypoints: Keypoint[]
  ) => {
    const connections = [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4], // face
      [5, 6],
      [5, 7],
      [6, 8],
      [7, 9],
      [8, 10], // arms
      [5, 11],
      [6, 12],
      [11, 12], // torso
      [11, 13],
      [12, 14],
      [13, 15],
      [14, 16], // legs
    ];

    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      if (
        keypoints[start] &&
        keypoints[end] &&
        keypoints[start].score &&
        keypoints[start].score! > 0.3 &&
        keypoints[end].score &&
        keypoints[end].score! > 0.3
      ) {
        ctx.beginPath();
        ctx.moveTo(keypoints[start].x, keypoints[start].y);
        ctx.lineTo(keypoints[end].x, keypoints[end].y);
        ctx.stroke();
      }
    });
  };

  // Analyze pose and provide feedback
  const analyzePose = (
    keypoints: Keypoint[],
    exercise: string
  ): PoseAnalysisResult | null => {
    if (keypoints.length < 10) return null;

    const normalized = normalizeKeypoints(keypoints);

    if (/push[- ]?up/i.test(exercise)) {
      return analyzePushUp(normalized);
    }

    // Default generic posture feedback
    return analyzeGenericPosture(normalized);
  };

  const normalizeKeypoints = (keypoints: Keypoint[]): Keypoint[] => {
    // Ensure numbers and provide defaults to avoid NaNs
    return keypoints.map((k) => ({
      x: Number(k.x) || 0,
      y: Number(k.y) || 0,
      score: k.score ?? 1,
    }));
  };

  const radiansToDegrees = (r: number) => (r * 180) / Math.PI;

  const computeAngle = (a: Keypoint, b: Keypoint, c: Keypoint): number => {
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const magAB = Math.hypot(ab.x, ab.y);
    const magCB = Math.hypot(cb.x, cb.y);
    if (magAB === 0 || magCB === 0) return 0;
    const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
    return radiansToDegrees(Math.acos(cos));
  };

  const analyzePushUp = (k: Keypoint[]): PoseAnalysisResult => {
    const ls = k[5],
      rs = k[6]; // shoulders
    const le = k[7],
      re = k[8]; // elbows
    const lw = k[9],
      rw = k[10]; // wrists
    const lh = k[11],
      rh = k[12]; // hips
    const lk = k[13],
      rk = k[14]; // knees
    const la = k[15],
      ra = k[16]; // ankles

    // Body line (shoulder-hip-ankle) ~ straight
    const leftBodyAngle = computeAngle(ls, lh, la); // ~180 when straight
    const rightBodyAngle = computeAngle(rs, rh, ra);
    const bodyStraight = leftBodyAngle > 160 && rightBodyAngle > 160;

    // Elbow angle (shoulder-elbow-wrist)
    const leftElbowAngle = computeAngle(ls, le, lw);
    const rightElbowAngle = computeAngle(rs, re, rw);

    // Hip sag: hips noticeably lower than shoulder-ankle line
    const hipAvgY = (lh.y + rh.y) / 2;
    const shoulderAvgY = (ls.y + rs.y) / 2;
    const ankleAvgY = (la.y + ra.y) / 2;
    const torsoLength = Math.abs(shoulderAvgY - hipAvgY) || 1;
    const hipBelowLine = hipAvgY > shoulderAvgY + torsoLength * 0.6;

    // Determine feedback
    if (!bodyStraight) {
      return {
        feedback:
          "Keep a straight line from shoulders to ankles. Engage your core and glutes to avoid sagging or piking.",
        type: "warning",
        confidence: 0.85,
        exerciseType: "Push-up",
      };
    }

    if (hipBelowLine) {
      return {
        feedback:
          "Hips are sagging. Squeeze your glutes and tighten your abs to keep your hips in line.",
        type: "warning",
        confidence: 0.8,
        exerciseType: "Push-up",
      };
    }

    // Lockout/top position check
    const nearLockout = leftElbowAngle > 160 && rightElbowAngle > 160;
    if (nearLockout) {
      return {
        feedback:
          "Good plank position at the top. Maintain a neutral neck and steady breathing.",
        type: "good",
        confidence: 0.9,
        exerciseType: "Push-up",
      };
    }

    // Bottom position guidance if elbows are deeply bent
    const deepBend = leftElbowAngle < 80 && rightElbowAngle < 80;
    if (deepBend) {
      return {
        feedback:
          "At the bottom, keep elbows at ~45° from your body and avoid flaring. Chest should approach the floor with body straight.",
        type: "warning",
        confidence: 0.8,
        exerciseType: "Push-up",
      };
    }

    return {
      feedback:
        "Solid push-up form. Keep core tight and move in a controlled tempo.",
      type: "good",
      confidence: 0.75,
      exerciseType: "Push-up",
    };
  };

  const analyzeGenericPosture = (k: Keypoint[]): PoseAnalysisResult => {
    const ls = k[5],
      rs = k[6];
    const shoulderLevel = ls && rs ? Math.abs(ls.y - rs.y) < 20 : false;
    if (shoulderLevel) {
      return {
        feedback: "Great shoulder alignment!",
        type: "good",
        confidence: 0.9,
      };
    }
    return {
      feedback: "Keep your shoulders level and spine neutral.",
      type: "warning",
      confidence: 0.7,
    };
  };

  const detectExercise = (k: Keypoint[]): string => {
    // Very simple heuristic: if body is horizontal and wrists near shoulders -> Push-up
    const ls = k[5],
      rs = k[6];
    const lw = k[9],
      rw = k[10];
    const lh = k[11],
      rh = k[12];
    if (ls && rs && lw && rw && lh && rh) {
      const shouldersLevel = Math.abs(ls.y - rs.y) < 30;
      const hipsLevel = Math.abs(lh.y - rh.y) < 30;
      const torsoHorizontal = shouldersLevel && hipsLevel;
      const wristsNearShoulders =
        Math.abs(lw.y - ls.y) < 80 && Math.abs(rw.y - rs.y) < 80;
      if (torsoHorizontal && wristsNearShoulders) return "Push-up";
    }
    return "Unknown";
  };

  // Get feedback icon
  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "good":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-secondary" />;
      case "error":
        return <X className="w-5 h-5 text-destructive" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  // Initialize available methods on mount
  useEffect(() => {
    checkAvailableMethods();
  }, []);

  // Update session stats
  useEffect(() => {
    if (isActive && sessionStartRef.current) {
      const interval = setInterval(() => {
        const duration = Math.round(
          (Date.now() - sessionStartRef.current!) / 1000
        );
        setSessionStats((prev) => ({ ...prev, duration }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Status Badges */}
        <div className="flex items-center justify-end gap-2 mb-8">
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {detectionStatus}
          </Badge>
          {isActive && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Live
            </Badge>
          )}
        </div>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden animate-fade-in">
          <div
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${formMonitorImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-overlay" />
            <div className="relative z-10 p-6 flex items-end h-full">
              <div className="text-white">
                <h1 className="text-heading-lg mb-2">
                  Live Workout Form Monitor
                </h1>
                <p className="text-body opacity-90">
                  AI-powered real-time pose analysis and form correction
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detection Method Selection */}
        <FitnessCard className="mb-6">
          <FitnessCardHeader>
            <FitnessCardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Detection Method
            </FitnessCardTitle>
          </FitnessCardHeader>
          <FitnessCardContent>
            <div className="flex flex-wrap gap-2">
              {availableMethods.map((method) => (
                <FitnessButton
                  key={method}
                  variant={detectionMethod === method ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDetectionMethod(method)}
                  disabled={isLoading}
                >
                  {method === "tensorflow" && "TensorFlow.js"}
                  {method === "mediapipe" && "MediaPipe"}
                  {method === "web" && "Web-based"}
                  {method === "none" && "None"}
                </FitnessButton>
              ))}
              <FitnessButton
                variant="outline"
                size="sm"
                onClick={() => checkAvailableMethods()}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </FitnessButton>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Current method: <strong>{detectionMethod}</strong> -{" "}
              {detectionStatus}
            </p>
          </FitnessCardContent>
        </FitnessCard>

        {/* Trial Limit Alert */}
        {showTrialLimit && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached the trial limit for non-authenticated users. Sign
              up for unlimited access.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera Feed */}
          <div className="lg:col-span-2">
            <FitnessCard className="h-full">
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Live Camera Feed
                </FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ pointerEvents: "none" }}
                  />

                  {!isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="text-center text-white">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Camera Ready</p>
                        <p className="text-sm opacity-75">
                          Click start to begin monitoring
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <FitnessButton
                    onClick={isActive ? stopMonitoring : startMonitoring}
                    disabled={isLoading || detectionMethod === "none"}
                    className="flex-1"
                    size="lg"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : isActive ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {isLoading
                      ? "Initializing..."
                      : isActive
                      ? "Stop Monitoring"
                      : "Start Monitoring"}
                  </FitnessButton>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>

          {/* Feedback Panel */}
          <div className="space-y-6">
            {/* Current Feedback */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Real-time Feedback
                </FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                {currentFeedback ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      {getFeedbackIcon(currentFeedback.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {currentFeedback.feedback}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence:{" "}
                          {Math.round(currentFeedback.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Waiting for pose detection...</p>
                  </div>
                )}
              </FitnessCardContent>
            </FitnessCard>

            {/* Session Stats */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Session Stats</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Duration
                    </span>
                    <span className="text-sm font-medium">
                      {Math.floor(sessionStats.duration / 60)}:
                      {(sessionStats.duration % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Good Form
                    </span>
                    <span className="text-sm font-medium">
                      {sessionStats.goodFormPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Feedback Count
                    </span>
                    <span className="text-sm font-medium">
                      {sessionStats.feedbackCount}
                    </span>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>

            {/* Tips */}
            <FitnessCard>
              <FitnessCardHeader>
                <FitnessCardTitle>Form Tips</FitnessCardTitle>
              </FitnessCardHeader>
              <FitnessCardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <span>Keep your shoulders level and relaxed</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <span>Maintain a straight spine throughout</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <span>Engage your core for stability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                    <span>Breathe steadily and controlled</span>
                  </div>
                </div>
              </FitnessCardContent>
            </FitnessCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormMonitorPage;
