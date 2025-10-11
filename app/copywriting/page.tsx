"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  PenTool,
  Copy,
  RefreshCw,
  Download,
  Share2,
  Zap,
  Sparkles,
  MessageCircle,
  Hash,
  Target,
  Users,
  TrendingUp,
  Clock,
  Loader2,
  CheckCircle,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Camera,
  Settings,
  Crown,
  BarChart3,
} from "lucide-react";

interface CopyResult {
  id: string;
  content: string;
  platform: string;
  tone: string;
  style: string;
  timestamp: Date;
  hashtags?: string[];
  engagement_score?: number;
}

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    maxLength: 2200,
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
  {
    id: "twitter",
    name: "Twitter/X",
    icon: Twitter,
    maxLength: 280,
    color: "bg-black",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    maxLength: 500,
    color: "bg-blue-600",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Camera,
    maxLength: 2200,
    color: "bg-black",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    maxLength: 1000,
    color: "bg-red-600",
  },
  {
    id: "general",
    name: "General",
    icon: MessageCircle,
    maxLength: 1000,
    color: "bg-gray-600",
  },
];

const TONES = [
  "Professional",
  "Casual",
  "Friendly",
  "Authoritative",
  "Humorous",
  "Inspirational",
  "Urgent",
  "Conversational",
  "Educational",
  "Promotional",
];

const CONTENT_TYPES = [
  "Product Launch",
  "Behind the Scenes",
  "Tutorial/How-to",
  "User Generated Content",
  "Question/Poll",
  "Quote/Inspiration",
  "News/Update",
  "Promotional",
  "Educational",
  "Entertainment",
];

const SAMPLE_PROMPTS = [
  "Launch a new productivity app for remote workers",
  "Promote a sustainable fashion brand",
  "Announce a special discount on online courses",
  "Share a behind-the-scenes look at your startup",
  "Introduce a new AI-powered feature",
  "Celebrate reaching 10k followers milestone",
];

const SAMPLE_COPIES = [
  {
    id: "1",
    content:
      "🌟 Transform your morning routine with our new AI-powered productivity planner! ✨ Say goodbye to chaotic mornings and hello to structured success. Join 10,000+ users who've already revolutionized their days! 🚀 #ProductivityHack #MorningRoutine #AItools",
    platform: "instagram",
    tone: "Inspirational",
    style: "Product Launch",
    timestamp: new Date(),
    hashtags: ["#ProductivityHack", "#MorningRoutine", "#AItools"],
    engagement_score: 8.5,
  },
  {
    id: "2",
    content:
      "POV: You discover the secret to viral content 🤯✨ It's not about following trends—it's about creating your own! Drop your most creative video idea below 👇 #ContentCreator #ViralTips #TikTokTips",
    platform: "tiktok",
    tone: "Casual",
    style: "Entertainment",
    timestamp: new Date(),
    hashtags: ["#ContentCreator", "#ViralTips", "#TikTokTips"],
    engagement_score: 9.2,
  },
];

