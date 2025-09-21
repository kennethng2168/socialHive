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
  RefreshCw,
  Cloud,
  ExternalLink
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
  },
  {
    id: "google-nano-banana-edit",
    name: "Google Nano Banana Edit",
    provider: "Google",
    description: "Advanced image editing with precise control and natural language instructions",
    speed: "Standard",
    resolution: ["1024x1024", "512x512"],
    features: ["Image Editing", "Natural Language", "Precise Control"],
    category: "image-editing"
  },
  {
    id: "google-nano-banana-effects",
    name: "Google Nano Banana Effects",
    provider: "Google",
    description: "Creative effects and transformations for existing images",
    speed: "Standard",
    resolution: ["1024x1024", "512x512"],
    features: ["Effects", "Transformations", "Creative"],
    category: "image-editing"
  },
  {
    id: "qwen-image-edit",
    name: "Qwen Image Edit",
    provider: "WaveSpeed AI",
    description: "Advanced image editing capabilities with Qwen AI",
    speed: "Standard",
    resolution: ["1024x1024", "512x512"],
    features: ["Advanced Editing", "AI Powered", "High Quality"],
    category: "image-editing"
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "text-to-image", name: "Text to Image" },
    { id: "image-to-image", name: "Image to Image" },
    { id: "image-editing", name: "Image Editing" },
    { id: "style-transfer", name: "Style Transfer" }
  ];

  const providers = [
    { id: "all", name: "All Providers" },
    { id: "Google", name: "Google" },
    { id: "WaveSpeed AI", name: "WaveSpeed AI" }
  ];

  const filteredModels = imageModels.filter(model => {
    const categoryMatch = selectedCategory === "all" || model.category === selectedCategory;
    const providerMatch = selectedProvider === "all" || model.provider === selectedProvider;
    return categoryMatch && providerMatch;
  });

  const pollForImageResult = async (taskId: string): Promise<void> => {
    let attempts = 0;
    const maxAttempts = 60; // Maximum 2 minutes of polling for images
    
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
          // Image is ready
          setResult({
            success: true,
            imageUrl: result.data.data.outputs[0],
            taskId: taskId,
            metadata: {
              model: selectedModel.name,
              prompt,
              resolution,
              seed
            }
          });
          setIsGenerating(false);
          return;
        } else if (result.data?.data?.status === 'failed') {
          // Task failed
          setResult({
            success: false,
            error: result.data?.data?.error || "Image generation failed",
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
      error: "Image generation timed out. Please try again.",
      taskId: taskId
    });
    setIsGenerating(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setResult({
        success: false,
        error: "Please enter a prompt"
      });
      return;
    }

    if (selectedModel.category === "image-editing" && imageFiles.length === 0) {
      setResult({
        success: false,
        error: "Please upload at least one image for editing"
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
        formData.append('model', selectedModel.id);
        formData.append('prompt', prompt);
        formData.append('negative_prompt', negativePrompt);
        formData.append('resolution', resolution);
        formData.append('aspect_ratio', aspectRatio);
        formData.append('num_images', numImages.toString());
        if (seed) formData.append('seed', seed.toString());
        
        // Add all image files
        imageFiles.forEach((file, index) => {
          formData.append(`image_${index}`, file);
        });

        response = await fetch('/api/wavespeed-image', {
          method: 'POST',
          body: formData
        });
      } else {
        // Use JSON for text-to-image models
        response = await fetch('/api/wavespeed-image', {
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
        console.log('Starting polling for image task:', data.taskId);
        await pollForImageResult(data.taskId);
      } else {
        // Error occurred
        setResult(data);
        setIsGenerating(false);
      }

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
      <main className="flex-1 ml-64 overflow-auto">
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
                {/* Generation Interface - Move to left column */}
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
                        placeholder={
                          selectedModel.category === "image-editing" 
                            ? "Describe the edits or effects you want to apply..."
                            : "Describe the image you want to generate..."
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
                              onClick={() => document.getElementById('image-upload')?.click()}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Upload className="h-4 w-4" />
                              Choose Images
                            </Button>
                            <p className="text-sm text-gray-500">
                              {imageFiles.length > 0 
                                ? `${imageFiles.length} image(s) selected: ${imageFiles.map(f => f.name).join(', ')}`
                                : "PNG, JPG up to 10MB each (multiple images supported)"
                              }
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
                                    const newFiles = imageFiles.filter((_, i) => i !== index);
                                    setImageFiles(newFiles);
                                  }}
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                >
                                  ×
                                </Button>
                                <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim() || (selectedModel.category === "image-editing" && imageFiles.length === 0)}
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
              </div>

              {/* Right Side - Generated Image */}
              <div className="h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Generated Image
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
                            {selectedModel.speed === "Ultra Fast" ? "⚡ Ultra Fast - Under 5 seconds" :
                             selectedModel.speed === "Fast" ? "🚀 Fast - Under 10 seconds" :
                             selectedModel.speed === "Standard" ? "⏱️ Standard - Under 30 seconds" :
                             "🎯 Pro - High Quality Processing"}
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
                            <h4 className="font-semibold mb-2">Generation Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Model: {result.metadata.model}</div>
                              <div>Resolution: {result.metadata.resolution}</div>
                              {result.metadata.seed && <div>Seed: {result.metadata.seed}</div>}
                              <div className="col-span-2">Prompt: {result.metadata.prompt}</div>
                              {result.metadata.s3Upload && (
                                <div className="col-span-2">
                                  <div className={`text-xs p-2 rounded ${
                                    result.metadata.s3Upload.success 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    <strong>S3 Storage:</strong> {
                                      result.metadata.s3Upload.success 
                                        ? '✅ Uploaded to AWS S3' 
                                        : result.metadata.s3Upload.error || '⏳ Upload in progress'
                                    }
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
                              onClick={() => window.open(result.s3Url, '_blank')}
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
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Ready to Create</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          Configure your settings on the left and click 'Generate Image' to create your AI masterpiece!
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