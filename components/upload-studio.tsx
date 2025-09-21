"use client";

import { useState, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Sparkles,
  Wand2,
  Eye,
  MapPin,
  Hash,
  AtSign,
  Palette,
  Zap,
  Brain,
  TrendingUp,
  Target,
  Clock,
  ArrowLeft,
  Play,
  Crop,
  Filter,
  Type,
  Sticker,
  Download,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { AICaption } from "@/components/ai-caption";
import { TrendingHashtags } from "@/components/trending-hashtags";
import { VideoPreview } from "@/components/video-preview";
import { SmartScheduler } from "@/components/smart-scheduler";
import Link from "next/link";

export function UploadStudio() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedCover, setSelectedCover] = useState(0);
  const [activeTab, setActiveTab] = useState("upload");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setIsUploading(true);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setActiveTab("edit");
        }
      }, 200);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    maxFiles: 1,
  });

  return (
    <div className="flex min-h-screen">
      {/* Main Upload Area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="font-playfair text-2xl font-bold">
                AI-Powered Upload Studio
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="edit"
                disabled={!uploadedFile}
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="enhance"
                disabled={!uploadedFile}
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                AI Enhance
              </TabsTrigger>
              <TabsTrigger
                value="publish"
                disabled={!uploadedFile}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Publish
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Video</CardTitle>
                  <CardDescription>
                    Drag and drop your video file or click to browse. Supported
                    formats: MP4, MOV, AVI, MKV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      {isDragActive ? (
                        <p className="text-lg font-medium">
                          Drop your video here...
                        </p>
                      ) : (
                        <>
                          <p className="text-lg font-medium">
                            Drag & drop your video here
                          </p>
                          <p className="text-muted-foreground">
                            or click to browse files
                          </p>
                        </>
                      )}
                      <Button className="mt-4">
                        <Upload className="h-4 w-4 mr-2" />
                        Select Video
                      </Button>
                    </div>
                  </div>

                  {isUploading && (
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading {uploadedFile?.name}...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Upload Options */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-medium mb-2">Quick Upload</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload and publish with AI-generated content
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">AI Studio</h3>
                    <p className="text-sm text-muted-foreground">
                      Full AI enhancement and optimization
                    </p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-chart-2" />
                    </div>
                    <h3 className="font-medium mb-2">Scheduled Post</h3>
                    <p className="text-sm text-muted-foreground">
                      Plan and schedule for optimal timing
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Video Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Video Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VideoPreview file={uploadedFile} />
                  </CardContent>
                </Card>

                {/* Editing Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle>Editing Tools</CardTitle>
                    <CardDescription>
                      Enhance your video with professional editing tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 bg-transparent"
                      >
                        <Crop className="h-6 w-6" />
                        <span className="text-xs">Trim & Crop</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 bg-transparent"
                      >
                        <Filter className="h-6 w-6" />
                        <span className="text-xs">Filters</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 bg-transparent"
                      >
                        <Type className="h-6 w-6" />
                        <span className="text-xs">Add Text</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-2 bg-transparent"
                      >
                        <Sticker className="h-6 w-6" />
                        <span className="text-xs">Stickers</span>
                      </Button>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-captions">
                          Auto-generate captions
                        </Label>
                        <Switch id="auto-captions" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="background-music">
                          Add background music
                        </Label>
                        <Switch id="background-music" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-effects">AI visual effects</Label>
                        <Switch id="auto-effects" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Enhance Tab */}
            <TabsContent value="enhance" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <AICaption onCaptionGenerated={setDescription} />
                <TrendingHashtags />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-accent" />
                    AI Content Optimization
                  </CardTitle>
                  <CardDescription>
                    Let AI analyze and optimize your content for maximum
                    engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        <div>
                          <p className="font-medium text-sm">
                            Engagement Score
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Predicted: 8.5/10
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Audience Match</p>
                          <p className="text-xs text-muted-foreground">
                            92% compatibility
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-chart-2/10">
                        <Clock className="h-5 w-5 text-chart-2" />
                        <div>
                          <p className="font-medium text-sm">Optimal Length</p>
                          <p className="text-xs text-muted-foreground">
                            Current: 45s (Perfect!)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-chart-3/10">
                        <Eye className="h-5 w-5 text-chart-3" />
                        <div>
                          <p className="font-medium text-sm">Hook Strength</p>
                          <p className="text-xs text-muted-foreground">
                            Strong opening detected
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">
                      <Wand2 className="h-4 w-4 mr-2" />
                      Apply AI Suggestions
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Publish Tab */}
            <TabsContent value="publish" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Content Details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Content Details</CardTitle>
                      <CardDescription>
                        Add description, hashtags, and other details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Write a compelling description for your video..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[100px] mt-2"
                        />
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{description.length}/4000 characters</span>
                          <Button variant="ghost" size="sm">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Improve
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="hashtags">Hashtags</Label>
                          <div className="flex items-center mt-2">
                            <Hash className="h-4 w-4 text-muted-foreground mr-2" />
                            <Input
                              id="hashtags"
                              placeholder="Add hashtags..."
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mentions">Mentions</Label>
                          <div className="flex items-center mt-2">
                            <AtSign className="h-4 w-4 text-muted-foreground mr-2" />
                            <Input id="mentions" placeholder="Tag people..." />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="flex items-center mt-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                          <Input id="location" placeholder="Add location..." />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <SmartScheduler />
                </div>

                {/* Mobile Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Mobile Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mx-auto w-64 h-96 bg-black rounded-3xl p-2">
                      <div className="w-full h-full bg-background rounded-2xl overflow-hidden">
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Following
                            </div>
                            <div className="text-xs text-muted-foreground">
                              For You
                            </div>
                          </div>
                          <div className="aspect-[9/16] bg-muted rounded-lg relative">
                            {uploadedFile && (
                              <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                                <div className="text-center text-white">
                                  <Play className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-xs opacity-50">Video Preview</p>
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-4 left-4 right-4">
                              <p className="text-white text-xs line-clamp-2 mb-2">
                                {description ||
                                  "Your video description will appear here..."}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full" />
                                <span className="text-white text-xs">
                                  @yourhandle
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Publish Actions */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">Ready to publish?</h3>
                      <p className="text-sm text-muted-foreground">
                        Your video is optimized and ready to go live
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline">Save as Draft</Button>
                      <Button className="bg-destructive hover:bg-destructive/90">
                        <Upload className="h-4 w-4 mr-2" />
                        Publish Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
