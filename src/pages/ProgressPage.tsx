import progressImage from "@/assets/hero-fitness.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { FitnessButton } from "@/components/ui/fitness-button";
import {
  FitnessCard,
  FitnessCardContent,
  FitnessCardHeader,
  FitnessCardTitle,
} from "@/components/ui/fitness-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Camera,
  Image as ImageIcon,
  Minus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  Weight,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";

interface WeightEntry {
  id: string;
  weight: number;
  unit: "kg" | "lbs";
  date: string;
  created_at: string;
}

interface ProgressPhoto {
  id: string;
  url: string;
  type: "front" | "side" | "back";
  date: string;
  created_at: string;
}

interface WeightStats {
  current: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
}

const ProgressPage: React.FC = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [currentWeight, setCurrentWeight] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState<
    "front" | "side" | "back"
  >("front");
  const [weightStats, setWeightStats] = useState<WeightStats | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load user's weight history and photos
  useEffect(() => {
    if (user) {
      loadWeightHistory();
      loadProgressPhotos();
    }
  }, [user]);

  // Calculate weight statistics
  useEffect(() => {
    if (weightEntries.length >= 2) {
      const sorted = [...weightEntries].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const latest = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];

      const change = latest.weight - previous.weight;
      const changePercent = (change / previous.weight) * 100;

      setWeightStats({
        current: latest.weight,
        change: Math.abs(change),
        changePercent: Math.abs(changePercent),
        trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      });
    } else if (weightEntries.length === 1) {
      setWeightStats({
        current: weightEntries[0].weight,
        change: 0,
        changePercent: 0,
        trend: "stable",
      });
    }
  }, [weightEntries]);

  const loadWeightHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("weight_entries" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setWeightEntries((data as WeightEntry[]) || []);
    } catch (error) {
      console.error("Error loading weight history:", error);
      toast({
        title: "Error",
        description: "Failed to load weight history",
        variant: "destructive",
      });
    }
  };

  const loadProgressPhotos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("progress_photos" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProgressPhotos((data as ProgressPhoto[]) || []);
    } catch (error) {
      console.error("Error loading progress photos:", error);
      toast({
        title: "Error",
        description: "Failed to load progress photos",
        variant: "destructive",
      });
    }
  };

  const saveWeight = async () => {
    if (!user || !currentWeight) return;

    const weight = parseFloat(currentWeight);
    if (isNaN(weight) || weight <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("weight_entries" as any).insert({
        user_id: user.id,
        weight,
        unit: weightUnit,
        date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      setCurrentWeight("");
      await loadWeightHistory();

      toast({
        title: "Weight Saved",
        description: "Your weight has been recorded successfully",
      });
    } catch (error) {
      console.error("Error saving weight:", error);
      toast({
        title: "Error",
        description: "Failed to save weight",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProgressPhoto = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("progress-photos").getPublicUrl(fileName);

      // Save photo metadata to database
      const { error: dbError } = await supabase
        .from("progress_photos" as any)
        .insert({
          user_id: user.id,
          url: publicUrl,
          type: selectedPhotoType,
          date: new Date().toISOString().split("T")[0],
        });

      if (dbError) throw dbError;

      await loadProgressPhotos();

      toast({
        title: "Photo Uploaded",
        description: "Your progress photo has been saved",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload progress photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProgressPhoto(file);
    }
  };

  const deleteWeightEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("weight_entries" as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await loadWeightHistory();

      toast({
        title: "Weight Deleted",
        description: "Weight entry has been removed",
      });
    } catch (error) {
      console.error("Error deleting weight:", error);
      toast({
        title: "Error",
        description: "Failed to delete weight entry",
        variant: "destructive",
      });
    }
  };

  const deleteProgressPhoto = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("progress_photos" as any)
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      await loadProgressPhotos();

      toast({
        title: "Photo Deleted",
        description: "Progress photo has been removed",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "Failed to delete progress photo",
        variant: "destructive",
      });
    }
  };

  // Prepare chart data
  const chartData = weightEntries.map((entry) => ({
    date: format(parseISO(entry.date), "MMM dd"),
    weight: entry.weight,
    fullDate: entry.date,
  }));

  // Group photos by date
  const photosByDate = progressPhotos.reduce((acc, photo) => {
    const date = photo.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(photo);
    return acc;
  }, {} as Record<string, ProgressPhoto[]>);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-destructive" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-success" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-destructive";
      case "down":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden animate-fade-in">
          <div
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${progressImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-overlay" />
            <div className="relative z-10 p-6 flex items-end h-full">
              <div className="text-white">
                <h1 className="text-heading-lg mb-2">Progress Tracking</h1>
                <p className="text-body opacity-90">
                  Track your weight and body transformation journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="weight" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weight">Weight Tracking</TabsTrigger>
            <TabsTrigger value="photos">Progress Photos</TabsTrigger>
          </TabsList>

          {/* Weight Tracking Tab */}
          <TabsContent value="weight" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Weight Input and Chart */}
              <div className="lg:col-span-2 space-y-6">
                {/* Weight Input */}
                <FitnessCard>
                  <FitnessCardHeader>
                    <FitnessCardTitle className="flex items-center gap-2">
                      <Weight className="w-5 h-5" />
                      Add Weight Entry
                    </FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label htmlFor="weight">Current Weight</Label>
                        <Input
                          id="weight"
                          type="number"
                          placeholder="Enter weight"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-20">
                        <Label htmlFor="unit">Unit</Label>
                        <select
                          id="unit"
                          value={weightUnit}
                          onChange={(e) =>
                            setWeightUnit(e.target.value as "kg" | "lbs")
                          }
                          className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                      <FitnessButton
                        onClick={saveWeight}
                        disabled={isLoading || !currentWeight}
                        className="mb-1"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </FitnessButton>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>

                {/* Weight Chart */}
                <FitnessCard>
                  <FitnessCardHeader>
                    <FitnessCardTitle>Weight Progress</FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    {chartData.length > 0 ? (
                      <div className="h-80 w-full overflow-hidden">
                        <div className="w-full h-full min-w-0">
                          <ChartContainer
                            config={{
                              weight: {
                                label: "Weight",
                                color: "hsl(var(--primary))",
                              },
                            }}
                            className="w-full h-full"
                          >
                            <LineChart
                              data={chartData}
                              margin={{
                                top: 20,
                                right: 20,
                                left: 20,
                                bottom: 40,
                              }}
                            >
                              <XAxis
                                dataKey="date"
                                tick={{
                                  fontSize: 10,
                                  fill: "hsl(var(--muted-foreground))",
                                }}
                                tickLine={{ stroke: "hsl(var(--border))" }}
                                axisLine={{ stroke: "hsl(var(--border))" }}
                                interval="preserveStartEnd"
                                height={50}
                                angle={-45}
                                textAnchor="end"
                                tickMargin={10}
                              />
                              <YAxis
                                domain={["dataMin - 2", "dataMax + 2"]}
                                tick={{
                                  fontSize: 12,
                                  fill: "hsl(var(--muted-foreground))",
                                }}
                                tickLine={{ stroke: "hsl(var(--border))" }}
                                axisLine={{ stroke: "hsl(var(--border))" }}
                                tickFormatter={(value) => `${value}`}
                                width={60}
                              />
                              <ChartTooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                        <p className="font-medium">
                                          {format(
                                            parseISO(data.fullDate),
                                            "MMM dd, yyyy"
                                          )}
                                        </p>
                                        <p className="text-primary font-semibold">
                                          {payload[0].value} {weightUnit}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Weight Entry
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={3}
                                dot={{
                                  fill: "hsl(var(--primary))",
                                  strokeWidth: 2,
                                  r: 4,
                                  stroke: "hsl(var(--background))",
                                }}
                                activeDot={{
                                  r: 6,
                                  stroke: "hsl(var(--primary))",
                                  strokeWidth: 2,
                                  fill: "hsl(var(--background))",
                                }}
                              />
                            </LineChart>
                          </ChartContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Weight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No weight data yet</p>
                          <p className="text-sm">
                            Add your first weight entry above
                          </p>
                        </div>
                      </div>
                    )}
                  </FitnessCardContent>
                </FitnessCard>
              </div>

              {/* Weight Statistics */}
              <div className="space-y-6">
                {weightStats && (
                  <FitnessCard>
                    <FitnessCardHeader>
                      <FitnessCardTitle>Weight Statistics</FitnessCardTitle>
                    </FitnessCardHeader>
                    <FitnessCardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {weightStats.current} {weightUnit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Current Weight
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-semibold flex items-center justify-center gap-1 ${getTrendColor(
                              weightStats.trend
                            )}`}
                          >
                            {getTrendIcon(weightStats.trend)}
                            {weightStats.change.toFixed(1)} {weightUnit}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Change
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-lg font-semibold ${getTrendColor(
                              weightStats.trend
                            )}`}
                          >
                            {weightStats.changePercent.toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Percentage
                          </div>
                        </div>
                      </div>
                    </FitnessCardContent>
                  </FitnessCard>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Progress Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Photo Upload */}
              <div className="lg:col-span-1">
                <FitnessCard>
                  <FitnessCardHeader>
                    <FitnessCardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Upload Photo
                    </FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Photo Type</Label>
                        <select
                          value={selectedPhotoType}
                          onChange={(e) =>
                            setSelectedPhotoType(
                              e.target.value as "front" | "side" | "back"
                            )
                          }
                          className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                          <option value="front">Front View</option>
                          <option value="side">Side View</option>
                          <option value="back">Back View</option>
                        </select>
                      </div>

                      <FitnessButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Upload className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            Upload Photo
                          </>
                        )}
                      </FitnessButton>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </FitnessCardContent>
                </FitnessCard>
              </div>

              {/* Photo Timeline */}
              <div className="lg:col-span-2">
                <FitnessCard>
                  <FitnessCardHeader>
                    <FitnessCardTitle>Photo Timeline</FitnessCardTitle>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    {Object.keys(photosByDate).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(photosByDate)
                          .sort(
                            ([a], [b]) =>
                              new Date(b).getTime() - new Date(a).getTime()
                          )
                          .map(([date, photos]) => (
                            <div key={date} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="w-4 h-4" />
                                {format(parseISO(date), "MMM dd, yyyy")}
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                {photos.map((photo) => (
                                  <div
                                    key={photo.id}
                                    className="relative group"
                                  >
                                    <img
                                      src={photo.url}
                                      alt={`${photo.type} view`}
                                      className="w-full h-20 object-cover rounded-lg cursor-pointer"
                                      onClick={() => {
                                        setSelectedPhoto(photo);
                                        setShowPhotoModal(true);
                                      }}
                                    />
                                    <div className="absolute top-1 left-1">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {photo.type}
                                      </Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteProgressPhoto(photo.id);
                                      }}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No progress photos yet</p>
                        <p className="text-sm">Upload your first photo above</p>
                      </div>
                    )}
                  </FitnessCardContent>
                </FitnessCard>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Photo Modal */}
        {showPhotoModal && selectedPhoto && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize">
                  {selectedPhoto.type} View
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhotoModal(false)}
                >
                  ×
                </Button>
              </div>
              <div className="p-4">
                <img
                  src={selectedPhoto.url}
                  alt={`${selectedPhoto.type} view`}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                <div className="mt-4 text-sm text-muted-foreground">
                  Uploaded:{" "}
                  {format(parseISO(selectedPhoto.created_at), "MMM dd, yyyy")}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
