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
  RefreshCw
} from "lucide-react";

interface ImageModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  speed: "Ultra Fast" | "Fast" | "Standard" | "Pro";
  resolution: string[];
  features: string[];
  category: "text-to-image" | "image-to-image" | "image-editing" | "style-transfer";
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
    description: "Latest Google image generation model with exceptional quality",
    speed: "Standard",
    resolution: ["1k", "2k"],
    features: ["High Quality", "Photorealistic", "Text Understanding"],
    category: "text-to-image"
  },
  {
    id: "google-imagen4-fast",
    name: "Google Imagen4 Fast",
    provider: "Google",
    description: "Fast version of Imagen4 for quick generation",
    speed: "Fast",
    resolution: ["1k", "2k"],
    features: ["Fast Generation", "Good Quality"],
    category: "text-to-image"
  },
  {
    id: "google-imagen4-ultra",
    name: "Google Imagen4 Ultra",
    provider: "Google", 
    description: "Ultra high quality version of Imagen4",
    speed: "Pro",
    resolution: ["1k", "2k"],
    features: ["Ultra Quality", "High Resolution", "Professional"],
    category: "text-to-image"
  },
  {
    id: "google-imagen3",
    name: "Google Imagen3",
    provider: "Google",
    description: "Previous generation Google model with proven reliability",
    speed: "Standard",
    resolution: ["1k", "2k"],
    features: ["Reliable", "Good Quality"],
    category: "text-to-image"
  },
  {
    id: "google-imagen3-fast",
    name: "Google Imagen3 Fast",
    provider: "Google",
    description: "Fast version of Imagen3",
    speed: "Fast",
    resolution: ["1k", "2k"],
    features: ["Fast Generation"],
    category: "text-to-image"
  },
  {
    id: "google-nano-banana-text-to-image",
    name: "Google Nano Banana",
    provider: "Google",
    description: "Specialized model for creative image generation",
    speed: "Fast",
    resolution: ["1024x1024", "512x512"],
    features: ["Creative", "Artistic", "Unique Style"],
    category: "text-to-image"
  }
];

export default function ImageGenerationPage() {
  const [selectedModel, setSelectedModel] = useState<ImageModel>(imageModels[0]);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [resolution, setResolution] = useState("1k");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "text-to-image", name: "Text to Image" },
    { id: "image-to-image", name: "Image to Image" },
    { id: "image-editing", name: "Image Editing" },
    { id: "style-transfer", name: "Style Transfer" }
  ];

  const providers = [
    { id: "all", name: "All Providers" },
    { id: "Google", name: "Google" }
  ];

  const filteredModels = imageModels.filter(model => {
    const categoryMatch = selectedCategory === "all" || model.category === selectedCategory;
    const providerMatch = selectedProvider === "all" || model.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResult({
        success: false,
        error: "Please enter a prompt"
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/wavespeed-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel.id,
          prompt,
          negative_prompt: negativePrompt,
          resolution,
          aspect_ratio: aspectRatio,
          num_images: numImages,
          seed
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Image generation error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          model: selectedModel.name,
          prompt,
          resolution,
          seed
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!result?.imageUrl) return;

    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `${selectedModel.name.replace(/\s+/g, '-')}-${Date.now()}.png`;
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
                <Camera className="h-10 w-10 text-purple-600" />
                AI Image Generation Studio
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Create stunning images with Google's state-of-the-art AI models. 
                Generate photorealistic images in seconds with advanced prompting.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Model Selection */}
              <div className="xl:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Model & Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Model Selection */}
                    <div className="space-y-2">
                      <Label>AI Model ({filteredModels.length} available)</Label>
                      <ScrollArea className="h-48 border rounded-md p-2">
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
                        <Label>Aspect Ratio</Label>
                        <Select value={aspectRatio} onValueChange={setAspectRatio}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                            <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                            <SelectItem value="4:3">4:3 (Classic)</SelectItem>
                            <SelectItem value="3:4">3:4 (Portrait Classic)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Number of Images</Label>
                        <Select value={numImages.toString()} onValueChange={(value) => setNumImages(parseInt(value))}>
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
              </div>

              {/* Generation Interface */}
              <div className="xl:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Image Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Prompt</Label>
                      <Textarea
                        placeholder="Describe the image you want to generate..."
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

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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

                {/* Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Generated Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating && (
                      <div className="flex items-center justify-center h-64">
                        <div className="text-center space-y-4">
                          <div className="relative">
                            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto" />
                            <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Generating with {selectedModel.name}</h3>
                            <p className="text-purple-600 font-medium">
                              {selectedModel.speed === "Ultra Fast" ? "⚡ Ultra Fast - Under 5 seconds" :
                               selectedModel.speed === "Fast" ? "🚀 Fast - Under 10 seconds" :
                               selectedModel.speed === "Standard" ? "⏱️ Standard - Under 30 seconds" :
                               "🎯 Pro - High Quality Processing"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result?.success && result.imageUrl && (
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={result.imageUrl}
                            alt="Generated"
                            className="w-full rounded-lg shadow-lg"
                          />
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
                              {result.metadata.seed && <div>Seed: {result.metadata.seed}</div>}
                              <div className="col-span-2">Prompt: {result.metadata.prompt}</div>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={downloadImage}
                          className="w-full"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Image
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
                      <div className="flex items-center justify-center h-64 text-center">
                        <div>
                          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Enter a prompt and click 'Generate Image' to create your AI masterpiece!
                          </p>
                        </div>
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