export default function CopywritingPage() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [selectedType, setSelectedType] = useState("Product Launch");
  const [prompt, setPrompt] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [generatedCopies, setGeneratedCopies] =
    useState<CopyResult[]>(SAMPLE_COPIES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">(
    "generate"
  );
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");

  const currentPlatform =
    PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/copywriting-ai", {
          method: "GET",
        });
        const data = await response.json();
        setApiStatus(data.geminiConnected ? "connected" : "disconnected");
      } catch (error) {
        setApiStatus("disconnected");
      }
    };

    checkApiStatus();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description:
          "Please enter what you want to promote or create content about.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call Gemini AI API for copywriting
      const response = await fetch("/api/copywriting-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          platform: selectedPlatform,
          tone: selectedTone,
          contentType: selectedType,
          targetAudience: targetAudience.trim(),
          keywords: keywords.trim(),
          maxLength: currentPlatform.maxLength,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate copy: ${response.status}`);
      }

      const data = await response.json();

      const newCopy: CopyResult = {
        id: Date.now().toString(),
        content: data.content,
        platform: selectedPlatform,
        tone: selectedTone,
        style: selectedType,
        timestamp: new Date(),
        hashtags: data.hashtags || [],
        engagement_score: data.engagement_score || Math.random() * 2 + 8, // Fallback random score 8-10
      };

      setGeneratedCopies((prev) => [newCopy, ...prev]);
      setActiveTab("history");

      // Success notification
      toast({
        title: "Copy generated successfully!",
        description: `Created ${selectedTone.toLowerCase()} ${selectedType.toLowerCase()} content for ${
          currentPlatform.name
        }.`,
      });

      // Clear the prompt for next generation
      setPrompt("");
    } catch (error) {
      console.error("Copywriting generation error:", error);

      toast({
        title: "Generation failed",
        description:
          "Using fallback copy generator. Check your API key configuration.",
        variant: "destructive",
      });

      // Fallback demo copy
      const fallbackCopy: CopyResult = {
        id: Date.now().toString(),
        content: generateFallbackCopy(
          prompt,
          selectedPlatform,
          selectedTone,
          selectedType
        ),
        platform: selectedPlatform,
        tone: selectedTone,
        style: selectedType,
        timestamp: new Date(),
        hashtags: generateHashtags(prompt, keywords),
        engagement_score: Math.random() * 2 + 8,
      };

      setGeneratedCopies((prev) => [fallbackCopy, ...prev]);
      setActiveTab("history");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCopy = (
    prompt: string,
    platform: string,
    tone: string,
    type: string
  ): string => {
    const platform_obj = PLATFORMS.find((p) => p.id === platform);
    const maxLength = platform_obj?.maxLength || 500;

    let copy = "";

    if (tone.toLowerCase().includes("professional")) {
      copy = `📢 ${prompt} - Discover the latest innovation that's transforming the industry. Join thousands of professionals who trust our solution. `;
    } else if (tone.toLowerCase().includes("casual")) {
      copy = `Hey! 👋 ${prompt} - This is exactly what you've been looking for! Super easy to use and totally worth it. `;
    } else if (tone.toLowerCase().includes("humorous")) {
      copy = `😂 ${prompt} - Warning: May cause excessive productivity and uncontrollable success! Side effects include happiness and achievement. `;
    } else {
      copy = `✨ ${prompt} - Experience something amazing that will change how you think about [your industry]. Ready to level up? `;
    }

    // Add platform-specific elements
    if (platform === "instagram") {
      copy += `🔥 #Innovation #Quality #Success`;
    } else if (platform === "linkedin") {
      copy += `What are your thoughts on this? 💭`;
    } else if (platform === "twitter") {
      copy = copy.substring(0, 240) + ` 🧵`;
    }

    // Trim to platform limits
    if (copy.length > maxLength) {
      copy = copy.substring(0, maxLength - 3) + "...";
    }

    return copy;
  };

  const generateHashtags = (prompt: string, keywords: string): string[] => {
    const baseHashtags = [
      "#Innovation",
      "#Quality",
      "#Success",
      "#Growth",
      "#Business",
    ];
    const keywordTags = keywords
      .split(",")
      .map((k) => `#${k.trim().replace(/\s+/g, "")}`)
      .filter((k) => k.length > 1);
    return [...keywordTags, ...baseHashtags].slice(0, 5);
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard!",
        description: "The content has been copied and is ready to paste.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description:
          "Unable to copy to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 9) return "text-green-600 bg-green-50";
    if (score >= 7.5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <AppLayout>
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <img src="/mainPage_assets/banana.png" alt="AI Copywriting Studio" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Copywriting Studio
                </h1>
                <p className="text-gray-600 text-sm">
                  Instantly write catchy captions, taglines, and post copy
                </p>
              </div>
            </div>
          </div>

        {/* Main Content Area */}
        <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Settings */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Platform & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Platform Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-md">Platform Settings</Label>
                      <Badge className="bg-gray-200 text-gray-500 rounded-2xl px-6 py-1 text-sm">
                        Default
                      </Badge>
                    </div>
                    <Button className="flex items-center gap-2 bg-primary text-white">
                      <Crown className="h-4 w-4" />
                      AI Powered
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-md">Selected Platform:</Label>
                    <div className="bg-gray-50 border border-gray-400 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <currentPlatform.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            {currentPlatform.name}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {currentPlatform.maxLength} chars
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {currentPlatform.maxLength} max
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map((platform) => (
                      <Button
                        key={platform.id}
                        variant={
                          selectedPlatform === platform.id
                            ? "default"
                            : "outline"
                        }
                        className={`justify-start h-12 ${
                          selectedPlatform === platform.id
                            ? platform.color + " text-white"
                            : ""
                        }`}
                        onClick={() => setSelectedPlatform(platform.id)}
                      >
                        <platform.icon className="h-4 w-4 mr-2" />
                        {platform.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Content Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tone Selection */}
                <div className="space-y-2">
                  <Label>Tone of Voice</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((tone) => (
                      <Button
                        key={tone}
                        variant={selectedTone === tone ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTone(tone)}
                      >
                        {tone}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Content Type */}
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONTENT_TYPES.map((type) => (
                      <Button
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Content Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main Prompt */}
                <div className="space-y-2">
                  <Label>What do you want to promote?</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your product, service, or message..."
                    className="min-h-[100px]"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-xs text-gray-500 w-full">
                      Quick start ideas:
                    </p>
                    {SAMPLE_PROMPTS.slice(0, 3).map((samplePrompt, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(samplePrompt)}
                        className="text-xs px-2 py-1 bg-purple-50 hover:bg-purple-100 rounded-full text-purple-700 border border-purple-200"
                      >
                        {samplePrompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., young professionals, small business owners..."
                  />
                </div>

                {/* Keywords */}
                <div className="space-y-2">
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., productivity, innovation, success..."
                  />
                </div>

                {apiStatus === "disconnected" && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg mb-4">
                    <p className="text-sm text-orange-800">
                      <strong>API Not Configured:</strong> Add your
                      GEMINI_API_KEY to .env.local file to unlock full AI
                      capabilities. Currently using fallback generator.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-black"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Copy
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Generated Content */}
          <div className="h-full">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Generated Content
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {apiStatus === "checking" && (
                      <Badge variant="outline" className="bg-gray-50">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Checking API...
                      </Badge>
                    )}
                    {apiStatus === "connected" && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Gemini Connected
                      </Badge>
                    )}
                    {apiStatus === "disconnected" && (
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Using Fallback
                      </Badge>
                    )}
                  </div>
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
                        Generating {selectedTone.toLowerCase()} content for{" "}
                        {currentPlatform.name}
                      </h3>
                      <p className="text-purple-600 font-medium">
                        Creating engaging {selectedType.toLowerCase()}{" "}
                        content...
                      </p>
                    </div>
                  </div>
                )}

                {generatedCopies.length > 0 && !isGenerating && (
                  <div className="w-full space-y-4">
                    <ScrollArea className="h-[60vh] w-full">
                      <div className="space-y-4">
                        {generatedCopies.map((copy) => {
                          const platform = PLATFORMS.find(
                            (p) => p.id === copy.platform
                          );
                          return (
                            <Card key={copy.id} className="bg-white">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {platform && (
                                      <platform.icon className="h-4 w-4" />
                                    )}
                                    <span className="font-medium text-sm">
                                      {platform?.name}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {copy.tone}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {copy.style}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {copy.engagement_score && (
                                      <Badge
                                        className={`text-xs ${getEngagementColor(
                                          copy.engagement_score
                                        )}`}
                                      >
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {copy.engagement_score.toFixed(1)}
                                      </Badge>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        copyToClipboard(copy.content)
                                      }
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {copy.content}
                                    </p>
                                  </div>

                                  {copy.hashtags &&
                                    copy.hashtags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {copy.hashtags.map((hashtag, index) => (
                                          <Badge
                                            key={index}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {hashtag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                      Generated{" "}
                                      {copy.timestamp.toLocaleTimeString()}
                                    </span>
                                    <span>
                                      {copy.content.length} characters
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {!isGenerating && generatedCopies.length === 0 && (
                  <div className="text-center">
                    <MessageCircle className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Ready to Create
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Configure your settings on the left and click 'Generate
                      Copy' to create your AI-powered content!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Bottom Link */}
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
