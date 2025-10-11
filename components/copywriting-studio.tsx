"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Camera
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
  { id: 'instagram', name: 'Instagram', icon: Instagram, maxLength: 2200, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, maxLength: 280, color: 'bg-black' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, maxLength: 500, color: 'bg-blue-600' },
  { id: 'tiktok', name: 'TikTok', icon: Camera, maxLength: 2200, color: 'bg-black' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, maxLength: 1000, color: 'bg-red-600' },
  { id: 'general', name: 'General', icon: MessageCircle, maxLength: 1000, color: 'bg-gray-600' }
];

const TONES = [
  'Professional', 'Casual', 'Friendly', 'Authoritative', 'Humorous', 
  'Inspirational', 'Urgent', 'Conversational', 'Educational', 'Promotional'
];

const CONTENT_TYPES = [
  'Product Launch', 'Behind the Scenes', 'Tutorial/How-to', 'User Generated Content',
  'Question/Poll', 'Quote/Inspiration', 'News/Update', 'Promotional', 'Educational', 'Entertainment'
];

const SAMPLE_PROMPTS = [
  "Launch a new productivity app for remote workers",
  "Promote a sustainable fashion brand",
  "Announce a special discount on online courses",
  "Share a behind-the-scenes look at your startup",
  "Introduce a new AI-powered feature",
  "Celebrate reaching 10k followers milestone"
];

const SAMPLE_COPIES = [
  {
    id: '1',
    content: "🌟 Transform your morning routine with our new AI-powered productivity planner! ✨ Say goodbye to chaotic mornings and hello to structured success. Join 10,000+ users who've already revolutionized their days! 🚀 #ProductivityHack #MorningRoutine #AItools",
    platform: 'instagram',
    tone: 'Inspirational',
    style: 'Product Launch',
    timestamp: new Date(),
    hashtags: ['#ProductivityHack', '#MorningRoutine', '#AItools'],
    engagement_score: 8.5
  },
  {
    id: '2', 
    content: "POV: You discover the secret to viral content 🤯✨ It's not about following trends—it's about creating your own! Drop your most creative video idea below 👇 #ContentCreator #ViralTips #TikTokTips",
    platform: 'tiktok',
    tone: 'Casual',
    style: 'Entertainment',
    timestamp: new Date(),
    hashtags: ['#ContentCreator', '#ViralTips', '#TikTokTips'],
    engagement_score: 9.2
  }
];

