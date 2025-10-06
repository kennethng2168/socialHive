"use client";

import { useState, useRef, useEffect } from "react";
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
import {
  Upload,
  Loader2,
  Download,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Shirt,
  User,
  Settings,
  AlertCircle,
  CheckCircle,
  Crown,
  Cloud,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface VirtualTryOnResult {
  success: boolean;
  image?: string;
  s3Url?: string;
  metadata?: {
    category: string;
    garment_description: string;
    steps: number;
    seed: number;
    s3Upload?: {
      enabled: boolean;
      success: boolean;
      error?: string;
    };
  };
  error?: string;
  details?: string;
}

export default function VirtualTryOnPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [result, setResult] = useState<VirtualTryOnResult | null>(null);
  const [humanImage, setHumanImage] = useState<string>("");
  const [garmentImage, setGarmentImage] = useState<string>("");
  const [humanImageUrl, setHumanImageUrl] = useState<string>("");
  const [garmentImageUrl, setGarmentImageUrl] = useState<string>("");
  const [garmentDescription, setGarmentDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("upper_body");
  const [advancedSettings, setAdvancedSettings] = useState({
    steps: 30,
    seed: 42,
    crop: false,
    force_dc: false,
    mask_only: false,
  });

  const humanFileRef = useRef<HTMLInputElement>(null);
  const garmentFileRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Progress tracker for 30-second loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingProgress(0);
      setLoadingMessage("Preparing images...");

      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = prev + 100 / 30; // 30 seconds total

          if (newProgress < 20) {
            setLoadingMessage("Analyzing human image...");
          } else if (newProgress < 40) {
            setLoadingMessage("Processing garment...");
          } else if (newProgress < 60) {
            setLoadingMessage("AI generating try-on...");
          } else if (newProgress < 80) {
            setLoadingMessage("Applying garment fit...");
          } else if (newProgress < 95) {
            setLoadingMessage("Finalizing result...");
          } else {
            setLoadingMessage("Almost ready...");
          }

          return Math.min(newProgress, 95); // Cap at 95% until actually done
        });
      }, 1000);
    } else {
      setLoadingProgress(0);
      setLoadingMessage("");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get pure base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: "human" | "garment") => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setResult({
        success: false,
        error: "Please upload a valid image file (PNG, JPG, GIF, etc.)",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setResult({
        success: false,
        error:
          "Image file is too large. Please upload an image smaller than 10MB.",
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      if (type === "human") {
        setHumanImage(base64);
        setHumanImageUrl(""); // Clear URL when file is uploaded
      } else {
        setGarmentImage(base64);
        setGarmentImageUrl(""); // Clear URL when file is uploaded
      }

      // Clear any previous errors
      if (result?.error) {
        setResult(null);
      }
    } catch (error) {
      console.error("Error converting file to base64:", error);
      setResult({
        success: false,
        error: "Failed to process the uploaded image. Please try again.",
      });
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, type: "human" | "garment") => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0], type);
    }
  };

  // Handle virtual try-on
  const handleVirtualTryOn = async () => {
    if (
      (!humanImage && !humanImageUrl) ||
      (!garmentImage && !garmentImageUrl)
    ) {
      setResult({
        success: false,
        error: "Please provide both human and garment images",
      });
      return;
    }

    if (!garmentDescription.trim()) {
      setResult({
        success: false,
        error: "Please provide a garment description to improve AI accuracy",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const requestData = {
        human_img: humanImage || humanImageUrl,
        garm_img: garmentImage || garmentImageUrl,
        garment_des: garmentDescription,
        category,
        ...advancedSettings,
      };

      console.log("Starting virtual try-on request...");

      const response = await fetch("/api/virtual-tryon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Virtual try-on completed successfully");
      setLoadingProgress(100);
      setLoadingMessage("Complete! ✨");
      setResult(data);
    } catch (error) {
      console.error("Virtual try-on error:", error);
      setResult({
        success: false,
        error: "Failed to process virtual try-on request",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Download result image
  const downloadImage = () => {
    if (!result?.image) return;

    const link = document.createElement("a");
    link.href = result.image;
    link.download = `virtual-tryon-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all inputs
  const clearAll = () => {
    setHumanImage("");
    setGarmentImage("");
    setHumanImageUrl("");
    setGarmentImageUrl("");
    setGarmentDescription("");
    setCategory("upper_body");
    setResult(null);
    if (humanFileRef.current) humanFileRef.current.value = "";
    if (garmentFileRef.current) garmentFileRef.current.value = "";
  };

  // Load demo images
  const loadDemoImages = () => {
    setHumanImageUrl(
      "https://segmind-sd-models.s3.amazonaws.com/display_images/idm-ip.png"
    );
    setGarmentImageUrl(
      "https://segmind-sd-models.s3.amazonaws.com/display_images/idm-viton-dress.png"
    );
    setGarmentDescription("Green colour semi Formal Blazer");
    setCategory("upper_body");
    setHumanImage("");
    setGarmentImage("");
    setResult(null);
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200  z-50">
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
            <div className="flex items-center gap-3 mb-0">
              <img src="/mainPage_assets/person.png" className="h-10" />
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  Virtual Try-On Studio
                </h1>
                <p className="text-gray-600 text-l light-text">
                  | Experience the future of fashion with AI-powered virtual
                  try-on. Upload a person's photo and a garment to see how they
                  look together.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Settings */}
          <div className="space-y-6 overflow-y-auto pr-2">
            {/* Demo Button */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={loadDemoImages}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Try Demo Images
                </Button>
              </CardContent>
            </Card>

            {/* Human Image Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Human Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="upload"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger
                      value="url"
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Image URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-6 text-center transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "human")}
                      onClick={() => humanFileRef.current?.click()}
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2 flex flex-col items-center">
                        <p className="text-sm text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                        <p className="text-xs text-gray-400">
                          Click to browse or drag & drop
                        </p>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
                        >
                          <Upload className="h-4 w-4" />
                          Choose Human Image
                        </Button>
                      </div>
                      <input
                        ref={humanFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "human");
                        }}
                      />
                    </div>
                    {humanImage && (
                      <div className="mt-4">
                        <Badge variant="secondary" className="mb-2">
                          ✅ Human image uploaded
                        </Badge>
                        <img
                          src={`data:image/jpeg;base64,${humanImage}`}
                          alt="Human preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="human-url">Image URL</Label>
                      <Input
                        id="human-url"
                        placeholder="https://example.com/human-image.jpg"
                        value={humanImageUrl}
                        onChange={(e) => setHumanImageUrl(e.target.value)}
                      />
                    </div>
                    {humanImageUrl && (
                      <div className="mt-4">
                        <Badge variant="secondary" className="mb-2">
                          ✅ Human URL provided
                        </Badge>
                        <img
                          src={humanImageUrl}
                          alt="Human preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Garment Image Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="h-5 w-5" />
                  Garment Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="upload"
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger
                      value="url"
                      className="flex items-center gap-2"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Image URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 hover:border-green-400 rounded-lg p-6 text-center transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, "garment")}
                      onClick={() => garmentFileRef.current?.click()}
                    >
                      <Shirt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2 flex flex-col items-center">
                        <p className="text-sm text-gray-500">
                          PNG, JPG up to 10MB
                        </p>
                        <p className="text-xs text-gray-400">
                          Click to browse or drag & drop
                        </p>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 pointer-events-none bg-black text-white"
                        >
                          <Upload className="h-4 w-4 text-white" />
                          Choose Garment Image
                        </Button>
                      </div>
                      <input
                        ref={garmentFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "garment");
                        }}
                      />
                    </div>
                    {garmentImage && (
                      <div className="mt-4">
                        <Badge variant="secondary" className="mb-2">
                          ✅ Garment image uploaded
                        </Badge>
                        <img
                          src={`data:image/jpeg;base64,${garmentImage}`}
                          alt="Garment preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="garment-url">Image URL</Label>
                      <Input
                        id="garment-url"
                        placeholder="https://example.com/garment-image.jpg"
                        value={garmentImageUrl}
                        onChange={(e) => setGarmentImageUrl(e.target.value)}
                      />
                    </div>
                    {garmentImageUrl && (
                      <div className="mt-4">
                        <Badge variant="secondary" className="mb-2">
                          ✅ Garment URL provided
                        </Badge>
                        <img
                          src={garmentImageUrl}
                          alt="Garment preview"
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Try-On Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="garment-description"
                    className="text-sm font-medium flex items-center gap-2"
                  >
                    <Shirt className="h-4 w-4" />
                    Garment Description
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  </Label>
                  <Textarea
                    id="garment-description"
                    placeholder="Describe the garment in detail (e.g., 'Green colour semi formal blazer', 'Red casual cotton t-shirt', 'Blue denim jeans with distressed finish')"
                    value={garmentDescription}
                    onChange={(e) => setGarmentDescription(e.target.value)}
                    rows={3}
                    className="resize-none [&::placeholder]:text-gray-400 [&::placeholder]:opacity-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Garment Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upper_body">
                        Upper Body (Shirts, Blazers, Jackets)
                      </SelectItem>
                      <SelectItem value="lower_body">
                        Lower Body (Pants, Skirts)
                      </SelectItem>
                      <SelectItem value="dresses">Dresses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="steps">Quality Steps</Label>
                    <Input
                      id="steps"
                      type="number"
                      min="10"
                      max="50"
                      value={advancedSettings.steps}
                      onChange={(e) =>
                        setAdvancedSettings((prev) => ({
                          ...prev,
                          steps: parseInt(e.target.value) || 30,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seed">Seed (Randomness)</Label>
                    <Input
                      id="seed"
                      type="number"
                      value={advancedSettings.seed}
                      onChange={(e) =>
                        setAdvancedSettings((prev) => ({
                          ...prev,
                          seed: parseInt(e.target.value) || 42,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    onClick={handleVirtualTryOn}
                    disabled={
                      isLoading ||
                      (!humanImage && !humanImageUrl) ||
                      (!garmentImage && !garmentImageUrl) ||
                      !garmentDescription.trim()
                    }
                    className="w-full bg-black"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Try On Virtually
                      </>
                    )}
                  </Button>
                </div>

                <Button variant="outline" onClick={clearAll} className="w-full">
                  Clear All
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Virtual Try-On Result */}
          <div className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Virtual Try-On Result
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-center items-center p-6">
                {isLoading && (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto" />
                      <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        AI Virtual Try-On in Progress
                      </h3>
                      <p className="text-purple-600 font-medium">
                        {loadingMessage}
                      </p>

                      <div className="space-y-2">
                        <Progress
                          value={loadingProgress}
                          className="w-full h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Processing...</span>
                          <span>{Math.round(loadingProgress)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result?.success && result.image && (
                  <div className="w-full space-y-4">
                    <div className="relative">
                      <img
                        src={result.s3Url || result.image}
                        alt="Virtual try-on result"
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
                          <div>Category: {result.metadata.category}</div>
                          <div>Steps: {result.metadata.steps}</div>
                          <div className="col-span-2">
                            Description: {result.metadata.garment_description}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        onClick={downloadImage}
                        className="w-full flex items-center gap-2"
                        variant="outline"
                      >
                        <Download className="h-4 w-4" />
                        Download Result
                      </Button>

                      {result.s3Url && (
                        <Button
                          onClick={() => window.open(result.s3Url, "_blank")}
                          className="w-full flex items-center gap-2"
                          variant="outline"
                        >
                          <ExternalLink className="h-4 w-4" />
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
                      {result.details && (
                        <div className="mt-2 text-sm opacity-80">
                          Details: {result.details}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {!isLoading && !result && (
                  <div className="text-center">
                    <Sparkles className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Ready to Try On
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Upload your images on the left and click "Try On
                      Virtually" to see the AI magic!
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
