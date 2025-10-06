"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video,
  Play,
  Download,
  Upload,
  Loader2,
  Sparkles,
  Film,
  Settings,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Cloud,
  ExternalLink,
  Camera,
  Image as ImageIcon,
  Crown,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface VideoModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: "Ultra Fast" | "Fast" | "Standard" | "Pro";
  resolution: string[];
  duration: string[];
  features: string[];
  category: "text-to-video" | "image-to-video" | "video-editing" | "lipsync";
}

interface GenerationResult {
  success: boolean;
  videoUrl?: string;
  taskId?: string;
  error?: string;
  metadata?: {
    model: string;
    prompt: string;
    resolution: string;
    duration: string;
    seed?: number;
  };
}

const videoModels: VideoModel[] = [
  // Google Models - Working models from WaveSpeed AI
  {
    id: "google-veo3-fast-image-to-video",
    name: "Google Veo3 Fast I2V",
    provider: "Google",
    description:
      "Fast image-to-video with Veo3 - 30% faster, 80% cost reduction",
    speed: "Fast",
    resolution: ["720p", "1080p"],
    duration: ["8s"],
    features: ["Fast Generation", "Cost Effective", "Audio Support"],
    category: "image-to-video",
  },
  {
    id: "google-veo3-image-to-video",
    name: "Google Veo3 I2V",
    provider: "Google",
    description: "High-quality image-to-video conversion with Veo3",
    speed: "Standard",
    resolution: ["720p", "1080p"],
    duration: ["8s"],
    features: ["High Quality", "Image to Video", "Audio Support"],
    category: "image-to-video",
  },

  // Kwaivgi (Kling) Models - Working models from WaveSpeed AI
  {
    id: "kwaivgi-kling-v2.1-i2v-pro",
    name: "Kling V2.1 I2V Pro",
    provider: "Kwaivgi",
    description: "Professional image-to-video conversion with Kling V2.1",
    speed: "Standard",
    resolution: ["1920x1080"],
    duration: ["5s", "10s"],
    features: ["Pro Quality", "I2V", "Flexible Duration"],
    category: "image-to-video",
  },
  {
    id: "kwaivgi-kling-v2.1-i2v-standard",
    name: "Kling V2.1 I2V Standard",
    provider: "Kwaivgi",
    description: "Standard image-to-video conversion with Kling V2.1",
    speed: "Fast",
    resolution: ["1280x720"],
    duration: ["5s", "10s"],
    features: ["Standard Quality", "Fast", "I2V"],
    category: "image-to-video",
  },
  {
    id: "kwaivgi-kling-v2.1-t2v-master",
    name: "Kling V2.1 T2V Master",
    provider: "Kwaivgi",
    description: "Master version of Kling with superior text-to-video quality",
    speed: "Pro",
    resolution: ["1920x1080", "2560x1440"],
    duration: ["5s", "10s"],
    features: ["Master Quality", "Superior", "Latest Version"],
    category: "text-to-video",
  },

  // Pixverse Models
  {
    id: "pixverse-pixverse-v5-t2v",
    name: "Pixverse V5 T2V",
    provider: "Pixverse",
    description: "Advanced text-to-video generation with Pixverse V5",
    speed: "Standard",
    resolution: ["1280x720", "1920x1080"],
    duration: ["5s", "10s", "20s"],
    features: ["High Quality", "Advanced AI", "Creative"],
    category: "text-to-video",
  },
];