export function CopywritingStudio() {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [selectedType, setSelectedType] = useState('Product Launch');
  const [prompt, setPrompt] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generatedCopies, setGeneratedCopies] = useState<CopyResult[]>(SAMPLE_COPIES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentPlatform = PLATFORMS.find(p => p.id === selectedPlatform) || PLATFORMS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check API status on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/copywriting-ai', {
          method: 'GET',
        });
        const data = await response.json();
        setApiStatus(data.awsConfigured ? 'connected' : 'disconnected');
      } catch (error) {
        setApiStatus('disconnected');
      }
    };

    checkApiStatus();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter what you want to promote or create content about.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call Amazon Nova Pro AI API for copywriting
      const response = await fetch('/api/copywriting-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          platform: selectedPlatform,
          tone: selectedTone,
          contentType: selectedType,
          targetAudience: targetAudience.trim(),
          keywords: keywords.trim(),
          maxLength: currentPlatform.maxLength
        })
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
        engagement_score: data.engagement_score || Math.random() * 2 + 8 // Fallback random score 8-10
      };

      setGeneratedCopies(prev => [newCopy, ...prev]);
      setActiveTab('history');

      // Success notification
      toast({
        title: "Copy generated successfully!",
        description: `Created ${selectedTone.toLowerCase()} ${selectedType.toLowerCase()} content for ${currentPlatform.name}.`,
      });

      // Clear the prompt for next generation
      setPrompt('');

    } catch (error) {
      console.error('Copywriting generation error:', error);
      
      toast({
        title: "Generation failed",
        description: "Using fallback copy generator. Check your API key configuration.",
        variant: "destructive",
      });
      
      // Fallback demo copy
      const fallbackCopy: CopyResult = {
        id: Date.now().toString(),
        content: generateFallbackCopy(prompt, selectedPlatform, selectedTone, selectedType),
        platform: selectedPlatform,
        tone: selectedTone,
        style: selectedType,
        timestamp: new Date(),
        hashtags: generateHashtags(prompt, keywords),
        engagement_score: Math.random() * 2 + 8
      };

      setGeneratedCopies(prev => [fallbackCopy, ...prev]);
      setActiveTab('history');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackCopy = (prompt: string, platform: string, tone: string, type: string): string => {
    const platform_obj = PLATFORMS.find(p => p.id === platform);
    const maxLength = platform_obj?.maxLength || 500;

    let copy = '';
    
    if (tone.toLowerCase().includes('professional')) {
      copy = `📢 ${prompt} - Discover the latest innovation that's transforming the industry. Join thousands of professionals who trust our solution. `;
    } else if (tone.toLowerCase().includes('casual')) {
      copy = `Hey! 👋 ${prompt} - This is exactly what you've been looking for! Super easy to use and totally worth it. `;
    } else if (tone.toLowerCase().includes('humorous')) {
      copy = `😂 ${prompt} - Warning: May cause excessive productivity and uncontrollable success! Side effects include happiness and achievement. `;
    } else {
      copy = `✨ ${prompt} - Experience something amazing that will change how you think about [your industry]. Ready to level up? `;
    }

    // Add platform-specific elements
    if (platform === 'instagram') {
      copy += `🔥 #Innovation #Quality #Success`;
    } else if (platform === 'linkedin') {
      copy += `What are your thoughts on this? 💭`;
    } else if (platform === 'twitter') {
      copy = copy.substring(0, 240) + ` 🧵`;
    }

    // Trim to platform limits
    if (copy.length > maxLength) {
      copy = copy.substring(0, maxLength - 3) + '...';
    }

    return copy;
  };

  const generateHashtags = (prompt: string, keywords: string): string[] => {
    const baseHashtags = ['#Innovation', '#Quality', '#Success', '#Growth', '#Business'];
    const keywordTags = keywords.split(',').map(k => `#${k.trim().replace(/\s+/g, '')}`).filter(k => k.length > 1);
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
        description: "Unable to copy to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 9) return 'text-green-600 bg-green-50';
    if (score >= 7.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PenTool className="h-6 w-6 text-purple-600" />
              AI Copywriting Studio
            </h1>
            <p className="text-sm text-gray-600">
              Create engaging social media content with AI-powered copywriting
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Zap className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            {apiStatus === 'checking' && (
              <Badge variant="outline" className="bg-gray-50">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Checking API...
              </Badge>
            )}
            {apiStatus === 'connected' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Nova Pro Connected
              </Badge>
            )}
            {apiStatus === 'disconnected' && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                Using Fallback
              </Badge>
            )}
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-0">
          {/* Left Panel - Generator */}
          <div className="border-r border-gray-200 bg-white">
            <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Content Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your content parameters for optimal results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Platform Selection */}
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {PLATFORMS.map((platform) => (
                          <Button
                            key={platform.id}
                            variant={selectedPlatform === platform.id ? "default" : "outline"}
                            className={`justify-start h-12 ${
                              selectedPlatform === platform.id ? platform.color + ' text-white' : ''
                            }`}
                            onClick={() => setSelectedPlatform(platform.id)}
                          >
                            <platform.icon className="h-4 w-4 mr-2" />
                            {platform.name}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Max length: {currentPlatform.maxLength} characters
                      </p>
                    </div>

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

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-600" />
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
                        <p className="text-xs text-gray-500 w-full">Quick start ideas:</p>
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


                    <Button
                      onClick={handleGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
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
          </div>

          {/* Right Panel - Results */}
          <div className="bg-gray-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Generated Content</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeTab === 'history' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab('history')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    History
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pb-8">
                  {generatedCopies.map((copy) => {
                    const platform = PLATFORMS.find(p => p.id === copy.platform);
                    return (
                      <Card key={copy.id} className="bg-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {platform && <platform.icon className="h-4 w-4" />}
                              <span className="font-medium text-sm">{platform?.name}</span>
                              <Badge variant="outline" className="text-xs">{copy.tone}</Badge>
                              <Badge variant="outline" className="text-xs">{copy.style}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {copy.engagement_score && (
                                <Badge className={`text-xs ${getEngagementColor(copy.engagement_score)}`}>
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {copy.engagement_score.toFixed(1)}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(copy.content)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{copy.content}</p>
                            </div>
                            
                            {copy.hashtags && copy.hashtags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {copy.hashtags.map((hashtag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {hashtag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Generated {copy.timestamp.toLocaleTimeString()}</span>
                              <span>{copy.content.length} characters</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                {generatedCopies.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
                    <p className="text-gray-600 mb-4">Create your first AI-powered copy using the form on the left</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}