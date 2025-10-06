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
  Camera,
  Wand2,
  Download,
  Upload,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Cloud,
  ExternalLink,
  Crown,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface ImageModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: "Ultra Fast" | "Fast" | "Standard" | "Pro";
  resolution: string[];
  features: string[];
  category:
    | "text-to-image"
    | "image-to-image"
    | "image-editing"
    | "style-transfer";
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  taskId?: string;
  error?: string;
  metadata?: {
    model: string;
    prompt: string;
    resolution: string;
    seed?: number;
  };
}

const imageModels: ImageModel[] = [
  // Google Models - Only working models
  {
    id: "google-imagen4",
    name: "Google Imagen4",
    provider: "Google",
    description:
      "Latest Google image generation model with exceptional quality",
    speed: "Standard",
    resolution: ["1k", "2k"],
    features: ["High Quality", "Photorealistic", "Text Understanding"],
    category: "text-to-image",
  },
  {
    id: "google-imagen4-fast",
    name: "Google Imagen4 Fast",
    provider: "Google",
    description: "Fast version of Imagen4 for quick generation",
    speed: "Fast",
    resolution: ["1k", "2k"],
    features: ["Fast Generation", "Good Quality"],
    category: "text-to-image",
  },
  {
    id: "google-imagen4-ultra",
    name: "Google Imagen4 Ultra",
    provider: "Google",
    description: "Ultra high quality version of Imagen4",
    speed: "Pro",
    resolution: ["1k", "2k"],
    features: ["Ultra Quality", "High Resolution", "Professional"],
    category: "text-to-image",
  },
  {
    id: "google-imagen3",
    name: "Google Imagen3",
    provider: "Google",
    description: "Previous generation Google model with proven reliability",
    speed: "Standard",
    resolution: ["1k", "2k"],
    features: ["Reliable", "Good Quality"],
    category: "text-to-image",
  },
  {
    id: "google-imagen3-fast",
    name: "Google Imagen3 Fast",
    provider: "Google",
    description: "Fast version of Imagen3",
    speed: "Fast",
    resolution: ["1k", "2k"],
    features: ["Fast Generation"],
    category: "text-to-image",
  },
  {
    id: "google-nano-banana-text-to-image",
    name: "Google Nano Banana",
    provider: "Google",
    description: "Specialized model for creative image generation",
    speed: "Fast",
    resolution: ["1024x1024", "512x512"],
    features: ["Creative", "Artistic", "Unique Style"],
    category: "text-to-image",
  },
  {
    id: "google-nano-banana-edit",
    name: "Google Nano Banana Edit",
    provider: "Google",
    description:
      "Advanced image editing with precise control and natural language instructions",
    speed: "Standard",
    resolution: ["1024x1024", "512x512"],
    features: ["Image Editing", "Natural Language", "Precise Control"],
    category: "image-editing",
  },
  {
    id: "google-nano-banana-effects",
    name: "Google Nano Banana Effects",
    provider: "Google",
    description: "Creative effects and transformations for existing images",
    speed: "Standard",
    resolution: ["1024x1024", "512x512"],
    features: ["Effects", "Transformations", "Creative"],
    category: "image-editing",
  },
  {
    id: "qwen-image-edit",
    name: "Qwen Image Edit",
    provider: "WaveSpeed AI",
    description: "Advanced image editing capabilities with Qwen AI",
    speed: "Standard",
    resolution: ["1024x1024", "512x512"],
    features: ["Advanced Editing", "AI Powered", "High Quality"],
    category: "image-editing",
  },
];

