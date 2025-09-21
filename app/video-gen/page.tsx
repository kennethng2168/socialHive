"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Camera,
  Image as ImageIcon
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
    description: "Fast image-to-video with Veo3 - 30% faster, 80% cost reduction",
    speed: "Fast",
    resolution: ["720p", "1080p"],
    duration: ["8s"],
    features: ["Fast Generation", "Cost Effective", "Audio Support"],
    category: "image-to-video"
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
    category: "image-to-video"
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
    category: "image-to-video"
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
    category: "image-to-video"
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
    category: "text-to-video"
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
    category: "text-to-video"
  }
];

export default function VideoGenerationPage() {
  const [selectedModel, setSelectedModel] = useState<VideoModel>(videoModels[0]);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [resolution, setResolution] = useState("1280x720");
  const [duration, setDuration] = useState("10s");
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "text-to-video", name: "Text to Video" },
    { id: "image-to-video", name: "Image to Video" },
    { id: "video-editing", name: "Video Editing" },
    { id: "lipsync", name: "Lipsync" }
  ];

  const providers = [
    { id: "all", name: "All Providers" },
    { id: "Google", name: "Google" },
    { id: "Kwaivgi", name: "Kwaivgi (Kling)" },
    { id: "Pixverse", name: "Pixverse" }
  ];

  const filteredModels = videoModels.filter(model => {
    const categoryMatch = selectedCategory === "all" || model.category === selectedCategory;
    const providerMatch = selectedProvider === "all" || model.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  const pollForVideoResult = async (taskId: string): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 120; // Maximum 4 minutes of polling for video
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch('/api/nanobanana', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId })
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
              seed
            }
          });
          setIsGenerating(false);
          return;
        } else if (result.data?.data?.status === 'failed') {
          // Task failed
          setResult({
            success: false,
            error: result.data?.data?.error || "Video generation failed",
            taskId: taskId
          });
          setIsGenerating(false);
          return;
        }
        
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        attempts++;
        
      } catch (error) {
        console.error('Polling error:', error);
        setResult({
          success: false,
          error: `Polling failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          taskId: taskId
        });
        setIsGenerating(false);
        return;
      }
    }
    
    // Timeout reached
    setResult({
      success: false,
      error: "Video generation timed out. Please try again.",
      taskId: taskId
    });
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && selectedModel.category === "text-to-video") {
      setResult({
        success: false,
        error: "Please enter a prompt for text-to-video generation"
      });
      return;
    }

    if (!imageFile && selectedModel.category === "image-to-video") {
      setResult({
        success: false,
        error: "Please upload an image for image-to-video generation"
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      // Make initial request to WaveSpeedAI
      const formData = new FormData();
      formData.append('model', selectedModel.id);
      formData.append('prompt', prompt);
      formData.append('negative_prompt', negativePrompt);
      formData.append('resolution', resolution);
      formData.append('duration', duration);
      if (seed) formData.append('seed', seed.toString());
      if (imageFile) formData.append('image', imageFile);

      const response = await fetch('/api/wavespeed-video', {
        method: 'POST',
        body: formData
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
        console.log('Starting polling for video task:', data.taskId);
        await pollForVideoResult(data.taskId);
      } else {
        // Error occurred
        setResult(data);
        setIsGenerating(false);
      }

    } catch (error) {
      console.error('Video generation error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          model: selectedModel.name,
          prompt,
          resolution,
          duration,
          seed
        }
      });
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (!result?.videoUrl) return;

    const link = document.createElement('a');
    link.href = result.videoUrl;
    link.download = `${selectedModel.name.replace(/\s+/g, '-')}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "Ultra Fast": return "bg-green-100 text-green-800";
      case "Fast": return "bg-blue-100 text-blue-800";
      case "Standard": return "bg-yellow-100 text-yellow-800";
      case "Pro": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-hidden">
        <div className="h-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                <Film className="h-10 w-10 text-purple-600" />
                AI Video Generation Studio
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Create stunning videos with state-of-the-art AI models from Google, Kwaivgi, and Pixverse. 
                Generate videos in under 2 minutes with our ultra-fast models.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
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
                    {/* Filters */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map(provider => (
                              <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Model Selection */}
                    <div className="space-y-2">
                      <Label>AI Model ({filteredModels.length} available)</Label>
                      <ScrollArea className="h-64 border rounded-md p-2">
                        <div className="space-y-2">
                          {filteredModels.map(model => (
                            <div
                              key={model.id}
                              onClick={() => setSelectedModel(model)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedModel.id === model.id 
                                  ? 'border-purple-500 bg-purple-50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm">{model.name}</h4>
                                <Badge className={getSpeedColor(model.speed)}>
                                  {model.speed}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                              <div className="flex flex-wrap gap-1">
                                {model.features.slice(0, 2).map(feature => (
                                  <Badge key={feature} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Selected Model Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{selectedModel.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{selectedModel.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSpeedColor(selectedModel.speed)}>
                          {selectedModel.speed}
                        </Badge>
                        <Badge variant="outline">{selectedModel.provider}</Badge>
                        <Badge variant="secondary">{selectedModel.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedModel.features.map(feature => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Generation Settings */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Resolution</Label>
                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedModel.resolution.map(res => (
                              <SelectItem key={res} value={res}>
                                {res}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedModel.duration.map(dur => (
                              <SelectItem key={dur} value={dur}>
                                {dur}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Seed (Optional)</Label>
                        <Input
                          type="number"
                          placeholder="Random if empty"
                          value={seed || ""}
                          onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Generation Interface - Move to left column */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Film className="h-5 w-5" />
                      Video Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image Upload for I2V */}
                    {selectedModel.category === "image-to-video" && (
                      <div className="space-y-2">
                        <Label>Source Image</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                              className="hidden"
                              id="image-upload"
                            />
                            <Button
                              onClick={() => document.getElementById('image-upload')?.click()}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Choose Image
                            </Button>
                            <p className="text-sm text-gray-500">
                              {imageFile ? imageFile.name : "PNG, JPG up to 10MB"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>
                        {selectedModel.category === "image-to-video" ? "Motion Prompt (Optional)" : "Video Prompt"}
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
                      disabled={isGenerating || 
                        (selectedModel.category === "text-to-video" && !prompt.trim()) ||
                        (selectedModel.category === "image-to-video" && !imageFile)
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Generated Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center items-center p-6">
                    {isGenerating && (
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto" />
                          <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold">Generating with {selectedModel.name}</h3>
                          <p className="text-purple-600 font-medium">
                            {selectedModel.speed === "Ultra Fast" ? "⚡ Ultra Fast - Under 30 seconds" :
                             selectedModel.speed === "Fast" ? "🚀 Fast - Under 1 minute" :
                             selectedModel.speed === "Standard" ? "⏱️ Standard - Under 2 minutes" :
                             "🎯 Pro - High Quality Processing"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Video generation typically takes longer than images. Please wait...
                          </p>
                        </div>
                      </div>
                    )}

                    {result?.success && result.videoUrl && (
                      <div className="w-full space-y-4">
                        <div className="relative">
                          <video
                            src={result.videoUrl}
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
                        </div>
                        
                        {result.metadata && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Generation Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Model: {result.metadata.model}</div>
                              <div>Resolution: {result.metadata.resolution}</div>
                              <div>Duration: {result.metadata.duration}</div>
                              {result.metadata.seed && <div>Seed: {result.metadata.seed}</div>}
                              <div className="col-span-2">Prompt: {result.metadata.prompt}</div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={downloadVideo}
                          className="w-full"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Video
                        </Button>
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
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Create</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          {selectedModel.category === "image-to-video" 
                            ? "Configure your settings on the left, upload an image, and click 'Generate Video' to create your AI video!"
                            : "Configure your settings on the left and click 'Generate Video' to create your AI masterpiece!"
                          }
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}