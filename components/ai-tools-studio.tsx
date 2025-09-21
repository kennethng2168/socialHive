"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  ImageIcon,
  Mic,
  Wand2,
  Upload,
  Download,
  Play,
  Settings,
  Sparkles,
  Bot,
  Music,
  Camera,
  Zap,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Shirt,
} from "lucide-react";
import { VirtualTryOn } from "./virtual-tryon";

interface NanobananaResult {
  success: boolean;
  data?: any;
  imageUrl?: string;
  isProcessing?: boolean;
  error?: string;
}

export function AIToolsStudio() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("video");
  const { toast } = useToast();

  // Check URL parameters for tab selection
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam && ['video', 'image', 'virtual-try-on'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Nanobanana states
  const [taskId, setTaskId] = useState("8b2ca887ab5646ed82c4251b46c5436f");
  const [nanobananaResult, setNanobananaResult] =
    useState<NanobananaResult | null>(null);
  const [isLoadingNanobanana, setIsLoadingNanobanana] = useState(false);
  const [nanobananaError, setNanobananaError] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);

    if (type === "image") {
      // For image generation, we'll use the nanobanana API
      // You can modify this to actually generate images or fetch existing ones
      try {
        // Simulate image generation process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // For demo purposes, let's fetch the nanobanana result
        await fetchNanobananaResult();
      } catch (error) {
        console.error("Image generation failed:", error);
      }
    } else {
      // Simulate other AI generation types
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    setIsGenerating(false);
  };

  const fetchNanobananaResult = async () => {
    if (!taskId.trim()) {
      setNanobananaError("Please enter a task ID");
      return;
    }

    setIsLoadingNanobanana(true);
    setNanobananaError(null);
    setNanobananaResult(null);

    try {
      const response = await fetch("/api/nanobanana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId: taskId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch result");
      }

      setNanobananaResult(data);
    } catch (err) {
      setNanobananaError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setIsLoadingNanobanana(false);
    }
  };

  const downloadNanobananaImage = (url: string) => {
    // Open image in new tab
    window.open(url, "_blank");
  };

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Successfully copied!",
        description: "Image URL has been copied to clipboard",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy URL to clipboard",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="h-6 w-6 text-accent" />
              AI Creator Tools
            </h1>
            <p className="text-sm text-gray-600">
              Generate videos, images, audio, and more with AI
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6 pb-8">
            {/* AI Tools Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video AI
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Image AI
                </TabsTrigger>
                <TabsTrigger
                  value="virtual-try-on"
                  className="flex items-center gap-2"
                >
                  <Shirt className="h-4 w-4" />
                  Virtual Try-On
                </TabsTrigger>
              </TabsList>

              {/* Video AI */}
              <TabsContent value="video" className="space-y-6">
                <Tabs defaultValue="video-generation" className="space-y-6">
                  {/* <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="video-generation" className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Generation
                    </TabsTrigger>
                  </TabsList> */}

                  {/* Video Generation */}
                  <TabsContent value="video-generation" className="space-y-6">
                    {/* Video Generator Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-chart-1" />
                            AI Video Generator
                          </CardTitle>
                          <CardDescription>
                            Create videos from text descriptions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Video Description
                            </label>
                            <Textarea
                              placeholder="Describe the video you want to create (e.g., 'A person cooking pasta in a modern kitchen with natural lighting')"
                              className="min-h-[100px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Duration
                              </label>
                              <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                <option>15 seconds</option>
                                <option>30 seconds</option>
                                <option>60 seconds</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                Style
                              </label>
                              <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                <option>Realistic</option>
                                <option>Animated</option>
                                <option>Cinematic</option>
                                <option>Documentary</option>
                              </select>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleGenerate("video")}
                            disabled={isGenerating}
                            className="w-full bg-chart-1 hover:bg-chart-1/90"
                          >
                            {isGenerating ? (
                              <>
                                <Zap className="h-4 w-4 mr-2 animate-spin" />
                                Generating Video...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate Video
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Generated Video Preview</CardTitle>
                          <CardDescription>
                            Your AI-generated content will appear here
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <Video className="h-12 w-12 text-muted-foreground mx-auto" />
                              <p className="text-sm text-muted-foreground">
                                Video preview will appear here
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" disabled>
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" disabled>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge variant="outline">Ready to use</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Audio and Lipsync Tabs */}
                    <Tabs defaultValue="add-audio" className="space-y-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                          value="add-audio"
                          className="flex items-center gap-2"
                        >
                          <Mic className="h-4 w-4" />
                          Add Audio
                        </TabsTrigger>
                        <TabsTrigger
                          value="lipsync"
                          className="flex items-center gap-2"
                        >
                          <Camera className="h-4 w-4" />
                          Lipsync
                        </TabsTrigger>
                      </TabsList>

                      {/* Add Audio */}
                      <TabsContent value="add-audio" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Mic className="h-5 w-5 text-chart-3" />
                                Add Audio to Video
                              </CardTitle>
                              <CardDescription>
                                Generate voice, music, and sound effects for
                                your video
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Tabs defaultValue="voice" className="space-y-4">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="voice">Voice</TabsTrigger>
                                  <TabsTrigger value="music">Music</TabsTrigger>
                                  <TabsTrigger value="sfx">SFX</TabsTrigger>
                                </TabsList>

                                <TabsContent
                                  value="voice"
                                  className="space-y-4"
                                >
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Text to Speech
                                    </label>
                                    <Textarea
                                      placeholder="Enter the text you want to convert to speech..."
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Voice
                                      </label>
                                      <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                        <option>Natural Female</option>
                                        <option>Natural Male</option>
                                        <option>Energetic</option>
                                        <option>Professional</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Speed
                                      </label>
                                      <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                        <option>Normal</option>
                                        <option>Slow</option>
                                        <option>Fast</option>
                                      </select>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent
                                  value="music"
                                  className="space-y-4"
                                >
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Music Description
                                    </label>
                                    <Textarea
                                      placeholder="Describe the music you want (e.g., 'Upbeat electronic music for workout videos')"
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Genre
                                      </label>
                                      <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                        <option>Electronic</option>
                                        <option>Pop</option>
                                        <option>Hip Hop</option>
                                        <option>Ambient</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">
                                        Duration
                                      </label>
                                      <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                        <option>30 seconds</option>
                                        <option>60 seconds</option>
                                        <option>2 minutes</option>
                                      </select>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="sfx" className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Sound Effect Description
                                    </label>
                                    <Input placeholder="e.g., 'Door closing', 'Rain falling', 'Phone notification'" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Duration
                                    </label>
                                    <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                                      <option>1 second</option>
                                      <option>3 seconds</option>
                                      <option>5 seconds</option>
                                    </select>
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <Button
                                onClick={() => handleGenerate("audio")}
                                disabled={isGenerating}
                                className="w-full bg-chart-3 hover:bg-chart-3/90"
                              >
                                {isGenerating ? (
                                  <>
                                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                                    Adding Audio...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Add Audio to Video
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Video with Audio</CardTitle>
                              <CardDescription>
                                Your video with added audio will appear here
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                                <div className="text-center space-y-2">
                                  <Video className="h-12 w-12 text-muted-foreground mx-auto" />
                                  <p className="text-sm text-muted-foreground">
                                    Video with audio preview
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                {[1, 2].map((i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                        <Music className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">
                                          Audio Track {i}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          0:30 duration
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled
                                      >
                                        <Play className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        disabled
                                      >
                                        <Download className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      {/* Lipsync */}
                      <TabsContent value="lipsync" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5 text-chart-4" />
                                Lipsync Video
                              </CardTitle>
                              <CardDescription>
                                Sync audio with your video footage
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Video Source
                                  </label>
                                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                      Use generated video or upload new one
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2 bg-transparent"
                                    >
                                      Choose File
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Audio Source
                                  </label>
                                  <Tabs
                                    defaultValue="upload"
                                    className="space-y-3"
                                  >
                                    <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="upload">
                                        Upload Audio
                                      </TabsTrigger>
                                      <TabsTrigger value="generate">
                                        Generate Voice
                                      </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="upload">
                                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                        <Mic className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">
                                          Upload audio file
                                        </p>
                                      </div>
                                    </TabsContent>

                                    <TabsContent value="generate">
                                      <Textarea
                                        placeholder="Enter text to generate voice for lipsync..."
                                        className="min-h-[80px]"
                                      />
                                    </TabsContent>
                                  </Tabs>
                                </div>
                              </div>

                              <Button
                                onClick={() => handleGenerate("lipsync")}
                                disabled={isGenerating}
                                className="w-full bg-chart-4 hover:bg-chart-4/90"
                              >
                                {isGenerating ? (
                                  <>
                                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                                    Processing Lipsync...
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="h-4 w-4 mr-2" />
                                    Sync Audio with Video
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Lipsync Preview</CardTitle>
                              <CardDescription>
                                Preview your synced video
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                                <div className="text-center space-y-2">
                                  <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                                  <p className="text-sm text-muted-foreground">
                                    Lipsync preview will appear here
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" disabled>
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" disabled>
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button size="sm" disabled>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Image AI */}
              <TabsContent value="image" className="space-y-6">
                {/* Image Generator Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-chart-2" />
                        AI Image Generator
                      </CardTitle>
                      <CardDescription>
                        Create stunning images from text prompts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Image Description
                        </label>
                        <Textarea
                          placeholder="Describe the image you want to create (e.g., 'A minimalist workspace with a laptop, coffee cup, and plants')"
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Aspect Ratio
                          </label>
                          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                            <option>9:16 (TikTok)</option>
                            <option>1:1 (Square)</option>
                            <option>16:9 (Landscape)</option>
                            <option>4:5 (Portrait)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Style</label>
                          <select className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                            <option>Photorealistic</option>
                            <option>Digital Art</option>
                            <option>Oil Painting</option>
                            <option>Minimalist</option>
                          </select>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGenerate("image")}
                        disabled={isGenerating}
                        className="w-full bg-chart-2 hover:bg-chart-2/90"
                      >
                        {isGenerating ? (
                          <>
                            <Zap className="h-4 w-4 mr-2 animate-spin" />
                            Generating Image...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate Image
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Generated Images</CardTitle>
                      <CardDescription>
                        Your AI-generated images will appear here
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {nanobananaResult?.imageUrl ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <img
                              src={nanobananaResult.imageUrl}
                              alt="Generated Image"
                              className="w-full rounded-lg border border-gray-200 shadow-sm"
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  downloadNanobananaImage(
                                    nanobananaResult.imageUrl!
                                  )
                                }
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copyImageUrl(nanobananaResult.imageUrl!)
                                }
                              >
                                Copy URL
                              </Button>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-800"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready
                            </Badge>
                          </div>
                        </div>
                      ) : nanobananaResult?.isProcessing ? (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Image is still processing...
                            </p>
                            <p className="text-xs text-yellow-600">
                              Check back in a few moments
                            </p>
                          </div>
                        </div>
                      ) : nanobananaError ? (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-700">
                            {nanobananaError}
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                            >
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      )}

                      {!nanobananaResult && !nanobananaError && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" disabled>
                              <Download className="h-4 w-4" />
                              Download All
                            </Button>
                          </div>
                          <Badge variant="outline">4 variations</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Virtual Try On */}
              <TabsContent value="virtual-try-on" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-chart-5" />
                        AI Virtual Try On
                      </CardTitle>
                      <CardDescription>
                        Try on clothes virtually by uploading your photo and
                        clothing image
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Upload Model Photo
                          </label>
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Upload a clear photo of yourself
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-transparent"
                            >
                              Choose Model Photo
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Upload Clothes Image
                          </label>
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Upload an image of the clothes you want to try on
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 bg-transparent"
                            >
                              Choose Clothes Image
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleGenerate("virtual-try-on")}
                        disabled={isGenerating}
                        className="w-full bg-chart-5 hover:bg-chart-5/90"
                      >
                        {isGenerating ? (
                          <>
                            <Zap className="h-4 w-4 mr-2 animate-spin" />
                            Processing Try On...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Try On Virtually
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Virtual Try On Result</CardTitle>
                      <CardDescription>
                        Your virtual try on result will appear here
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                        <div className="text-center space-y-2">
                          <Camera className="h-12 w-12 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">
                            Virtual try on result will appear here
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" disabled>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" disabled>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <Badge variant="outline">Ready to use</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Virtual Try-On */}
              <TabsContent value="virtual-try-on" className="space-y-6">
                <VirtualTryOn />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