export default function ImageGenerationPage() {
  const [selectedModel, setSelectedModel] = useState<ImageModel>(
    imageModels[0]
  );
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [resolution, setResolution] = useState("1k");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("text-to-image");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const providers = [
    { id: "all", name: "All Providers" },
    { id: "Google", name: "Google" },
    { id: "WaveSpeed AI", name: "WaveSpeed AI" },
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

  const filteredModels = imageModels.filter((model) => {
    const categoryMatch = model.category === selectedCategory;
    const providerMatch =
      selectedProvider === "all" || model.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  const pollForImageResult = async (taskId: string): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 60; // Maximum 2 minutes of polling for images

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
          // Image is ready
          setResult({
            success: true,
            imageUrl: result.data.data.outputs[0],
            taskId: taskId,
            metadata: {
              model: selectedModel.name,
              prompt,
              resolution,
              seed,
            },
          });
          setIsGenerating(false);
          return;
        } else if (result.data?.data?.status === "failed") {
          // Task failed
          setResult({
            success: false,
            error: result.data?.data?.error || "Image generation failed",
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
      error: "Image generation timed out. Please try again.",
      taskId: taskId,
    });
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResult({
        success: false,
        error: "Please enter a prompt",
      });
      return;
    }

    if (selectedModel.category === "image-editing" && imageFiles.length === 0) {
      setResult({
        success: false,
        error: "Please upload at least one image for editing",
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      let response;

      // Use FormData for editing models that require image uploads
      if (selectedModel.category === "image-editing" && imageFiles.length > 0) {
        const formData = new FormData();
        formData.append("model", selectedModel.id);
        formData.append("prompt", prompt);
        formData.append("negative_prompt", negativePrompt);
        formData.append("resolution", resolution);
        formData.append("aspect_ratio", aspectRatio);
        formData.append("num_images", numImages.toString());
        if (seed) formData.append("seed", seed.toString());

        // Add all image files
        imageFiles.forEach((file, index) => {
          formData.append(`image_${index}`, file);
        });

        response = await fetch("/api/wavespeed-image", {
          method: "POST",
          body: formData,
        });
      } else {
        // Use JSON for text-to-image models
        response = await fetch("/api/wavespeed-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel.id,
            prompt,
            negative_prompt: negativePrompt,
            resolution,
            aspect_ratio: aspectRatio,
            num_images: numImages,
            seed,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Image is ready immediately
        setResult(data);
        setIsGenerating(false);
      } else if (data.success && data.taskId) {
        // Start polling for results
        console.log("Starting polling for image task:", data.taskId);
        await pollForImageResult(data.taskId);
      } else {
        // Error occurred
        setResult(data);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          model: selectedModel.name,
          prompt,
          resolution,
          seed,
        },
      });
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result?.imageUrl) return;

    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = `${selectedModel.name.replace(
      /\s+/g,
      "-"
    )}-${Date.now()}.png`;
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
    <div className="min-h-screen bg-white ">
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
                  onClick={() => {
                    setShowDropdown(!showDropdown);
                  }}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border-2 0 z-50">
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
            <div className="flex items-center gap-4 mb-0">
              <img src="/mainPage_assets/cookie.png" className="h-10" />
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  AI Image Generation Studio
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Turn your ideas into stunning visuals. Generate
                  high-quality, photorealistic images with advanced AI models.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Settings */}
          <div className="space-y-6 overflow-y-auto pr-2">
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
                                {model.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {model.features.slice(0, 2).map((feature) => (
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
              </CardContent>
            </Card>
            {/* Generation Interface - Move to left column */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Image Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generation Settings */}
                <div className="space-y-3 grid grid-cols-2">
                  <div className="space-y-2 flex-1">
                    <Label>Quantity</Label>
                    <Select
                      value={numImages.toString()}
                      onValueChange={(value) => setNumImages(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Image</SelectItem>
                        <SelectItem value="2">2 Images</SelectItem>
                        <SelectItem value="3">3 Images</SelectItem>
                        <SelectItem value="4">4 Images</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Size</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                        <SelectItem value="3:4">
                          3:4 (Portrait Classic)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image Prompt</Label>
                  <Textarea
                    placeholder={
                      selectedModel.category === "image-editing"
                        ? "Describe the edits or effects you want to apply..."
                        : "Describe the image you want to generate and what you want to avoid in the video."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Negative Prompt (Optional)</Label>
                  <Textarea
                    placeholder="What to avoid in the image..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Image Upload for Editing Models */}
                {selectedModel.category === "image-editing" && (
                  <div className="space-y-2">
                    <Label>Source Images (Required for Editing)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setImageFiles(files);
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Choose Images
                        </Button>
                        <p className="text-sm text-gray-500">
                          {imageFiles.length > 0
                            ? `${
                                imageFiles.length
                              } image(s) selected: ${imageFiles
                                .map((f) => f.name)
                                .join(", ")}`
                            : "PNG, JPG up to 10MB each (multiple images supported)"}
                        </p>
                      </div>
                    </div>

                    {/* Image Preview Grid */}
                    {imageFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              onClick={() => {
                                const newFiles = imageFiles.filter(
                                  (_, i) => i !== index
                                );
                                setImageFiles(newFiles);
                              }}
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            >
                              ×
                            </Button>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating ||
                    !prompt.trim() ||
                    (selectedModel.category === "image-editing" &&
                      imageFiles.length === 0)
                  }
                  className="w-full bg-black"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Generated Image */}
          <div className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Generated Image
                  </CardTitle>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1k">1K (1024x1024)</SelectItem>
                      <SelectItem value="2k">2K (2048x2048)</SelectItem>
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
                          ? "⚡ Ultra Fast - Under 5 seconds"
                          : selectedModel.speed === "Fast"
                          ? "🚀 Fast - Under 10 seconds"
                          : selectedModel.speed === "Standard"
                          ? "⏱️ Standard - Under 30 seconds"
                          : "🎯 Pro - High Quality Processing"}
                      </p>
                    </div>
                  </div>
                )}

                {result?.success && result.imageUrl && (
                  <div className="w-full space-y-4">
                    <div className="relative">
                      <img
                        src={result.s3Url || result.imageUrl}
                        alt="Generated"
                        className="max-w-full max-h-[60vh] w-auto h-auto rounded-lg shadow-lg mx-auto object-contain"
                      />
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
                        onClick={downloadImage}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
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
                    <ImageIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Ready to Create
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Configure your settings on the left and click 'Generate
                      Image' to create your AI masterpiece!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Bottom Link */}
        <div className="bg-white py-8">
          <div className="flex justify-center">
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
    </div>
  );
}