export default function VideoGenerationPage() {
  const [selectedModel, setSelectedModel] = useState<VideoModel>(
    videoModels.find((model) => model.id === "kwaivgi-kling-v2.1-t2v-master") ||
      videoModels[0]
  );
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [resolution, setResolution] = useState("1280x720");
  const [duration, setDuration] = useState("10s");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("text-to-video");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = [
    // { id: "all", name: "All Categories" },
    { id: "text-to-video", name: "Text to Video" },
    { id: "image-to-video", name: "Image to Video" },
    { id: "video-editing", name: "Video Editing" },
    { id: "lipsync", name: "Lipsync" },
  ];

  const providers = [
    { id: "all", name: "All Providers" },
    { id: "Google", name: "Google" },
    { id: "Kwaivgi", name: "Kwaivgi (Kling)" },
    { id: "Pixverse", name: "Pixverse" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredModels = videoModels.filter((model) => {
    const categoryMatch =
      selectedCategory === "all" || model.category === selectedCategory;
    const providerMatch =
      selectedProvider === "all" || model.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  // Function to set default model based on category
  const setDefaultModelForCategory = (category: string) => {
    let defaultModelId: string;

    if (category === "text-to-video") {
      defaultModelId = "kwaivgi-kling-v2.1-t2v-master";
    } else if (category === "image-to-video") {
      defaultModelId = "google-veo3-fast-image-to-video";
    } else {
      // For other categories, use the first available model
      const availableModels = videoModels.filter(
        (model) => model.category === category
      );
      defaultModelId = availableModels[0]?.id || videoModels[0].id;
    }

    const defaultModel = videoModels.find(
      (model) => model.id === defaultModelId
    );
    if (defaultModel) {
      setSelectedModel(defaultModel);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setDefaultModelForCategory(category);
    setShowModelSelection(false);
  };

  const pollForVideoResult = async (taskId: string): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 120; // Maximum 4 minutes of polling for video

    while (attempts < maxAttempts) {
      try {
        const response = await fetch("/api/nanobanana", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId }),
        });

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data?.data?.outputs?.length > 0) {
          // Video is ready
          setResult({
            success: true,
            videoUrl: result.data.data.outputs[0],
            taskId: taskId,
            metadata: {
              model: selectedModel.name,
              prompt,
              resolution,
              duration,
              seed,
            },
          });
          setIsGenerating(false);
          return;
        } else if (result.data?.data?.status === "failed") {
          // Task failed
          setResult({
            success: false,
            error: result.data?.data?.error || "Video generation failed",
            taskId: taskId,
          });
          setIsGenerating(false);
          return;
        }

        // Still processing, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        attempts++;
      } catch (error) {
        console.error("Polling error:", error);
        setResult({
          success: false,
          error: `Polling failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          taskId: taskId,
        });
        setIsGenerating(false);
        return;
      }
    }

    // Timeout reached
    setResult({
      success: false,
      error: "Video generation timed out. Please try again.",
      taskId: taskId,
    });
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && selectedModel.category === "text-to-video") {
      setResult({
        success: false,
        error: "Please enter a prompt for text-to-video generation",
      });
      return;
    }

    if (!imageFile && selectedModel.category === "image-to-video") {
      setResult({
        success: false,
        error: "Please upload an image for image-to-video generation",
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      // Make initial request to WaveSpeedAI
      const formData = new FormData();
      formData.append("model", selectedModel.id);
      formData.append("prompt", prompt);
      formData.append("negative_prompt", negativePrompt);
      formData.append("resolution", resolution);
      formData.append("duration", duration);
      if (seed) formData.append("seed", seed.toString());
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch("/api/wavespeed-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.videoUrl) {
        // Video is ready immediately
        setResult(data);
        setIsGenerating(false);
      } else if (data.success && data.taskId) {
        // Start polling for results
        console.log("Starting polling for video task:", data.taskId);
        await pollForVideoResult(data.taskId);
      } else {
        // Error occurred
        setResult(data);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Video generation error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          model: selectedModel.name,
          prompt,
          resolution,
          duration,
          seed,
        },
      });
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!result?.videoUrl) return;

    const link = document.createElement("a");
    link.href = result.videoUrl;
    link.download = `${selectedModel.name.replace(
      /\s+/g,
      "-"
    )}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "Ultra Fast":
        return "bg-green-100 text-green-800";
      case "Fast":
        return "bg-blue-100 text-blue-800";
      case "Standard":
        return "bg-yellow-100 text-yellow-800";
      case "Pro":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="block">
              <div className="flex items-center">
                <img
                  src="/socialHive-logo.png"
                  alt="SocialHive Logo"
                  className="h-8"
                />
              </div>
            </a>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Amber Chen</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-600 rounded-full" />
              </div>
              {/* Dropdown Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <a
                      href="/analytics"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-3 text-gray-500" />
                      Analytics
                    </a>
                    <a
                      href="/trends"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 mr-3 text-gray-500" />
                      Trends
                    </a>
                    <a
                      href="/tools"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      All Tools
                    </a>
                    <a
                      href="/comments"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <svg className="h-4 w-4 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comments
                    </a>
                    <div className="border-t border-gray-200"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        alert("Logout functionality would be implemented here");
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg
                        className="h-4 w-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Tool Icon and Title */}
            <div className="flex items-center gap-4 mb-6">
              <img src="/mainPage_assets/starfish.png" className="h-10" />
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  AI Video Generation Studio
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Create dynamic short videos in minutes using
                  state-of-the-art AI models. Perfect for reels, ads, and social
                  content.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Category Tabs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="space-y-2">
          <div className="flex border border-black rounded-4xl ">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-4xl transition-all ${
                  selectedCategory === category.id
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Settings and Generation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Model & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Model Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-md">Model Settings</Label>
                      <Badge className="bg-gray-200 text-gray-500 rounded-2xl px-6 py-1 text-sm">
                        Default
                      </Badge>
                    </div>

                    <Button
                      onClick={() => setShowModelSelection(!showModelSelection)}
                      className="flex items-center gap-2 bg-primary  text-white"
                    >
                      <Crown className="h-4 w-4" />
                      Change Model
                    </Button>
                  </div>

                  {/* Model Selection Dropdown */}
                  {showModelSelection && (
                    <div className="space-y-2">
                      <Label className="text-md">Model Available:</Label>
                      <div className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {/* Show selected model first */}
                        <div
                          onClick={() => {
                            setShowModelSelection(false);
                          }}
                          className="p-3 cursor-pointer transition-colors border-b border-gray-100 bg-blue-50 border-l-4 border-blue-500"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {selectedModel.name}
                              </span>
                              <Badge
                                className={getSpeedColor(selectedModel.speed)}
                              >
                                {selectedModel.speed}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {selectedModel.provider}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {selectedModel.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {selectedModel.features
                              .slice(0, 2)
                              .map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                          </div>
                        </div>

                        {/* Show other models */}
                        {filteredModels
                          .filter((model) => model.id !== selectedModel.id)
                          .map((model) => (
                            <div
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model);
                                setShowModelSelection(false);
                              }}
                              className="p-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {model.name}
                                  </span>
                                  <Badge className={getSpeedColor(model.speed)}>
                                    {model.speed}
                                  </Badge>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {model.provider}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {selectedModel.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {selectedModel.features
                                  .slice(0, 2)
                                  .map((feature) => (
                                    <Badge
                                      key={feature}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {feature}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Display Selected Model Only */}
                  {!showModelSelection && (
                    <div className="space-y-2">
                      <Label className="text-md">Selected Model:</Label>
                      <div
                        className="bg-gray-50 border border-gray-400 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setShowModelSelection(true)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {selectedModel.name}
                            </span>
                            <Badge
                              className={getSpeedColor(selectedModel.speed)}
                            >
                              {selectedModel.speed}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {selectedModel.provider}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {selectedModel.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedModel.features.slice(0, 2).map((feature) => (
                            <Badge
                              key={feature}
                              variant="outline"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generation Settings */}
                <div className="space-y-3">
                  {/* <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModel.duration.map((dur) => (
                          <SelectItem key={dur} value={dur}>
                            {dur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  {/* <div className="space-y-2">
                    <Label>Seed (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="Random if empty"
                      value={seed || ""}
                      onChange={(e) =>
                        setSeed(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div> */}
                </div>
              </CardContent>
            </Card>
            {/* Generation Interface - Move to left column */}
            <Card>
              {/* <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="h-5 w-5" />
                  Video Generation
                </CardTitle>
              </CardHeader> */}
              <CardContent className="space-y-4">
                {/* Image Upload for I2V */}
                {selectedModel.category === "image-to-video" && (
                  <div className="space-y-2">
                    <Label>Source Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="flex flex-col items-center space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setImageFile(e.target.files?.[0] || null)
                          }
                          className="hidden"
                          id="image-upload"
                        />

                        <p className="text-sm text-gray-500">
                          {imageFile ? imageFile.name : "PNG, JPG up to 10MB"}
                        </p>

                        <Button
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                          className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
                        >
                          <Upload className="h-4 w-4" />
                          Choose Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    {selectedModel.category === "image-to-video"
                      ? "Motion Prompt (Optional)"
                      : "Video Prompt"}
                  </Label>
                  <Textarea
                    placeholder={
                      selectedModel.category === "image-to-video"
                        ? "Describe the motion or animation you want..."
                        : "Describe the video you want to generate..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Negative Prompt (Optional)</Label>
                  <Textarea
                    placeholder="What to avoid in the video..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    (selectedModel.category === "text-to-video" &&
                      !prompt.trim()) ||
                    (selectedModel.category === "image-to-video" && !imageFile)
                  }
                  className="w-full bg-black"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Generated Video */}
          <div className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Generated Video
                  </CardTitle>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1280x720">720p (1280x720)</SelectItem>
                      <SelectItem value="1920x1080">
                        1080p (1920x1080)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center p-6">
                {isGenerating && (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto" />
                      <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Generating with {selectedModel.name}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {selectedModel.speed === "Ultra Fast"
                          ? "⚡ Ultra Fast - Under 30 seconds"
                          : selectedModel.speed === "Fast"
                          ? "🚀 Fast - Under 1 minute"
                          : selectedModel.speed === "Standard"
                          ? "⏱️ Standard - Under 2 minutes"
                          : "🎯 Pro - High Quality Processing"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Video generation typically takes longer than images.
                        Please wait...
                      </p>
                    </div>
                  </div>
                )}

                {result?.success && result.videoUrl && (
                  <div className="w-full space-y-4">
                    <div className="relative">
                      <video
                        src={result.s3Url || result.videoUrl}
                        controls
                        className="max-w-full max-h-[60vh] w-auto h-auto rounded-lg shadow-lg mx-auto"
                        poster="/placeholder.jpg"
                      >
                        Your browser does not support the video tag.
                      </video>
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                      {result.s3Url && (
                        <Badge className="absolute top-2 left-2 bg-blue-500">
                          <Cloud className="h-3 w-3 mr-1" />
                          S3 Stored
                        </Badge>
                      )}
                    </div>

                    {result.metadata && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Generation Details
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Model: {result.metadata.model}</div>
                          <div>Resolution: {result.metadata.resolution}</div>
                          <div>Duration: {result.metadata.duration}</div>
                          {result.metadata.seed && (
                            <div>Seed: {result.metadata.seed}</div>
                          )}
                          <div className="col-span-2">
                            Prompt: {result.metadata.prompt}
                          </div>
                          {result.metadata.s3Upload && (
                            <div className="col-span-2">
                              <div
                                className={`text-xs p-2 rounded ${
                                  result.metadata.s3Upload.success
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                <strong>S3 Storage:</strong>{" "}
                                {result.metadata.s3Upload.success
                                  ? "✅ Uploaded to AWS S3"
                                  : result.metadata.s3Upload.error ||
                                    "⏳ Upload in progress"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={downloadVideo}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>

                      {result.s3Url && (
                        <Button
                          onClick={() => window.open(result.s3Url, "_blank")}
                          className="w-full"
                          variant="outline"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open S3 URL
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {result?.error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Error:</strong> {result.error}
                    </AlertDescription>
                  </Alert>
                )}

                {!isGenerating && !result && (
                  <div className="text-center">
                    <Film className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Ready to Create
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      {selectedModel.category === "image-to-video"
                        ? "Configure your settings on the left, upload an image, and click 'Generate Video' to create your AI video!"
                        : "Configure your settings on the left and click 'Generate Video' to create your AI masterpiece!"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Bottom Link */}
        <div className="flex justify-center mt-5">
          <a
            href="/"
            className="text-blue-500 hover:text-blue-500 font-medium text-md flex items-center space-x-2 transition-colors underline"
          >
            <span>Keep creating — discover more AI tools</span>
            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M13 5H19V11" />
              <path d="M19 5L5 19" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
